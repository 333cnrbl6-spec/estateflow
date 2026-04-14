import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Info, Scale, Shield } from 'lucide-react';

export default function LegalComplianceFramework() {
  const legislationMap = [
    {
      category: 'Tenancy & Deposits',
      items: [
        {
          name: 'Housing Act 2004 (s.213-215)',
          applies_to: ['Landlords', 'Agents'],
          requirement: 'Protect deposits within prescribed scheme & serve prescribed information within 30 days',
          penalties: '3x deposit liability + court costs',
          tracked: true,
          enforced: 'DEPOSIT_PROTECTION_MANDATORY'
        },
        {
          name: 'Unfair Terms in Tenancy Agreements Act 1977',
          applies_to: ['Landlords', 'Agents'],
          requirement: 'All tenancy terms must be fair and transparent',
          penalties: 'Terms void + damages',
          tracked: false,
          enforced: 'MANUAL_REVIEW'
        }
      ]
    },
    {
      category: 'Safety Certificates',
      items: [
        {
          name: 'Gas Safety (Installation and Use) Regulations 1998',
          applies_to: ['Landlords', 'Property Managers'],
          requirement: 'Annual Gas Safety Certificate from registered engineer (12 months validity)',
          penalties: '£30,000 fine + £5,000/day for non-compliance',
          tracked: true,
          enforced: 'BLOCK_LETTING'
        },
        {
          name: 'Electrical Safety Standards 2020 (England)',
          applies_to: ['Landlords', 'Property Managers'],
          requirement: 'EICR (Electrical Installation Condition Report) max 5 years old',
          penalties: '£30,000 fine per breach',
          tracked: true,
          enforced: 'BLOCK_LETTING'
        },
        {
          name: 'Energy Performance of Buildings Regulations 2012',
          applies_to: ['Landlords', 'Selling Agents'],
          requirement: 'EPC before letting/sale (10 years validity)',
          penalties: '£5,000-£5,500 fine',
          tracked: true,
          enforced: 'BLOCK_LETTING'
        },
        {
          name: 'Minimum EPC Standard 2025',
          applies_to: ['Landlords'],
          requirement: 'Property must meet minimum EPC Band D from April 1, 2025',
          penalties: 'Cannot be let/sold',
          tracked: true,
          enforced: 'BLOCK_LETTING'
        }
      ]
    },
    {
      category: 'Fire Safety',
      items: [
        {
          name: 'Regulatory Reform (Fire Safety) Order 2005',
          applies_to: ['HMO Landlords', 'Property Managers'],
          requirement: 'Annual Fire Risk Assessment by qualified person; maintain fire safety measures',
          penalties: '£20,000 fine + up to 2 years imprisonment',
          tracked: true,
          enforced: 'BLOCK_LETTING'
        },
        {
          name: 'HMO Licensing Requirements',
          applies_to: ['HMO Landlords'],
          requirement: 'Local authority HMO license + compliance with conditions (varies by council)',
          penalties: 'Eviction of tenants + £20,000 fine',
          tracked: true,
          enforced: 'TRACKING_ONLY'
        }
      ]
    },
    {
      category: 'Tenant Protection',
      items: [
        {
          name: 'Immigration Act 2014 (Right to Rent)',
          applies_to: ['Landlords', 'Agents'],
          requirement: 'Check right to rent before letting; update every 12 months',
          penalties: '£15,000 per unlawful letting + criminal prosecution',
          tracked: true,
          enforced: 'BLOCK_LETTING'
        },
        {
          name: 'Tenant Fees Act 2019',
          applies_to: ['Letting Agents'],
          requirement: 'Cannot charge fees beyond deposit + rent + prescribed items',
          penalties: '£20,000 fine + damages to tenant',
          tracked: false,
          enforced: 'MANUAL_REVIEW'
        },
        {
          name: 'Ascertainable Terms (Unfair Contract Terms Act)',
          applies_to: ['Landlords', 'Agents'],
          requirement: 'All rental terms must be in plain English & understandable',
          penalties: 'Terms void + damages',
          tracked: false,
          enforced: 'MANUAL_REVIEW'
        }
      ]
    },
    {
      category: 'Anti-Money Laundering',
      items: [
        {
          name: 'AML Regulations 2017 & 2021',
          applies_to: ['All Users'],
          requirement: 'Know Your Customer (KYC) checks on tenants, vendors, suppliers',
          penalties: 'Criminal liability + £300,000 fine',
          tracked: true,
          enforced: 'SCREENING_REQUIRED'
        }
      ]
    }
  ];

  const subscriptionFeatures = {
    'Basic': {
      deposit_protection_tracking: true,
      right_to_rent_checks: false,
      certificate_alerts: true,
      compliance_blocking: false,
      audit_trail: true,
      legal_templates: false,
      color: 'bg-blue-100'
    },
    'Professional': {
      deposit_protection_tracking: true,
      right_to_rent_checks: true,
      certificate_alerts: true,
      compliance_blocking: true,
      audit_trail: true,
      legal_templates: false,
      color: 'bg-green-100'
    },
    'Enterprise': {
      deposit_protection_tracking: true,
      right_to_rent_checks: true,
      certificate_alerts: true,
      compliance_blocking: true,
      audit_trail: true,
      legal_templates: true,
      color: 'bg-purple-100'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b pb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">Legal Compliance Framework</h1>
          <p className="text-lg text-muted-foreground">How Premiso protects you from prosecution and manages compliance by subscription tier</p>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100">
            <AlertTriangle className="w-8 h-8 text-red-600 mb-3" />
            <p className="text-sm text-red-700 font-medium">Critical Legislation Tracked</p>
            <p className="text-2xl font-bold text-red-900">12</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
            <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
            <p className="text-sm text-green-700 font-medium">Auto-Blocking Rules</p>
            <p className="text-2xl font-bold text-green-900">6</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
            <Shield className="w-8 h-8 text-blue-600 mb-3" />
            <p className="text-sm text-blue-700 font-medium">Audit Trail Proof</p>
            <p className="text-2xl font-bold text-blue-900">100%</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
            <Scale className="w-8 h-8 text-purple-600 mb-3" />
            <p className="text-sm text-purple-700 font-medium">Max Exposure Covered</p>
            <p className="text-2xl font-bold text-purple-900">£330k</p>
          </Card>
        </div>

        {/* Legislation Browser */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Legislation Coverage</h2>
          <div className="space-y-6">
            {legislationMap.map((category, idx) => (
              <div key={idx}>
                <h3 className="text-lg font-semibold mb-4 text-foreground">{category.category}</h3>
                <div className="space-y-3">
                  {category.items.map((item, jdx) => (
                    <div key={jdx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-foreground">{item.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{item.requirement}</p>
                        </div>
                        <div className="flex gap-2">
                          {item.tracked && (
                            <Badge className="bg-blue-600">Tracked</Badge>
                          )}
                          {item.enforced === 'BLOCK_LETTING' && (
                            <Badge className="bg-red-600">Blocking</Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Applies To:</p>
                          <p className="font-medium">{item.applies_to.join(', ')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Penalty:</p>
                          <p className="font-medium text-red-600">{item.penalties}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Enforcement:</p>
                          <p className="font-medium">{item.enforced.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Subscription Tiers */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Compliance Coverage by Subscription</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-bold">Feature</th>
                  {Object.entries(subscriptionFeatures).map(([tier]) => (
                    <th key={tier} className="text-center p-3 font-bold">{tier}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  'deposit_protection_tracking',
                  'right_to_rent_checks',
                  'certificate_alerts',
                  'compliance_blocking',
                  'audit_trail',
                  'legal_templates'
                ].map((feature) => (
                  <tr key={feature} className="border-b">
                    <td className="p-3 font-medium">{feature.replace(/_/g, ' ')}</td>
                    {Object.entries(subscriptionFeatures).map(([tier, features]) => (
                      <td key={tier} className="text-center p-3">
                        {features[feature] ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Role-Based Access */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Features by User Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                role: 'Landlord',
                features: ['View deposit status & audit trail', 'Certificate alerts', 'Right to rent tracking', 'Compliance dashboard']
              },
              {
                role: 'Property Manager',
                features: ['Manage all certificates', 'Schedule compliance tasks', 'Vendor management', 'Compliance reporting']
              },
              {
                role: 'Tenant',
                features: ['View tenancy agreement', 'See compliance status', 'View gas safety cert', 'Request maintenance']
              },
              {
                role: 'Contractor/Vendor',
                features: ['View assigned tasks', 'Report completion', 'Track certifications', 'Availability calendar']
              }
            ].map((item, idx) => (
              <Card key={idx} className="p-4 bg-slate-50">
                <h3 className="font-bold mb-3">{item.role}</h3>
                <ul className="space-y-2">
                  {item.features.map((feat, jdx) => (
                    <li key={jdx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Card>

        {/* How It Works */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100">
          <h2 className="text-2xl font-bold mb-6 text-foreground">How Premiso Protects You</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
              <div>
                <p className="font-bold text-foreground">Automatic Alerts (30-day rule)</p>
                <p className="text-sm text-muted-foreground">Reminders sent 30 days before certificates, right to rent, or licenses expire</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
              <div>
                <p className="font-bold text-foreground">Compliance Blocking (Professional+)</p>
                <p className="text-sm text-muted-foreground">System prevents lettings if Gas Safety, Electrical, EPC, Right to Rent are invalid</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
              <div>
                <p className="font-bold text-foreground">Deposit Protection Audit Trail</p>
                <p className="text-sm text-muted-foreground">Complete proof of protection, prescribed info delivery, and compliance stored with timestamps</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">4</div>
              <div>
                <p className="font-bold text-foreground">Right to Rent Enforcement</p>
                <p className="text-sm text-muted-foreground">Automatic checks, expiry tracking, and renewal reminders to avoid £15,000 fines</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">5</div>
              <div>
                <p className="font-bold text-foreground">Compliance Reporting</p>
                <p className="text-sm text-muted-foreground">Detailed audit trails and compliance reports provide evidence of due diligence if questioned</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}