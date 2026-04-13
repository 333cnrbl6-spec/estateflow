import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  TrendingUp,
  Clock
} from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  new: "bg-blue-500",
  contacted: "bg-yellow-500",
  qualified: "bg-green-500",
  nurturing: "bg-purple-500",
  converted: "bg-emerald-500",
  lost: "bg-red-500",
};

const typeIcons = {
  buyer: <TrendingUp className="w-4 h-4" />,
  seller: <User className="w-4 h-4" />,
  landlord: <MapPin className="w-4 h-4" />,
  tenant: <Clock className="w-4 h-4" />,
};

export default function LeadCard({ lead }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${statusColors[lead.status] || 'bg-gray-500'} text-white`}>
              {typeIcons[lead.lead_type] || <User className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{lead.contact_name}</h3>
              <p className="text-sm text-muted-foreground capitalize">{lead.lead_type}</p>
            </div>
          </div>
          <Badge variant={lead.status === 'new' ? 'default' : 'secondary'}>
            {lead.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Contact Info */}
        <div className="space-y-2 text-sm">
          {lead.contact_email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span className="truncate">{lead.contact_email}</span>
            </div>
          )}
          {lead.contact_phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{lead.contact_phone}</span>
            </div>
          )}
        </div>

        {/* Property Preferences */}
        {(lead.property_type || lead.location_preference || lead.bedrooms_min) && (
          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">PROPERTY PREFERENCES</p>
            <div className="space-y-1 text-sm">
              {lead.property_type && (
                <p className="capitalize">{lead.property_type}</p>
              )}
              {lead.location_preference && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{lead.location_preference}</span>
                </div>
              )}
              {lead.bedrooms_min && (
                <p>{lead.bedrooms_min}+ bedrooms</p>
              )}
              {(lead.budget_min || lead.budget_max) && (
                <p className="font-medium">
                  £{(lead.budget_min || 0).toLocaleString()} - £{(lead.budget_max || 0).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="border-t pt-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Calendar className="w-3 h-3" />
            <span>Timescale: <span className="font-medium text-foreground capitalize">{lead.timescale?.replace('_', ' ')}</span></span>
          </div>
          {lead.next_follow_up_date && (
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-3 h-3" />
              <span>Follow up: <span className="font-medium">{formatDate(lead.next_follow_up_date)}</span></span>
            </div>
          )}
        </div>

        {/* Lead Score */}
        {lead.lead_score > 0 && (
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Lead Score</span>
              <span className="text-sm font-bold">{lead.lead_score}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className={`h-2 rounded-full ${lead.lead_score > 70 ? 'bg-green-500' : lead.lead_score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${lead.lead_score}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="border-t pt-3 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Mail className="w-3 h-3 mr-1" />
            Email
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Phone className="w-3 h-3 mr-1" />
            Call
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}