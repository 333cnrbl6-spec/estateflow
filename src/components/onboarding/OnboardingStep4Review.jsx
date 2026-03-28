import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

const TIER_NAMES = {
  basic: 'Basic',
  standard: 'Standard',
  premium: 'Premium',
  enterprise: 'Enterprise',
};

export default function OnboardingStep4Review({ formData }) {
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDays = (days) => {
    const dayLabels = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun',
    };
    return days.map((d) => dayLabels[d]).join(', ');
  };

  const getTierPrice = () => {
    const prices = {
      basic: 75,
      standard: 200,
      premium: 450,
      enterprise: 900,
    };
    return prices[formData.selectedTier];
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-green-900">Ready to activate!</p>
          <p className="text-sm text-green-800 mt-1">
            Review your settings below and click "Complete Setup" to activate your out-of-hours coverage.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Coverage Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Start Time</p>
              <p className="text-lg font-semibold">{formatTime(formData.coverageStartTime)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">End Time</p>
              <p className="text-lg font-semibold">{formatTime(formData.coverageEndTime)}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Days Covered</p>
            <div className="flex flex-wrap gap-2">
              {formatDays(formData.coverageDays)
                .split(', ')
                .map((day) => (
                  <Badge key={day} className="bg-blue-100 text-blue-900">
                    {day}
                  </Badge>
                ))}
            </div>
          </div>

          {formData.holidaysCovered && (
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-600" />
                <p className="text-sm text-foreground">Bank holidays and festive periods included</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Escalation Contacts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.primaryContact.name && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Primary Contact</p>
              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="font-semibold text-sm">{formData.primaryContact.name}</p>
                <p className="text-xs text-muted-foreground">{formData.primaryContact.role}</p>
                <a href={`tel:${formData.primaryContact.phone}`} className="text-xs text-primary hover:underline">
                  {formData.primaryContact.phone}
                </a>
                <a href={`mailto:${formData.primaryContact.email}`} className="block text-xs text-primary hover:underline">
                  {formData.primaryContact.email}
                </a>
              </div>
            </div>
          )}

          {formData.secondaryContact.name && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Secondary Contact</p>
              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="font-semibold text-sm">{formData.secondaryContact.name}</p>
                <p className="text-xs text-muted-foreground">{formData.secondaryContact.role}</p>
                <a href={`tel:${formData.secondaryContact.phone}`} className="text-xs text-primary hover:underline">
                  {formData.secondaryContact.phone}
                </a>
                <a href={`mailto:${formData.secondaryContact.email}`} className="block text-xs text-primary hover:underline">
                  {formData.secondaryContact.email}
                </a>
              </div>
            </div>
          )}

          {formData.emergencyContactPhone && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Emergency Contact</p>
              <p className="text-sm text-foreground">{formData.emergencyContactPhone}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Service Tier</p>
              <div className="flex items-center gap-2 mt-2">
                <h3 className="text-xl font-bold">{TIER_NAMES[formData.selectedTier]}</h3>
                {formData.selectedTier === 'standard' && (
                  <Badge className="bg-primary">Recommended</Badge>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Billing Cycle</p>
              <p className="text-lg font-semibold mt-2 capitalize">
                {formData.billingCycle === 'monthly' ? 'Monthly' : 'Annual (Save 10%)'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Monthly Cost:</span>
              <span className="text-2xl font-bold text-primary">£{getTierPrice()}</span>
            </div>
            {formData.billingCycle === 'annual' && (
              <p className="text-xs text-green-600 mt-2">
                Annual cost: £{Math.round(getTierPrice() * 12 * 0.9)} (includes 10% discount)
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-secondary/30 border-secondary">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-3">
            <span className="font-semibold">What happens next?</span>
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-bold text-foreground">1.</span>
              <span>Your service will be activated immediately</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-foreground">2.</span>
              <span>Escalation contacts will receive welcome emails with app links</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-foreground">3.</span>
              <span>You'll be assigned a dedicated success manager</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-foreground">4.</span>
              <span>First billing occurs at the end of your first month</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}