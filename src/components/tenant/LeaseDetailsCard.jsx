import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Home, User, FileText } from 'lucide-react';

export default function LeaseDetailsCard({ lease, property, unit, tenant }) {
  if (!lease) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No active lease found.</p>
        </CardContent>
      </Card>
    );
  }

  const startDate = new Date(lease.start_date);
  const endDate = new Date(lease.end_date);
  const today = new Date();
  const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysRemaining < 60 && daysRemaining > 0;
  const isExpired = daysRemaining <= 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Lease Agreement
            </CardTitle>
            <Badge className={
              lease.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }>
              {lease.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Property & Unit */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <Home className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Property</p>
                <p className="font-semibold text-slate-900">{property?.name || 'N/A'}</p>
                <p className="text-xs text-muted-foreground mt-1">{property?.address_line_1}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Unit</p>
                <p className="font-semibold text-slate-900">{unit?.name || 'N/A'}</p>
                <p className="text-xs text-muted-foreground mt-1">{unit?.unit_type || 'Studio/Flat'}</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-semibold text-slate-900">{startDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-semibold text-slate-900">{endDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                {isExpiringSoon && !isExpired && (
                  <p className="text-xs text-orange-600 mt-1 font-medium">⚠ Expires in {daysRemaining} days</p>
                )}
                {isExpired && (
                  <p className="text-xs text-red-600 mt-1 font-medium">⚠ Lease has expired</p>
                )}
              </div>
            </div>
          </div>

          {/* Rent Details */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Monthly Rent</span>
              <span className="font-semibold text-lg text-slate-900">£{(lease.monthly_rent / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Deposit Held</span>
              <span className="font-semibold text-slate-900">£{(lease.deposit || 0 / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Lease Term</span>
              <span className="font-semibold text-slate-900">{lease.lease_term_months || 12} months</span>
            </div>
          </div>

          {/* Terms */}
          {lease.terms && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">Key Terms</p>
              <p className="text-sm text-blue-700 whitespace-pre-wrap">{lease.terms.substring(0, 300)}...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tenant Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Your Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><span className="text-muted-foreground">Name:</span> <span className="font-medium">{tenant.full_name}</span></p>
          <p><span className="text-muted-foreground">Email:</span> <span className="font-medium">{tenant.email}</span></p>
          <p><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{tenant.phone || 'Not provided'}</span></p>
        </CardContent>
      </Card>
    </div>
  );
}