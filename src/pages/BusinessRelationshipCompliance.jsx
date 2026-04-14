import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Users, Zap, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function BusinessRelationshipCompliance() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [entityType, setEntityType] = useState('Vendor');
  const [relationshipType, setRelationshipType] = useState('vendor');
  const [jurisdiction, setJurisdiction] = useState('England');
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);

  const relationshipOptions = [
    { value: 'vendor', label: 'Vendor/Contractor' },
    { value: 'supplier', label: 'Supplier' },
    { value: 'subcontractor', label: 'Subcontractor' },
    { value: 'landlord', label: 'Landlord' },
    { value: 'customer', label: 'Customer/Tenant' },
    { value: 'property_manager', label: 'Property Manager' }
  ];

  const jurisdictions = ['England', 'Scotland', 'Wales', 'Northern Ireland'];

  const handleAssess = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a name or ID');
      return;
    }

    setLoading(true);
    try {
      // Search for entity
      const results = await base44.entities[entityType]?.filter?.({
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { full_name: { $regex: searchQuery, $options: 'i' } },
          { id: searchQuery }
        ]
      }, '-updated_date', 10);

      if (!results || results.length === 0) {
        toast.error('Entity not found');
        setLoading(false);
        return;
      }

      // Run assessment on first result
      const entity = results[0];
      const assessment = await base44.functions.invoke('assessBusinessRelationshipCompliance', {
        entityId: entity.id,
        entityType,
        relationshipType,
        jurisdiction,
        auditMode: false
      });

      setAssessments([assessment, ...assessments]);
      setSearchQuery('');
      toast.success('Compliance assessment completed');
    } catch (error) {
      toast.error('Assessment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Business Relationship Compliance</h1>
          <p className="text-muted-foreground">Assess compliance for vendors, contractors, suppliers, landlords and customers</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">New Assessment</TabsTrigger>
            <TabsTrigger value="results">Assessment History</TabsTrigger>
            <TabsTrigger value="guidelines">Compliance Guidelines</TabsTrigger>
          </TabsList>

          {/* New Assessment */}
          <TabsContent value="search" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6" />
                Run Compliance Assessment
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Entity Type</label>
                  <select
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value)}
                    className="w-full px-4 py-2 border border-input rounded-md bg-background"
                  >
                    <option>Vendor</option>
                    <option>Contact</option>
                    <option>Company</option>
                    <option>Tenant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Relationship Type</label>
                  <select
                    value={relationshipType}
                    onChange={(e) => setRelationshipType(e.target.value)}
                    className="w-full px-4 py-2 border border-input rounded-md bg-background"
                  >
                    {relationshipOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Jurisdiction</label>
                  <select
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    className="w-full px-4 py-2 border border-input rounded-md bg-background"
                  >
                    {jurisdictions.map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Search Name or ID</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter name or ID..."
                    className="w-full px-4 py-2 border border-input rounded-md bg-background"
                    onKeyPress={(e) => e.key === 'Enter' && handleAssess()}
                  />
                </div>
              </div>

              <Button
                onClick={handleAssess}
                disabled={loading || !searchQuery.trim()}
                className="w-full"
              >
                {loading ? 'Assessing...' : 'Run Assessment'}
              </Button>
            </Card>

            <Card className="p-4 bg-blue-50 border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Assessments check registration, insurance, professional credentials, geographical compliance (England/Scotland/Wales/Northern Ireland), AML, and GDPR compliance.
              </p>
            </Card>
          </TabsContent>

          {/* Results */}
          <TabsContent value="results" className="space-y-4">
            {assessments.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No assessments yet. Run one to see results here.</p>
              </Card>
            ) : (
              assessments.map((assessment, idx) => (
                <AssessmentResult key={idx} assessment={assessment} />
              ))
            )}
          </TabsContent>

          {/* Guidelines */}
          <TabsContent value="guidelines" className="space-y-4">
            <ComplianceGuidelines />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AssessmentResult({ assessment }) {
  const riskColors = {
    low: 'bg-green-50 border-green-200',
    medium: 'bg-yellow-50 border-yellow-200',
    high: 'bg-orange-50 border-orange-200',
    critical: 'bg-red-50 border-red-200'
  };

  return (
    <Card className={`p-6 border-2 ${riskColors[assessment.overall_risk_level]}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">{assessment.entity_name}</h3>
          <p className="text-sm text-muted-foreground">{assessment.entity_type} • {assessment.relationship_type}</p>
        </div>
        <Badge className={assessment.approved ? 'bg-green-600' : 'bg-orange-600'}>
          {assessment.results.score}% Compliant
        </Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="text-sm">
          <p className="text-muted-foreground">Risk Level</p>
          <p className="font-semibold capitalize">{assessment.overall_risk_level}</p>
        </div>
        <div className="text-sm">
          <p className="text-muted-foreground">Passed Checks</p>
          <p className="font-semibold">{assessment.results.passed}/{assessment.results.total}</p>
        </div>
        <div className="text-sm">
          <p className="text-muted-foreground">Jurisdiction</p>
          <p className="font-semibold">{assessment.jurisdiction}</p>
        </div>
        <div className="text-sm">
          <p className="text-muted-foreground">Assessment Date</p>
          <p className="font-semibold text-xs">{new Date(assessment.assessment_date).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Checks */}
      <div className="space-y-2 mb-4">
        {Object.entries(assessment.checks).map(([key, check]) => {
          if (!check) return null;
          const statusColor = {
            pass: 'text-green-600',
            warning: 'text-yellow-600',
            fail: 'text-red-600',
            unknown: 'text-slate-600'
          }[check.status];

          return (
            <div key={key} className="flex items-start gap-2 text-sm">
              <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${statusColor}`} />
              <div>
                <p className="font-medium">{check.name}</p>
                {check.issues?.length > 0 && (
                  <p className="text-xs text-muted-foreground">{check.issues.join('; ')}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {assessment.recommendations?.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <p className="text-sm font-semibold mb-2">Recommendations:</p>
          <ul className="text-xs space-y-1">
            {assessment.recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-2">
                <span>•</span>
                <span><strong>{rec.category}:</strong> {rec.action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

function ComplianceGuidelines() {
  const guidelines = [
    {
      title: 'Gas Engineers',
      requirement: 'Gas Safe Register certification',
      jurisdiction: 'England, Scotland, Wales, Northern Ireland',
      renewal: 'Annual',
      insurance: '£6M minimum public liability'
    },
    {
      title: 'Electricians',
      requirement: 'NICEIC, NAPIT or ELECSA accreditation',
      jurisdiction: 'England, Scotland, Wales, Northern Ireland',
      renewal: 'Annual',
      insurance: '£2M minimum public liability'
    },
    {
      title: 'Surveyors',
      requirement: 'RICS registration and chartered status',
      jurisdiction: 'England, Scotland, Wales, Northern Ireland',
      renewal: 'Annual CPD',
      insurance: '£1M professional indemnity'
    },
    {
      title: 'Landlords',
      requirement: 'Deposit protection, right to rent checks',
      jurisdiction: 'England, Scotland, Wales, Northern Ireland',
      renewal: 'Ongoing for each tenancy',
      insurance: 'Buildings insurance required'
    }
  ];

  return (
    <div className="space-y-4">
      {guidelines.map((guide, idx) => (
        <Card key={idx} className="p-4">
          <h3 className="font-bold mb-2">{guide.title}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Requirement</p>
              <p>{guide.requirement}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Jurisdiction</p>
              <p>{guide.jurisdiction}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Renewal</p>
              <p>{guide.renewal}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Insurance</p>
              <p>{guide.insurance}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}