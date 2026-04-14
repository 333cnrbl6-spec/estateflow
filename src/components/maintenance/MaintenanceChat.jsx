import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function MaintenanceChat({ maintenanceRequest }) {
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Load current user
  useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user));
  }, []);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  // Fetch messages
  const { data: messages = [], isLoading: messagesLoading, refetch } = useQuery({
    queryKey: ['maintenance-chat', maintenanceRequest.id],
    queryFn: async () => {
      return await base44.entities.Message.filter(
        { 
          entity_type: 'maintenance_request',
          entity_id: maintenanceRequest.id
        },
        'created_date'
      );
    },
    refetchInterval: 3000 // Poll every 3 seconds for real-time effect
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.invoke('sendMaintenanceMessage', {
        maintenance_request_id: maintenanceRequest.id,
        message_text: message,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name
      });
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['maintenance-chat'] });
      refetch();
    }
  });

  const handleSendMessage = () => {
    if (!message.trim() || !currentUser) return;
    sendMutation.mutate();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="p-6 h-96 flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Discussion</h3>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = msg.sender_email === currentUser?.email;
            return (
              <div key={msg.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    isCurrentUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-foreground'
                  }`}
                >
                  <p className={`text-xs ${isCurrentUser ? 'text-blue-100' : 'text-muted-foreground'} mb-1`}>
                    {msg.sender_name}
                  </p>
                  <p className="text-sm break-words">{msg.message_text}</p>
                  <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-200' : 'text-muted-foreground'}`}>
                    {format(new Date(msg.created_date), 'HH:mm')}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message... (Shift+Enter for new line)"
          rows="2"
          className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground resize-none text-sm"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || sendMutation.isPending}
          size="icon"
          className="h-auto"
        >
          {sendMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </Card>
  );
}