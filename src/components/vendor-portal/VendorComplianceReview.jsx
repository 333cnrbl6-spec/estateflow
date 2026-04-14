import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, AlertTriangle, XCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';

export default function VendorComplianceReview({ vendorId, onApproved }) {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const runAssessment = async () => {
      try {
        const result = await base44.functions.invoke('assessVendorCompliance', {
          vendorId
        });
        setAssessment(result);
      } catch (err) {
        setError(err.message);
        toast.error('Assessment failed: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    runAssessment();
  }, [vendorId]);

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <Loader className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
        <p className="text-muted-foreground">Running compliance assessment...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 bg-red-50 border-red-200">
        <div className="flex gap-3">
          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Assessment Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!assessment) return null;

  const riskColors = {
    low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
    high: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
    critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' }
  };

  const colors = riskColors[assessment.overall_risk_level];

  const getCheckIcon = (status) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Result */}
      <Card className={`p-6 border-2 ${colors.border} ${colors.bg}`}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Compliance Assessment</h2>
            <p className={`text-sm font-medium ${colors.text}`}>
              Risk Level: {assessment.overall_risk_level.toUpperCase()}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Compliance Score: {assessment.compliance_score}%
            </p>
          </div>
          <Badge 
            className={assessment.approved_for_onboarding ? 'bg-green-600' : 'bg-red-600'}
          >
            {assessment.approved_for_onboarding ? '✓ Approved' : '✗ Review Required'}
          </Badge>
        </div>
      </Card>

      {/* Checks */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Compliance Checks</h3>
        {Object.entries(assessment.checks).map(([key, check]) => (
          <Card key={key} className="p-4 border-l-4" style={{
            borderColor: {
              pass: '#22c55e',
              warning: '#eab308',
              fail: '#ef4444'
            }[check.status]
          }}>
            <div className="flex items-start gap-3">
              {getCheckIcon(check.status)}
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{check.name}</h4>
                {check.issues?.length > 0 && (
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    {check.issues.map((issue, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span>•</span> {issue}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      {assessment.recommendations?.length > 0 && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Recommendations
          </h3>
          <div className="space-y-3">
            {assessment.recommendations.map((rec, idx) => (
              <div key={idx} className="border-l-4 border-blue-400 pl-4 py-2">
                <p className="text-sm font-medium text-blue-900">{rec.category}</p>
                <p className="text-xs text-blue-800 mt-1">{rec.action}</p>
                <Badge className="mt-2 text-xs bg-blue-200 text-blue-900">
                  Priority: {rec.priority.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Assessment Details */}
      <Card className="p-4 bg-slate-50 text-xs text-muted-foreground">
        <p>Assessment Date: {new Date(assessment.assessment_date).toLocaleString()}</p>
      </Card>
    </div>
  );
}