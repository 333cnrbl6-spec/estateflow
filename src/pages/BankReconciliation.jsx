import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Upload, CheckCircle2, AlertCircle, HelpCircle, TrendingUp,
  Loader2, RefreshCw, FileText, PoundSterling, Sparkles, X,
  ChevronDown, ChevronUp, Download, AlertTriangle
} from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────────────
const STATUS_CONFIG = {
  matched:     { label: 'Matched',      color: 'bg-green-100 text-green-700 border-green-200',  icon: CheckCircle2,  iconColor: 'text-green-600' },
  partial:     { label: 'Partial',      color: 'bg-amber-100 text-amber-700 border-amber-200',  icon: AlertTriangle, iconColor: 'text-amber-500' },
  unmatched:   { label: 'Unmatched',    color: 'bg-red-100 text-red-700 border-red-200',         icon: HelpCircle,    iconColor: 'text-red-500' },
  overpayment: { label: 'Overpayment',  color: 'bg-blue-100 text-blue-700 border-blue-200',     icon: TrendingUp,    iconColor: 'text-blue-500' },
  pending:     { label: 'Pending',      color: 'bg-slate-100 text-slate-600 border-slate-200',  icon: AlertCircle,   iconColor: 'text-slate-400' },
};

function parseBankCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'));
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    header.forEach((h, i) => { obj[h] = vals[i] || ''; });
    // Normalise common column names
    return {
      date: obj.date || obj.transaction_date || obj.value_date || '',
      description: obj.description || obj.narrative || obj.memo || obj.details || '',
      amount: parseFloat(obj.amount || obj.credit || obj.debit || obj.value || 0),
      reference: obj.reference || obj.ref || obj.payment_reference || '',
      raw: obj,
    };
  }).filter(t => t.amount > 0);
}

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
        </div>
        <Icon className={`w-6 h-6 ${color} opacity-60`} />
      </div>
    </div>
  );
}

