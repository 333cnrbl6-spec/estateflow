import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, MessageCircle, Clock, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';

function MessageBubble({ msg, isAdmin }) {
  return (
    <div className={`flex gap-3 ${msg.sender_type === 'tenant' ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-xs rounded-lg p-3 ${msg.sender_type === 'tenant'
        ? 'bg-slate-100 text-slate-900'
        : 'bg-primary text-primary-foreground'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs font-semibold">{msg.sender_name}</p>
          <span className={`text-[10px] ${msg.sender_type === 'tenant' ? 'text-slate-500' : 'text-primary-foreground/70'}`}>
            {format(parseISO(msg.created_date), 'HH:mm')}
          </span>
        </div>
        <p className="text-sm">{msg.body}</p>
        {msg.status === 'unread' && msg.sender_type !== 'tenant' && (
          <Badge variant="secondary" className="mt-2 text-[10px]">New</Badge>
        )}
      </div>
    </div>
  );
}

export default function TenantMessageThread({ tenantId, propertyId, unitId, maintenanceOrderId }) {
  const qc = useQueryClient();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('inquiry');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);

  // Create unique thread ID based on context
  const threadId = maintenanceOrderId || `tenant-${tenantId}-${propertyId}-general`;

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['tenant-messages', threadId],
    queryFn: () => base44.entities.Message.filter({ thread_id: threadId }),
    enabled: !!tenantId,
  });

  const sendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.Message.create({
        tenant_id: tenantId,
        property_id: propertyId,
        unit_id: unitId,
        maintenance_order_id: maintenanceOrderId,
        thread_id: threadId,
        sender_type: 'tenant',
        sender_name: user.full_name,
        sender_email: user.email,
        body: message,
        subject: subject || 'General Inquiry',
        message_type: messageType,
        status: 'unread',
      });

      // Create notification for admins
      await base44.asServiceRole.entities.TenantNotification.create({
        tenant_id: tenantId,
        title: `💬 New message from ${user.full_name}`,
        message: message.substring(0, 100),
        notification_type: 'update',
        is_read: false,
        sent_date: new Date().toISOString(),
        notes: `message:${threadId}`,
      });

      qc.invalidateQueries({ queryKey: ['tenant-messages', threadId] });
      setMessage('');
      setSubject('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* New message form */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> Send a Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject</label>
            <Input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Question about lease, Maintenance issue"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Message Type</label>
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inquiry">General Inquiry</SelectItem>
                <SelectItem value="complaint">Complaint</SelectItem>
                <SelectItem value="document">Document Request</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Message</label>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              placeholder="Type your message here…"
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!message.trim() || sending}
            className="w-full gap-2"
          >
            {sending ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</> : <><Send className="w-4 h-4" />Send Message</>}
          </Button>
        </CardContent>
      </Card>

      {/* Message thread */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> Conversation ({messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-6">Loading messages…</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No messages yet. Start a conversation above.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map(msg => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700 flex items-start gap-2">
        <Clock className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Communication Trail</p>
          <p>All messages are logged and accessible to your property manager. Expect a response within 24-48 hours.</p>
        </div>
      </div>
    </div>
  );
}