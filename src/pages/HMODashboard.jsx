import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Clock, Home, Users, FileText, MapPin } from 'lucide-react';
import { format, parseISO, differenceInDays, isBefore } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';

function LicenseStatusBadge({ status, expiryDate }) {
  const daysUntilExpiry = expiryDate ? differenceInDays(parseISO(expiryDate), new Date()) : 0;
  const isExpired = expiryDate && isBefore(parseISO(expiryDate), new Date());

  if (isExpired) {
    return <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100 text-xs font-semibold">Expired</span>;
  }
  if (daysUntilExpiry <= 90) {
    return <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-100 text-xs font-semibold">Renewing Soon ({daysUntilExpiry}d)</span>;
  }
  return <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100 text-xs font-semibold">Valid</span>;
}

export default function HMODashboard() {
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Fetch HMO properties
  const propertiesQuery = useQuery({
    queryKey: ['hmo-properties'],
    queryFn: async () => {
      const props = await base44.entities.Property.filter(
        { property_type: 'hmo' },
        '-updated_date',
        50
      );
      return props;
    },
  });

  // Fetch licenses for selected property
  const licenseQuery = useQuery({
    queryKey: ['hmo-license', selectedProperty],
    enabled: !!selectedProperty,
    queryFn: async () => {
      const licenses = await base44.entities.HMOLicense.filter(
        { property_id: selectedProperty },
        '-created_date',
        1
      );
      return licenses[0] || null;
    },
  });

  // Fetch units for selected property
  const unitsQuery = useQuery({
    queryKey: ['hmo-units', selectedProperty],
    enabled: !!selectedProperty,
    queryFn: async () => {
      return base44.entities.Unit.filter(
        { property_id: selectedProperty },
        'name',
        100
      );
    },
  });

  // Fetch fire safety register
  const fireRegisterQuery = useQuery({
    queryKey: ['fire-safety-register-hmo', selectedProperty],
    enabled: !!selectedProperty,
    queryFn: async () => {
      const registers = await base44.entities.FireSafetyRegister.filter(
        { property_id: selectedProperty },
        '-created_date',
        1
      );
      return registers[0] || null;
    },
  });

  const { data: properties = [] } = propertiesQuery;
  const { data: license } = licenseQuery;
  const { data: units = [] } = unitsQuery;
  const { data: fireRegister } = fireRegisterQuery;

  const property = properties.find(p => p.id === selectedProperty);

  if (!selectedProperty && properties.length > 0) {
    setSelectedProperty(properties[0].id);
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="HMO Compliance Dashboard"
        subtitle="Room-by-room fire safety, occupancy limits, and local authority licensing"
      />

      {/* Property Selector */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-foreground mb-2 block">Select Property</label>
        <select
          value={selectedProperty || ''}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="w-full md:w-80 px-4 py-2 rounded-lg border border-border bg-card text-foreground"
        >
          <option value="">Choose a property...</option>
          {properties.map(p => (
            <option key={p.id} value={p.id}>
              {p.address_line_1} ({p.postcode})
            </option>
          ))}
        </select>
      </div>

      {!selectedProperty ? (
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <Home className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground font-semibold">No HMO properties found</p>
        </div>
      ) : (
        <>
          {/* License Status Overview */}
          {license && (
            <div className={`mb-6 rounded-lg border-2 p-6 ${
              license.status === 'valid' ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' :
              license.status === 'expiring_soon' ? 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800' :
              'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">License Number</p>
                  <p className="text-lg font-bold text-foreground">{license.license_number}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Status</p>
                  <LicenseStatusBadge status={license.status} expiryDate={license.expiry_date} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Expires</p>
                  <p className="text-lg font-bold text-foreground">{format(parseISO(license.expiry_date), 'dd MMM yyyy')}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Renewal Deadline</p>
                  <p className="text-lg font-bold text-foreground">{format(parseISO(license.renewal_deadline), 'dd MMM yyyy')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Occupancy Overview */}
          {license && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  <p className="text-xs font-semibold uppercase text-muted-foreground">License Limit</p>
                </div>
                <p className="text-3xl font-bold text-foreground">{license.max_occupants}</p>
              </div>
              <div className={`rounded-lg border-2 p-4 ${
                license.occupancy_compliance
                  ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
              }`}>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Current Occupancy</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">{license.current_occupants}</p>
                  <p className="text-sm text-muted-foreground">/ {license.max_occupants}</p>
                </div>
              </div>
              <div className="bg-card rounded-lg border border-border p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Local Authority</p>
                <p className="text-lg font-bold text-foreground">{license.local_authority}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="rooms" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="rooms">Room Status</TabsTrigger>
              <TabsTrigger value="fire">Fire Safety</TabsTrigger>
              <TabsTrigger value="conditions">License Conditions</TabsTrigger>
              <TabsTrigger value="inspections">Inspections</TabsTrigger>
            </TabsList>

            {/* Room Status Tab */}
            <TabsContent value="rooms" className="space-y-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Room-by-Room Status</h3>
                <Button size="sm">Update Occupancy</Button>
              </div>

              {!units || units.length === 0 ? (
                <div className="bg-card rounded-lg border border-border p-8 text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No rooms recorded</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {units.map(unit => {
                    const licenseRoom = license?.rooms?.find(r => r.room_id === unit.id);
                    const occupancyCompliant = !licenseRoom || (unit.current_occupants || 0) <= (licenseRoom.max_occupancy || 1);

                    return (
                      <div
                        key={unit.id}
                        className={`rounded-lg border-2 p-5 ${
                          occupancyCompliant && licenseRoom?.fire_safety_compliant
                            ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-foreground">{unit.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{unit.room_type || 'Room'}</p>
                          </div>
                          {occupancyCompliant && licenseRoom?.fire_safety_compliant ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          )}
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-black/20 rounded">
                            <span className="text-muted-foreground">Occupancy:</span>
                            <span className={`font-semibold ${occupancyCompliant ? 'text-green-600' : 'text-red-600'}`}>
                              {unit.current_occupants || 0} / {licenseRoom?.max_occupancy || 1}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-black/20 rounded">
                            <span className="text-muted-foreground">Fire Safety:</span>
                            <span className={`font-semibold ${licenseRoom?.fire_safety_compliant ? 'text-green-600' : 'text-red-600'}`}>
                              {licenseRoom?.fire_safety_compliant ? 'Compliant' : 'Non-Compliant'}
                            </span>
                          </div>
                          {licenseRoom?.last_check_date && (
                            <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-black/20 rounded text-xs">
                              <span className="text-muted-foreground">Last Check:</span>
                              <span>{format(parseISO(licenseRoom.last_check_date), 'dd MMM yyyy')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Fire Safety Tab */}
            <TabsContent value="fire" className="space-y-4 mt-4">
              {fireRegister ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card rounded-lg border border-border p-4">
                      <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold">FRA Status</p>
                      <p className="text-lg font-bold text-foreground">
                        {fireRegister.fra_schedule?.current_fra_date
                          ? format(parseISO(fireRegister.fra_schedule.current_fra_date), 'dd MMM yy')
                          : 'Not assessed'
                        }
                      </p>
                    </div>
                    <div className="bg-card rounded-lg border border-border p-4">
                      <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold">Alarms Tested</p>
                      <p className="text-lg font-bold text-foreground">
                        {fireRegister.fire_alarm_schedule?.last_tested_date
                          ? format(parseISO(fireRegister.fire_alarm_schedule.last_tested_date), 'dd MMM yy')
                          : 'Not tested'
                        }
                      </p>
                    </div>
                    <div className="bg-card rounded-lg border border-border p-4">
                      <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold">Extinguishers</p>
                      <p className="text-lg font-bold text-foreground">{fireRegister.extinguisher_maintenance?.extinguisher_count || 0}</p>
                    </div>
                    <div className={`rounded-lg border-2 p-4 ${
                      fireRegister.compliance_status === 'compliant'
                        ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                    }`}>
                      <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold">Status</p>
                      <p className="text-lg font-bold">{fireRegister.compliance_status.replace(/_/g, ' ')}</p>
                    </div>
                  </div>

                  {fireRegister.remedial_actions && fireRegister.remedial_actions.length > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                      <p className="font-semibold text-orange-900 dark:text-orange-100 mb-3">Outstanding Actions</p>
                      <div className="space-y-2">
                        {fireRegister.remedial_actions.slice(0, 3).map((action, idx) => (
                          <p key={idx} className="text-sm text-orange-800 dark:text-orange-200">
                            • {action.description}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-card rounded-lg border border-border p-8 text-center">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No fire safety register found</p>
                </div>
              )}
            </TabsContent>

            {/* Conditions Tab */}
            <TabsContent value="conditions" className="space-y-4 mt-4">
              {license?.conditions_of_license && license.conditions_of_license.length > 0 ? (
                <div className="space-y-3">
                  {license.conditions_of_license.map((condition, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg border-2 p-4 ${
                        condition.status === 'compliant'
                          ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                          : condition.status === 'in_progress'
                          ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
                          : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-foreground">{condition.description}</p>
                        <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                          condition.status === 'compliant' ? 'bg-green-200 text-green-900 dark:bg-green-800' :
                          condition.status === 'in_progress' ? 'bg-yellow-200 text-yellow-900 dark:bg-yellow-800' :
                          'bg-red-200 text-red-900 dark:bg-red-800'
                        }`}>
                          {condition.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {condition.last_checked && (
                        <p className="text-xs text-muted-foreground">Last checked: {format(parseISO(condition.last_checked), 'dd MMM yyyy')}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-lg border border-border p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No license conditions recorded</p>
                </div>
              )}
            </TabsContent>

            {/* Inspections Tab */}
            <TabsContent value="inspections" className="space-y-4 mt-4">
              {license?.inspection_history && license.inspection_history.length > 0 ? (
                <div className="space-y-3">
                  {license.inspection_history.map((inspection, idx) => (
                    <div key={idx} className="bg-card rounded-lg border border-border p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-foreground">{inspection.inspection_type.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-muted-foreground">{format(parseISO(inspection.inspection_date), 'dd MMM yyyy')} • {inspection.inspector_name}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          inspection.outcome === 'pass' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100' :
                          inspection.outcome === 'pass_with_conditions' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100' :
                          'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'
                        }`}>
                          {inspection.outcome.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {inspection.findings && <p className="text-sm text-muted-foreground mt-2">{inspection.findings}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-lg border border-border p-8 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No inspection history</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}