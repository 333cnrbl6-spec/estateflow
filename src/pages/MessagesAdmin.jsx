import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageSquare, Search, Filter, Check, CheckCheck, Clock, Archive,
  Reply, User, Building, Wrench, AlertCircle, Loader2, Mail, Phone, X
} from 'lucide-react';
import { format } from 'date-fns';

export default function MessagesAdmin() {
  const queryClient = useQueryClient();
  const [selectedThread, setSelectedThread] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, archived
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allMessages = [], isLoading } = useQuery({
    queryKey: ['all-messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 100),
  });

  // Group messages by thread
  const threads = React.useMemo(() => {
    const threadMap = {};
    
    allMessages.forEach(msg => {
      if (!threadMap[msg.thread_id]) {
        threadMap[msg.thread_id] = {
          thread_id: msg.thread_id,
          subject: msg.subject || 'No Subject',
          property_id: msg.property_id,
          unit_id: msg.unit_id,
          maintenance_order_id: msg.maintenance_order_id,
          message_type: msg.message_type,
          tenant_id: msg.tenant_id,
          tenant_name: msg.sender_type === 'tenant' ? msg.sender_name : null,
          tenant_email: msg.sender_type === 'tenant' ? msg.sender_email : null,
          last_message: msg.created_date,
          unread_count: 0,
          messages: [],
          is_archived: msg.status === 'archived',
        };
      }
      
      threadMap[msg.thread_id].messages.push(msg);
      
      if (msg.status === 'unread' && msg.sender_type === 'tenant') {
        threadMap[msg.thread_id].unread_count++;
      }
      
      if (msg.created_date > threadMap[msg.thread_id].last_message) {
        threadMap[msg.thread_id].last_message = msg.created_date;
        threadMap[msg.thread_id].last_message_preview = msg.body;
      }
    });

    return Object.values(threadMap)
      .filter(thread => {
        if (filter === 'unread' && thread.unread_count === 0) return false;
        if (filter === 'archived' && !thread.is_archived) return false;
        if (filter === 'active' && thread.is_archived) return false;
        if (searchQuery && !thread.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => new Date(b.last_message) - new Date(a.last_message));
  }, [allMessages, filter, searchQuery]);

  const sendMessage = useMutation({
    mutationFn: async (messageData) => {
      const response = await base44.entities.Message.create(messageData);
      
      // Mark tenant messages as read
      await base44.entities.Message.update(response.id, { status: 'read' });
      
      return response;
    },
    onSuccess: () => {
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });
    },
  });

  const handleReply = () => {
    if (!replyText.trim() || !selectedThread) return;

    sendMessage.mutate({
      tenant_id: selectedThread.tenant_id,
      property_id: selectedThread.property_id,
      unit_id: selectedThread.unit_id,
      maintenance_order_id: selectedThread.maintenance_order_id,
      thread_id: selectedThread.thread_id,
      sender_type: 'admin',
      sender_name: 'Property Manager',
      sender_email: '',
      body: replyText.trim(),
      subject: `Re: ${selectedThread.subject}`,
      message_type: selectedThread.message_type,
      status: 'unread', // Unread for tenant
    });
  };

  const archiveThread = useMutation({
    mutationFn: async (threadId) => {
      const messages = await base44.entities.Message.filter({ thread_id: threadId });
      await Promise.all(messages.map(msg => 
        base44.entities.Message.update(msg.id, { status: 'archived' })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });
      setSelectedThread(null);
    },
  });

  const markAllRead = useMutation({
    mutationFn: async (threadId) => {
      const messages = await base44.entities.Message.filter({ 
        thread_id: threadId, 
        status: 'unread',
        sender_type: 'tenant'
      });
      await Promise.all(messages.map(msg => 
        base44.entities.Message.update(msg.id, { status: 'read' })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });
    },
  });

  const unreadCount = threads.filter(t => t.unread_count > 0).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-7 h-7" /> Message Center
          </h1>
          <p className="text-muted-foreground mt-1">Manage tenant communications and support requests</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge className="bg-blue-600">{unreadCount} unread</Badge>
          )}
        </div>
      </div>

      <div className="flex h-[700px] gap-4">
        {/* Thread List */}
        <Card className="w-1/3 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-3">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <Badge variant="outline">{threads.length} threads</Badge>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 mt-3">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className="flex-1"
              >
                All
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
                className="flex-1"
              >
                Unread
              </Button>
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('active')}
                className="flex-1"
              >
                Active
              </Button>
              <Button
                variant={filter === 'archived' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('archived')}
                className="flex-1"
              >
                Archived
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : threads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No conversations found</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {threads.map(thread => (
                    <button
                      key={thread.thread_id}
                      onClick={() => {
                        setSelectedThread(thread);
                        markAllRead.mutate(thread.thread_id);
                      }}
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
                            {thread.tenant_name || 'Tenant'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {thread.last_message_preview || 'No messages'}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            {thread.message_type === 'maintenance' ? (
                              <Wrench className="w-3 h-3" />
                            ) : thread.message_type === 'complaint' ? (
                              <AlertCircle className="w-3 h-3" />
                            ) : (
                              <User className="w-3 h-3" />
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
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{selectedThread.subject}</CardTitle>
                      <Badge variant="outline">
                        {selectedThread.message_type === 'maintenance' ? 'Maintenance' : 
                         selectedThread.message_type === 'complaint' ? 'Complaint' : 'Inquiry'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {selectedThread.tenant_name || 'Tenant'}
                      </span>
                      {selectedThread.property_id && (
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          Property {selectedThread.property_id}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => archiveThread.mutate(selectedThread.thread_id)}
                      className="gap-1"
                    >
                      <Archive className="w-4 h-4" /> Archive
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedThread(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-3">
                    {selectedThread.messages
                      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
                      .map((message) => (
                        <AdminMessageBubble 
                          key={message.id} 
                          message={message} 
                          isAdmin={message.sender_type === 'admin'} 
                        />
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Reply Input */}
              <div className="p-4 border-t">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                      disabled={sendMessage.isPending}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleReply} 
                      disabled={!replyText.trim() || sendMessage.isPending}
                      className="gap-2"
                    >
                      {sendMessage.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Reply className="w-4 h-4" />
                      )}
                      Reply
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tenant will receive email notification for your reply
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-1">View and respond to tenant messages</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function AdminMessageBubble({ message, isAdmin }) {
  return (
    <div className={`flex gap-3 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
      {!isAdmin && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {message.sender_name?.charAt(0) || 'T'}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={`max-w-[70%] ${isAdmin ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isAdmin
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.body}</p>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>{format(new Date(message.created_date), 'h:mm a')}</span>
          {isAdmin && (
            message.status === 'read' ? (
              <CheckCheck className="w-3 h-3" />
            ) : (
              <Clock className="w-3 h-3" />
            )
          )}
        </div>
      </div>
      {isAdmin && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            PM
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}