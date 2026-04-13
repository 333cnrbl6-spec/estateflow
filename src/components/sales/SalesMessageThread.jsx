import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, Phone, Mail, Calendar, Clock, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function SalesMessageThread({ listingId, leadId, offerId, threadId }) {
  const [newMessage, setNewMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [messageType, setMessageType] = useState('general_inquiry');
  const [sendSMS, setSendSMS] = useState(false);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['salesMessages', threadId],
    queryFn: async () => {
      if (!threadId) return [];
      const all = await base44.entities.SalesCommunication.list('-created_date');
      return all.filter(m => m.thread_id === threadId);
    },
    enabled: !!threadId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      const result = await base44.entities.SalesCommunication.create(messageData);
      
      if (sendSMS && messageData.recipient_phone) {
        await base44.functions.invoke('sendSalesSMS', {
          contact_phone: messageData.recipient_phone,
          message: `${messageData.subject}: ${messageData.body.substring(0, 100)}...`,
          listing_address: '',
        });
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesMessages', threadId] });
      setNewMessage('');
      setSubject('');
      toast.success('Message sent successfully');
    },
  });

  const handleSend = () => {
    if (!newMessage.trim()) return;

    sendMessageMutation.mutate({
      sales_listing_id: listingId,
      sales_lead_id: leadId,
      offer_id: offerId,
      thread_id: threadId,
      sender_type: 'agent',
      sender_id: (async () => { const u = await base44.auth.me(); return u.id; })(),
      sender_name: (async () => { const u = await base44.auth.me(); return u.full_name; })(),
      sender_email: (async () => { const u = await base44.auth.me(); return u.email; })(),
      recipient_type: leadId ? 'buyer' : 'seller',
      recipient_id: 'pending',
      recipient_name: 'Client',
      recipient_email: 'pending',
      subject: subject || 'Re: Property Inquiry',
      body: newMessage,
      message_type: messageType,
      status: 'sent',
    });
  };

  const messageTypeColors = {
    offer_update: 'bg-blue-100 text-blue-800',
    viewing_request: 'bg-green-100 text-green-800',
    viewing_confirmation: 'bg-purple-100 text-purple-800',
    general_inquiry: 'bg-gray-100 text-gray-800',
    negotiation: 'bg-amber-100 text-amber-800',
    document_request: 'bg-red-100 text-red-800',
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Clock className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Communication Thread</CardTitle>
          </div>
          <Badge variant="outline">{messages.length} messages</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs mt-1">Start the conversation below</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg p-3 ${
                      msg.sender_type === 'agent'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold">{msg.sender_name}</span>
                      <Badge 
                        className={`text-[10px] px-1.5 py-0 ${messageTypeColors[msg.message_type] || 'bg-gray-100 text-gray-800'}`}
                        variant="secondary"
                      >
                        {msg.message_type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    {msg.subject && (
                      <div className="text-xs font-medium mb-1 opacity-90">{msg.subject}</div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                      <span>{format(new Date(msg.created_date), 'dd MMM HH:mm')}</span>
                      {msg.is_sms_sent && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          SMS sent
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4 space-y-3">
          <Input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="text-sm"
          />
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[100px] text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                className="text-sm border rounded px-2 py-1 bg-background"
              >
                <option value="general_inquiry">General Inquiry</option>
                <option value="offer_update">Offer Update</option>
                <option value="viewing_request">Viewing Request</option>
                <option value="viewing_confirmation">Viewing Confirmation</option>
                <option value="negotiation">Negotiation</option>
                <option value="document_request">Document Request</option>
              </select>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendSMS}
                  onChange={(e) => setSendSMS(e.target.checked)}
                  className="rounded"
                />
                Send SMS notification
              </label>
            </div>
            <Button 
              onClick={handleSend} 
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              size="sm"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}