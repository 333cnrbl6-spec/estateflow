import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bell, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function TenantAnnouncementsPanel({ propertyId }) {
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['property-announcements', propertyId],
    queryFn: async () => {
      const messages = await base44.entities.Message.filter(
        { property_id: propertyId, message_type: 'announcement' },
        '-created_date',
        20
      );
      return messages;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="bg-muted/30 rounded-lg p-8 text-center">
        <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
        <p className="text-muted-foreground font-semibold">No announcements</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {announcements.map(announcement => {
        const isUrgent = announcement.priority === 'urgent' || announcement.priority === 'high';
        const Icon = isUrgent ? AlertTriangle : Info;

        return (
          <div key={announcement.id} className={`rounded-lg p-4 border-l-4 ${
            isUrgent
              ? 'border-l-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
              : 'border-l-blue-500 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800'
          }`}>
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${
                isUrgent ? 'text-red-600' : 'text-blue-600'
              }`} />
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold ${
                  isUrgent ? 'text-red-900 dark:text-red-100' : 'text-blue-900 dark:text-blue-100'
                }`}>
                  {announcement.subject || 'Announcement'}
                </h4>
                <p className={`text-sm mt-1 ${
                  isUrgent ? 'text-red-800 dark:text-red-200' : 'text-blue-800 dark:text-blue-200'
                }`}>
                  {announcement.message || announcement.content}
                </p>
                <p className={`text-xs mt-2 opacity-75 ${
                  isUrgent ? 'text-red-700 dark:text-red-300' : 'text-blue-700 dark:text-blue-300'
                }`}>
                  {format(parseISO(announcement.created_date), 'dd MMM yyyy HH:mm')}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}