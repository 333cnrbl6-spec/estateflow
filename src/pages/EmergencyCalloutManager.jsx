import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Phone, Clock, CheckCircle2, Send, Plus } from 'lucide-react';

export default function EmergencyCalloutManager() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('active');
  const [showNewForm, setShowNewForm] = useState(false);
  const [escalatingId, setEscalatingId] = useState(null);
  const [newCallout, setNewCallout] = useState({
    property_id: '',
    caller_name: '',
    caller_phone: '',
    call_type: 'other',
    severity: 'high',
    description: '',
  });
  const [escalationData, setEscalationData] = useState({
    contractor_phone: '',
    contractor_email: '',
    estimated_arrival_time: '',
  });

  const queryClient = useQueryClient();

  // Fetch data
  const { data: callouts } = useQuery({
    queryKey: ['emergencyCallouts'],
    queryFn: () => base44.entities.EmergencyCallout.list(),
    initialData: [],
  });

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
    initialData: [],
  });

  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list(),
    initialData: [],
  });

  // Create callout mutation
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EmergencyCallout.create({
      ...data,
      call_received_date: new Date().toISOString(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyCallouts'] });
      setShowNewForm(false);
      setNewCallout({
        property_id: '',
        caller_name: '',
        caller_phone: '',
        call_type: 'other',
        severity: 'high',
        description: '',
      });
    },
  });

  // Escalate mutation
  const escalateMutation = useMutation({
    mutationFn: async () => {
      const callout = callouts.find(c => c.id === escalatingId);
      if (!callout) throw new Error('Callout not found');

      const property = properties.find(p => p.id === callout.property_id);

      const response = await base44.functions.invoke('escalateEmergencyCallout', {
        callout_id: escalatingId,
        contractor_phone: escalationData.contractor_phone,
        contractor_email: escalationData.contractor_email,
        property_name: property?.name,
        call_type: callout.call_type,
        description: callout.description,
        estimated_arrival_time: escalationData.estimated_arrival_time,
      });

      // Update with contractor details
      await base44.entities.EmergencyCallout.update(escalatingId, {
        assigned_contractor_phone: escalationData.contractor_phone,
        assigned_contractor_email: escalationData.contractor_email,
        estimated_arrival_time: escalationData.estimated_arrival_time,
      });

      queryClient.invalidateQueries({ queryKey: ['emergencyCallouts'] });
      setEscalatingId(null);
      setEscalationData({ contractor_phone: '', contractor_email: '', estimated_arrival_time: '' });

      return response.data;
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      base44.entities.EmergencyCallout.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyCallouts'] });
    },
  });

  // Filter callouts
  const filteredCallouts = useMemo(() => {
    let filtered = callouts;

    if (filter === 'active') {
      filtered = filtered.filter(c => !['resolved', 'cancelled'].includes(c.status));
    } else if (filter === 'resolved') {
      filtered = filtered.filter(c => c.status === 'resolved');
    }

    if (search) {
      const prop = properties.find(p => p.id === callouts[0]?.property_id);
      filtered = filtered.filter(c => {
        const property = properties.find(p => p.id === c.property_id);
        return (
          c.caller_name.toLowerCase().includes(search.toLowerCase()) ||
          property?.name.toLowerCase().includes(search.toLowerCase())
        );
      });
    }

    return filtered.sort((a, b) => 
      new Date(b.call_received_date) - new Date(a.call_received_date)
    );
  }, [callouts, properties, filter, search]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'logged': return 'bg-slate-100 text-slate-800';
      case 'escalated': return 'bg-amber-100 text-amber-800';
      case 'contractor_assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const callTypeLabel = {
    water_leak: '💧 Water Leak',
    gas_smell: '⚠️ Gas Smell',
    electrical_fault: '⚡ Electrical',
    fire_alarm: '🚨 Fire Alarm',
    security_breach: '🔒 Security',
    heating_failure: '🔥 Heating',
    structural_damage: '🏚️ Structural',
    other: '📞 Other',
  };

  const activeCount = callouts.filter(c => !['resolved', 'cancelled'].includes(c.status)).length;

  return (
    <div className="min-h-screen bg-background space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold text-foreground">Emergency Callout Management</h1>
          <p className="text-muted-foreground mt-1">Out-of-hours call logging and contractor escalation</p>
        </div>
        <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Log Emergency Call
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Log Emergency Callout</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Property</label>
                <select
                  value={newCallout.property_id}
                  onChange={(e) => setNewCallout({ ...newCallout, property_id: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm mt-1"
                >
                  <option value="">-- Select property --</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Caller Name</label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={newCallout.caller_name}
                    onChange={(e) => setNewCallout({ ...newCallout, caller_name: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Caller Phone</label>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={newCallout.caller_phone}
                    onChange={(e) => setNewCallout({ ...newCallout, caller_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Emergency Type</label>
                  <select
                    value={newCallout.call_type}
                    onChange={(e) => setNewCallout({ ...newCallout, call_type: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm mt-1"
                  >
                    <option value="water_leak">Water Leak</option>
                    <option value="gas_smell">Gas Smell</option>
                    <option value="electrical_fault">Electrical Fault</option>
                    <option value="fire_alarm">Fire Alarm</option>
                    <option value="security_breach">Security Breach</option>
                    <option value="heating_failure">Heating Failure</option>
                    <option value="structural_damage">Structural Damage</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Severity</label>
                  <select
                    value={newCallout.severity}
                    onChange={(e) => setNewCallout({ ...newCallout, severity: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm mt-1"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  placeholder="Detailed description of the emergency"
                  value={newCallout.description}
                  onChange={(e) => setNewCallout({ ...newCallout, description: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm mt-1 h-24"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => createMutation.mutate(newCallout)}
                  disabled={!newCallout.property_id || !newCallout.caller_name || !newCallout.description}
                >
                  Log Callout
                </Button>
                <Button variant="outline" onClick={() => setShowNewForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Count Alert */}
      {activeCount > 0 && (
        <Alert className={`border-2 ${activeCount > 2 ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50'}`}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className={activeCount > 2 ? 'text-red-900' : 'text-amber-900'}>
            <strong>{activeCount} active callout{activeCount !== 1 ? 's' : ''}</strong> requiring attention
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {/* Search */}
          <Input
            placeholder="Search by caller name or property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Callouts List */}
          {filteredCallouts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Phone className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No {filter} callouts</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCallouts.map(callout => {
                const property = properties.find(p => p.id === callout.property_id);
                const responseTime = callout.response_time_minutes;

                return (
                  <Card key={callout.id} className={`border-l-4 ${
                    callout.severity === 'critical' ? 'border-l-red-600' :
                    callout.severity === 'high' ? 'border-l-orange-600' :
                    'border-l-yellow-600'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{callTypeLabel[callout.call_type]}</p>
                            <Badge className={getSeverityColor(callout.severity)}>
                              {callout.severity}
                            </Badge>
                            <Badge className={getStatusColor(callout.status)}>
                              {callout.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{property?.name}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-semibold">{callout.caller_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(callout.call_received_date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <p className="text-sm">{callout.description}</p>

                      {/* Response Time & Contractor */}
                      <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Response Time</p>
                          <p className="font-semibold">
                            {responseTime ? `${responseTime} min` : 'Pending'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Contact</p>
                          <p className="font-semibold">{callout.caller_phone}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Assigned To</p>
                          <p className="font-semibold">
                            {callout.assigned_contractor_name || 'Unassigned'}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {!['resolved', 'cancelled'].includes(callout.status) && !callout.assigned_contractor_name && (
                          <Dialog open={escalatingId === callout.id} onOpenChange={(open) => {
                            if (!open) setEscalatingId(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2"
                                onClick={() => setEscalatingId(callout.id)}
                              >
                                <Send className="w-4 h-4" />
                                Escalate
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Escalate to Contractor</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Contractor Phone</label>
                                  <input
                                    type="tel"
                                    placeholder="+44 123 456 7890"
                                    value={escalationData.contractor_phone}
                                    onChange={(e) => setEscalationData({ ...escalationData, contractor_phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-input rounded-md text-sm mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Contractor Email</label>
                                  <input
                                    type="email"
                                    placeholder="contractor@example.com"
                                    value={escalationData.contractor_email}
                                    onChange={(e) => setEscalationData({ ...escalationData, contractor_email: e.target.value })}
                                    className="w-full px-3 py-2 border border-input rounded-md text-sm mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Estimated Arrival Time</label>
                                  <input
                                    type="datetime-local"
                                    value={escalationData.estimated_arrival_time}
                                    onChange={(e) => setEscalationData({ ...escalationData, estimated_arrival_time: e.target.value })}
                                    className="w-full px-3 py-2 border border-input rounded-md text-sm mt-1"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => escalateMutation.mutate()}
                                    disabled={!escalationData.contractor_phone && !escalationData.contractor_email}
                                  >
                                    Send Escalation
                                  </Button>
                                  <Button variant="outline" onClick={() => setEscalatingId(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {!['resolved', 'cancelled'].includes(callout.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => updateStatusMutation.mutate({
                              id: callout.id,
                              status: 'resolved',
                            })}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}