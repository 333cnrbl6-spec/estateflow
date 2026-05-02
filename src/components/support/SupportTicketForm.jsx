import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';

export default function SupportTicketForm() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('technical');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.SupportTicket.create({
        user_id: user.id,
        subject,
        description,
        category,
        priority: 'medium',
        status: 'open'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setSubject('');
      setDescription('');
      alert('Ticket created! Our team will respond within 24 hours.');
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Support Ticket</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-900">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Brief description of your issue"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-900">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg mt-1"
          >
            <option value="technical">Technical Issue</option>
            <option value="billing">Billing</option>
            <option value="feature_request">Feature Request</option>
            <option value="onboarding">Onboarding Help</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-900">Description</label>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Provide as much detail as possible..."
            className="w-full mt-1 h-32"
          />
        </div>

        <Button 
          onClick={() => createMutation.mutate()}
          disabled={!subject || !description || createMutation.isPending}
          className="w-full"
        >
          {createMutation.isPending ? 'Creating...' : 'Submit Ticket'}
        </Button>
      </CardContent>
    </Card>
  );
}