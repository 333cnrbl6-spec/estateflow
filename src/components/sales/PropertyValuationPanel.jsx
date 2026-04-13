import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  CheckCircle
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
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (score) => {
    if (score >= 80) return 'High Confidence';
    if (score >= 60) return 'Medium Confidence';
    return 'Low Confidence';
  };

  if (!valuation && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            AI Property Valuation
          </CardTitle>
          <CardDescription>
            Generate an AI-powered valuation based on comparable market data and property features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Home className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground mb-4">
              Click below to generate a comprehensive valuation
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
            Generating Valuation...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analyzing market data and comparables...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Valuation Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Property Valuation
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
            {/* Estimated Value */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Estimated Value</p>
              <p className="text-4xl font-bold text-primary">
                {formatCurrency(valuation.estimated_value)}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Range:</span>
                <span className="text-green-600 font-medium">
                  {formatCurrency(valuation.valuation_range.low)}
                </span>
                <span>-</span>
                <span className="text-red-600 font-medium">
                  {formatCurrency(valuation.valuation_range.high)}
                </span>
              </div>
            </div>

            {/* Confidence Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Confidence Score</p>
                <Badge className={getConfidenceColor(valuation.confidence_score)}>
                  {getConfidenceLabel(valuation.confidence_score)}
                </Badge>
              </div>
              <Progress value={valuation.confidence_score} className="h-3" />
              <p className="text-2xl font-bold">{valuation.confidence_score}%</p>
            </div>
          </div>

          {/* Key Factors */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Key Positive Factors
              </h4>
              <ul className="space-y-1">
                {valuation.key_factors?.slice(0, 3).map((factor, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                Risk Factors
              </h4>
              <ul className="space-y-1">
                {valuation.risk_factors?.slice(0, 3).map((risk, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Market Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Current Market Conditions</h4>
            <p className="text-sm text-muted-foreground">{valuation.market_conditions}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Comparable Analysis</h4>
            <p className="text-sm text-muted-foreground">{valuation.comparable_analysis}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Valuation Methodology</h4>
            <p className="text-sm text-muted-foreground">{valuation.methodology}</p>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
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