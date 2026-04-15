/**
 * COILegalSeverityPanel.jsx
 *
 * Displays full UK legal context when a COI flag is clicked.
 * Shows legislation basis, penalties, tribunal routes, and leaseholder remedies.
 */

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertTriangle, Scale, Gavel, Shield, FileText,
  ChevronDown, ChevronUp, ExternalLink, BookOpen, X
} from 'lucide-react';
import { getLegalSeverity, SEVERITY_STYLES } from '@/lib/coiLegalSeverity';

const SEVERITY_ICONS = {
  CRITICAL: AlertTriangle,
  HIGH: AlertTriangle,
  MEDIUM: Scale,
  LOW: Shield,
};

function LegislationCard({ item, index }) {
  const [expanded, setExpanded] = useState(index === 0);
  const style = SEVERITY_STYLES[item.severity] || SEVERITY_STYLES.MEDIUM;

  return (
    <div className={`rounded-xl border ${style.card} overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between p-3 text-left gap-3"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold ${style.text}`}>{item.legislation}</span>
            <Badge className={`text-[9px] shrink-0 ${style.badge}`}>{item.severity}</Badge>
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{item.jurisdiction}</div>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-current/10">
          <p className="text-xs leading-relaxed text-foreground/80 mt-2">{item.detail}</p>
          <div className={`flex items-start gap-2 rounded-lg p-2 ${style.card} border ${style.card.split(' ')[0]}`}>
            <Gavel className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${style.icon_color}`} />
            <div>
              <div className={`text-[10px] font-semibold uppercase tracking-wide ${style.text}`}>Consequence</div>
              <div className="text-xs mt-0.5">{item.consequence}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function COILegalBadge({ coiPattern, onClick }) {
  const data = getLegalSeverity(coiPattern);
  if (!data) return null;
  const style = SEVERITY_STYLES[data.severity] || SEVERITY_STYLES.MEDIUM;
  const Icon = SEVERITY_ICONS[data.severity] || AlertTriangle;

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium transition-all hover:shadow-md cursor-pointer ${style.card} ${style.text}`}
      title="Click for UK legal analysis"
    >
      <Icon className={`w-3.5 h-3.5 ${style.icon_color}`} />
      <span>{data.severity}</span>
      <span className="opacity-60 text-[10px]">· {data.legal_basis?.length} laws</span>
      <BookOpen className="w-3 h-3 opacity-50" />
    </button>
  );
}

export default function COILegalSeverityPanel({ coiPattern, fromLabel, toLabel, open, onClose }) {
  const data = getLegalSeverity(coiPattern);

  if (!data) return null;

  const style = SEVERITY_STYLES[data.severity] || SEVERITY_STYLES.MEDIUM;
  const Icon = SEVERITY_ICONS[data.severity] || AlertTriangle;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className={`p-5 ${style.card} border-b`}>
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl ${style.badge.split(' ')[0]}/20 border ${style.card.split(' ')[0]}`}>
                  <Icon className={`w-5 h-5 ${style.icon_color}`} />
                </div>
                <div>
                  <DialogTitle className={`text-base font-bold ${style.text}`}>
                    {data.pattern_name}
                  </DialogTitle>
                  {fromLabel && toLabel && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-medium">{fromLabel}</span>
                      <span className="mx-1 opacity-50">→</span>
                      <span className="font-medium">{toLabel}</span>
                    </div>
                  )}
                </div>
              </div>
              <Badge className={`shrink-0 ${style.badge}`}>{data.severity} RISK</Badge>
            </div>
          </DialogHeader>

          {/* Headline */}
          <div className={`mt-3 flex items-start gap-2 rounded-lg p-3 bg-white/60 border ${style.card.split(' ')[0]}`}>
            <Scale className={`w-4 h-4 mt-0.5 shrink-0 ${style.icon_color}`} />
            <p className={`text-sm font-medium ${style.text}`}>{data.headline}</p>
          </div>

          <p className="text-xs text-foreground/70 mt-3 leading-relaxed">{data.summary}</p>
        </div>

        <div className="p-5 space-y-5">
          {/* Legal Basis */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Legal Basis — England & Wales</h3>
              <Badge variant="outline" className="text-[10px]">{data.legal_basis?.length} statutes</Badge>
            </div>
            <div className="space-y-2">
              {data.legal_basis?.map((item, i) => (
                <LegislationCard key={i} item={item} index={i} />
              ))}
            </div>
          </div>

          {/* Risk Escalation (nominee only) */}
          {data.risk_escalation && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-semibold">Risk Escalation Matrix</h3>
              </div>
              <div className="space-y-2">
                {Object.entries(data.risk_escalation).map(([key, val]) => {
                  const s = SEVERITY_STYLES[val.severity] || SEVERITY_STYLES.LOW;
                  return (
                    <div key={key} className={`flex items-start gap-2 rounded-lg border p-2.5 ${s.card}`}>
                      <Badge className={`text-[9px] shrink-0 ${s.badge}`}>{val.severity}</Badge>
                      <div>
                        <div className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wide">{key.replace(/_/g, ' ')}</div>
                        <div className="text-xs mt-0.5">{val.note}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tribunal Route */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Gavel className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-primary">Enforcement / Tribunal Route</h3>
            </div>
            <p className="text-xs leading-relaxed">{data.tribunal_route}</p>
            {data.regulator && (
              <div className="text-[10px] text-muted-foreground">
                <span className="font-semibold">Regulators: </span>{data.regulator}
              </div>
            )}
          </div>

          {/* Leaseholder Remedies */}
          {data.leaseholder_remedies?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-semibold">Leaseholder Remedies</h3>
              </div>
              <div className="space-y-1.5">
                {data.leaseholder_remedies.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full bg-green-100 text-green-700 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <span className="leading-relaxed">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Action */}
          {data.recommended_action && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-amber-800">Recommended Action</h3>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">{data.recommended_action}</p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="border-t pt-3 text-[10px] text-muted-foreground leading-relaxed">
            <strong>Legal Disclaimer:</strong> This information is provided for guidance purposes only and reflects the law of England & Wales as at April 2026. It does not constitute legal advice. For specific advice on your situation, please consult a solicitor specialising in leasehold law or property dispute resolution.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}