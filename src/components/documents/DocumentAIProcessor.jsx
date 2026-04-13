import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  Sparkles, Loader2, CheckCircle2, ChevronDown, ChevronUp,
  Tag, FileSearch, Wand2, AlertCircle, Copy, Check
} from 'lucide-react';

// ─── Extraction schema ────────────────────────────────────────────
const EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    // Document identity
    document_type: {
      type: 'string',
      enum: [
        'tenancy_agreement', 'lease', 'deposit_protection_notice',
        'gas_safety_cert', 'eicr', 'epc', 'fire_safety_cert', 'asbestos_report',
        'service_charge_statement', 'invoice', 'rent_statement', 'ground_rent_demand',
        'inventory', 'inspection_report', 'maintenance_notice',
        'eviction_notice', 'rent_increase', 'section_21', 'section_8',
        'rtm_notice', 's20_notice', 'company_document', 'bank_statement', 'other'
      ]
    },
    confidence: { type: 'number' },

    // Key dates
    dates: {
      type: 'object',
      properties: {
        issue_date: { type: 'string' },
        expiry_date: { type: 'string' },
        start_date: { type: 'string' },
        end_date: { type: 'string' },
        signed_date: { type: 'string' },
      }
    },

    // Financial
    financials: {
      type: 'object',
      properties: {
        rent_amount: { type: 'number' },
        rent_frequency: { type: 'string' },
        deposit_amount: { type: 'number' },
        invoice_amount: { type: 'number' },
        service_charge_amount: { type: 'number' },
        currency: { type: 'string' },
      }
    },

    // People
    people: {
      type: 'object',
      properties: {
        tenant_name: { type: 'string' },
        tenant_email: { type: 'string' },
        tenant_phone: { type: 'string' },
        landlord_name: { type: 'string' },
        landlord_email: { type: 'string' },
        agent_name: { type: 'string' },
        issuing_engineer_name: { type: 'string' },
        issuing_body: { type: 'string' },
      }
    },

    // Property
    property: {
      type: 'object',
      properties: {
        address: { type: 'string' },
        postcode: { type: 'string' },
        property_type: { type: 'string' },
        unit_reference: { type: 'string' },
      }
    },

    // Certificate-specific
    certificate: {
      type: 'object',
      properties: {
        certificate_number: { type: 'string' },
        registration_number: { type: 'string' },
        result: { type: 'string' },
        rating: { type: 'string' },
        next_inspection_due: { type: 'string' },
      }
    },

    // AI-generated
    summary: { type: 'string' },
    key_points: { type: 'array', items: { type: 'string' } },
    suggested_tags: { type: 'array', items: { type: 'string' } },
    suggested_title: { type: 'string' },
    action_required: { type: 'string' },
    warnings: { type: 'array', items: { type: 'string' } },
  }
};

