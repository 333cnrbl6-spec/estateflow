import React from 'react';
import { AlertCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function LeaseExpirationCard({ upcomingExpirations }) {
  const getDaysUntilExpiry = (date) => {
    const now = new Date();
    const expiryDate = new Date(date);
    const diffTime = expiryDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyColor = (daysLeft) => {
    if (daysLeft <= 14) return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
    if (daysLeft <= 30) return 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800';
    return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
  };

  const getUrgencyBadge = (daysLeft) => {
    if (daysLeft <= 14) return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100';
    if (daysLeft <= 30) return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-100';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100';
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Upcoming Lease Expirations
      </h3>
      
      {upcomingExpirations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No lease expirations in the next 90 days</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {upcomingExpirations.map((tenant) => {
            const daysLeft = getDaysUntilExpiry(tenant.lease_end_date);
            return (
              <div
                key={tenant.id}
                className={`p-3 rounded-lg border ${getUrgencyColor(daysLeft)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{tenant.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(tenant.lease_end_date), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${getUrgencyBadge(daysLeft)}`}>
                    {daysLeft} days
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}