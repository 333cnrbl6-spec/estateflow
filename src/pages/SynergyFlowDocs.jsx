import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Link as LinkIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const PREMISO_REFERENCE = `# Premiso — Complete Reference

**Tagline:** Institutional property management intelligence. Built on relationship expertise, not generic compliance.

---

## Core Value Proposition

Premiso detects what others miss:
- **Hidden conflicts of interest** via relationship mapping (beneficial owners, nominees, offshore structures)
- **Regulatory compliance gaps** (certificates, filings, statutory notices)
- **Financial risk** in property portfolios (yield, occupancy, cash flow)
- **Operational inefficiency** in maintenance, tenant management, vendor lifecycle

---

## Quick Start

### Key Entities
- **Property** — Buildings, blocks, freehold/leasehold
- **Unit** — Individual flats within properties
- **Tenant** — Leaseholders, renters; screening data
- **Company** — Companies House data, directors
- **OwnershipRelationship** — Maps person→company→property chains

### Core Features
- **Relationship Intelligence** — Detects conflicts of interest automatically
- **Compliance Alerts** — Certificate expiry tracking, Companies House sync
- **Maintenance Management** — Tenant requests → contractor assignment
- **Financial Tracking** — Rent ledger, service charges, P&L reports

### Backend Functions
- detectConflictsOfInterest() — Scan all relationships for hidden COI
- checkCertificateExpiryDaily() — Automated compliance alerts
- syncCompaniesHouseDataBatch() — Keep CH profiles current
- generateFinancialReportPDF() — PDF P&L, balance sheet

---

## Technology Stack
- **Frontend:** React, Tailwind, shadcn/ui
- **Backend:** Deno Deploy (serverless), Base44 SDK
- **Data:** Base44 entities (PostgreSQL), full audit logging

---

## Revenue Model
- SaaS subscription (per property or unit)
- Enterprise license (portfolio-based)
- Compliance consulting services

---

## Competitive Moat
Relationship Intelligence Engine — detects conflicts no competitor catches. Built on deep UK property expertise, not generic features.`;

const INTEGRATION_PATTERNS = `# Cross-App Integration Patterns

**Goal:** Multiple Base44 apps operate as unified software vendor ecosystem.

---

## Architecture

Hub (Landing, Licensing)
    ↓
Shared Services (User Auth, Billing, Analytics)
    ↓
[Premiso] [Synergy Flow] [Future App]

---

## Key Patterns

### Pattern 1: Shared User Context

Use SubscriptionProvider to share user & entitlements across apps.

### Pattern 2: Cross-App Data Queries

Any app can query shared entities via service role:

\`const leads = await base44.asServiceRole.entities.SalesLead.filter({ ... })\`

### Pattern 3: License Gating

Use ProtectedAppRoute to gate apps by subscription entitlements.

### Pattern 4: Shared Entities

Core entities used by all apps:
- Property — Base data
- Unit — Sub-properties
- Tenant — User data
- Contact — Directors, agents
- Company — Company data

Each app extends with its own fields.

### Pattern 5: Real-Time Sync

Use entity automations to sync data across apps in real-time.

---

## Deployment Strategy

**Start with Monorepo:**
- Single Base44 project
- Shared components, entities, functions
- Easy cross-app communication
- Deploy together

**All apps in one codebase:**
- /pages/premiso/...
- /pages/synergy-flow/...
- /entities/... (shared)
- /functions/... (shared)

---

## Getting Started

1. Create Subscription entity in hub
2. Add app-specific entities in each app
3. Build SubscriptionProvider wrapper
4. Add license gating to routes
5. Create backend functions for cross-app queries
`;

export default function SynergyFlowDocs() {
  const [activeTab, setActiveTab] = useState('premiso');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Software Vendor Hub — Integration Docs</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Reference guides for Premiso, Synergy Flow, and cross-app integration patterns.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="premiso">Premiso Reference</TabsTrigger>
            <TabsTrigger value="integration">Integration Patterns</TabsTrigger>
          </TabsList>

          {/* Premiso Tab */}
          <TabsContent value="premiso" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Premiso — Complete Reference</CardTitle>
                <CardDescription>
                  Features, entities, functions, and competitive advantages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xl font-semibold mt-5 mb-3">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>,
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-2 my-4">{children}</ul>,
                      li: ({ children }) => <li className="ml-4">{children}</li>,
                      code: ({ inline, children }) => 
                        inline ? (
                          <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{children}</code>
                        ) : (
                          <pre className="bg-muted p-4 rounded overflow-auto my-4">
                            <code className="text-sm font-mono">{children}</code>
                          </pre>
                        ),
                      p: ({ children }) => <p className="my-3 leading-relaxed">{children}</p>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {PREMISO_REFERENCE}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integration Tab */}
          <TabsContent value="integration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cross-App Integration Patterns</CardTitle>
                <CardDescription>
                  How to build Premiso, Synergy Flow, and future apps as unified platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xl font-semibold mt-5 mb-3">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>,
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-2 my-4">{children}</ul>,
                      li: ({ children }) => <li className="ml-4">{children}</li>,
                      code: ({ inline, children }) => 
                        inline ? (
                          <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{children}</code>
                        ) : (
                          <pre className="bg-muted p-4 rounded overflow-auto my-4">
                            <code className="text-sm font-mono">{children}</code>
                          </pre>
                        ),
                      p: ({ children }) => <p className="my-3 leading-relaxed">{children}</p>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
                          {children}
                        </blockquote>
                      ),
                      table: ({ children }) => <table className="w-full border-collapse border my-4">{children}</table>,
                      th: ({ children }) => <th className="border p-2 bg-muted font-semibold">{children}</th>,
                      td: ({ children }) => <td className="border p-2">{children}</td>,
                    }}
                  >
                    {INTEGRATION_PATTERNS}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer CTA */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <LinkIcon className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold">Ready to integrate?</p>
                <p className="text-sm text-muted-foreground">
                  Use these docs as reference for building Synergy Flow, entity schemas, and cross-app functions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}