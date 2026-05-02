import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Check, Copy, ExternalLink } from 'lucide-react';

export default function WhiteLabelSettings() {
  const [branding, setBranding] = useState({
    appName: 'Premiso',
    companyName: 'Your Company',
    logoUrl: '',
    primaryColor: '#1e3a8a',
    accentColor: '#fbbf24',
    customDomain: '',
    supportEmail: 'support@yourcompany.com',
    logoText: 'Your Logo'
  });

  const [copied, setCopied] = useState(null);
  const [resellers, setResellers] = useState([
    { id: 1, name: 'Agency Partners LLC', domain: 'agency-partners.premiso.app', users: 12, status: 'active' },
    { id: 2, name: 'PropTech Solutions', domain: 'proptech.premiso.app', users: 28, status: 'active' }
  ]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">White-Label Settings</h1>
          <p className="text-lg text-slate-600">Customize Premiso with your brand & resell to customers</p>
        </div>

        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="domains">Custom Domains</TabsTrigger>
            <TabsTrigger value="resellers">Reseller Portal</TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Logo & Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Logo</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600">Click to upload or drag & drop</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG (max 2MB)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Primary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={branding.primaryColor}
                        onChange={e => setBranding({ ...branding, primaryColor: e.target.value })}
                        className="w-12 h-10 rounded border border-slate-200 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={branding.primaryColor}
                        onChange={e => setBranding({ ...branding, primaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Accent Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={branding.accentColor}
                        onChange={e => setBranding({ ...branding, accentColor: e.target.value })}
                        className="w-12 h-10 rounded border border-slate-200 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={branding.accentColor}
                        onChange={e => setBranding({ ...branding, accentColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>App Name & Company</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">App Name</label>
                  <Input
                    value={branding.appName}
                    onChange={e => setBranding({ ...branding, appName: e.target.value })}
                    placeholder="e.g., Premiso"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Company Name</label>
                  <Input
                    value={branding.companyName}
                    onChange={e => setBranding({ ...branding, companyName: e.target.value })}
                    placeholder="Your Company Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Support Email</label>
                  <Input
                    type="email"
                    value={branding.supportEmail}
                    onChange={e => setBranding({ ...branding, supportEmail: e.target.value })}
                    placeholder="support@yourcompany.com"
                  />
                </div>
              </CardContent>
            </Card>

            <Button className="w-full">Save Branding</Button>
          </TabsContent>

          {/* Custom Domains Tab */}
          <TabsContent value="domains" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Custom Domain</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Domain</label>
                  <div className="flex gap-2">
                    <Input
                      value={branding.customDomain}
                      onChange={e => setBranding({ ...branding, customDomain: e.target.value })}
                      placeholder="app.yourcompany.com"
                      className="flex-1"
                    />
                    <Button variant="outline">Check Availability</Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    $10/month • Add a CNAME record pointing to: premiso-proxy.app
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                  <p className="text-sm font-semibold text-blue-900">🔒 SSL Certificate</p>
                  <p className="text-sm text-blue-800">Automatic SSL included. Renews annually.</p>
                </div>

                <Button className="w-full">Setup Custom Domain</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reseller Portal Tab */}
          <TabsContent value="resellers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Resellers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resellers.map(reseller => (
                    <div key={reseller.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{reseller.name}</p>
                          <p className="text-sm text-slate-600 mt-1 flex items-center gap-2">
                            {reseller.domain}
                            <button
                              onClick={() => copyToClipboard(reseller.domain, reseller.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {copied === reseller.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </p>
                          <p className="text-xs text-slate-500 mt-2">{reseller.users} users</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <ExternalLink className="w-4 h-4" />
                            Visit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add New Reseller</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Company Name</label>
                  <Input placeholder="Reseller Company Name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Subdomain</label>
                  <div className="flex gap-2">
                    <Input placeholder="reseller-name" className="flex-1" />
                    <span className="flex items-center px-3 text-slate-500 bg-slate-100 rounded-lg text-sm">.premiso.app</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Admin Email</label>
                  <Input type="email" placeholder="admin@reseller.com" />
                </div>
                <Button className="w-full">Create Reseller Account</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}