import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertCircle, Mail, Bell, Clock, Loader2 } from 'lucide-react';

const ALERT_TYPES = [
  { id: 'accounts_overdue', label: 'Annual Accounts Overdue' },
  { id: 'confirmation_statement_due', label: 'Confirmation Statement Due' },
  { id: 'director_change', label: 'Director Changes' },
  { id: 'status_change', label: 'Company Status Changes' },
  { id: 'strike_off_notice', label: 'Strike-Off Notices' },
  { id: 'insolvency', label: 'Insolvency Actions' }
];

export default function AlertPreferencesDialog({ open, onOpenChange, userEmail }) {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (open && userEmail) {
      loadPreferences();
    }
  }, [open, userEmail]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await base44.entities.ComplianceAlertPreference.filter({
        user_email: userEmail
      });
      
      // Ensure all alert types are represented
      const prefMap = {};
      prefs.forEach(p => {
        prefMap[p.alert_type] = p;
      });

      const allPrefs = ALERT_TYPES.map(type => 
        prefMap[type.id] || {
          user_email: userEmail,
          alert_type: type.id,
          enabled: true,
          notify_via_email: true,
          notify_via_dashboard: true,
          email_frequency: 'daily_digest',
          days_before_due: 14
        }
      );

      setPreferences(allPrefs);
    } catch (err) {
      console.error('Failed to load preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      for (const pref of preferences) {
        if (pref.id) {
          // Update existing
          await base44.entities.ComplianceAlertPreference.update(pref.id, pref);
        } else {
          // Create new
          await base44.entities.ComplianceAlertPreference.create(pref);
        }
      }
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const updatePref = (alertType, field, value) => {
    setPreferences(prefs =>
      prefs.map(p =>
        p.alert_type === alertType ? { ...p, [field]: value } : p
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Compliance Alert Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : (
            <>
              {preferences.map(pref => {
                const alertType = ALERT_TYPES.find(t => t.id === pref.alert_type);
                return (
                  <div key={pref.alert_type} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">{alertType?.label}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{pref.alert_type}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label className="text-xs">Enabled</Label>
                        <Switch
                          checked={pref.enabled}
                          onCheckedChange={(val) => updatePref(pref.alert_type, 'enabled', val)}
                        />
                      </div>
                    </div>

                    {pref.enabled && (
                      <div className="space-y-3 pl-4 border-l-2 border-muted">
                        {/* Dashboard Alert */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-slate-400" />
                            <Label className="text-xs font-medium">Dashboard Alert</Label>
                          </div>
                          <Switch
                            checked={pref.notify_via_dashboard}
                            onCheckedChange={(val) => updatePref(pref.alert_type, 'notify_via_dashboard', val)}
                          />
                        </div>

                        {/* Email Notifications */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <Label className="text-xs font-medium">Email Notification</Label>
                          </div>
                          <Switch
                            checked={pref.notify_via_email}
                            onCheckedChange={(val) => updatePref(pref.alert_type, 'notify_via_email', val)}
                          />
                        </div>

                        {pref.notify_via_email && (
                          <div className="space-y-2 ml-6">
                            {/* Email Frequency */}
                            <div>
                              <Label className="text-xs font-medium block mb-1.5">Frequency</Label>
                              <Select
                                value={pref.email_frequency}
                                onValueChange={(val) => updatePref(pref.alert_type, 'email_frequency', val)}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="immediate">Immediate</SelectItem>
                                  <SelectItem value="daily_digest">Daily Digest</SelectItem>
                                  <SelectItem value="weekly_digest">Weekly Digest</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Days Before Due */}
                            <div>
                              <Label className="text-xs font-medium block mb-1.5 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Alert {pref.days_before_due} days before deadline
                              </Label>
                              <input
                                type="range"
                                min="1"
                                max="60"
                                value={pref.days_before_due}
                                onChange={(e) => updatePref(pref.alert_type, 'days_before_due', parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>1 day</span>
                                <span>{pref.days_before_due} days</span>
                                <span>60 days</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}