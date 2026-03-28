import React, { useState } from 'react';
import { AlertCircle, Shield, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function AccessibilityFlagsDialog({ 
  open, 
  onOpenChange, 
  onComplete 
}) {
  const [flags, setFlags] = useState({
    mobility_issues: false,
    hearing_impaired: false,
    vision_impaired: false,
    vulnerable_adult: false,
    safeguarding_concern: false,
    pet_in_property: false,
    bedridden: false,
    cognitive_impairment: false
  });
  
  const [safeguardingDetails, setSafeguardingDetails] = useState('');
  const [accessibilityNotes, setAccessibilityNotes] = useState('');

  const handleComplete = () => {
    onComplete({
      flags,
      safeguardingDetails,
      accessibilityNotes
    });
    onOpenChange(false);
  };

  const toggleFlag = (key) => {
    setFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const anyFlagsSet = Object.values(flags).some(v => v);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Accessibility & Safeguarding Flags
          </DialogTitle>
          <DialogDescription>
            Important for safe handling and contractor dispatch
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Accessibility */}
          <div>
            <p className="font-medium text-sm mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Accessibility Needs
            </p>
            <div className="space-y-2">
              {[
                { key: 'mobility_issues', label: 'Mobility difficulties or wheelchair access required' },
                { key: 'hearing_impaired', label: 'Hearing impaired - needs visual communication' },
                { key: 'vision_impaired', label: 'Vision impaired - verbal instructions preferred' },
                { key: 'bedridden', label: 'Caller is bedridden or unable to move' },
                { key: 'cognitive_impairment', label: 'Cognitive impairment - needs clear, simple instructions' }
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={flags[item.key]}
                    onCheckedChange={() => toggleFlag(item.key)}
                  />
                  <span className="text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Safeguarding */}
          <div>
            <p className="font-medium text-sm mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-600" />
              Safeguarding Concerns
            </p>
            <div className="space-y-2 mb-3">
              {[
                { key: 'vulnerable_adult', label: 'Vulnerable adult (elderly, isolated)' },
                { key: 'safeguarding_concern', label: 'Safeguarding concern identified' },
                { key: 'pet_in_property', label: 'Aggressive animal/pet in property' }
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={flags[item.key]}
                    onCheckedChange={() => toggleFlag(item.key)}
                  />
                  <span className="text-sm">{item.label}</span>
                </label>
              ))}
            </div>

            {(flags.vulnerable_adult || flags.safeguarding_concern) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                <Label className="text-sm font-medium text-red-900 mb-2 block">
                  Safeguarding Details
                </Label>
                <Textarea
                  placeholder="Document specific concerns, vulnerabilities, or warning signs..."
                  value={safeguardingDetails}
                  onChange={(e) => setSafeguardingDetails(e.target.value)}
                  className="text-xs h-20"
                />
              </div>
            )}
          </div>

          {/* Additional Accessibility Notes */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Additional Notes for Contractor</Label>
            <Textarea
              placeholder="e.g., 'Access via side gate only', 'No visiting after 8pm', 'Deaf caller - use SMS'..."
              value={accessibilityNotes}
              onChange={(e) => setAccessibilityNotes(e.target.value)}
              className="h-20"
            />
          </div>

          {/* Summary */}
          {anyFlagsSet && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <p className="text-xs text-amber-900">
                  <strong>⚠️ Important:</strong> These flags will be prominently displayed to contractors and escalated during dispatch. Ensure all details are accurate.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Skip
          </Button>
          <Button onClick={handleComplete}>
            Confirm Flags
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}