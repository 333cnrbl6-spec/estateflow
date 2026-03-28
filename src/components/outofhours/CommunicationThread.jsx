import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, MessageSquare, Phone, FileText, Send, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

const COMM_ICONS = {
  email: Mail,
  sms: MessageSquare,
  phone_note: Phone,
  internal_note: FileText,
};

const STATUS_COLORS = {
  sent: 'bg-blue-100 text-blue-900',
  delivered: 'bg-green-100 text-green-900',
  read: 'bg-green-100 text-green-900',
  failed: 'bg-red-100 text-red-900',
  pending: 'bg-yellow-100 text-yellow-900',
};

function CommunicationMessage({ message }) {
  const Icon = COMM_ICONS[message.communication_type];
  const isOutbound = message.direction === 'outbound';

  return (
    <div className={cn('flex gap-4 mb-4', isOutbound && 'flex-row-reverse')}>
      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', 
        isOutbound ? 'bg-primary/10' : 'bg-secondary/30'
      )}>
        <Icon className={cn('w-5 h-5', isOutbound ? 'text-primary' : 'text-muted-foreground')} />
      </div>

      <div className={cn('flex-1', isOutbound && 'text-right')}>
        <div className="flex items-center gap-2 mb-1" >
          <p className="text-sm font-semibold">
            {message.from_name}
            {isOutbound && ' (sent to)'}
          </p>
          <span className="text-xs text-muted-foreground">{message.from_contact}</span>
          <Badge className={STATUS_COLORS[message.status]} variant="outline">
            {message.status}
          </Badge>
        </div>

        {message.subject && (
          <p className="text-sm font-medium text-foreground mb-2">{message.subject}</p>
        )}

        <div className="bg-secondary/30 rounded-lg p-3 mb-2 text-sm text-foreground whitespace-pre-wrap">
          {message.body}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {message.attachments?.length > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="w-3 h-3" />
              <span>{message.attachments.length} file(s)</span>
            </div>
          )}
          <span>{new Date(message.timestamp).toLocaleString('en-GB')}</span>
        </div>
      </div>
    </div>
  );
}

export default function CommunicationThread({ callId }) {
  const queryClient = useQueryClient();
  const [messageType, setMessageType] = useState('email');
  const [messageBody, setMessageBody] = useState('');
  const [recipientType, setRecipientType] = useState('property_manager');

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['communications', callId],
    queryFn: () =>
      base44.entities.OutOfHoursCommunication.filter(
        { call_id: callId },
        'timestamp',
        100
      ),
  });

  const { data: callData } = useQuery({
    queryKey: ['outOfHoursCall', callId],
    queryFn: () => base44.entities.OutOfHoursCall.filter({ id: callId }, null, 1),
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData) =>
      base44.entities.OutOfHoursCommunication.create(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications', callId] });
      setMessageBody('');
    },
  });

  const handleSendMessage = () => {
    if (!messageBody.trim()) return;

    const call = callData?.[0];
    let toContact = '';
    let toName = '';

    if (recipientType === 'tenant') {
      toContact = call?.caller_phone || call?.caller_email || '';
      toName = call?.caller_name || 'Tenant';
    } else if (recipientType === 'contractor') {
      // In production, would select from assigned contractor
      toContact = 'contractor@example.com';
      toName = 'Assigned Contractor';
    }

    sendMessageMutation.mutate({
      call_id: callId,
      communication_type: messageType,
      direction: 'outbound',
      from_type: 'property_manager',
      from_name: 'Property Manager',
      from_contact: 'manager@company.com',
      to_type: recipientType,
      to_name: toName,
      to_contact: toContact,
      subject: messageType === 'email' ? `Re: Case ${callId}` : undefined,
      body: messageBody,
      status: 'sent',
      timestamp: new Date().toISOString(),
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Loading communications...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Communication Thread</CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No communications yet. Start by sending a message below.
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-4 pb-4">
              {messages.map((message) => (
                <CommunicationMessage key={message.id} message={message} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Send Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Type</label>
              <Select value={messageType} onValueChange={setMessageType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="phone_note">Phone Note</SelectItem>
                  <SelectItem value="internal_note">Internal Note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Send To</label>
              <Select value={recipientType} onValueChange={setRecipientType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tenant">Tenant</SelectItem>
                  <SelectItem value="contractor">Assigned Contractor</SelectItem>
                  <SelectItem value="property_manager">Internal Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Message</label>
            <textarea
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="Type your message here..."
              className="w-full h-24 p-3 border border-input rounded-md font-sans text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setMessageBody('')}
              disabled={!messageBody.trim()}
            >
              Clear
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!messageBody.trim() || sendMessageMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}