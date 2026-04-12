import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BookOpen, Presentation, BarChart3, FileText, Zap } from 'lucide-react';

export default function DeveloperMarketing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24">
          <h1 className="text-5xl sm:text-6xl font-serif font-bold mb-6">
            Premiso
          </h1>
          <p className="text-xl text-blue-100 mb-4">
            Enterprise Property Management System
          </p>
          <p className="text-blue-50 text-lg mb-8 max-w-3xl">
            Complete marketing documentation showcasing the Powell & Co demo environment with 38 companies, 13 properties, 120+ units, and comprehensive financial & compliance tracking.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Demo Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-400">38</div>
              <p className="text-slate-400 text-sm mt-2">Companies</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-400">13</div>
              <p className="text-slate-400 text-sm mt-2">Properties</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-amber-400">120+</div>
              <p className="text-slate-400 text-sm mt-2">Units</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-400">60+</div>
              <p className="text-slate-400 text-sm mt-2">Tenants</p>
            </CardContent>
          </Card>
        </div>

        {/* Marketing Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Product Brochure */}
          <Link to="/brochure">
            <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors h-full cursor-pointer hover:shadow-lg hover:shadow-blue-500/20">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-white">Product Brochure</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400">
                  Comprehensive overview of Premiso capabilities, featuring 6 core modules with detailed descriptions and Powell & Co demo metrics.
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 font-semibold">INCLUDES:</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Executive overview & platform capabilities</li>
                    <li>• Financial analytics & reporting</li>
                    <li>• Compliance & audit management</li>
                    <li>• Tenant portal features</li>
                    <li>• API integration framework</li>
                  </ul>
                </div>
                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                  View Brochure <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Platform Tour */}
          <Link to="/tour">
            <Card className="bg-slate-800 border-slate-700 hover:border-green-500 transition-colors h-full cursor-pointer hover:shadow-lg hover:shadow-green-500/20">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Presentation className="w-6 h-6 text-green-400" />
                  </div>
                  <CardTitle className="text-white">Platform Tour</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400">
                  Interactive 8-slide walkthrough of the Premiso interface with simulated tablet views and real demo data.
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 font-semibold">COVERS:</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Dashboard overview</li>
                    <li>• Companies management</li>
                    <li>• Properties & units</li>
                    <li>• Financial reporting</li>
                    <li>• Compliance audit & operations</li>
                  </ul>
                </div>
                <Button className="w-full mt-6 bg-green-600 hover:bg-green-700">
                  Start Tour <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Product Comparison */}
          <Link to="/comparison">
            <Card className="bg-slate-800 border-slate-700 hover:border-amber-500 transition-colors h-full cursor-pointer hover:shadow-lg hover:shadow-amber-500/20">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-amber-500/20 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-amber-400" />
                  </div>
                  <CardTitle className="text-white">Product Comparison</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400">
                  Side-by-side feature comparison with major competitors including Goodlord, AppFolio, Keogh, Yardi, and Rent Manager.
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 font-semibold">ANALYZES:</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• 27 feature comparisons</li>
                    <li>• Pricing models & TCO</li>
                    <li>• Key differentiators</li>
                    <li>• Regulatory focus</li>
                    <li>• Use case recommendations</li>
                  </ul>
                </div>
                <Button className="w-full mt-6 bg-amber-600 hover:bg-amber-700">
                  Compare Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Marketing Collateral */}
          <Link to="/marketing">
            <Card className="bg-slate-800 border-slate-700 hover:border-purple-500 transition-colors h-full cursor-pointer hover:shadow-lg hover:shadow-purple-500/20">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-400" />
                  </div>
                  <CardTitle className="text-white">Marketing Collateral</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400">
                  Complete unified document combining brochure, platform tour, and competitive analysis with export to PDF/print.
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 font-semibold">INCLUDES:</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• All 3 sections in one document</li>
                    <li>• PDF export functionality</li>
                    <li>• Print-optimized layout</li>
                    <li>• Regulatory frameworks</li>
                    <li>• TCO analysis & recommendations</li>
                  </ul>
                </div>
                <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
                  View Collateral <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Key Features Section */}
        <Card className="bg-slate-800 border-slate-700 mb-16">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              <CardTitle className="text-white">Demo Environment Highlights</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold text-white mb-3">Portfolio Management</h4>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li>✓ 38 companies (core, RTM, freehold, investment)</li>
                  <li>✓ 13 properties across 6 UK regions</li>
                  <li>✓ 120+ units with lease management</li>
                  <li>✓ Companies House integration</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Financial & Compliance</h4>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li>✓ 200+ transactions (rent, service charges)</li>
                  <li>✓ 92% collection rate tracking</li>
                  <li>✓ 18+ compliance checkpoints</li>
                  <li>✓ Full audit trail & document generation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Operations & Integrations</h4>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li>✓ 40+ maintenance orders</li>
                  <li>✓ 60+ active tenants</li>
                  <li>✓ QuickBooks & Xero sync</li>
                  <li>✓ Webhook & custom API support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center space-y-6 py-12">
          <h2 className="text-3xl font-serif font-bold text-white">Ready to Explore?</h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Select any section above to dive deep into the Premiso platform documentation. All materials showcase a fully-functional demo environment with realistic data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/brochure">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start with Brochure
              </Button>
            </Link>
            <Link to="/tour">
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                Take Interactive Tour
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 bg-slate-900/50 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-slate-400 text-sm">
          <p>Premiso Platform Documentation | All demo data is representative of system capabilities</p>
        </div>
      </div>
    </div>
  );
}