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
      { title: 'Add Tenants', duration: '3 min' },
      { title: 'Set Up Rent Collection', duration: '8 min' },
      { title: 'Configure Compliance Tracking', duration: '10 min' }
    ],
    'Property Management': [
      { title: 'Managing Multiple Properties', duration: '6 min' },
      { title: 'Unit Management & Allocation', duration: '7 min' },
      { title: 'Property Maintenance Requests', duration: '5 min' },
      { title: 'Lease Management & Renewals', duration: '8 min' }
    ],
    'Tenant Management': [
      { title: 'Tenant Onboarding Process', duration: '4 min' },
      { title: 'Rent Collection & Payments', duration: '6 min' },
      { title: 'Tenant Portal Access', duration: '3 min' },
      { title: 'Handling Maintenance Requests', duration: '5 min' }
    ],
    'Compliance & Legal': [
      { title: 'Certificate Tracking & Alerts', duration: '7 min' },
      { title: 'Safety Compliance Checklist', duration: '10 min' },
      { title: 'GDPR & Data Protection', duration: '8 min' },
      { title: 'Regulatory Requirements by Region', duration: '12 min' }
    ],
    'Financial & Reporting': [
      { title: 'Creating Custom Reports', duration: '6 min' },
      { title: 'Financial Dashboard Overview', duration: '5 min' },
      { title: 'Exporting Data to Excel/PDF', duration: '3 min' },
      { title: 'Benchmarking Your Portfolio', duration: '7 min' }
    ],
    'Team & Settings': [
      { title: 'Inviting Team Members', duration: '4 min' },
      { title: 'Role-Based Access Control', duration: '6 min' },
      { title: 'Setting Up 2FA', duration: '5 min' },
      { title: 'Managing API Keys', duration: '4 min' }
    ]
  };

  const videoGuides = [
    { title: 'Dashboard Overview', duration: '8:32' },
    { title: 'Property Quick Start', duration: '12:15' },
    { title: 'Maintenance Workflow', duration: '10:45' },
    { title: 'Creating Custom Reports', duration: '7:20' },
    { title: 'Team Collaboration Setup', duration: '9:10' }
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
              { q: 'How do I export my data?', a: 'Go to Settings → Data Export and choose your format (Excel, CSV, or PDF).' },
              { q: 'Can I invite contractors?', a: 'Yes, use Team Management to invite contractors with specific role permissions.' },
              { q: 'How are my data protected?', a: 'All data is encrypted at rest and in transit. 2FA and IP whitelisting available.' },
              { q: 'What is the API rate limit?', a: '1,000 requests/hour per token with 100 req/min burst limit.' },
              { q: 'How do I delete my account?', a: 'Go to Settings → Security → GDPR to request account deletion (30-day grace period).' }
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