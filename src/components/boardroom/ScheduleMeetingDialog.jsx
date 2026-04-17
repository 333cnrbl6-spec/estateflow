import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ScheduleMeetingDialog({ open, onOpenChange, onMeetingCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    meeting_date: '',
    meeting_time: '09:00',
    attendees: [],
    agenda_items: [{ topic: '', priority: 'medium', description: '' }]
  });
  const [selectedAttendees, setSelectedAttendees] = useState([]);

  const queryClient = useQueryClient();

  // Fetch board members for attendee selection
  const { data: boardMembers = [] } = useQuery({
    queryKey: ['board-members'],
    queryFn: () => base44.entities.BoardMember.list()
  });

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const createMeetingMutation = useMutation({
    mutationFn: async (meetingData) => {
      const [dateStr, timeStr] = [meetingData.meeting_date, meetingData.meeting_time];
      const meetingDateTime = new Date(`${dateStr}T${timeStr}:00`).toISOString();

      return base44.entities.BoardMeeting.create({
        title: meetingData.title,
        called_by: currentUser?.email || 'System',
        attendees: meetingData.attendees,
        status: 'scheduled',
        meeting_date: meetingDateTime,
        agenda_items: meetingData.agenda_items.filter(a => a.topic),
        discussion_threads: [],
        decisions: [],
        notes: ''
      });
    },
    onSuccess: (meeting) => {
      queryClient.invalidateQueries({ queryKey: ['board-meetings'] });
      toast.success(`Meeting "${meeting.title}" scheduled successfully!`);
      
      // Reset form
      setFormData({
        title: '',
        meeting_date: '',
        meeting_time: '09:00',
        attendees: [],
        agenda_items: [{ topic: '', priority: 'medium', description: '' }]
      });
      setSelectedAttendees([]);
      
      onOpenChange(false);
      if (onMeetingCreated) onMeetingCreated(meeting);
    },
    onError: (error) => {
      toast.error(`Failed to schedule meeting: ${error.message}`);
    }
  });

  const handleAddAgendaItem = () => {
    setFormData({
      ...formData,
      agenda_items: [...formData.agenda_items, { topic: '', priority: 'medium', description: '' }]
    });
  };

  const handleRemoveAgendaItem = (index) => {
    setFormData({
      ...formData,
      agenda_items: formData.agenda_items.filter((_, i) => i !== index)
    });
  };

  const handleAttendeeToggle = (memberName) => {
    setSelectedAttendees(prev => {
      if (prev.includes(memberName)) {
        return prev.filter(a => a !== memberName);
      } else {
        return [...prev, memberName];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Meeting title is required');
      return;
    }

    if (!formData.meeting_date) {
      toast.error('Meeting date is required');
      return;
    }

    if (selectedAttendees.length === 0) {
      toast.error('Please select at least one attendee');
      return;
    }

    createMeetingMutation.mutate({
      ...formData,
      attendees: selectedAttendees
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule New Board Meeting</DialogTitle>
          <DialogDescription>
            Create a new board meeting and select attendees. Invitations will be sent automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meeting Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input
              id="title"
              placeholder="e.g., Q2 Strategic Planning Session"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={formData.meeting_date}
                  onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={formData.meeting_time}
                  onChange={(e) => setFormData({ ...formData, meeting_time: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Attendees Selection */}
          <div className="space-y-2">
            <Label>Select Attendees</Label>
            <div className="border rounded-lg p-4 space-y-2 max-h-40 overflow-y-auto">
              {boardMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No board members found</p>
              ) : (
                boardMembers.map(member => (
                  <label key={member.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedAttendees.includes(member.member_name)}
                      onChange={() => handleAttendeeToggle(member.member_name)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{member.member_name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
            {selectedAttendees.length > 0 && (
              <p className="text-sm text-muted-foreground">{selectedAttendees.length} attendee(s) selected</p>
            )}
          </div>

          {/* Agenda Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Agenda Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAgendaItem}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Item
              </Button>
            </div>
            <div className="space-y-3">
              {formData.agenda_items.map((item, idx) => (
                <div key={idx} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Agenda topic"
                      value={item.topic}
                      onChange={(e) => {
                        const updated = [...formData.agenda_items];
                        updated[idx].topic = e.target.value;
                        setFormData({ ...formData, agenda_items: updated });
                      }}
                      className="flex-1"
                    />
                    <Select
                      value={item.priority}
                      onValueChange={(value) => {
                        const updated = [...formData.agenda_items];
                        updated[idx].priority = value;
                        setFormData({ ...formData, agenda_items: updated });
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.agenda_items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAgendaItem(idx)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                  <Textarea
                    placeholder="Brief description (optional)"
                    value={item.description}
                    onChange={(e) => {
                      const updated = [...formData.agenda_items];
                      updated[idx].description = e.target.value;
                      setFormData({ ...formData, agenda_items: updated });
                    }}
                    className="text-sm h-16"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMeetingMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMeetingMutation.isPending}
            >
              {createMeetingMutation.isPending ? 'Scheduling...' : 'Schedule Meeting'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}