import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronRight, AlertCircle } from "lucide-react";

const CHECKLIST = [
  {
    section: "Data Foundation",
    steps: [
      { id: "companies", label: "Add all group companies", desc: "Powell & Co entities, SPVs, management cos", done: true },
      { id: "properties", label: "Add all properties", desc: "Buildings, blocks and standalone units", done: true },
      { id: "units", label: "Add units & leases", desc: "Flat references, lease terms, ground rents", done: true },
      { id: "tenants", label: "Add tenants & ASTs", desc: "Current tenants with tenancy dates and deposits", done: true },
    ]
  },
  {
    section: "File Storage",
    steps: [
      { id: "dropbox", label: "Connect Dropbox", desc: "Enable smart import of rent rolls and schedules", done: false, action: "Connect" },
      { id: "gdrive", label: "Connect Google Drive (optional)", desc: "Alternative file source for import", done: false, action: "Connect" },
    ]
  },
  {
    section: "Accounting",
    steps: [
      { id: "freeagent", label: "Connect FreeAgent", desc: "Sync transactions and invoices", done: false, action: "Add API Key" },
      { id: "bank_csv", label: "Import bank statements", desc: "Upload CSV from Lloyds, Barclays etc.", done: false, action: "Upload" },
    ]
  },
  {
    section: "Google Workspace",
    steps: [
      { id: "gmail", label: "Connect Gmail", desc: "Auto-log tenant and contractor emails to CRM", done: false, action: "Connect" },
      { id: "gcal", label: "Connect Google Calendar", desc: "Sync inspections and compliance deadlines", done: false, action: "Connect" },
      { id: "gsheets", label: "Connect Google Sheets", desc: "Import live rent rolls from Sheets", done: false, action: "Connect" },
    ]
  },
  {
    section: "Compliance & Legal",
    steps: [
      { id: "companies_house", label: "Add Companies House API key", desc: "Auto-fetch filing deadlines for all entities", done: false, action: "Add Key" },
      { id: "hmlr", label: "Add HMLR API key (CCOD)", desc: "Enable company ownership search", done: false, action: "Add Key" },
      { id: "compliance_review", label: "Review compliance dashboard", desc: "Check filing deadlines for all companies", done: true },
    ]
  },
  {
    section: "Operations",
    steps: [
      { id: "pipeline_live", label: "Set up tenancy pipeline", desc: "Add active and prospective tenancies", done: true },
      { id: "maintenance", label: "Log open maintenance orders", desc: "Track all outstanding work", done: false, action: "Add" },
      { id: "contacts", label: "Add key contacts", desc: "Contractors, solicitors, accountants", done: true },
    ]
  },
];

export default function SetupChecklist() {
  const allSteps = CHECKLIST.flatMap(s => s.steps);
  const doneCount = allSteps.filter(s => s.done).length;
  const total = allSteps.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-lg">
        <div className="text-3xl font-bold text-primary">{doneCount}/{total}</div>
        <div>
          <p className="font-medium text-sm">Setup steps completed</p>
          <p className="text-xs text-muted-foreground">{total - doneCount} remaining to fully activate the platform</p>
        </div>
      </div>

      {CHECKLIST.map(section => (
        <div key={section.section}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{section.section}</h3>
          <div className="space-y-2">
            {section.steps.map(step => (
              <Card key={step.id} className={`${step.done ? "opacity-70" : ""}`}>
                <CardContent className="py-3 px-4 flex items-center gap-3">
                  {step.done
                    ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    : <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${step.done ? "line-through text-muted-foreground" : ""}`}>{step.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{step.desc}</p>
                  </div>
                  {!step.done && step.action && (
                    <Button variant="outline" size="sm" className="text-xs shrink-0">
                      {step.action} <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                  {step.done && (
                    <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200 shrink-0">Done</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}