import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, AlertTriangle, Zap, Brain, PieChart } from 'lucide-react';

const modules = [
  {
    title: 'Commercial Market Analysis',
    description: 'Real-time market insights, rent trends, occupancy rates, and regional benchmarking for institutional decision-making.',
    icon: BarChart3,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    path: '/commercial-market-analysis',
    features: ['Rent trend analysis', 'Occupancy forecasting', 'Regional benchmarks', 'Market condition scoring']
  },
  {
    title: 'Investment Opportunity Scoring',
    description: 'AI-powered deal evaluation with cap rate analysis, valuation assessment, ROI projections, and risk scoring.',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    path: '/investment-opportunity-scoring',
    features: ['Opportunity scoring 0-100', 'Cap rate analysis', 'Valuation assessment', '5-year ROI projections']
  },
  {
    title: 'Portfolio Risk Analyzer',
    description: 'Comprehensive portfolio analysis with concentration risk, lease expiry clustering, and diversification scoring.',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    path: '/portfolio-risk-analyzer',
    features: ['Risk rating (Low/Med/High)', 'Diversification scoring', 'Lease expiry analysis', 'Sector breakdown']
  },
  {
    title: 'Lease Negotiation Assistant',
    description: 'Benchmark-driven lease terms, comparable transaction analysis, and AI-powered negotiation guidance.',
    icon: Brain,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    path: '/lease-negotiation',
    features: ['Benchmark rent comparison', 'Break clause optimization', 'Tenant improvement analysis', 'Term recommendations']
  },
  {
    title: 'Tenant Intelligence Layer',
    description: 'Credit screening, financial health analysis, payment history tracking, and tenant risk profiling.',
    icon: Zap,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    path: '/tenant-intelligence',
    features: ['Credit analysis', 'Financial profiling', 'Payment history', 'Risk classification']
  },
  {
    title: 'Market Trend Forecasting',
    description: 'Predictive analytics for market movements, demand trends, and long-term investment horizon planning.',
    icon: PieChart,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    path: '/market-forecasting',
    features: ['12-month forecasts', 'Demand indicators', 'Growth projections', 'Cycle analysis']
  }
];

export default function PremisoCoreHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Premiso Property Intelligence
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Institutional-grade data analytics and AI-powered deal intelligence for property companies, institutional investors, and portfolio managers.
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.path} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${module.bgColor} flex items-center justify-center mb-3`}>
                    <Icon className={`w-6 h-6 ${module.color}`} />
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <p className="text-sm text-slate-600">{module.description}</p>
                  
                  <div>
                    <p className="text-xs font-medium text-slate-700 mb-2">Key Features</p>
                    <ul className="space-y-1">
                      {module.features.map((feature, i) => (
                        <li key={i} className="text-xs text-slate-600">
                          ✓ {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button asChild className="w-full mt-auto">
                    <Link to={module.path}>
                      Launch Module
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Use Cases */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">For Portfolio Managers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">
                Monitor concentration risk, identify lease expiry clustering, diversify sector exposure, and optimize rebalancing decisions.
              </p>
              <ul className="text-sm space-y-1">
                <li>• Real-time portfolio risk scoring</li>
                <li>• Diversification analysis</li>
                <li>• Lease expiry calendar</li>
                <li>• Rebalancing recommendations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg">For Deal Teams</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">
                Score opportunities objectively, benchmark lease terms, compare comps, and fast-track investment decisions.
              </p>
              <ul className="text-sm space-y-1">
                <li>• Automated opportunity scoring</li>
                <li>• Cap rate benchmarking</li>
                <li>• Valuation guidance</li>
                <li>• Investment committee packs</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200">
            <CardHeader>
              <CardTitle className="text-lg">For Asset Managers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">
                Track tenant health, forecast lease renewals, identify risk early, and plan proactive management.
              </p>
              <ul className="text-sm space-y-1">
                <li>• Tenant credit scoring</li>
                <li>• Payment trend monitoring</li>
                <li>• Lease renewal forecasting</li>
                <li>• Risk early warning</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg">For Investors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">
                Access market forecasts, identify emerging trends, benchmark sector performance, and time market entries.
              </p>
              <ul className="text-sm space-y-1">
                <li>• Market trend forecasts</li>
                <li>• Sector performance tracking</li>
                <li>• Timing analysis</li>
                <li>• Opportunity pipeline</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Data & Trust */}
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <CardHeader>
            <CardTitle>Powered by Institutional Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="opacity-75 mb-1">Data Sources</p>
                <p className="font-semibold">Companies House, Land Registry, Market Comps</p>
              </div>
              <div>
                <p className="opacity-75 mb-1">Update Frequency</p>
                <p className="font-semibold">Real-time market data, Daily analysis refreshes</p>
              </div>
              <div>
                <p className="opacity-75 mb-1">Validation</p>
                <p className="font-semibold">Peer-reviewed methodology, Audit trail</p>
              </div>
              <div>
                <p className="opacity-75 mb-1">Coverage</p>
                <p className="font-semibold">UK-wide commercial markets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}