function MatchRow({ result, txn, index }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[result?.match_status || 'pending'];
  const Icon = cfg.icon;

  return (
    <div className={`rounded-xl border ${result?.match_status === 'matched' ? 'border-green-200 bg-green-50/30' : result?.match_status === 'unmatched' ? 'border-red-200 bg-red-50/20' : 'border-slate-200'}`}>
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <Icon className={`w-4 h-4 shrink-0 ${cfg.iconColor}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-800 truncate">{txn.description || txn.reference || `Transaction ${index + 1}`}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${cfg.color}`}>{cfg.label}</span>
            {result?.confidence && (
              <span className="text-xs text-muted-foreground">{Math.round(result.confidence * 100)}% confidence</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {txn.date && `${txn.date} · `}£{Number(txn.amount).toLocaleString()}
            {result?.matched_invoice_description && ` → ${result.matched_invoice_description}`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <p className="text-sm font-bold text-slate-700">£{Number(txn.amount).toLocaleString()}</p>
          {result?.invoice_amount && result.invoice_amount !== txn.amount && (
            <span className="text-xs text-muted-foreground">/ £{Number(result.invoice_amount).toLocaleString()}</span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-3 border-t border-dashed pt-3 grid grid-cols-2 gap-2 text-xs">
          {[
            ['Bank Date', txn.date || '—'],
            ['Bank Amount', `£${txn.amount}`],
            ['Reference', txn.reference || '—'],
            ['Match Status', result?.match_status || 'pending'],
            ['Invoice', result?.matched_invoice_description || '—'],
            ['Invoice Amount', result?.invoice_amount ? `£${result.invoice_amount}` : '—'],
            ['Difference', result?.difference !== null && result?.difference !== undefined ? `£${result.difference}` : '—'],
            ['AI Notes', result?.notes || '—'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-muted-foreground">{k}</p>
              <p className="font-medium text-slate-700">{v}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Manual entry row ──────────────────────────────────────────────
function ManualEntryTable({ rows, setRows }) {
  const add = () => setRows(r => [...r, { date: '', description: '', amount: '', reference: '' }]);
  const update = (i, k, v) => setRows(r => r.map((row, idx) => idx === i ? { ...row, [k]: v } : row));
  const remove = (i) => setRows(r => r.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground px-1">
        <span className="col-span-2">Date</span>
        <span className="col-span-5">Description</span>
        <span className="col-span-2">Amount £</span>
        <span className="col-span-2">Reference</span>
        <span className="col-span-1"></span>
      </div>
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 items-center">
          <Input type="date" value={row.date} onChange={e => update(i, 'date', e.target.value)} className="col-span-2 h-8 text-xs" />
          <Input value={row.description} onChange={e => update(i, 'description', e.target.value)} placeholder="e.g. John Smith Rent" className="col-span-5 h-8 text-xs" />
          <Input type="number" min="0" value={row.amount} onChange={e => update(i, 'amount', e.target.value)} placeholder="0.00" className="col-span-2 h-8 text-xs" />
          <Input value={row.reference} onChange={e => update(i, 'reference', e.target.value)} placeholder="Ref" className="col-span-2 h-8 text-xs" />
          <button onClick={() => remove(i)} className="col-span-1 flex justify-center"><X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="text-xs gap-1 mt-1">+ Add Row</Button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────
export default function BankReconciliation() {
  const qc = useQueryClient();
  const fileRef = useRef();
  const [inputMode, setInputMode] = useState('manual'); // 'manual' | 'csv'
  const [manualRows, setManualRows] = useState([
    { date: '', description: '', amount: '', reference: '' }
  ]);
  const [csvText, setCsvText] = useState('');
  const [csvParsed, setCsvParsed] = useState([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Outstanding invoices for reference
  const { data: outstanding = [] } = useQuery({
    queryKey: ['outstanding-txns'],
    queryFn: () => base44.entities.FinancialTransaction.filter({ status: 'pending' }),
  });
  const { data: overdue = [] } = useQuery({
    queryKey: ['overdue-txns'],
    queryFn: () => base44.entities.FinancialTransaction.filter({ status: 'overdue' }),
  });

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setCsvText(text);
      setCsvParsed(parseBankCSV(text));
    };
    reader.readAsText(file);
  };

  const getTransactions = () => {
    if (inputMode === 'csv') return csvParsed;
    return manualRows
      .filter(r => r.description && r.amount)
      .map(r => ({ ...r, amount: parseFloat(r.amount) }));
  };

  const runReconciliation = async () => {
    const txns = getTransactions();
    if (txns.length === 0) return;
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke('reconcileBankTransactions', { transactions: txns });
      setResult(res.data);
      qc.invalidateQueries(['outstanding-txns']);
      qc.invalidateQueries(['overdue-txns']);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  };

  const txns = getTransactions();

  const matchedCount = result?.results?.filter(r => r.match_status === 'matched').length || 0;
  const alertCount = result?.results?.filter(r => ['partial', 'unmatched', 'overpayment'].includes(r.match_status)).length || 0;
  const totalMatched = result?.applied?.reduce((s, a) => s + (a.bankTxn?.amount || 0), 0) || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <PoundSterling className="w-6 h-6 text-primary" /> Bank Reconciliation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Match bank transactions against outstanding invoices and rent payments.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          {outstanding.length + overdue.length} outstanding payment{outstanding.length + overdue.length !== 1 ? 's' : ''} awaiting reconciliation
        </div>
      </div>

      {/* Stats */}
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Transactions" value={result.total_bank_transactions} icon={FileText} color="text-slate-700" bg="bg-slate-50" />
          <StatCard label="Auto Matched" value={matchedCount} icon={CheckCircle2} color="text-green-700" bg="bg-green-50" />
          <StatCard label="Needs Review" value={alertCount} icon={AlertTriangle} color={alertCount > 0 ? 'text-red-600' : 'text-slate-500'} bg={alertCount > 0 ? 'bg-red-50' : 'bg-slate-50'} />
          <StatCard label="Value Reconciled" value={`£${totalMatched.toLocaleString()}`} icon={PoundSterling} color="text-green-700" bg="bg-green-50" />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Upload className="w-4 h-4" /> Import Bank Transactions
              </h2>
              <div className="flex bg-slate-100 rounded-lg p-0.5">
                {['manual', 'csv'].map(mode => (
                  <button key={mode} onClick={() => setInputMode(mode)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize ${inputMode === mode ? 'bg-white shadow text-slate-800' : 'text-muted-foreground hover:text-slate-700'}`}>
                    {mode === 'csv' ? 'CSV Upload' : 'Manual Entry'}
                  </button>
                ))}
              </div>
            </div>

            {inputMode === 'manual' ? (
              <ManualEntryTable rows={manualRows} setRows={setManualRows} />
            ) : (
              <div className="space-y-3">
                <label
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground">
                  <Upload className="w-8 h-8 mb-2" />
                  <p className="text-sm font-medium">Drop CSV bank export here or click to upload</p>
                  <p className="text-xs mt-1">Supports Barclays, HSBC, Natwest, Lloyds, Monzo, Starling CSV formats</p>
                  <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
                </label>
                {csvParsed.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    {csvParsed.length} transactions parsed from CSV
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <Button
              onClick={runReconciliation}
              disabled={running || txns.length === 0}
              className="w-full gap-2 h-11"
            >
              {running
                ? <><Loader2 className="w-4 h-4 animate-spin" />Running AI Reconciliation…</>
                : <><Sparkles className="w-4 h-4" />Reconcile {txns.length} Transaction{txns.length !== 1 ? 's' : ''}</>}
            </Button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-800">Reconciliation Results</h2>
                <Button variant="outline" size="sm" onClick={() => setResult(null)} className="gap-1 text-xs">
                  <RefreshCw className="w-3.5 h-3.5" /> New Run
                </Button>
              </div>

              {/* Alerts first */}
              {result.results?.filter(r => ['partial', 'unmatched', 'overpayment'].includes(r.match_status)).map((r, i) => (
                <MatchRow key={`alert-${i}`} result={r} txn={getTransactions()[r.bank_txn_index] || {}} index={r.bank_txn_index} />
              ))}

              {/* Then matched */}
              {result.results?.filter(r => r.match_status === 'matched').map((r, i) => (
                <MatchRow key={`match-${i}`} result={r} txn={getTransactions()[r.bank_txn_index] || {}} index={r.bank_txn_index} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: outstanding */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" /> Outstanding Payments
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {[...overdue, ...outstanding].length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">All payments reconciled</p>
              ) : [...overdue, ...outstanding].map(t => (
                <div key={t.id} className={`rounded-lg border p-2.5 ${t.status === 'overdue' ? 'bg-red-50 border-red-200' : 'bg-slate-50'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-slate-800 truncate">{t.description}</p>
                    <span className={`text-xs font-bold shrink-0 ${t.status === 'overdue' ? 'text-red-600' : 'text-amber-600'}`}>
                      £{(t.amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Due: {t.due_date || '—'} · {t.status}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">How It Works</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              {[
                'Enter transactions manually or upload a CSV bank export',
                'AI matches each transaction against outstanding invoices using amount, description and reference',
                'High-confidence matches are automatically marked as paid',
                'Partial, unmatched and overpayments are flagged for your review',
                'All actions are logged as notifications in your activity feed',
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary font-bold">{i + 1}.</span>{s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}