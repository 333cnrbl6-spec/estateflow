import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Home, Building2, Users } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { PRICING_TIERS, getAllTiers } from '@/lib/pricingTiersConfig';

const ICON_MAP = {
  Home: <Home className="w-6 h-6" />,
  Building2: <Building2 className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />,
};

export default function Settings() {
  const [selectedTier, setSelectedTier] = useState('lettings');
  const tiers = getAllTiers();
  const currentTier = PRICING_TIERS[selectedTier];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      <div className="p-8 max-w-[1400px] mx-auto">
        <PageHeader 
          title="Settings & Pricing" 
          subtitle="Configure your service tier and manage platform settings"
        />

        <Tabs defaultValue="pricing" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pricing">Service Tiers</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="general">General Settings</TabsTrigger>
          </TabsList>

          {/* Service Tiers Tab */}
          <TabsContent value="pricing" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {tiers.map((tier) => (
                <Card 
                  key={tier.id} 
                  className={`relative cursor-pointer transition-all ${
                    selectedTier === tier.id 
                      ? 'ring-2 ring-primary shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedTier(tier.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-lg ${tier.color}`}>
                        {ICON_MAP[tier.icon]}
                      </div>
                      {selectedTier === tier.id && (
                        <Badge variant="default">Current</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm font-semibold text-foreground mb-3">Pricing</p>
                      <p className="text-lg font-bold text-primary">{tier.pricing}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Limits</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• Properties: {tier.limits.properties}</p>
                        <p>• Tenants: {tier.limits.tenants}</p>
                        <p>• Users: {tier.limits.users}</p>
                      </div>
                    </div>
                    <Button 
                      variant={selectedTier === tier.id ? "default" : "outline"}
                      className="w-full"
                    >
                      {selectedTier === tier.id ? 'Current Tier' : 'Upgrade'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selected Tier Details */}
            <Card>
              <CardHeader>
                <CardTitle>Features in {currentTier.name}</CardTitle>
                <CardDescription>Complete list of included features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentTier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Tier Comparison</CardTitle>
                <CardDescription>Side-by-side feature comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Feature</th>
                        {tiers.map(tier => (
                          <th key={tier.id} className="text-center py-3 px-4 font-semibold text-foreground">
                            {tier.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Collect all unique features */}
                      {(() => {
                        const allFeatures = new Set();
                        tiers.forEach(t => t.features.forEach(f => allFeatures.add(f)));
                        return Array.from(allFeatures).map((feature, idx) => (
                          <tr key={idx} className="border-b border-border hover:bg-muted/30">
                            <td className="py-3 px-4 text-foreground">{feature}</td>
                            {tiers.map(tier => (
                              <td key={tier.id} className="text-center py-3 px-4">
                                {tier.features.includes(feature) ? (
                                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Pricing Summary */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tiers.map(tier => (
                    <Card key={tier.id} className="bg-muted/30">
                      <CardHeader>
                        <CardTitle className="text-base">{tier.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-2xl font-bold text-primary">{tier.pricing}</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Properties: {tier.limits.properties}</p>
                          <p>Users: {tier.limits.users}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Settings Tab */}
          <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">General settings coming soon. Contact support for billing or account changes.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}