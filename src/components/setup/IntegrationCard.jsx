import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, Circle, ExternalLink, ArrowRight, Lock,
  HardDrive, Cloud, FileSpreadsheet, Mail, Calculator,
  Landmark, Building2, Globe, MessageSquare, BarChart3,
  FileText, Upload, CreditCard, Database
} from "lucide-react";

const ICON_MAP = {
  dropbox: HardDrive,
  gdrive: Cloud,
  onedrive: Cloud,
  freeagent: Calculator,
  xero: BarChart3,
  quickbooks: BarChart3,
  bank: Landmark,
  upload: Upload,
  gmail: Mail,
  gcal: Globe,
  gsheets: FileSpreadsheet,
  ch: Building2,
  lr: FileText,
  email: Mail,
  slack: MessageSquare,
};

const STATUS_CONFIG = {
  active: { label: "Active", className: "bg-green-100 text-green-700 border-green-200" },
  not_connected: { label: "Not Connected", className: "bg-muted text-muted-foreground" },
  available: { label: "Ready to Connect", className: "bg-amber-100 text-amber-700 border-amber-200" },
  coming_soon: { label: "Coming Soon", className: "bg-blue-100 text-blue-700 border-blue-200" },
};

const ACTION_LABELS = {
  oauth: "Connect via OAuth",
  api_key: "Add API Key",
  open_banking: "Connect Bank",
  csv: "Upload CSV",
};

export default function IntegrationCard({ integration }) {
  const Icon = ICON_MAP[integration.icon] || Globe;
  const status = STATUS_CONFIG[integration.status] || STATUS_CONFIG.not_connected;
  const actionLabel = ACTION_LABELS[integration.connectAction] || "Connect";
  const isActive = integration.status === "active";
  const isAvailable = integration.status === "available";

  return (
    <Card className={`flex flex-col transition-all duration-200 hover:shadow-md ${isActive ? "border-green-200 bg-green-50/30" : ""}`}>
      <CardContent className="pt-5 pb-4 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${integration.color} flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">{integration.name}</h4>
              <Badge variant="outline" className={`text-[10px] mt-0.5 ${status.className}`}>
                {isActive ? <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> : <Circle className="w-2.5 h-2.5 mr-1" />}
                {status.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed">{integration.description}</p>

        {/* Features */}
        <ul className="space-y-1">
          {integration.features.map(f => (
            <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-green-500" : "bg-primary/30"}`} />
              {f}
            </li>
          ))}
        </ul>

        {/* Action */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          {isActive ? (
            <Button variant="outline" size="sm" className="text-xs border-green-300 text-green-700 flex-1">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
            </Button>
          ) : (
            <Button
              variant={isAvailable ? "default" : "outline"}
              size="sm"
              className="text-xs flex-1"
              disabled={integration.status === "coming_soon"}
            >
              {actionLabel} <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
          {integration.docsUrl && (
            <Button variant="ghost" size="sm" className="text-xs px-2" asChild>
              <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}