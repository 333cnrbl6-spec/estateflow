import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TenantMessaging({ tenant }) {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch messages
  const messagesQuery = useQuery({
    queryKey: ['tenant-messages', tenant.id],
    queryFn: async () => {
      return await base44.entities.Message.filter(
        { tenant_id: tenant.id },
        '-created_date',
        100
      );
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (text) => {
      return await base44.entities.Message.create({
        tenant_id: tenant.id,
        sender_email: tenant.email,
        sender_role: 'tenant',
        content: text,
        read: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-messages'] });
      setMessageText('');
    },
  });

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesQuery.data]);

  const { data: messages = [] } = messagesQuery;
  const sortedMessages = [...messages].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessageMutation.mutate(messageText);
  };

  return (
    <div className="flex flex-col h-[600px] space-y-4">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-muted rounded-lg p-4 space-y-4">
        {sortedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-xs text-muted-foreground">Start a conversation with your property manager</p>
            </div>
          </div>
        ) : (
          <>
            {sortedMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_role === 'tenant' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender_role === 'tenant'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card border border-border rounded-bl-none'
                  }`}
                >
                  {msg.sender_role !== 'tenant' && (
                    <p className="text-xs font-semibold opacity-75 mb-1">{msg.sender_email.split('@')[0]}</p>
                  )}
                  <p className="text-sm break-words">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={sendMessageMutation.isPending}
        />
        <Button
          type="submit"
          disabled={!messageText.trim() || sendMessageMutation.isPending}
          className="gap-2"
        >
          {sendMessageMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>

      {/* Help Text */}
      <p className="text-xs text-muted-foreground text-center">
        Messages are monitored during business hours. For emergencies, contact our hotline.
      </p>
    </div>
  );
}