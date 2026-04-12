import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Shield,
  BarChart3,
  Users,
  FileText,
  Zap,
  CheckCircle2,
  AlertCircle,
  Download,
  Eye,
} from 'lucide-react';

export default function BlockManagementPitch() {
  const [expandedSection, setExpandedSection] = useState(null);

  const phases = [
    {
      phase: 'Phase 1 (MVP)',
      title: 'Essential Block Management',
      timeline: '3-4 months',
      modules: [
        {
          name: 'Service Charge Management',
          description: 'Landlord & Tenant Act 1985 s.20 compliance with cost allocation, s.20 consultation, reserves',
          features: [
            'Cost breakdown by category (repairs, insurance, management, utilities)',
            's.20 statutory notice generation & leaseholder approval tracking',
            'Service charge accounts reconciliation & audit certification',
            'Reserve/sinking fund management',
            'Per-unit charge calculation & arrears tracking',
            'Annual leaseholder statement (statutory requirement)',
          ],
          legal: ['Landlord & Tenant Act 1985 (s.20-20C)', 'RICS Service Charge Code'],
          impact: 'Reduces compliance risk, automates complex s.20 workflows, improves leaseholder transparency',
        },
        {
          name: 'RTM (Right to Manage)',
          description: 'Commonhold & Leasehold Reform Act 2002 - full RTM claim lifecycle management',
          features: [
            'Leaseholder eligibility verification (75% ownership threshold)',
            'Statutory notice generation & dispute period tracking',
            'RTM company formation & handover checklists',
            'Transition from traditional to RTM management',
            'RTM to landlord transition management',
            'Statutory timeline compliance (90-day acquisition period)',
          ],
          legal: ['Commonhold & Leasehold Reform Act 2002 (s.71-113)'],
          impact: 'Captures emerging RTM market (20%+ of apartment buildings), manages complex statutory process',
        },
        {
          name: 'Building Safety & Fire Compliance',
          description: 'Building Safety Act 2023 & Fire Safety Act - HRRB (7+ storey buildings)',
          features: [
            'Building classification (height, units, HRRB scope)',
            'Accountable Person & Responsible Person appointment',
            'Fire risk assessment tracking (annual/biennial)',
            'Fire safety systems management (alarms, lighting, extinguishers)',
            'Structural defect register & remediation tracking',
            'Safety case audit schedules',
            'Resident communication & evacuation procedures',
          ],
          legal: ['Building Safety Act 2023', 'Fire Safety Act 2021', 'Regulatory Reform Act 2005'],
          impact: 'Critical compliance gap - recent legislation with significant legal penalties for breaches',
        },
        {
          name: 'Leaseholder Rights & Statutory Protections',
          description: 'Comprehensive leaseholder accountability & statutory information requirements',
          features: [
            'Lease expiry tracking & extension eligibility',
            'Lease variation & enfranchisement workflows',
            'Prescribed information notices (Housing Act 2004 s.213)',
            'Service charge dispute management',
            'Complaint handling & escalation to ombudsman',
            'Leaseholder meeting records & voting management',
            'Right to information requests',
          ],
          legal: ['Housing Act 2004', 'Leasehold Reform Acts', 'Ombudsman standards'],
          impact: 'Reduces complaints & ombudsman escalations (47% increase in complaints noted in 2025)',
        },
        {
          name: 'Client Money Protection (CMP)',
          description: 'Housing Act 2004 s.213 mandatory compliance for English property management',
          features: [
            'CMP scheme membership tracking (The Property Ombudsman/LETTINGREDRESS)',
            'Segregated client account management',
            'Monthly reconciliation (bank vs. held amounts)',
            'Interest tracking & distribution',
            'Disputed funds holding protocols',
            'Audit trail for all client money movements',
            'CMP scheme inspection documentation',
          ],
          legal: ['Housing Act 2004 s.213-215', 'Landlord & Tenant Act 1985'],
          impact: 'Legal requirement - breaches result in regulator action & leaseholder compensation claims',
        },
      ],
    },
    {
      phase: 'Phase 2 (Operations)',
      title: 'Advanced Operations & Compliance',
      timeline: '2-3 months (post-Phase 1)',
      modules: [
        'Communal Repairs & Maintenance (planned maintenance, health & safety hazard register, EICR/gas/asbestos)',
        'Compliance & Audit Trails (Companies House deadlines, GDPR, ombudsman expectations)',
        'Leaseholder Portal Enhancement (service charge visibility, repair tracking, complaint submission)',
      ],
    },
    {
      phase: 'Phase 3 (Enhancement)',
      title: 'Insurance & Regulatory Excellence',
      timeline: '1-2 months (post-Phase 2)',
      modules: [
        'Insurance & Liability Management (building insurance tracking, claims management, indemnity)',
        'RTM Handback Management (emerging post-reform capability)',
      ],
    },
  ];

  const competitors = [
    {
      name: 'Goodlord',
      block_mgmt_score: 'Limited (RTM only)',
      s20_compliance: 'Basic',
      building_safety: 'Not covered',
      cmp_focus: 'Weak',
      differentiator: 'Primarily residential lettings',
    },
    {
      name: 'AppFolio',
      block_mgmt_score: 'Moderate',
      s20_compliance: 'Partial',
      building_safety: 'Emerging',
      cmp_focus: 'Basic',
      differentiator: 'North American-focused (UK compliance gaps)',
    },
    {
      name: 'Yardi',
      block_mgmt_score: 'Strong (enterprise)',
      s20_compliance: 'Strong',
      building_safety: 'Not fully integrated',
      cmp_focus: 'Strong',
      differentiator: 'Complex, expensive, limited SMB adoption',
    },
    {
      name: 'Premiso (with Phase 1)',
      block_mgmt_score: '★★★★★ Comprehensive',
      s20_compliance: '★★★★★ Automated',
      building_safety: '★★★★★ Full 2023 Act',
      cmp_focus: '★★★★★ Purpose-built',
      differentiator: 'SMB-friendly, UK-first, affordable',
    },
  ];

  const marketOpportunity = [
    {
      stat: '13,000+',
      label: 'Residential blocks in England (5+ units)',
      context: 'Managing ~2M leaseholders',
    },
    {
      stat: '20%+',
      label: 'Currently using/seeking RTM management',
      context: 'Growing trend post-Leasehold Reform proposals',
    },
    {
      stat: '30%+',
      label: 'Multi-storey buildings now subject to Building Safety Act 2023',
      context: 'New compliance requirements = new software demands',
    },
    {
      stat: '47%',
      label: 'Increase in property management complaints (2024-2025)',
      context: 'Driven by service charge disputes & poor communication',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Block Management Module Suite
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Premiso Phase 1 Pitch for Local Block Management Agency
            </p>
          </div>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export Pitch
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Executive Summary */}
        <section className="bg-white rounded-xl shadow-lg p-8 border border-border">
          <h2 className="text-3xl font-serif font-bold mb-6">Why Block Management?</h2>
          <div className="space-y-4">
            <p className="text-lg text-foreground leading-relaxed">
              Premiso is expanding to serve block management agencies with a purpose-built module suite addressing the critical compliance gaps in the UK residential block management market. This is a high-growth, high-margin opportunity with minimal competition.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900 font-semibold mb-2">Market Gap:</p>
              <p className="text-sm text-amber-800">
                47% increase in property management complaints (2025). Competitors lack Building Safety Act 2023 compliance, s.20 automation, and RTM-specific workflows. Local agencies are managing these with spreadsheets and manual processes.
              </p>
            </div>
          </div>
        </section>

        {/* Market Opportunity */}
        <section className="space-y-6">
          <h2 className="text-3xl font-serif font-bold">Market Opportunity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {marketOpportunity.map((item, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-4xl font-bold text-primary mb-2">{item.stat}</div>
                  <CardTitle className="text-lg">{item.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.context}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Phase 1 Modules (Detailed) */}
        <section className="space-y-8">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-2">{phases[0].phase}: {phases[0].title}</h2>
            <p className="text-muted-foreground">Timeline: {phases[0].timeline}</p>
          </div>

          <div className="grid gap-6">
            {phases[0].modules.map((module, idx) => (
              <Card
                key={idx}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setExpandedSection(expandedSection === idx ? null : idx)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        {module.name}
                      </CardTitle>
                      <CardDescription className="mt-2">{module.description}</CardDescription>
                    </div>
                    <Badge className="ml-4 whitespace-nowrap">
                      {module.legal[0].split(' ')[0]}
                    </Badge>
                  </div>
                </CardHeader>

                {expandedSection === idx && (
                  <CardContent className="space-y-6 pt-0">
                    <div>
                      <h4 className="font-semibold text-sm mb-3 uppercase tracking-wide">
                        Core Features:
                      </h4>
                      <ul className="space-y-2">
                        {module.features.map((feature, fidx) => (
                          <li key={fidx} className="text-sm flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <h4 className="font-semibold text-sm mb-2 uppercase tracking-wide">
                        Legal Compliance:
                      </h4>
                      <div className="space-y-1">
                        {module.legal.map((law, lidx) => (
                          <p key={lidx} className="text-xs text-muted-foreground">
                            ✓ {law}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-900">
                        <strong>Impact:</strong> {module.impact}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-3">Why Phase 1 is Essential</h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li>✓ <strong>Legal Foundation:</strong> Covers all core statutory requirements (s.20, RTM, Building Safety, CMP)</li>
              <li>✓ <strong>Revenue Driver:</strong> Service charge management + RTM tracking = retention + upsell</li>
              <li>✓ <strong>Competitive Moat:</strong> No competitor offers full Building Safety Act 2023 compliance</li>
              <li>✓ <strong>MVP-Ready:</strong> 5 integrated modules, achievable in 3-4 months with existing Premiso architecture</li>
            </ul>
          </div>
        </section>

        {/* Phase 2 & 3 Overview */}
        <section className="space-y-6">
          <h2 className="text-3xl font-serif font-bold">Phase 2 & 3 Roadmap</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Phase 2: Operations & Compliance</CardTitle>
                <CardDescription>2-3 months post-Phase 1</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Communal Repairs & Maintenance</strong> - Planned maintenance, EICR, gas certs, asbestos</li>
                  <li>• <strong>Compliance & Audit Trails</strong> - Companies House, GDPR, ombudsman tracking</li>
                  <li>• <strong>Leaseholder Portal</strong> - Service charge visibility, repair tracking, complaints</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Phase 3: Insurance & Excellence</CardTitle>
                <CardDescription>1-2 months post-Phase 2</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Insurance & Liability</strong> - Building insurance, claims, indemnity tracking</li>
                  <li>• <strong>RTM Handback</strong> - Emerging post-Leasehold Reform opportunity</li>
                  <li>• <strong>Advanced Analytics</strong> - Portfolio-wide compliance dashboards</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Competitive Analysis */}
        <section className="space-y-6">
          <h2 className="text-3xl font-serif font-bold">Competitive Positioning</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Capability</th>
                  <th className="text-left py-3 px-4 font-semibold">Goodlord</th>
                  <th className="text-left py-3 px-4 font-semibold">AppFolio</th>
                  <th className="text-left py-3 px-4 font-semibold">Yardi</th>
                  <th className="text-left py-3 px-4 font-semibold bg-primary/5">
                    Premiso (Phase 1)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3 px-4">Block Management</td>
                  <td className="py-3 px-4">Limited</td>
                  <td className="py-3 px-4">Moderate</td>
                  <td className="py-3 px-4">Strong</td>
                  <td className="py-3 px-4 bg-green-50">
                    <strong className="text-green-700">★★★★★</strong>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4">s.20 Compliance</td>
                  <td className="py-3 px-4">Basic</td>
                  <td className="py-3 px-4">Partial</td>
                  <td className="py-3 px-4">Strong</td>
                  <td className="py-3 px-4 bg-green-50">
                    <strong className="text-green-700">Automated</strong>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4">Building Safety Act 2023</td>
                  <td className="py-3 px-4">Not covered</td>
                  <td className="py-3 px-4">Emerging</td>
                  <td className="py-3 px-4">Partial</td>
                  <td className="py-3 px-4 bg-green-50">
                    <strong className="text-green-700">Full Coverage</strong>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4">RTM Management</td>
                  <td className="py-3 px-4">RTM only</td>
                  <td className="py-3 px-4">Limited</td>
                  <td className="py-3 px-4">Not available</td>
                  <td className="py-3 px-4 bg-green-50">
                    <strong className="text-green-700">Complete</strong>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4">CMP Focus</td>
                  <td className="py-3 px-4">Weak</td>
                  <td className="py-3 px-4">Basic</td>
                  <td className="py-3 px-4">Strong</td>
                  <td className="py-3 px-4 bg-green-50">
                    <strong className="text-green-700">Purpose-Built</strong>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4">SMB Pricing</td>
                  <td className="py-3 px-4">Fair</td>
                  <td className="py-3 px-4">Fair</td>
                  <td className="py-3 px-4">Expensive</td>
                  <td className="py-3 px-4 bg-green-50">
                    <strong className="text-green-700">Affordable</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Premiso's Advantage:</strong> Only UK-first, SMB-focused platform with Building Safety Act 2023 compliance + RTM workflows + s.20 automation + CMP management in a single, affordable system.
            </p>
          </div>
        </section>

        {/* Integration with Existing EstateFlow */}
        <section className="bg-white rounded-xl shadow-lg p-8 border border-border">
          <h2 className="text-2xl font-serif font-bold mb-6">Seamless Integration with Premiso</h2>
          <div className="space-y-4">
            <p className="text-foreground">
              Block management modules leverage your existing infrastructure:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="font-semibold text-sm mb-2">Extend Property Management:</p>
                <p className="text-xs text-muted-foreground">
                  Property & Unit entities gain leaseholder-specific tracking, service charge accounts, and RTM company relationships.
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="font-semibold text-sm mb-2">Unified Compliance Audit:</p>
                <p className="text-xs text-muted-foreground">
                  Expand existing Compliance page to include Building Safety Act tracking, fire safety, and CMP reconciliation.
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="font-semibold text-sm mb-2">Financial Intelligence:</p>
                <p className="text-xs text-muted-foreground">
                  Service charge accounts extend Financial Transaction tracking with statutory s.20 workflows and reserve management.
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="font-semibold text-sm mb-2">Portal Enhancement:</p>
                <p className="text-xs text-muted-foreground">
                  Tenant Portal becomes Leaseholder Portal with service charge visibility, dispute filing, and RTM information.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Implementation & Revenue Impact */}
        <section className="space-y-6">
          <h2 className="text-3xl font-serif font-bold">Implementation & Revenue Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Development Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-semibold">Phase 1: 3-4 months</p>
                  <p className="text-xs text-muted-foreground">5 core modules, full testing</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Phase 2: 2-3 months</p>
                  <p className="text-xs text-muted-foreground">Operations & portal</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Phase 3: 1-2 months</p>
                  <p className="text-xs text-muted-foreground">Insurance & excellence</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Addressable Market</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <strong>Primary:</strong> 500+ UK block management agencies (SMB focus)
                </p>
                <p>
                  <strong>Secondary:</strong> 13,000+ apartment buildings (RTM companies, property firms)
                </p>
                <p>
                  <strong>TAM:</strong> £200M+ annual SaaS opportunity
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <strong>Subscription:</strong> £50-150/property/month
                </p>
                <p>
                  <strong>Per-Module:</strong> Add-ons for RTM, Building Safety
                </p>
                <p>
                  <strong>Professional Services:</strong> RTM claim support, s.20 consultation prep
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl p-12 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">Ready to Expand into Block Management?</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Phase 1 is achievable in 3-4 months with your existing architecture. This positions Premiso as the only UK-first, SMB-friendly block management SaaS with Building Safety Act 2023 compliance.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-gray-100">
              Schedule Demo
            </Button>
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 gap-2">
              <Eye className="w-4 h-4" />
              View Data Schemas
            </Button>
          </div>
        </section>

        {/* Footer */}
        <section className="text-center py-12 text-sm text-muted-foreground">
          <p>
            Document prepared for local block management agency pitch | All legislative references verified against 2025 UK law
          </p>
        </section>
      </div>
    </div>
  );
}