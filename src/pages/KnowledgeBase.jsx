import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, ChevronRight } from 'lucide-react';

export default function KnowledgeBase() {
  const [search, setSearch] = useState('');

  const articles = {
    'Getting Started': [
      { title: 'Create Your First Property', duration: '5 min' },
      { title: 'Add Tenants & Manage Relationships', duration: '6 min' },
      { title: 'Set Up Rent Collection & Payments', duration: '8 min' },
      { title: 'Enable Compliance Intelligence Alerts', duration: '7 min' }
    ],
    'Compliance & Intelligence': [
      { title: 'Using Predictive Compliance Scoring', duration: '8 min' },
      { title: 'Certificate Tracking & Auto-Alerts', duration: '6 min' },
      { title: 'Compliance Risk Assessment Dashboard', duration: '7 min' },
      { title: 'Building Safety Register Management', duration: '9 min' }
    ],
    'Maintenance & Tenant Portal': [
       { title: 'Tenant Maintenance Request Workflow', duration: '6 min' },
       { title: 'Manager Contractor Assignment Guide', duration: '7 min' },
       { title: 'Maintenance Lifecycle & Notifications', duration: '8 min' },
       { title: 'Photo Upload & Documentation', duration: '5 min' }
     ],
    'Property Valuation & Pricing': [
       { title: 'AI Property Valuation Engine', duration: '8 min' },
       { title: 'Rental Price Optimization Tool', duration: '7 min' },
       { title: 'Market Comparable Analysis', duration: '9 min' },
       { title: 'Interpreting Valuation Reports', duration: '6 min' }
     ],
    'Workflow Automation': [
       { title: 'Building Your First Workflow', duration: '10 min' },
       { title: 'Automating Certificate Renewals', duration: '7 min' },
       { title: 'Setting Up Maintenance Workflows', duration: '8 min' },
       { title: 'No-Code Workflow Builder Guide', duration: '12 min' }
     ],
    'Integrations & APIs': [
      { title: 'Connecting to Slack & Zapier', duration: '5 min' },
      { title: 'Using the Integration Marketplace', duration: '6 min' },
      { title: 'Custom API Integration Setup', duration: '9 min' },
      { title: 'Webhook Configuration', duration: '7 min' }
    ],
    'Real-Time Collaboration': [
      { title: 'Inviting Team Members & Roles', duration: '4 min' },
      { title: 'Live Document Collaboration', duration: '6 min' },
      { title: 'Activity Streams & Mentions', duration: '5 min' },
      { title: 'Tenant Portal & Communication', duration: '7 min' }
    ],
    'Financial & Reporting': [
      { title: 'Creating Custom Financial Reports', duration: '7 min' },
      { title: 'Real-Time Financial Dashboard', duration: '6 min' },
      { title: 'Exporting to Excel/PDF', duration: '4 min' },
      { title: 'Multi-Property Benchmarking', duration: '8 min' }
    ]
  };

  const videoGuides = [
    { title: 'Dashboard Overview & Compliance Intelligence', duration: '10:42' },
    { title: 'Tenant Portal: Maintenance Requests & Documents', duration: '8:15' },
    { title: 'AI Property Valuation Engine Demo', duration: '12:30' },
    { title: 'Rental Price Optimizer & Market Analysis', duration: '9:45' },
    { title: 'Maintenance Workflow: From Request to Completion', duration: '11:20' },
    { title: 'Workflow Automation: Build & Deploy', duration: '15:20' },
    { title: 'Custom Reports & Analytics', duration: '8:30' },
    { title: 'AI Copilot: Automate Your Operations', duration: '11:15' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <BookOpen className="w-8 h-8" />
            Help Center
          </h1>
          <p className="text-lg text-slate-600">Learn how to use Premiso effectively</p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for help articles..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="videos">Video Guides</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-6">
            {Object.entries(articles).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-xl font-bold text-slate-900 mb-3">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((article, i) => (
                    <Card key={i} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{article.title}</p>
                          <p className="text-sm text-slate-600">{article.duration}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videoGuides.map((video, i) => (
                <Card key={i} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="bg-slate-200 h-32 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-slate-500">▶ Video</span>
                    </div>
                    <p className="font-semibold text-slate-900">{video.title}</p>
                    <p className="text-sm text-slate-600">{video.duration}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-3">
            {[
              { q: 'How do tenants submit maintenance requests?', a: 'Tenants log into their dashboard, navigate to Maintenance tab, fill out form with photos, select priority/category. Managers get instant email alert.' },
              { q: 'How does the rental price optimizer work?', a: 'Analyze Market uses land registry comparable analysis + market trends + AI analysis to recommend optimal rental pricing. Updated monthly.' },
              { q: 'Can tenants view safety certificates?', a: 'Yes! Tenants can see gas safety, electrical (EICR), and fire safety certificates with expiry alerts in their Documents section.' },
              { q: 'What happens when maintenance is requested?', a: 'Request created → Manager notified → Contractor assigned → Tenant gets tracking link → Completion email sent to both.' },
              { q: 'How is property valuation calculated?', a: 'AI analysis combines comparable property data, rental trends, market demand, regional growth, and your property specifics for accurate estimates.' }
            ].map((item, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-base">{item.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Support CTA */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-slate-700 font-semibold">Can't find what you're looking for?</p>
            <a href="/billing" className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
              Contact Support
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}