function FieldRow({ label, value, onApply, applied }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-1.5 border-b last:border-0 gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-slate-800 truncate">{String(value)}</p>
      </div>
      {onApply && (
        <button onClick={() => onApply(value)}
          className={`text-xs px-2 py-1 rounded font-medium shrink-0 transition-all ${
            applied ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary hover:bg-primary/20'
          }`}>
          {applied ? <span className="flex items-center gap-1"><Check className="w-3 h-3" />Applied</span> : 'Apply'}
        </button>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children, color = 'bg-slate-50' }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={`rounded-xl border overflow-hidden`}>
      <button onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-3 py-2 ${color} hover:opacity-90 transition-opacity`}>
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-xs font-semibold text-slate-700">{title}</span>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>
      {open && <div className="p-3 bg-white">{children}</div>}
    </div>
  );
}

export default function DocumentAIProcessor({ fileUrl, fileName, onExtracted }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState({});

  const process = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a UK property management document analyst. Carefully analyse this document and extract ALL relevant data.

File: "${fileName}"

Extract:
1. Document type (classify precisely)
2. All dates (issue, expiry, start/end of tenancy, signing date)
3. Financial figures (rent, deposit, invoice amounts, service charges)
4. All people mentioned (tenant, landlord, agent, engineer, issuing body)
5. Property details (full address, postcode, unit reference)
6. Certificate details if applicable (cert number, result, rating, next inspection)
7. Write a 2–3 sentence executive summary of the document
8. List 3–5 key points a property manager should know
9. Suggest 3–6 tags for filing (short, lowercase, hyphenated)
10. Suggest a professional document title
11. Flag any actions required or warnings (e.g. expiry within 30 days, missing signatures, unusual clauses)

Be precise with dates — use ISO format YYYY-MM-DD where possible.`,
        file_urls: [fileUrl],
        response_json_schema: EXTRACTION_SCHEMA,
        model: 'claude_sonnet_4_6',
      });
      setResult(res);
      onExtracted && onExtracted(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const apply = (field, value) => {
    setApplied(a => ({ ...a, [field]: true }));
    onExtracted && onExtracted({ _apply: { [field]: value } });
  };

  if (!fileUrl) return null;

  return (
    <div className="border rounded-xl overflow-hidden bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <span className="text-sm font-semibold text-violet-900">AI Document Analysis</span>
        </div>
        {!result && (
          <Button size="sm" onClick={process} disabled={loading}
            className="bg-violet-600 hover:bg-violet-700 text-white h-7 text-xs gap-1">
            {loading ? <><Loader2 className="w-3 h-3 animate-spin" />Analysing…</> : <><Wand2 className="w-3 h-3" />Analyse Document</>}
          </Button>
        )}
        {result && (
          <button onClick={process} className="text-xs text-violet-600 hover:text-violet-800 flex items-center gap-1">
            <Loader2 className="w-3 h-3" /> Re-analyse
          </button>
        )}
      </div>

      {error && (
        <div className="mx-4 mb-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </div>
      )}

      {loading && (
        <div className="px-4 pb-4 space-y-2">
          {['Identifying document type…', 'Extracting dates and figures…', 'Recognising parties…', 'Generating summary…'].map((msg, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-violet-700">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              {msg}
            </div>
          ))}
        </div>
      )}

      {result && (
        <div className="px-4 pb-4 space-y-3">
          {/* Document type + confidence */}
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-slate-700 capitalize">
              {result.document_type?.replace(/_/g, ' ')}
            </span>
            {result.confidence && (
              <span className="text-xs text-muted-foreground">({Math.round(result.confidence * 100)}% confidence)</span>
            )}
            <button onClick={() => apply('document_type', result.document_type)}
              className={`ml-auto text-xs px-2 py-0.5 rounded font-medium ${applied.document_type ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
              {applied.document_type ? '✓ Applied' : 'Apply type'}
            </button>
          </div>

          {/* Warnings */}
          {result.warnings?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
              <p className="text-xs font-bold text-red-700 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Warnings</p>
              {result.warnings.map((w, i) => <p key={i} className="text-xs text-red-600">• {w}</p>)}
            </div>
          )}

          {/* Action required */}
          {result.action_required && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs font-bold text-amber-700">Action Required</p>
              <p className="text-xs text-amber-800 mt-0.5">{result.action_required}</p>
            </div>
          )}

          {/* Summary */}
          {result.summary && (
            <Section title="Executive Summary" icon={FileSearch} color="bg-blue-50">
              <p className="text-xs text-slate-700 leading-relaxed">{result.summary}</p>
              {result.key_points?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {result.key_points.map((pt, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span>{pt}
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          )}

          {/* Dates */}
          {result.dates && Object.values(result.dates).some(Boolean) && (
            <Section title="Dates" icon={CheckCircle2} color="bg-green-50">
              {[
                ['Issue Date', 'issue_date', 'generated_date'],
                ['Expiry Date', 'expiry_date', 'expiry_date'],
                ['Start Date', 'start_date', 'start_date'],
                ['End Date', 'end_date', 'end_date'],
                ['Signed Date', 'signed_date', 'signed_date'],
              ].map(([label, key, applyKey]) => result.dates?.[key] && (
                <FieldRow key={key} label={label} value={result.dates[key]}
                  applied={applied[applyKey]}
                  onApply={(v) => apply(applyKey, v)} />
              ))}
            </Section>
          )}

          {/* Financials */}
          {result.financials && Object.values(result.financials).some(Boolean) && (
            <Section title="Financial Details" icon={CheckCircle2} color="bg-emerald-50">
              {[
                ['Monthly Rent', 'rent_amount', 'rent_amount'],
                ['Rent Frequency', 'rent_frequency', 'rent_frequency'],
                ['Deposit Amount', 'deposit_amount', 'deposit_amount'],
                ['Invoice Amount', 'invoice_amount', 'invoice_amount'],
                ['Service Charge', 'service_charge_amount', 'service_charge_amount'],
              ].map(([label, key, applyKey]) => result.financials?.[key] && (
                <FieldRow key={key} label={label} value={result.financials[key]}
                  applied={applied[applyKey]}
                  onApply={(v) => apply(applyKey, v)} />
              ))}
            </Section>
          )}

          {/* People */}
          {result.people && Object.values(result.people).some(Boolean) && (
            <Section title="Parties" icon={CheckCircle2} color="bg-blue-50">
              {[
                ['Tenant', 'tenant_name', 'tenant_name'],
                ['Tenant Email', 'tenant_email', 'tenant_email'],
                ['Tenant Phone', 'tenant_phone', 'tenant_phone'],
                ['Landlord', 'landlord_name', 'landlord_name'],
                ['Agent', 'agent_name', 'agent_name'],
                ['Issuing Body', 'issuing_body', 'issuing_body'],
                ['Engineer', 'issuing_engineer_name', 'engineer_name'],
              ].map(([label, key, applyKey]) => result.people?.[key] && (
                <FieldRow key={key} label={label} value={result.people[key]}
                  applied={applied[applyKey]}
                  onApply={(v) => apply(applyKey, v)} />
              ))}
            </Section>
          )}

          {/* Property */}
          {result.property && Object.values(result.property).some(Boolean) && (
            <Section title="Property Details" icon={CheckCircle2} color="bg-amber-50">
              {[
                ['Address', 'address', 'address'],
                ['Postcode', 'postcode', 'postcode'],
                ['Type', 'property_type', 'property_type'],
                ['Unit Reference', 'unit_reference', 'unit_reference'],
              ].map(([label, key, applyKey]) => result.property?.[key] && (
                <FieldRow key={key} label={label} value={result.property[key]}
                  applied={applied[applyKey]}
                  onApply={(v) => apply(applyKey, v)} />
              ))}
            </Section>
          )}

          {/* Certificate */}
          {result.certificate && Object.values(result.certificate).some(Boolean) && (
            <Section title="Certificate Details" icon={CheckCircle2} color="bg-red-50">
              {[
                ['Certificate Number', 'certificate_number', 'certificate_number'],
                ['Registration Number', 'registration_number', 'registration_number'],
                ['Result / Outcome', 'result', 'cert_result'],
                ['Rating', 'rating', 'cert_rating'],
                ['Next Inspection', 'next_inspection_due', 'next_inspection_due'],
              ].map(([label, key, applyKey]) => result.certificate?.[key] && (
                <FieldRow key={key} label={label} value={result.certificate[key]}
                  applied={applied[applyKey]}
                  onApply={(v) => apply(applyKey, v)} />
              ))}
            </Section>
          )}

          {/* Tags + Title */}
          <div className="space-y-2">
            {result.suggested_title && (
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">Suggested title:</p>
                <span className="text-xs font-medium text-slate-800 flex-1">{result.suggested_title}</span>
                <button onClick={() => apply('title', result.suggested_title)}
                  className={`text-xs px-2 py-0.5 rounded font-medium ${applied.title ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                  {applied.title ? '✓' : 'Use'}
                </button>
              </div>
            )}

            {result.suggested_tags?.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Tag className="w-3 h-3" /> Suggested tags:
                  <button onClick={() => apply('tags', result.suggested_tags)}
                    className={`ml-auto text-xs px-2 py-0.5 rounded font-medium ${applied.tags ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                    {applied.tags ? '✓ Applied' : 'Apply all'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.suggested_tags.map(tag => (
                    <span key={tag} className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}