import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const ANNOUNCEMENT_TYPES = {
  maintenance: { icon: AlertCircle, color: 'bg-orange-100 text-orange-700', label: 'Maintenance' },
  update: { icon: Info, color: 'bg-blue-100 text-blue-700', label: 'Update' },
  legal: { icon: AlertCircle, color: 'bg-red-100 text-red-700', label: 'Legal Notice' },
  general: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', label: 'General' }
};

export default function AnnouncementsPanel({ property }) {
  const { data: announcements = [], isLoading, refetch } = useQuery({
    queryKey: ['announcements', property?.id],
    enabled: !!property,
    queryFn: async () => {
      return await base44.entities.Message.filter(
        { 
          property_id: property.id,
          message_type: 'announcement'
        },
        '-created_date',
        20
      ).catch(() => []);
    },
    refetchInterval: 10000 // Poll every 10 seconds
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!property) return;
    
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data?.property_id === property.id && event.data?.message_type === 'announcement') {
        refetch();
      }
    });

    return () => unsubscribe?.();
  }, [property?.id, refetch]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-muted-foreground">Loading announcements...</p>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <Card className="p-12 bg-white text-center">
        <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No announcements at the moment</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map(announcement => {
        const typeConfig = ANNOUNCEMENT_TYPES[announcement.announcement_type] || ANNOUNCEMENT_TYPES.general;
        const TypeIcon = typeConfig.icon;

        return (
          <Card key={announcement.id} className="p-6 bg-white hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <div className="flex gap-4">
              <div className={`flex items-start justify-center w-10 h-10 rounded-lg shrink-0 ${typeConfig.color}`}>
                <TypeIcon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-foreground text-lg">{announcement.subject || announcement.title}</h3>
                  <Badge className={`text-xs shrink-0 ${typeConfig.color}`}>
                    {typeConfig.label}
                  </Badge>
                </div>

                <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                  {announcement.content || announcement.body}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {announcement.created_by && `From: ${announcement.created_by}`}
                  </span>
                  <span>
                    {format(new Date(announcement.created_date), 'dd MMM yyyy, HH:mm')}
                  </span>
                </div>

                {/* Attachments */}
                {announcement.attachments?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs font-semibold text-foreground mb-2">Attachments:</p>
                    <div className="flex flex-wrap gap-2">
                      {announcement.attachments.map((attachment, idx) => (
                        <a
                          key={idx}
                          href={attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          Attachment {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}