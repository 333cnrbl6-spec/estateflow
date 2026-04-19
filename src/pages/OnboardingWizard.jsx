import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { Home, Users, Calendar, CheckCircle2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { id: 1, title: 'Add Your First Property', icon: Home, desc: 'Tell us about your first property' },
  { id: 2, title: 'Add Your First Tenant', icon: Users, desc: 'Add a tenant to get started' },
  { id: 3, title: 'Set Rent Collection Day', icon: Calendar, desc: 'Choose when rent is collected' },
];

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [propertyData, setPropertyData] = useState({ name: '', address_line_1: '', city: '', postcode: '' });
  const [tenantData, setTenantData] = useState({ full_name: '', email: '', phone: '' });
  const [rentDay, setRentDay] = useState(1);
  const [createdPropertyId, setCreatedPropertyId] = useState(null);
  const navigate = useNavigate();

  const createPropertyMutation = useMutation({
    mutationFn: () => base44.entities.Property.create(propertyData),
    onSuccess: (p) => {
      setCreatedPropertyId(p.id);
      toast.success('Property added!');
      setStep(2);
    }
  });

  const createTenantMutation = useMutation({
    mutationFn: () => base44.entities.Tenant.create({ ...tenantData, property_id: createdPropertyId, status: 'active' }),
    onSuccess: () => {
      toast.success('Tenant added!');
      setStep(3);
    }
  });

  const completeMutation = useMutation({
    mutationFn: () => base44.auth.updateMe({ onboarding_complete: true, rent_collection_day: rentDay }),
    onSuccess: () => {
      toast.success('Setup complete! Welcome to Premiso.');
      navigate('/dashboard');
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition-all ${
                step > s.id ? 'bg-green-500 text-white' :
                step === s.id ? 'bg-primary text-white' :
                'bg-slate-200 text-slate-500'
              }`}>
                {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-12 transition-all ${step > s.id ? 'bg-green-500' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <Card className="p-8 shadow-xl border-0">
          {/* Step 1: Property */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <Home className="w-10 h-10 text-primary mx-auto mb-3" />
                <h2 className="text-2xl font-bold">Add Your First Property</h2>
                <p className="text-muted-foreground text-sm mt-1">Tell us about your first property</p>
              </div>
              <div className="space-y-3">
                <div>
                  <Label>Property Name</Label>
                  <Input placeholder="e.g. Flat 1, 12 Oak Street" value={propertyData.name} onChange={e => setPropertyData({ ...propertyData, name: e.target.value })} />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input placeholder="Address line 1" value={propertyData.address_line_1} onChange={e => setPropertyData({ ...propertyData, address_line_1: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>City</Label>
                    <Input placeholder="London" value={propertyData.city} onChange={e => setPropertyData({ ...propertyData, city: e.target.value })} />
                  </div>
                  <div>
                    <Label>Postcode</Label>
                    <Input placeholder="SW1A 1AA" value={propertyData.postcode} onChange={e => setPropertyData({ ...propertyData, postcode: e.target.value })} />
                  </div>
                </div>
              </div>
              <Button className="w-full gap-2" disabled={!propertyData.name || createPropertyMutation.isPending} onClick={() => createPropertyMutation.mutate()}>
                {createPropertyMutation.isPending ? 'Saving...' : <>Continue <ChevronRight className="w-4 h-4" /></>}
              </Button>
            </div>
          )}

          {/* Step 2: Tenant */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <Users className="w-10 h-10 text-primary mx-auto mb-3" />
                <h2 className="text-2xl font-bold">Add Your First Tenant</h2>
                <p className="text-muted-foreground text-sm mt-1">You can add more later</p>
              </div>
              <div className="space-y-3">
                <div>
                  <Label>Full Name</Label>
                  <Input placeholder="Jane Smith" value={tenantData.full_name} onChange={e => setTenantData({ ...tenantData, full_name: e.target.value })} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" placeholder="jane@example.com" value={tenantData.email} onChange={e => setTenantData({ ...tenantData, email: e.target.value })} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input placeholder="+44 7700 000000" value={tenantData.phone} onChange={e => setTenantData({ ...tenantData, phone: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>Skip for now</Button>
                <Button className="flex-1 gap-2" disabled={!tenantData.full_name || createTenantMutation.isPending} onClick={() => createTenantMutation.mutate()}>
                  {createTenantMutation.isPending ? 'Saving...' : <>Continue <ChevronRight className="w-4 h-4" /></>}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Rent collection day */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <Calendar className="w-10 h-10 text-primary mx-auto mb-3" />
                <h2 className="text-2xl font-bold">Set Rent Collection Day</h2>
                <p className="text-muted-foreground text-sm mt-1">Which day of the month is rent due?</p>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28].map(d => (
                  <button
                    key={d}
                    onClick={() => setRentDay(d)}
                    className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                      rentDay === d ? 'bg-primary text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <p className="text-sm text-center text-muted-foreground">Rent due on the <strong>{rentDay}{rentDay === 1 ? 'st' : rentDay === 2 ? 'nd' : rentDay === 3 ? 'rd' : 'th'}</strong> of each month</p>
              <Button className="w-full gap-2" disabled={completeMutation.isPending} onClick={() => completeMutation.mutate()}>
                {completeMutation.isPending ? 'Setting up...' : <>Complete Setup <CheckCircle2 className="w-4 h-4" /></>}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}