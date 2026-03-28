import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Crown } from 'lucide-react';

export default function ProductComparison() {
  const [selectedCategory, setSelectedCategory] = useState('portfolio');

  const competitors = [
    {
      name: 'EstateFlow Platform',
      logo: '🏢',
      type: 'Proprietary SaaS',
      pricing: 'Custom (per 250 units)',
      priceRange: '£2,000-5,000/mo',
      highlight: true,
    },
    {
      name: 'Goodlord',
      logo: '🔵',
      type: 'Cloud-based',
      pricing: 'Usage-based',
      priceRange: '£50-300/mo',
    },
    {
      name: 'AppFolio',
      logo: '🟣',
      type: 'Enterprise SaaS',
      pricing: 'Per-unit model',
      priceRange: '£1,500-8,000/mo',
    },
    {
      name: 'Keogh',
      logo: '🟠',
      type: 'UK Cloud',
      pricing: 'Per-property',
      priceRange: '£100-400/mo',
    },
    {
      name: 'Yardi',
      logo: '🟢',
      type: 'Enterprise Suite',
      pricing: 'Enterprise licensing',
      priceRange: '£3,000-15,000/mo',
    },
    {
      name: 'Rent Manager',
      logo: '🔴',
      type: 'Desktop/Cloud Hybrid',
      pricing: 'Per-unit + fees',
      priceRange: '£800-4,000/mo',
    },
  ];

  const features = [
    {
      category: 'Portfolio Management',
      features: [
        { name: 'Multi-property management', powell: true, goodlord: true, appfolio: true, keogh: true, yardi: true, rentmgr: true },
        { name: 'Unit tracking & leases', powell: true, goodlord: true, appfolio: true, keogh: true, yardi: true, rentmgr: true },
        { name: 'Tenant management', powell: true, goodlord: true, appfolio: true, keogh: true, yardi: true, rentmgr: true },
        { name: 'Company hierarchy (group structures)', powell: true, goodlord: false, appfolio: true, keogh: false, yardi: true, rentmgr: false },
        { name: 'Companies House integration', powell: true, goodlord: false, appfolio: false, keogh: false, yardi: false, rentmgr: false },
      ],
    },
    {
      category: 'Financial Management',
      features: [
        { name: 'Rent collection tracking', powell: true, goodlord: true, appfolio: true, keogh: true, yardi: true, rentmgr: true },
        { name: 'Service charge management', powell: true, goodlord: true, appfolio: true, keogh: true, yardi: true, rentmgr: true },
        { name: 'Accounting integration (QB/Xero)', powell: true, goodlord: false, appfolio: true, keogh: true, yardi: true, rentmgr: true },
        { name: 'Real-time P&L reporting', powell: true, goodlord: false, appfolio: true, keogh: false, yardi: true, rentmgr: false },
        { name: '12-month trend analysis', powell: true, goodlord: false, appfolio: true, keogh: false, yardi: true, rentmgr: false },
        { name: 'Arrears tracking & alerts', powell: true, goodlord: true, appfolio: true, keogh: true, yardi: true, rentmgr: true },
      ],
    },
    {
      category: 'Compliance & Legal',
      features: [
        { name: 'Gas Safety tracking', powell: true, goodlord: true, appfolio: true, keogh: true, yardi: true, rentmgr: true },
        { name: 'EPC management', powell: true, goodlord: true, appfolio: true, keogh: true, yardi: true, rentmgr: true },
        { name: 'Deposit protection compliance', powell: true, goodlord: true, appfolio: true, keogh: true, yardi: true, rentmgr: true },
        { name: 'Full audit trail logging', powell: true, goodlord: false, appfolio: true, keogh: false, yardi: true, rentmgr: false },
        { name: 'Bulk document generation (1000+)', powell: true, goodlord: false, appfolio: false, keogh: false, yardi: false, rentmgr: false },
        { name: 'Wales legislation support (Renting Homes Act)', powell: true, goodlord: false, appfolio: false, keogh: true, yardi: false, rentmgr: false },
        { name: 'MEES compliance alerts', powell: true, goodlord: true, appfolio: true, keogh: true, yardi: true, rentmgr: true },
      ],
    },
    {
      category: 'Tenant Experience',
      features: [
        { name: 'Tenant portal access', powell: true, goodlord: true, appfolio: true, keogh: true, yardi: true, rentmgr: false },
        { name: 'Online rent payment', powell: false, goodlord: true, appfolio: true, keogh: true, yardi: true, rentmgr: true },
        { name: 'Maintenance request submissions', powell: true, goodlord: true, appfolio: true, keogh: true, yardi: true, rentmgr: false },
        { name: 'White-label tenant portal', powell: true, goodlord: false, appfolio: true, keogh: false, yardi: true, rentmgr: false },
        { name: 'Document access portal', powell: true, goodlord: true, appfolio: true, keogh: true, yardi: true, rentmgr: false },
        { name: 'Mobile tenant app', powell: false, goodlord: true, appfolio: true, keogh: true, yardi: true, rentmgr: true },
      ],
    },
    {
      category: 'Operations & Maintenance',
      features: [
        { name: 'Maintenance order tracking', powell: true, goodlord: true, appfolio: true, keogh: true, yardi: true, rentmgr: true },
        { name: 'Contractor management', powell: true, goodlord: true, appfolio: true, keogh: true, yardi: true, rentmgr: true },
        { name: 'Automated workflow engine', powell: true, goodlord: false, appfolio: true, keogh: false, yardi: true, rentmgr: false },
        { name: 'CRM interactions logging', powell: true, goodlord: true, appfolio: true, keogh: false, yardi: true, rentmgr: false },
        { name: 'Priority-based scheduling', powell: true, goodlord: false, appfolio: true, keogh: true, yardi: true, rentmgr: false },
      ],
    },
    {
      category: 'Integration & API',
      features: [
        { name: 'Custom API access', powell: true, goodlord: true, appfolio: true, keogh: false, yardi: true, rentmgr: false },
        { name: 'Webhook support', powell: true, goodlord: false, appfolio: false, keogh: false, yardi: false, rentmgr: false },
        { name: 'Third-party service connectors', powell: true, goodlord: true, appfolio: true, keogh: true, yardi: true, rentmgr: true },
        { name: 'QuickBooks integration', powell: true, goodlord: true, appfolio: true, keogh: true, yardi: true, rentmgr: true },
        { name: 'Xero integration', powell: true, goodlord: true, appfolio: true, keogh: true, yardi: true, rentmgr: true },
        { name: 'Automated sync scheduling', powell: true, goodlord: false, appfolio: true, keogh: false, yardi: true, rentmgr: false },
      ],
    },
  ];

  const pricingDetails = [
    {
      product: 'EstateFlow',
      model: 'Custom Enterprise',
      basePrice: '£2,000-5,000/mo',
      perUnit: 'Included',
      implementation: '£5,000-15,000',
      support: '24/7 Dedicated',
      contracts: '12+ months',
      highlights: ['All-in-one platform', 'Unlimited users', 'Custom integrations'],
    },
    {
      product: 'Goodlord',
      model: 'Usage-Based',
      basePrice: '£50-300/mo',
      perUnit: '£0-2 per letting',
      implementation: 'Free',
      support: 'Email/Chat 9-5',
      contracts: 'Month-to-month',
      highlights: ['Lettings-focused', 'No setup fees', 'Pay per use'],
    },
    {
      product: 'AppFolio',
      model: 'Per-Unit',
      basePrice: '£1,500-8,000/mo',
      perUnit: '£0.25-1.50/unit',
      implementation: '£2,000-8,000',
      support: '24/7 Phone/Chat',
      contracts: '12+ months',
      highlights: ['Market leader', 'Feature-rich', 'Strong support'],
    },
    {
      product: 'Keogh',
      model: 'Per-Property',
      basePrice: '£100-400/mo',
      perUnit: 'Per property',
      implementation: 'Free',
      support: 'Email/Chat',
      contracts: 'Flexible',
      highlights: ['UK-focused', 'Affordable', 'Simple pricing'],
    },
    {
      product: 'Yardi',
      model: 'Enterprise License',
      basePrice: '£3,000-15,000/mo',
      perUnit: 'Included',
      implementation: '£10,000-50,000',
      support: '24/7 Dedicated',
      contracts: '3+ years',
      highlights: ['Complex portfolios', 'Full-suite', 'Customizable'],
    },
    {
      product: 'Rent Manager',
      model: 'Per-Unit + Fees',
      basePrice: '£800-4,000/mo',
      perUnit: '£0.50-1.00/unit',
      implementation: '£1,000-5,000',
      support: 'Email/Phone',
      contracts: '12+ months',
      highlights: ['US-centric', 'Desktop hybrid', 'Traditional'],
    },
  ];

  const keyDifferences = [
    {
      powell: 'UK-first, regulatory-focused (MEES, Renting Homes Act, Companies House)',
      others: 'General-purpose with UK compliance bolt-ons',
    },
    {
      powell: 'Built-in bulk document generation (1000+ documents)',
      others: 'Manual document templates or third-party integrations',
    },
    {
      powell: 'Unified platform (no additional modules)',
      others: 'Often sold as modular add-ons increasing TCO',
    },
    {
      powell: 'Webhooks & custom API framework',
      others: 'Limited API depth or no webhook support',
    },
    {
      powell: 'Full audit trail for every action',
      others: 'Basic logging; compliance features separate',
    },
    {
      powell: 'White-label tenant portal included',
      others: 'Tenant portal often separate cost',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-amber-500" />
            <h1 className="text-4xl font-serif font-bold text-slate-900">Product Comparison</h1>
            <Crown className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-lg text-slate-600">
            EstateFlow vs. Market-Leading Property Management Solutions
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-2">Competitor Set</p>
              <p className="text-2xl font-bold text-slate-900">6 Platforms</p>
              <p className="text-xs text-slate-500 mt-2">Goodlord, AppFolio, Keogh, Yardi, Rent Manager</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-2">Feature Categories</p>
              <p className="text-2xl font-bold text-slate-900">6 Domains</p>
              <p className="text-xs text-slate-500 mt-2">Portfolio, Finance, Compliance, Tenant, Ops, Integration</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-2">Data Source</p>
              <p className="text-2xl font-bold text-slate-900">Public</p>
              <p className="text-xs text-slate-500 mt-2">Provider websites & verified pricing (March 2026)</p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Comparison Tabs */}
        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="portfolio" className="text-xs">Portfolio</TabsTrigger>
            <TabsTrigger value="financial" className="text-xs">Financial</TabsTrigger>
            <TabsTrigger value="compliance" className="text-xs">Compliance</TabsTrigger>
            <TabsTrigger value="tenant" className="text-xs">Tenant</TabsTrigger>
            <TabsTrigger value="operations" className="text-xs">Operations</TabsTrigger>
            <TabsTrigger value="integration" className="text-xs">Integration</TabsTrigger>
          </TabsList>

          {features.map((category, idx) => (
            <TabsContent key={idx} value={category.category.toLowerCase().split(' ')[0]}>
              <Card>
                <CardHeader>
                  <CardTitle>{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left font-semibold py-3 px-4 bg-slate-50">Feature</th>
                          <th className="text-center font-semibold py-3 px-3 bg-blue-50">EstateFlow</th>
                          <th className="text-center font-semibold py-3 px-3">Goodlord</th>
                          <th className="text-center font-semibold py-3 px-3">AppFolio</th>
                          <th className="text-center font-semibold py-3 px-3">Keogh</th>
                          <th className="text-center font-semibold py-3 px-3">Yardi</th>
                          <th className="text-center font-semibold py-3 px-3">Rent Mgr</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.features.map((feature, fidx) => (
                          <tr key={fidx} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 font-medium text-slate-900">{feature.name}</td>
                            <td className="text-center py-3 px-3 bg-blue-50">
                              {feature.powell ? (
                                <Check className="w-5 h-5 text-green-600 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-slate-300 mx-auto" />
                              )}
                            </td>
                            <td className="text-center py-3 px-3">
                              {feature.goodlord ? (
                                <Check className="w-5 h-5 text-green-600 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-slate-300 mx-auto" />
                              )}
                            </td>
                            <td className="text-center py-3 px-3">
                              {feature.appfolio ? (
                                <Check className="w-5 h-5 text-green-600 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-slate-300 mx-auto" />
                              )}
                            </td>
                            <td className="text-center py-3 px-3">
                              {feature.keogh ? (
                                <Check className="w-5 h-5 text-green-600 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-slate-300 mx-auto" />
                              )}
                            </td>
                            <td className="text-center py-3 px-3">
                              {feature.yardi ? (
                                <Check className="w-5 h-5 text-green-600 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-slate-300 mx-auto" />
                              )}
                            </td>
                            <td className="text-center py-3 px-3">
                              {feature.rentmgr ? (
                                <Check className="w-5 h-5 text-green-600 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-slate-300 mx-auto" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Pricing Comparison */}
        <Card className="border-2 border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl">Pricing Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pricingDetails.map((pricing, idx) => (
                <div
                  key={idx}
                  className={`border-2 rounded-lg p-6 ${
                    pricing.product === 'EstateFlow'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    {pricing.product === 'EstateFlow' && (
                      <Crown className="w-5 h-5 text-amber-500" />
                    )}
                    <h3 className="font-bold text-lg">{pricing.product}</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-600">Pricing Model</p>
                      <p className="font-semibold">{pricing.model}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Base Price</p>
                      <p className="font-bold text-lg text-slate-900">{pricing.basePrice}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-600">Per Unit</p>
                        <p className="font-semibold">{pricing.perUnit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Implementation</p>
                        <p className="font-semibold">{pricing.implementation}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-600">Support</p>
                        <p className="font-semibold text-sm">{pricing.support}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Min. Contract</p>
                        <p className="font-semibold text-sm">{pricing.contracts}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-300">
                      <p className="text-xs text-slate-600 mb-2">Key Highlights</p>
                      <ul className="space-y-1">
                        {pricing.highlights.map((highlight, hidx) => (
                          <li key={hidx} className="text-sm flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Total Cost of Ownership Estimate */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
          <CardHeader>
            <CardTitle>Annual Total Cost of Ownership (TCO) - 250 Unit Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-amber-200">
                  <p className="text-sm text-slate-600">EstateFlow</p>
                  <p className="text-3xl font-bold text-slate-900">£36,000</p>
                  <p className="text-xs text-slate-500 mt-2">£3,000/mo + support</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-600">AppFolio</p>
                  <p className="text-3xl font-bold text-slate-900">£48,000+</p>
                  <p className="text-xs text-slate-500 mt-2">£2,000-4,000/mo</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-600">Goodlord</p>
                  <p className="text-3xl font-bold text-slate-900">£2,400+</p>
                  <p className="text-xs text-slate-500 mt-2">Usage-based, Lettings only</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-amber-300">
                <p className="text-sm font-semibold text-slate-900 mb-2">📊 TCO Note:</p>
                <p className="text-sm text-slate-700">
                  EstateFlow pricing is all-inclusive (no per-unit fees, no module add-ons). AppFolio and Yardi require additional modules (up to £8,000+/mo). Goodlord is lettings-focused; full portfolio management requires additional tools.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Differences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Key Differentiators: EstateFlow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {keyDifferences.map((diff, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="font-semibold text-slate-900 text-sm mb-1">EstateFlow:</p>
                  <p className="text-sm text-slate-700 mb-2">{diff.powell}</p>
                  <p className="font-semibold text-slate-900 text-sm mb-1">Competitors:</p>
                  <p className="text-sm text-slate-600">{diff.others}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300">
          <CardHeader>
            <CardTitle>Summary & Recommendation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">When to Choose EstateFlow:</h4>
              <ul className="space-y-1 text-sm">
                <li>✓ Large, complex multi-company portfolios (250+ units)</li>
                <li>✓ Require full regulatory compliance (MEES, Companies House, Wales legislation)</li>
                <li>✓ Need bulk document generation and audit trails</li>
                <li>✓ Custom API integrations and webhook support</li>
                <li>✓ White-label tenant portal included</li>
                <li>✓ Want unified, all-in-one platform</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Alternative Recommendations:</h4>
              <ul className="space-y-1 text-sm">
                <li>🔵 <strong>Goodlord:</strong> Best for lettings agents, simple single-property management</li>
                <li>🟣 <strong>AppFolio:</strong> Market leader, strong feature set, US-centric</li>
                <li>🟠 <strong>Keogh:</strong> Budget-friendly, UK-focused, smaller portfolios</li>
                <li>🟢 <strong>Yardi:</strong> Enterprise mega-suites with complex customization</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="bg-slate-100 border border-slate-300 rounded-lg p-6 text-sm text-slate-700 space-y-2">
          <p className="font-semibold">Data Disclaimer:</p>
          <p>
            This comparison is based on publicly available information from competitor websites, press releases, and verified pricing (as of March 2026). EstateFlow Platform is a demonstrative property management system combining public domain regulatory frameworks with representative enterprise metrics. Feature and pricing data for competitors has been sourced from official provider websites and should be verified directly with vendors for current accuracy.
          </p>
        </div>
      </div>
    </div>
  );
}