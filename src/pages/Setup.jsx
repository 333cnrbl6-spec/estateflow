import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2, Circle, ChevronRight, ExternalLink, AlertCircle,
  Cloud, Building2, CreditCard, FileSpreadsheet, Mail, HardDrive,
  Database, BarChart3, Calculator, Landmark, Users, FileText,
  Zap, Settings, ArrowRight, Lock, Globe, Upload, RefreshCw
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import IntegrationCard from "@/components/setup/IntegrationCard";
import SetupChecklist from "@/components/setup/SetupChecklist";

const INTEGRATION_GROUPS = [
  {
    label: "File Storage & Documents",
    integrations: [
      {
        id: "dropbox",
        name: "Dropbox",
        description: "Browse folders, import CSVs, tenancy schedules and rent rolls directly into the platform.",
        icon: "dropbox",
        status: "not_connected",
        category: "storage",
        features: ["Browse folders", "Smart CSV import", "Sync property documents", "Auto-import rent rolls"],
        connectAction: "oauth",
        docsUrl: "https://www.dropbox.com",
        color: "bg-blue-500",
      },
      {
        id: "googledrive",
        name: "Google Drive",
        description: "Import spreadsheets, documents and reports from Google Drive into Powell & Co.",
        icon: "gdrive",
        status: "not_connected",
        category: "storage",
        features: ["Browse Drive files", "Import Google Sheets", "Sync documents", "Real-time file updates"],
        connectAction: "oauth",
        docsUrl: "https://drive.google.com",
        color: "bg-yellow-500",
      },
      {
        id: "onedrive",
        name: "OneDrive / SharePoint",
        description: "Connect Microsoft OneDrive or SharePoint to import and sync operational documents.",
        icon: "onedrive",
        status: "not_connected",
        category: "storage",
        features: ["Browse OneDrive", "SharePoint libraries", "Import Excel files", "Document sync"],
        connectAction: "oauth",
        docsUrl: "https://onedrive.live.com",
        color: "bg-blue-600",
      },
    ]
  },
  {
    label: "Accounting & Finance",
    integrations: [
      {
        id: "freeagent",
        name: "FreeAgent",
        description: "Sync invoices, bank transactions and expenses with your FreeAgent accounting software.",
        icon: "freeagent",
        status: "not_connected",
        category: "accounting",
        features: ["Sync bank transactions", "Import invoices", "Match expenses", "VAT returns"],
        connectAction: "api_key",
        docsUrl: "https://www.freeagent.com",
        color: "bg-green-500",
      },
      {
        id: "xero",
        name: "Xero",
        description: "Connect Xero to reconcile rent payments, service charge demands and contractor invoices.",
        icon: "xero",
        status: "not_connected",
        category: "accounting",
        features: ["Bank reconciliation", "Invoice sync", "Expense tracking", "Financial reports"],
        connectAction: "oauth",
        docsUrl: "https://www.xero.com",
        color: "bg-blue-400",
      },
      {
        id: "quickbooks",
        name: "QuickBooks",
        description: "Import and reconcile transactions from QuickBooks Online.",
        icon: "quickbooks",
        status: "not_connected",
        category: "accounting",
        features: ["Transaction sync", "P&L reports", "Invoice management", "Tax preparation"],
        connectAction: "oauth",
        docsUrl: "https://quickbooks.intuit.com",
        color: "bg-green-600",
      },
    ]
  },
  {
    label: "Banking",
    integrations: [
      {
        id: "open_banking",
        name: "Open Banking (UK)",
        description: "Connect Lloyds, Barclays, NatWest, HSBC via Open Banking to auto-import transactions.",
        icon: "bank",
        status: "not_connected",
        category: "banking",
        features: ["Auto-import transactions", "Real-time balances", "Multi-account", "Standing orders"],
        connectAction: "open_banking",
        docsUrl: "https://www.openbanking.org.uk",
        color: "bg-emerald-600",
      },
      {
        id: "csv_bank",
        name: "Bank CSV Import",
        description: "Upload CSV exports from any UK bank — Lloyds, Barclays, Monzo, Starling, etc.",
        icon: "upload",
        status: "available",
        category: "banking",
        features: ["Lloyds format", "Barclays format", "Monzo / Starling", "Auto-categorise"],
        connectAction: "csv",
        docsUrl: null,
        color: "bg-slate-500",
      },
    ]
  },
  {
    label: "Google Workspace",
    integrations: [
      {
        id: "gmail",
        name: "Gmail",
        description: "Log emails from tenants, contractors and solicitors directly into the CRM.",
        icon: "gmail",
        status: "not_connected",
        category: "google",
        features: ["Inbound email logging", "Auto-link to tenant", "Thread tracking", "Attachment sync"],
        connectAction: "oauth",
        docsUrl: "https://mail.google.com",
        color: "bg-red-500",
      },
      {
        id: "googlecalendar",
        name: "Google Calendar",
        description: "Sync property inspections, tenancy renewals and compliance deadlines to Google Calendar.",
        icon: "gcal",
        status: "not_connected",
        category: "google",
        features: ["Inspection scheduling", "Renewal reminders", "Compliance alerts", "Team calendar"],
        connectAction: "oauth",
        docsUrl: "https://calendar.google.com",
        color: "bg-blue-500",
      },
      {
        id: "googlesheets",
        name: "Google Sheets",
        description: "Import rent rolls, tenancy schedules and property data directly from Google Sheets.",
        icon: "gsheets",
        status: "not_connected",
        category: "google",
        features: ["Rent roll import", "Tenancy schedule sync", "Live data refresh", "Export reports"],
        connectAction: "oauth",
        docsUrl: "https://sheets.google.com",
        color: "bg-green-500",
      },
    ]
  },
  {
    label: "Companies House & Legal",
    integrations: [
      {
        id: "companies_house",
        name: "Companies House API",
        description: "Auto-fetch company details, director changes and filing deadlines for all group entities.",
        icon: "ch",
        status: "available",
        category: "legal",
        features: ["Company profiles", "Director tracking", "Filing deadlines", "PSC register"],
        connectAction: "api_key",
        docsUrl: "https://developer.company-information.service.gov.uk",
        color: "bg-purple-600",
      },
      {
        id: "land_registry",
        name: "HM Land Registry",
        description: "Search price paid data and company ownership (CCOD) — already integrated.",
        icon: "lr",
        status: "active",
        category: "legal",
        features: ["Price paid lookups", "CCOD ownership search", "Title number lookup", "SPARQL queries"],
        connectAction: "api_key",
        docsUrl: "https://use-land-property-data.service.gov.uk",
        color: "bg-red-700",
      },
    ]
  },
  {
    label: "Communication",
    integrations: [
      {
        id: "sendgrid",
        name: "Email (SendGrid)",
        description: "Send automated emails — rent demands, service charge notices, compliance reminders.",
        icon: "email",
        status: "not_connected",
        category: "comms",
        features: ["Automated demands", "Compliance notices", "Tenant communications", "Email templates"],
        connectAction: "api_key",
        docsUrl: "https://sendgrid.com",
        color: "bg-blue-600",
      },
      {
        id: "slack",
        name: "Slack",
        description: "Get alerts for overdue rent, urgent maintenance and compliance deadlines in Slack.",
        icon: "slack",
        status: "not_connected",
        category: "comms",
        features: ["Rent arrears alerts", "Maintenance updates", "Compliance warnings", "Daily digest"],
        connectAction: "oauth",
        docsUrl: "https://slack.com",
        color: "bg-purple-500",
      },
    ]
  }
];

