import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  TrendingDown, 
  Info, 
  MapPin, 
  Home, 
  Calendar,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  PoundSterling,
  FileCheck,
  ShieldAlert,
  Building,
  Flame,
  Zap,
  ClipboardCheck
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function PropertyValuationPanel({ propertyId, listingId, address }) {
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(false);

  const valuationMutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      const response = await base44.functions.invoke('generatePropertyValuation', {
        property_id: propertyId,
        listing_id: listingId,
      });
      return response;
    },
    onSuccess: (data) => {
      setValuation(data.valuation);
      setLoading(false);
      toast.success('Valuation generated successfully');
    },
    onError: (error) => {
      setLoading(false);
      toast.error(`Failed to generate valuation: ${error.message}`);
    }
  });

  const handleGenerateValuation = () => {
    valuationMutation.mutate();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceLabel = (score) => {
    if (score >= 80) return 'High Confidence';
    if (score >= 60) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'important': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (!valuation && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Comprehensive Property Valuation
          </CardTitle>
          <CardDescription>
            AI-powered valuation including sales, rental, compliance, licensing and certifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Home className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground mb-4">
              Generate a comprehensive valuation with sales, rental, and compliance analysis
            </p>
            <Button 
              onClick={handleGenerateValuation}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Generate Valuation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Generating Comprehensive Valuation...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analyzing sales, rental, compliance and certification data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rental">Rental Analysis</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Sales Valuation
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <MapPin className="w-3 h-3" />
                    {address || valuation.property_id}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(valuation.valuation_date).toLocaleDateString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Estimated Sales Value</p>
                  <p className="text-4xl font-bold text-primary">
                    {formatCurrency(valuation.sales_valuation.estimated_value)}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Range:</span>
                    <span className="text-green-600 font-medium">
                      {formatCurrency(valuation.sales_valuation.valuation_range.low)}
                    </span>
                    <span>-</span>
                    <span className="text-red-600 font-medium">
                      {formatCurrency(valuation.sales_valuation.valuation_range.high)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Confidence Score</p>
                    <Badge className={getConfidenceColor(valuation.sales_valuation.confidence_score)}>
                      {getConfidenceLabel(valuation.sales_valuation.confidence_score)}
                    </Badge>
                  </div>
                  <Progress value={valuation.sales_valuation.confidence_score} className="h-3" />
                  <p className="text-2xl font-bold">{valuation.sales_valuation.confidence_score}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Summary */}
          {valuation.investment_analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PoundSterling className="w-5 h-5" />
                  Investment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Gross Yield</p>
                    <p className="text-2xl font-bold text-blue-700">{valuation.investment_analysis.gross_yield}%</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Annual Rental Income</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(valuation.investment_analysis.estimated_annual_rental_income)}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Net Yield</p>
                    <p className="text-2xl font-bold text-purple-700">{valuation.investment_analysis.net_yield}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Factors & Risks */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Key Positive Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {valuation.key_factors?.slice(0, 4).map((factor, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {valuation.risk_factors?.slice(0, 4).map((risk, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-yellow-600 mt-0.5">⚠</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rental Analysis Tab */}
        <TabsContent value="rental" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PoundSterling className="w-5 h-5" />
                Rental Valuation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Estimated Monthly Rent</p>
                  <p className="text-4xl font-bold text-green-600">
                    {formatCurrency(valuation.rental_valuation.estimated_monthly_rent)}
                    <span className="text-sm text-muted-foreground font-normal">/month</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Annual: {formatCurrency(valuation.rental_valuation.estimated_monthly_rent * 12)}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Rental Yield</p>
                  <p className="text-4xl font-bold text-primary">
                    {valuation.rental_valuation.rental_yield_percent}%
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      valuation.rental_valuation.rental_yield_percent >= 6 ? 'bg-green-100 text-green-800' :
                      valuation.rental_valuation.rental_yield_percent >= 4 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {valuation.rental_valuation.rental_yield_percent >= 6 ? 'Excellent' :
                       valuation.rental_valuation.rental_yield_percent >= 4 ? 'Good' : 'Below Average'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">
                    {valuation.rental_valuation.rental_demand === 'high' ? '🔥' : '📊'} 
                    Rental Demand: {valuation.rental_valuation.rental_demand}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {valuation.rental_valuation.comparable_rent_analysis}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Costs */}
          {valuation.compliance_cost_estimate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PoundSterling className="w-5 h-5" />
                  Compliance Cost Estimate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Immediate Costs</p>
                    <p className="text-2xl font-bold">{formatCurrency(valuation.compliance_cost_estimate.immediate_costs)}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Annual Compliance</p>
                    <p className="text-2xl font-bold">{formatCurrency(valuation.compliance_cost_estimate.annual_compliance_costs)}</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <p className="text-sm text-muted-foreground">Total First Year</p>
                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(valuation.compliance_cost_estimate.total_first_year_costs)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ComplianceItem 
                  icon={Building}
                  label="HMO License Required"
                  status={valuation.compliance_status.hmo_license_required ? 'Required' : 'Not Required'}
                  compliant={!valuation.compliance_status.hmo_license_required}
                />
                <ComplianceItem 
                  icon={ShieldAlert}
                  label="Selective Licensing"
                  status={valuation.compliance_status.selective_licensing ? 'Applies' : 'Not Applicable'}
                  compliant={!valuation.compliance_status.selective_licensing}
                />
                <ComplianceItem 
                  icon={Flame}
                  label="Gas Safety Certificate"
                  status={valuation.compliance_status.gas_safety_cert_required ? 'Required' : 'Not Required'}
                  compliant={!valuation.compliance_status.gas_safety_cert_required}
                />
                <ComplianceItem 
                  icon={Zap}
                  label="EICR (Electrical Safety)"
                  status={valuation.compliance_status.eicr_required ? 'Required' : 'Not Required'}
                  compliant={!valuation.compliance_status.eicr_required}
                />
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <ClipboardCheck className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">EPC Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Current: {valuation.compliance_status.epc_rating_current}</Badge>
                    <Badge variant="outline">Required: {valuation.compliance_status.epc_rating_required}</Badge>
                    <Badge className={valuation.compliance_status.epc_compliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {valuation.compliance_status.epc_compliant ? 'Compliant' : 'Non-Compliant'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium">Fire Safety</span>
                  </div>
                  <Badge variant="outline">{valuation.compliance_status.fire_safety_compliance}</Badge>
                </div>
                {valuation.compliance_status.building_safety_act_applicable && (
                  <div className="p-3 border rounded-lg bg-yellow-50">
                    <p className="text-sm font-medium text-yellow-800">⚠️ Building Safety Act 2022 Applies</p>
                    <p className="text-xs text-yellow-600 mt-1">Additional compliance requirements for higher-risk buildings</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {valuation.compliance_status.local_authority_requirements?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Local Authority Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {valuation.compliance_status.local_authority_requirements.map((req, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                Required Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {valuation.certifications_needed?.map((cert, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Validity: {cert.validity_period}
                        </p>
                      </div>
                      <Badge className={getPriorityColor(cert.priority)}>
                        {cert.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`w-4 h-4 ${cert.required ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className="text-sm">{cert.required ? 'Required' : 'Optional'}</span>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(cert.cost_estimate_gbp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Market Analysis & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Market Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Market Conditions</h4>
            <p className="text-sm text-muted-foreground">{valuation.market_conditions}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Methodology</h4>
            <p className="text-sm text-muted-foreground">{valuation.methodology}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {valuation.recommendations?.map((rec, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <span className="text-primary font-bold">{idx + 1}.</span>
                {rec}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={handleGenerateValuation}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>
    </div>
  );
}

function ComplianceItem({ icon: Icon, label, status, compliant }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <Icon className={cn("w-5 h-5", compliant ? 'text-green-600' : 'text-yellow-600')} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <Badge variant="outline">{status}</Badge>
    </div>
  );
}