import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Bell, Trash2, Check, AlertCircle, Calendar, FileText, Home } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationCenter({ tenantId }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [tenantId]);

  const loadNotifications = async () => {
    try {
      const data = await base44.entities.TenantNotification.filter({ 
        tenant_id: tenantId 
      }, '-created_at', 20);
      setNotifications(data || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await base44.entities.TenantNotification.update(notificationId, {
        read: true,
        read_at: new Date().toISOString()
      });
      loadNotifications();
    } catch (err) {
      toast.error('Error updating notification');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      // Soft delete by archiving
      await base44.entities.TenantNotification.delete(notificationId);
      loadNotifications();
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Error deleting notification');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    const icons = {
      rent_payment_due: <AlertCircle className="w-5 h-5 text-orange-500" />,
      rent_payment_overdue: <AlertCircle className="w-5 h-5 text-red-500" />,
      inspection_scheduled: <Calendar className="w-5 h-5 text-blue-500" />,
      document_expiring: <FileText className="w-5 h-5 text-yellow-500" />,
      tenancy_renewal: <Home className="w-5 h-5 text-purple-500" />
    };
    return icons[type] || <Bell className="w-5 h-5" />;
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      rent_payment_due: 'bg-orange-100 text-orange-800',
      rent_payment_overdue: 'bg-red-100 text-red-800',
      inspection_scheduled: 'bg-blue-100 text-blue-800',
      document_expiring: 'bg-yellow-100 text-yellow-800',
      tenancy_renewal: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading notifications...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} new</Badge>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-muted-foreground">No notifications yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <Card 
              key={notification.id} 
              className={notification.read ? 'opacity-60' : 'border-l-4 border-l-primary'}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {getIcon(notification.type)}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{notification.title}</h3>
                      <Badge className={getTypeBadgeColor(notification.type)}>
                        {notification.type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>

                    {notification.due_date && (
                      <p className="text-xs text-muted-foreground mb-3">
                        Due: {new Date(notification.due_date).toLocaleDateString('en-GB')}
                      </p>
                    )}

                    <div className="flex gap-2">
                      {notification.action_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={notification.action_url}>Take Action</a>
                        </Button>
                      )}
                      {!notification.read && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="gap-1"
                        >
                          <Check className="w-4 h-4" /> Mark Read
                        </Button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="text-muted-foreground hover:text-destructive transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}