export default function Setup() {
  const [activeTab, setActiveTab] = useState("overview");

  const allIntegrations = useMemo(() => INTEGRATION_GROUPS.flatMap(g => g.integrations), []);
  const connected = allIntegrations.filter(i => i.status === "active").length;
  const available = allIntegrations.filter(i => i.status === "available").length;
  const total = allIntegrations.length;
  const progress = useMemo(() => Math.round(((connected + available * 0.5) / total) * 100), [connected, available, total]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Setup & Integrations"
        subtitle="Connect your tools to automate data import and keep Powell & Co in sync"
      />

      {/* Progress Banner */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Platform Setup Progress</p>
                <span className="text-sm font-semibold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {connected} of {total} integrations active · {total - connected - available} not yet configured
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{connected}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-500">{available}</p>
                <p className="text-xs text-muted-foreground">Ready</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-muted-foreground">{total - connected - available}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">All Integrations</TabsTrigger>
          <TabsTrigger value="checklist">Setup Checklist</TabsTrigger>
          <TabsTrigger value="import">Smart Import</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-8">
            {INTEGRATION_GROUPS.map(group => (
              <div key={group.label}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{group.label}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {group.integrations.map(integration => (
                    <IntegrationCard key={integration.id} integration={integration} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="checklist">
          <SetupChecklist />
        </TabsContent>

        <TabsContent value="import">
          <SmartImportTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SmartImportTab() {
  const importSources = [
    { icon: HardDrive, name: "Dropbox", desc: "Browse and import files from your Dropbox", color: "text-blue-500", action: "Connect Dropbox first" },
    { icon: Cloud, name: "Google Drive", desc: "Import spreadsheets and docs from Drive", color: "text-yellow-500", action: "Connect Google first" },
    { icon: FileSpreadsheet, name: "Upload CSV / Excel", desc: "Drag and drop any spreadsheet file", color: "text-green-500", action: "Upload now" },
    { icon: Globe, name: "Google Sheets URL", desc: "Paste a Google Sheets link to import live", color: "text-blue-400", action: "Connect Google first" },
  ];

  const entityTargets = [
    { name: "Properties", fields: "Name, Address, Postcode, Type, Ownership", icon: Building2 },
    { name: "Units", fields: "Reference, Bedrooms, Floor, Monthly Rent, Lease dates", icon: Database },
    { name: "Tenants", fields: "Name, Email, Phone, Unit, Tenancy dates, Deposit", icon: Users },
    { name: "Rent Ledger", fields: "Tenant, Amount, Due date, Paid date, Status", icon: CreditCard },
    { name: "Bank Transactions", fields: "Date, Description, Amount, Reference, Category", icon: Landmark },
    { name: "Companies", fields: "Name, Company No., Directors, SIC, Region", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Import Source</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {importSources.map(src => (
            <Card key={src.name} className="hover:border-primary/40 transition-colors cursor-pointer group">
              <CardContent className="pt-5 pb-4">
                <src.icon className={`w-8 h-8 mb-3 ${src.color}`} />
                <h4 className="font-medium text-sm mb-1">{src.name}</h4>
                <p className="text-xs text-muted-foreground mb-3">{src.desc}</p>
                <Button variant="outline" size="sm" className="w-full text-xs group-hover:border-primary">
                  {src.action} <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">What Can Be Imported</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entityTargets.map(target => (
            <Card key={target.name}>
              <CardContent className="pt-4 pb-4 flex items-start gap-3">
                <target.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-medium text-sm">{target.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{target.fields}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-4 pb-4 flex items-start gap-3">
          <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Smart Column Mapping</p>
            <p className="text-xs text-amber-700 mt-0.5">
              When you upload a file, AI will automatically map your column headers to the correct fields — even if they don't match exactly. You'll see a preview before anything is saved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}