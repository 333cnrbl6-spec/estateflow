import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const navigate = useNavigate();

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ['board-notifications'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return [];
      return base44.entities.Notification.filter(
        { recipient_email: user.email, read: false },
        '-created_date',
        20
      );
    },
    staleTime: 1 * 60 * 1000
  });

  const unreadCount = notifications.length;

  const handleMarkAsRead = async (notificationId) => {
    await base44.entities.Notification.update(notificationId, {
      read: true,
      read_at: new Date().toISOString()
    });
    refetch();
  };

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification.id);
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="font-semibold">
          {unreadCount === 0 ? 'No new notifications' : `${unreadCount} unread`}
        </DropdownMenuLabel>
        {unreadCount > 0 && (
          <>
            <DropdownMenuSeparator />
            {notifications.map(notification => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className="flex flex-col items-start gap-2 p-3 cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-start justify-between w-full">
                  <p className="font-medium text-sm text-slate-900">{notification.title}</p>
                  <div className="ml-2 w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1"></div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notification.message}</p>
                <p className="text-xs text-slate-400">
                  {format(new Date(notification.created_date), 'MMM d, p')}
                </p>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}