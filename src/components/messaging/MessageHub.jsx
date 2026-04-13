import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send, MessageSquare, Bell, Check, CheckCheck, Clock, AlertCircle,
  Paperclip, X, Home, Wrench, User, Building, Loader2
} from 'lucide-react';
import { format } from 'date-fns';

export default function MessageHub({ tenantId, propertyId, unitId }) {
  const queryClient = useQueryClient();
  const [selectedThread, setSelectedThread] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch threads for this tenant
  const { data: threads = [], isLoading: threadsLoading } = useQuery({
    queryKey: ['message-threads', tenantId],
    queryFn: async () => {
      const messages = await base44.entities.Message.filter({ tenant_id: tenantId });
      // Group by thread_id
      const threadMap = {};
      messages.forEach(msg => {
        if (!threadMap[msg.thread_id]) {
          threadMap[msg.thread_id] = {
            thread_id: msg.thread_id,
            subject: msg.subject || 'No Subject',
            property_id: msg.property_id,
            unit_id: msg.unit_id,
            maintenance_order_id: msg.maintenance_order_id,
            message_type: msg.message_type,
            last_message: msg.created_date,
            unread_count: 0,
            participants: [],
          };
        }
        if (msg.status === 'unread' && msg.sender_type !== 'tenant') {
          threadMap[msg.thread_id].unread_count++;
        }
        if (!threadMap[msg.thread_id].participants.includes(msg.sender_name)) {
          threadMap[msg.thread_id].participants.push(msg.sender_name);
        }
        // Keep the latest message
        if (msg.created_date > threadMap[msg.thread_id].last_message) {
          threadMap[msg.thread_id].last_message = msg.created_date;
          threadMap[msg.thread_id].last_message_preview = msg.body;
          threadMap[msg.thread_id].last_sender = msg.sender_name;
        }
      });
      return Object.values(threadMap).sort((a, b) => new Date(b.last_message) - new Date(a.last_message));
    },
    enabled: !!tenantId,
  });

  // Fetch messages for selected thread
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['thread-messages', selectedThread?.thread_id],
    queryFn: () => base44.entities.Message.filter({ 
      thread_id: selectedThread?.thread_id 
    }).sort('-created_date'),
    enabled: !!selectedThread?.thread_id,
  });

  // Real-time subscription
  useEffect(() => {
    if (!tenantId) return;

    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.type === 'create') {
        const message = event.data;
        if (message.tenant_id === tenantId) {
          queryClient.invalidateQueries({ queryKey: ['message-threads', tenantId] });
          if (selectedThread && message.thread_id === selectedThread.thread_id) {
            queryClient.invalidateQueries({ queryKey: ['thread-messages', selectedThread.thread_id] });
          }
        }
      }
    });

    return () => unsubscribe();
  }, [tenantId, selectedThread, queryClient]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (messageData) => {
      const response = await base44.entities.Message.create(messageData);
      
      // Send notification to property manager
      await base44.functions.invoke('notifyNewMessage', {
        message_id: response.id,
        recipient_type: 'property_manager',
        property_id: messageData.property_id,
      });

      // If related to maintenance, notify contractor
      if (messageData.maintenance_order_id) {
        await base44.functions.invoke('notifyNewMessage', {
          message_id: response.id,
          recipient_type: 'contractor',
          maintenance_order_id: messageData.maintenance_order_id,
        });
      }

      return response;
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['thread-messages', selectedThread?.thread_id] });
      queryClient.invalidateQueries({ queryKey: ['message-threads', tenantId] });
    },
  });

  const handleSend = () => {
    if (!messageText.trim() || !selectedThread) return;

    sendMessage.mutate({
      tenant_id: tenantId,
      property_id: selectedThread.property_id,
      unit_id: selectedThread.unit_id,
      maintenance_order_id: selectedThread.maintenance_order_id,
      thread_id: selectedThread.thread_id,
      sender_type: 'tenant',
      sender_name: 'Tenant',
      sender_email: '',
      body: messageText.trim(),
      subject: selectedThread.subject,
      message_type: selectedThread.message_type,
      status: 'unread',
    });
  };

  const handleCreateThread = (threadData) => {
    const newThreadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    sendMessage.mutate({
      tenant_id: tenantId,
      property_id: propertyId,
      unit_id: unitId,
      maintenance_order_id: threadData.maintenance_order_id || null,
      thread_id: newThreadId,
      sender_type: 'tenant',
      sender_name: 'Tenant',
      sender_email: '',
      body: threadData.message,
      subject: threadData.subject,
      message_type: threadData.message_type || 'inquiry',
      status: 'unread',
    }, {
      onSuccess: () => {
        setShowNewThreadModal(false);
        setSelectedThread({ thread_id: newThreadId, ...threadData });
      },
    });
  };

  const markAsRead = useMutation({
    mutationFn: async (threadId) => {
      const messages = await base44.entities.Message.filter({ thread_id: threadId, status: 'unread' });
      await Promise.all(messages.map(msg => 
        base44.entities.Message.update(msg.id, { status: 'read' })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-threads', tenantId] });
    },
  });

  useEffect(() => {
    if (selectedThread) {
      markAsRead.mutate(selectedThread.thread_id);
    }
  }, [selectedThread]);

  if (threadsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[600px] gap-4">
      {/* Thread List */}
      <Card className="w-1/3 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Messages
            </CardTitle>
            <Button size="sm" onClick={() => setShowNewThreadModal(true)}>
              New Message
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            {threads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No messages yet</p>
                <p className="text-xs mt-1">Start a conversation with your property manager</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {threads.map(thread => (
                  <button
                    key={thread.thread_id}
                    onClick={() => setSelectedThread(thread)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedThread?.thread_id === thread.thread_id
                        ? 'bg-primary/10 border-primary/30 border'
                        : 'hover:bg-muted border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{thread.subject}</p>
                          {thread.unread_count > 0 && (
                            <Badge className="h-4 text-xs bg-blue-600">{thread.unread_count}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {thread.last_message_preview || 'No messages'}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          {thread.message_type === 'maintenance' ? (
                            <Wrench className="w-3 h-3" />
                          ) : thread.message_type === 'inquiry' ? (
                            <User className="w-3 h-3" />
                          ) : (
                            <Building className="w-3 h-3" />
                          )}
                          <span>{format(new Date(thread.last_message), 'MMM d, h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Message Thread */}
      <Card className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedThread.subject}</CardTitle>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {selectedThread.message_type === 'maintenance' ? 'Maintenance' : 
                       selectedThread.message_type === 'complaint' ? 'Complaint' : 'General'}
                    </Badge>
                    {selectedThread.participants.length > 0 && (
                      <span>{selectedThread.participants.join(', ')}</span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedThread(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No messages in this thread</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.reverse().map((message, idx) => (
                      <MessageBubble key={message.id} message={message} isOwn={message.sender_type === 'tenant'} />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  disabled={sendMessage.isPending}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSend} 
                  disabled={!messageText.trim() || sendMessage.isPending}
                  className="gap-2"
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Or start a new message</p>
            </div>
          </div>
        )}
      </Card>

      {/* New Thread Modal */}
      {showNewThreadModal && (
        <NewThreadModal
          propertyId={propertyId}
          unitId={unitId}
          onClose={() => setShowNewThreadModal(false)}
          onCreate={handleCreateThread}
        />
      )}
    </div>
  );
}

function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {message.sender_name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.body}</p>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>{format(new Date(message.created_date), 'h:mm a')}</span>
          {isOwn && (
            message.status === 'read' ? (
              <CheckCheck className="w-3 h-3" />
            ) : message.status === 'unread' ? (
              <Check className="w-3 h-3" />
            ) : (
              <Clock className="w-3 h-3" />
            )
          )}
        </div>
      </div>
      {isOwn && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            You
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

function NewThreadModal({ propertyId, unitId, onClose, onCreate }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('inquiry');
  const [maintenanceOrderId, setMaintenanceOrderId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    onCreate({
      subject,
      message,
      message_type: messageType,
      maintenance_order_id: maintenanceOrderId || null,
      property_id: propertyId,
      unit_id: unitId,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" /> New Message
              </h3>
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Message Type</label>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="inquiry">General Inquiry</option>
                <option value="maintenance">Maintenance Request</option>
                <option value="complaint">Complaint</option>
                <option value="other">Other</option>
              </select>
            </div>

            {messageType === 'maintenance' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Related Maintenance Order (Optional)</label>
                <select
                  value={maintenanceOrderId}
                  onChange={(e) => setMaintenanceOrderId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">No related order</option>
                  {/* Would fetch maintenance orders here */}
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What is this about?"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          <div className="p-6 pt-0 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="gap-2">
              <Send className="w-4 h-4" /> Send Message
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}