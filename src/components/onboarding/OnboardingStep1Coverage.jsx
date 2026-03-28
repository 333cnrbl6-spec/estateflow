import React from 'react';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const DAYS = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

export default function OnboardingStep1Coverage({ formData, updateFormData }) {
  const toggleDay = (day) => {
    const days = formData.coverageDays;
    const updated = days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
    updateFormData('coverageDays', updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="company-name" className="text-base font-semibold mb-2 block">
          Company Name
        </Label>
        <Input
          id="company-name"
          placeholder="Enter your company name"
          value={formData.companyName}
          onChange={(e) => updateFormData('companyName', e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="start-time" className="text-base font-semibold mb-2 block">
            Coverage Start Time
          </Label>
          <p className="text-xs text-muted-foreground mb-2">When does your out-of-hours period begin?</p>
          <Input
            id="start-time"
            type="time"
            value={formData.coverageStartTime}
            onChange={(e) => updateFormData('coverageStartTime', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="end-time" className="text-base font-semibold mb-2 block">
            Coverage End Time
          </Label>
          <p className="text-xs text-muted-foreground mb-2">When does your out-of-hours period end?</p>
          <Input
            id="end-time"
            type="time"
            value={formData.coverageEndTime}
            onChange={(e) => updateFormData('coverageEndTime', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-4 block">Days Requiring Coverage</Label>
        <p className="text-xs text-muted-foreground mb-4">
          Select which days you need after-hours support
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DAYS.map((day) => (
            <Card
              key={day.id}
              className={`cursor-pointer transition-all ${
                formData.coverageDays.includes(day.id)
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => toggleDay(day.id)}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <Checkbox
                  checked={formData.coverageDays.includes(day.id)}
                  onCheckedChange={() => toggleDay(day.id)}
                  className="cursor-pointer"
                />
                <span className="text-sm font-medium">{day.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-secondary/30 border-secondary">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={formData.holidaysCovered}
              onCheckedChange={(checked) => updateFormData('holidaysCovered', checked)}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-sm mb-1">Include Bank Holidays & Christmas Period</p>
              <p className="text-xs text-muted-foreground">
                If checked, coverage will extend to national holidays and festive periods
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">💡 Tip:</span> Most property managers enable 24/7 coverage on weekends and
          evenings (6pm-8am weekdays).
        </p>
      </div>
    </div>
  );
}