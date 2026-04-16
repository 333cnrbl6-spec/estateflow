import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2, Users, Zap, CheckCircle2, Loader2, ChevronRight,
  AlertCircle, Mail, Lock, Sparkles
} from 'lucide-react';
import { validateCompanyName, validateCompanyNumber, validateEmail, validateFormData } from '@/lib/dataValidation';
import FormValidationDisplay from '@/components/onboarding/FormValidationDisplay';

const STEPS = [
  { id: 'welcome', label: 'Welcome', icon: Sparkles },
  { id: 'company', label: 'Your Company', icon: Building2 },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'ready', label: 'Ready to Go', icon: CheckCircle2 },
];

export default function FounderLaunch() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    company_number: '',
    team_email: '',
    team_role: 'team_member'
  });
  const [touched, setTouched] = useState({});
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const me = await base44.auth.me();
      setUser(me);
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      // Validate company step
      const nameValidation = validateCompanyName(formData.company_name);
      const numberValidation = validateCompanyNumber(formData.company_number);
      
      if (!nameValidation.valid || !numberValidation.valid) {
        setTouched({ company_name: true, company_number: true });
        setError(nameValidation.error || numberValidation.error);
        return;
      }
      setError(null);
      setTouched({});
    }
    if (step === 2) {
      // Validate team email
      if (formData.team_email) {
        const emailValidation = validateEmail(formData.team_email);
        if (!emailValidation.valid) {
          setTouched({ team_email: true });
          setError(emailValidation.error);
          return;
        }
      }
      setError(null);
      setTouched({});
    }
    if (step === 3) {
      // Finalize setup
      setLoading(true);
      try {
        await completeSetup();
      } finally {
        setLoading(false);
      }
      return;
    }
    setStep(s => s + 1);
  };

  const completeSetup = async () => {
    try {
      // Create company
      const company = await base44.entities.Company.create({
        name: formData.company_name,
        company_number: formData.company_number || null,
      });

      // Trigger background sync if company number provided
      if (formData.company_number) {
        base44.functions.invoke('autoSyncCompanyCompliance', {
          company_id: company.id,
          company_number: formData.company_number,
          company_name: formData.company_name
        }).catch(err => console.warn('Compliance sync failed (non-blocking):', err));
      }

      // Mark as new user for tutorial
      localStorage.setItem('premiso_first_login', 'true');

      // Invite team member if provided
      if (formData.team_email) {
        await base44.users.inviteUser(formData.team_email, formData.team_role);
      }

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message || 'Setup failed');
    }
  };

  const currentStepObj = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary/10 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-6 text-sm font-semibold text-primary">
            <Sparkles className="w-4 h-4" />
            Founder Launch
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to Premiso</h1>
          <p className="text-slate-300">Set up your property management suite in 2 minutes</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1.5 mb-8 justify-center">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  i < step ? 'bg-green-500 text-white' :
                  i === step ? 'bg-primary text-white shadow-lg' :
                  'bg-slate-700 text-slate-400'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-12 transition-all ${i < step ? 'bg-green-500' : 'bg-slate-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <currentStepObj.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-white">{currentStepObj.label}</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">Step {step + 1} of {STEPS.length}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className="space-y-4">
                <p className="text-slate-300 text-sm leading-relaxed">
                  We'll walk you through the essentials to get your portfolio ready. You can always adjust settings later.
                </p>
                <div className="grid grid-cols-3 gap-3 py-4">
                  {[
                    { icon: Building2, label: 'Companies' },
                    { icon: Users, label: 'Team' },
                    { icon: Zap, label: 'Ready' }
                  ].map((item, i) => (
                    <div key={i} className="text-center p-3 bg-slate-700/50 rounded-lg">
                       <item.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                       <p className="text-xs font-medium text-white">{item.label}</p>
                     </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Company */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Company Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Powell & Co"
                    value={formData.company_name}
                    onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                    onBlur={() => setTouched({ ...touched, company_name: true })}
                    className={`w-full px-4 py-2.5 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none text-sm transition-colors ${
                      touched.company_name && !validateCompanyName(formData.company_name).valid
                        ? 'border-red-500'
                        : 'border-slate-600 focus:border-primary'
                    }`}
                  />
                  <FormValidationDisplay
                    errors={{ company_name: validateCompanyName(formData.company_name).error }}
                    touched={touched}
                    field="company_name"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Companies House Number (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 12345678"
                    value={formData.company_number}
                    onChange={e => setFormData({ ...formData, company_number: e.target.value })}
                    onBlur={() => setTouched({ ...touched, company_number: true })}
                    className={`w-full px-4 py-2.5 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none text-sm transition-colors ${
                      touched.company_number && formData.company_number && !validateCompanyNumber(formData.company_number).valid
                        ? 'border-red-500'
                        : 'border-slate-600 focus:border-primary'
                    }`}
                  />
                  <FormValidationDisplay
                    errors={{ company_number: validateCompanyNumber(formData.company_number).error }}
                    touched={touched}
                    field="company_number"
                  />
                </div>
                <p className="text-xs text-slate-400 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  We'll auto-populate company details if you provide a Companies House number
                </p>
              </div>
            )}

            {/* Step 2: Team */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-slate-300">Invite team members to collaborate (optional)</p>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Team Member Email</label>
                  <input
                    type="email"
                    placeholder="colleague@example.com"
                    value={formData.team_email}
                    onChange={e => setFormData({ ...formData, team_email: e.target.value })}
                    onBlur={() => setTouched({ ...touched, team_email: true })}
                    className={`w-full px-4 py-2.5 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none text-sm transition-colors ${
                      touched.team_email && formData.team_email && !validateEmail(formData.team_email).valid
                        ? 'border-red-500'
                        : 'border-slate-600 focus:border-primary'
                    }`}
                  />
                  <FormValidationDisplay
                    errors={{ team_email: validateEmail(formData.team_email).error }}
                    touched={touched}
                    field="team_email"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Role</label>
                  <select
                    value={formData.team_role}
                    onChange={e => setFormData({ ...formData, team_role: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-primary focus:outline-none text-sm"
                  >
                    <option value="admin">Admin</option>
                    <option value="team_member">Team Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <p className="text-xs text-slate-400">Leave blank to skip — you can invite team members anytime</p>
              </div>
            )}

            {/* Step 3: Ready */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-400 text-sm">All set!</p>
                      <p className="text-xs text-slate-300 mt-1">Your account is configured and ready to go. Click below to access your dashboard.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span>{formData.company_name}</span>
                  </div>
                  {formData.team_email && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <span>Invite sent to {formData.team_email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              {step > 0 && (
                <Button
                  variant="outline"
                  onClick={() => { setStep(s => s - 1); setError(null); }}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  ← Back
                </Button>
              )}
              <div className="flex-1" />
              <Button
                onClick={handleNext}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    {isLastStep ? 'Go to Dashboard' : 'Continue'}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-8">
          Questions? Contact us at <a href="mailto:hello@premiso.io" className="text-primary hover:underline">hello@premiso.io</a>
        </p>
      </div>
    </div>
  );
}