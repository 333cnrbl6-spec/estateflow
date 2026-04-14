import React from 'react';
import { AlertTriangle, Flame, Phone, MapPin, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FireSafetyInformation({ property, fireRiskAssessment }) {
  if (!fireRiskAssessment) {
    return (
      <div className="bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100">Fire Risk Assessment Not Available</h3>
            <p className="text-sm text-red-800 dark:text-red-200 mt-1">
              A Fire Risk Assessment is required before occupancy. Please contact the property manager to arrange this.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Flame className="w-8 h-8 text-red-600 dark:text-red-400 shrink-0" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Fire Safety Information</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Important information to keep you and your home safe from fire
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">ASSESSMENT DATE</p>
          <p className="font-semibold text-foreground">
            {new Date(fireRiskAssessment.assessment_date).toLocaleDateString()}
          </p>
          <p className="text-xs text-muted-foreground mt-2">Next Review: {new Date(fireRiskAssessment.next_review_due).toLocaleDateString()}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">OVERALL RISK LEVEL</p>
          <p className={`font-semibold text-lg ${
            fireRiskAssessment.overall_risk_level === 'low' ? 'text-green-600' :
            fireRiskAssessment.overall_risk_level === 'medium' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {fireRiskAssessment.overall_risk_level.charAt(0).toUpperCase() + fireRiskAssessment.overall_risk_level.slice(1)}
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">ASSESSMENT BY</p>
          <p className="font-semibold text-foreground">{fireRiskAssessment.assessor_name}</p>
          {fireRiskAssessment.assessor_contact && (
            <p className="text-xs text-muted-foreground mt-2">{fireRiskAssessment.assessor_contact}</p>
          )}
        </div>
      </div>

      {/* Fire Alarms */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Fire Alarms
        </h3>
        <div className="space-y-3">
          {fireRiskAssessment.fire_safety_measures?.fire_alarms && (
            <>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-semibold text-foreground">Fire Alarms Installed</span>
                <span className="text-green-600 font-semibold">✓ Yes</span>
              </div>
              {fireRiskAssessment.fire_safety_measures.fire_alarms.alarm_type && (
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="font-semibold text-foreground">Alarm Type</span>
                  <span className="text-foreground">{fireRiskAssessment.fire_safety_measures.fire_alarms.alarm_type.replace(/_/g, ' ')}</span>
                </div>
              )}
              {fireRiskAssessment.fire_safety_measures.fire_alarms.tested_date && (
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="font-semibold text-foreground">Last Tested</span>
                  <span className="text-foreground">{new Date(fireRiskAssessment.fire_safety_measures.fire_alarms.tested_date).toLocaleDateString()}</span>
                </div>
              )}
            </>
          )}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>What to do:</strong> Test your alarm weekly by pressing the test button. Listen for a loud, continuous alarm. Replace batteries annually or when the alarm chirps.
            </p>
          </div>
        </div>
      </div>

      {/* Escape Routes */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Emergency Escape Routes
        </h3>
        <div className="space-y-3">
          {fireRiskAssessment.evacuation_plan?.assembly_point_location && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="font-semibold text-foreground mb-1">Assembly Point</p>
              <p className="text-sm text-muted-foreground">{fireRiskAssessment.evacuation_plan.assembly_point_location}</p>
            </div>
          )}
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              <strong>What to do:</strong> Know at least two ways out of your home. Keep doors and windows unlocked for easy exit. Never use lifts in a fire — use stairs only.
            </p>
          </div>
        </div>
      </div>

      {/* Fire Extinguishers */}
      {fireRiskAssessment.fire_safety_measures?.fire_extinguishers?.have_extinguishers && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-600" />
            Fire Extinguishers
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm"><strong>Location:</strong> {fireRiskAssessment.fire_safety_measures.fire_extinguishers.locations?.join(', ') || 'N/A'}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-900 dark:text-red-100">
                <strong>Important:</strong> Only use extinguishers if safe to do so. If unsure, evacuate immediately and call 999.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* What To Do In A Fire */}
      <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 border-2 border-red-300 dark:border-red-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          In Case of Fire
        </h3>
        <div className="space-y-3 text-red-900 dark:text-red-100 text-sm">
          <p><strong>1. ALERT:</strong> Activate the fire alarm if safe to do so.</p>
          <p><strong>2. EVACUATE:</strong> Get everyone out of the building immediately. Close doors behind you to slow the spread of fire.</p>
          <p><strong>3. ASSEMBLE:</strong> Meet at the designated assembly point. Count people to ensure everyone is accounted for.</p>
          <p><strong>4. CALL 999:</strong> Call the fire brigade from outside the building. Tell them the location and whether anyone is still inside.</p>
          <p><strong>5. DO NOT:</strong> Go back inside for belongings or to rescue others unless trained to do so.</p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Important Contacts
        </h3>
        <div className="space-y-2 text-sm">
          <p className="font-semibold">Emergency: <span className="text-red-600 font-bold text-lg">999</span></p>
          <p className="font-semibold">Non-Emergency Fire Service: 101</p>
          <p className="font-semibold">Property Manager: Contact details should be on your tenancy agreement</p>
        </div>
      </div>

      {/* Full Report */}
      {fireRiskAssessment.assessment_document_url && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-foreground">Full Fire Risk Assessment Report</h4>
                <p className="text-sm text-muted-foreground mt-1">Download the complete professional assessment for detailed information</p>
              </div>
            </div>
            <a
              href={fireRiskAssessment.assessment_document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold whitespace-nowrap shrink-0"
            >
              <FileText className="w-4 h-4" />
              Download
            </a>
          </div>
        </div>
      )}

      {/* Acknowledgment */}
      <div className="bg-card rounded-lg border-2 border-border p-6">
        <p className="text-xs text-muted-foreground mb-3">
          This fire safety information is based on the Fire Risk Assessment conducted on {new Date(fireRiskAssessment.assessment_date).toLocaleDateString()} and must be reviewed before occupancy.
        </p>
        <p className="text-xs text-muted-foreground">
          For questions or concerns about fire safety, contact your property manager immediately.
        </p>
      </div>
    </div>
  );
}