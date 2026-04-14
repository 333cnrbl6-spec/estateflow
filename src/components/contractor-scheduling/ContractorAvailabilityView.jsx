import React, { useState } from 'react';
import { Calendar, MapPin, Phone, Mail, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function ContractorAvailabilityView({ contractors }) {
  const [selectedContractor, setSelectedContractor] = useState(contractors[0]?.id);

  const activeContractor = contractors.find(c => c.id === selectedContractor);

  if (!activeContractor) {
    return <div className="text-center py-12 text-muted-foreground">No contractors available</div>;
  }

  // Sample availability - in a real app this would come from the contractor's availability data
  const availability = [
    { day: 'Monday', hours: '09:00 - 17:00', available: true },
    { day: 'Tuesday', hours: '09:00 - 17:00', available: true },
    { day: 'Wednesday', hours: '09:00 - 17:00', available: true },
    { day: 'Thursday', hours: '09:00 - 17:00', available: true },
    { day: 'Friday', hours: '09:00 - 16:00', available: true },
    { day: 'Saturday', hours: 'On-call', available: false },
    { day: 'Sunday', hours: 'Unavailable', available: false },
  ];

  return (
    <div className="space-y-6">
      {/* Contractor Selector */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Select Contractor</label>
        <select
          value={selectedContractor}
          onChange={(e) => setSelectedContractor(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {contractors.map(contractor => (
            <option key={contractor.id} value={contractor.id}>
              {contractor.name}
            </option>
          ))}
        </select>
      </div>

      {/* Contractor Info Card */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-foreground mb-4">{activeContractor.name}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {activeContractor.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              <span>{activeContractor.phone}</span>
            </div>
          )}
          {activeContractor.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <span>{activeContractor.email}</span>
            </div>
          )}
          {activeContractor.address_line_1 && (
            <div className="flex items-center gap-2 col-span-1 md:col-span-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{activeContractor.address_line_1}</span>
            </div>
          )}
        </div>

        {activeContractor.specialties && (
          <div className="mt-4 pt-4 border-t border-primary/20">
            <p className="text-xs text-muted-foreground mb-2">SPECIALTIES</p>
            <div className="flex flex-wrap gap-2">
              {activeContractor.specialties.split(',').map((spec, i) => (
                <span key={i} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-semibold">
                  {spec.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Availability Schedule */}
      <div>
        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Weekly Availability
        </h4>
        <div className="space-y-2">
          {availability.map((slot, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                slot.available
                  ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                  : 'bg-muted border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                {slot.available ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-muted-foreground" />
                )}
                <span className="font-semibold text-foreground">{slot.day}</span>
              </div>
              <span className={`text-sm ${slot.available ? 'text-green-700 dark:text-green-100' : 'text-muted-foreground'}`}>
                {slot.hours}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rating/Performance Info */}
      <div className="bg-card rounded-lg border border-border p-4">
        <p className="text-sm text-muted-foreground mb-2">Average Response Time</p>
        <p className="text-2xl font-bold text-foreground">2.5 hours</p>
        <p className="text-xs text-muted-foreground mt-2">Based on last 10 assignments</p>
      </div>
    </div>
  );
}