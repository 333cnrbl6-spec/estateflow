import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MessageCircle, Search, Loader2, Send, Check, Archive, Filter,
  MessageSquare, Clock, User, AlertCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

function ThreadCard({ thread, unreadCount, onClick, selected }) {
  const latestMsg = thread.messages?.[thread.messages.length - 1];
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg border cursor-pointer transition-all ${
        selected ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm truncate">{thread.tenant_name}</p>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-xs">{unreadCount}</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{latestMsg?.subject || latestMsg?.body || 'No messages'}</p>
          <p className="text-xs text-muted-foreground mt-1">{latestMsg?.created_date ? format(parseISO(latestMsg.created_date), 'MMM d, HH:mm') : '—'}</p>
        </div>
        <div className={`w-2 h-2 rounded-full shrink-0 ${unreadCount > 0 ? 'bg-red-500' : 'bg-slate-300'}`} />
      </div>
    </div>
  );
}

export default function MessagesAdmin() {
  const qc = useQueryClient();
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [filter, setFilter] = useState('unread'); // unread | all

  const { data: messages = [] } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => base44.asServiceRole.entities.Message.list('-created_date', 1000),
  });

  // Group messages by thread
  const threads = {};
  messages.forEach(msg => {
    if (!threads[msg.thread_id]) {
      threads[msg.thread_id] = {
        thread_id: msg.thread_id,
        tenant_id: msg.tenant_id,
        tenant_name: msg.sender_type === 'tenant' ? msg.sender_name : `${msg.sender_name} (Admin)`,
        property_id: msg.property_id,
        messages: [],
        unreadCount: 0,
      };
    }
    threads[msg.thread_id].messages.push(msg);
    if (msg.status === 'unread') threads[msg.thread_id].unreadCount += 1;
  });

  const threadList = Object.values(threads).sort((a, b) => {
    const aDate = a.messages[a.messages.length - 1]?.created_date || '';
    const bDate = b.messages[b.messages.length - 1]?.created_date || '';
    return new Date(bDate) - new Date(aDate);
  });

  const filteredThreads = filter === 'unread' ? threadList.filter(t => t.unreadCount > 0) : threadList;
  const selectedThread = threads[selectedThreadId];

  const sendReply = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const msg = await base44.asServiceRole.entities.Message.create({
        tenant_id: selectedThread.tenant_id,
        thread_id: selectedThreadId,
        property_id: selectedThread.property_id,
        sender_type: 'admin',
        sender_name: user.full_name,
        sender_email: user.email,
        body: replyText,
        subject: `Re: ${selectedThread.messages[0]?.subject || 'Message'}`,
        status: 'read',
        message_type: 'other',
      });

      // Create tenant notification
      await base44.asServiceRole.entities.TenantNotification.create({
        tenant_id: selectedThread.tenant_id,
        title: `📬 Response to your message from property manager`,
        message: replyText.substring(0, 100),
        notification_type: 'update',
        is_read: false,
        sent_date: new Date().toISOString(),
        notes: `message-reply:${selectedThreadId}`,
      });

      // Mark original messages as read
      for (const m of selectedThread.messages.filter(m => m.status === 'unread')) {
        await base44.asServiceRole.entities.Message.update(m.id, { status: 'read' });
      }

      return msg;
    },
    onSuccess: () => {
      setReplyText('');
      qc.invalidateQueries({ queryKey: ['admin-messages'] });
    },
  });

  const totalUnread = threadList.reduce((s, t) => s + t.unreadCount, 0);

  return (
    <div className="min-h-screen bg-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <MessageCircle className="w-7 h-7 text-primary" /> Tenant Messages
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage tenant inquiries and maintenance requests</p>
        </div>

        {totalUnread > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 flex items-center gap-2 text-sm text-amber-800">
            <AlertCircle className="w-4 h-4" />
            You have <strong>{totalUnread} unread message{totalUnread !== 1 ? 's' : ''}</strong>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Thread list */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <div className="space-y-3">
                  <CardTitle className="text-base">Conversations ({filteredThreads.length})</CardTitle>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilter('unread')}
                      className={`text-xs px-2 py-1 rounded-md ${filter === 'unread' ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-700'}`}
                    >
                      Unread ({threadList.reduce((s, t) => s + t.unreadCount, 0)})
                    </button>
                    <button
                      onClick={() => setFilter('all')}
                      className={`text-xs px-2 py-1 rounded-md ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-700'}`}
                    >
                      All ({threadList.length})
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {filteredThreads.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No messages</p>
                ) : (
                  filteredThreads.map(thread => (
                    <ThreadCard
                      key={thread.thread_id}
                      thread={thread}
                      unreadCount={thread.unreadCount}
                      selected={selectedThreadId === thread.thread_id}
                      onClick={() => setSelectedThreadId(thread.thread_id)}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Message detail */}
          <div className="lg:col-span-2">
            {selectedThread ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedThread.tenant_name}</span>
                    <Badge variant="outline">{selectedThread.messages.length} messages</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Messages */}
                  <div className="space-y-3 max-h-80 overflow-y-auto border rounded-lg p-4 bg-slate-50">
                    {selectedThread.messages.map(msg => (
                      <div key={msg.id} className={`p-3 rounded-lg ${
                        msg.sender_type === 'tenant'
                          ? 'bg-white border border-slate-200'
                          : 'bg-primary text-primary-foreground'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold">{msg.sender_name}</p>
                          <span className="text-[10px] opacity-70">{format(parseISO(msg.created_date), 'MMM d, HH:mm')}</span>
                        </div>
                        {msg.subject && <p className="text-xs font-medium opacity-80 mb-1">{msg.subject}</p>}
                        <p className="text-sm">{msg.body}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <Badge variant={msg.message_type === 'maintenance' ? 'default' : 'secondary'} className="text-[10px]">
                            {msg.message_type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply form */}
                  <div className="space-y-2 border-t pt-4">
                    <label className="text-xs font-medium text-muted-foreground">Your Reply</label>
                    <Textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      rows={3}
                      placeholder="Type your response…"
                    />
                    <Button
                      onClick={() => sendReply.mutate()}
                      disabled={!replyText.trim() || sendReply.isPending}
                      className="w-full gap-2"
                    >
                      {sendReply.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</> : <><Send className="w-4 h-4" />Send Reply</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Select a conversation to view messages and reply</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}