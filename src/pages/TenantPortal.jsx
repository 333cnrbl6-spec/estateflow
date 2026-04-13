import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText, Wrench, Bell, Home, PoundSterling, Calendar, Lock,
  Upload, CheckCircle2, Clock, AlertTriangle, ChevronRight, Loader2, Phone, Download, MessageCircle
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import TenantMessageThread from '@/components/messaging/TenantMessageThread';
import RentPaymentModal from '@/components/payments/RentPaymentModal';
import RecurringPaymentsManager from '@/components/payments/RecurringPaymentsManager';
import MessageHub from '@/components/messaging/MessageHub';
import MessageHub from '@/components/messaging/MessageHub';

// ── helpers ──────────────────────────────────────────────────────────────────

function safeFormat(dateStr, fmt = 'dd MMM yyyy') {
  if (!dateStr) return '—';
  try { return format(parseISO(dateStr), fmt); } catch { return dateStr; }
}

function StatusPill({ status }) {
  const map = {
    paid: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    overdue: 'bg-red-100 text-red-700',
    partial: 'bg-orange-100 text-orange-700',
    reported: 'bg-slate-100 text-slate-700',
    assigned: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-slate-100 text-slate-400',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}

// ── Tab: Lease & Unit details ─────────────────────────────────────────────────

function LeaseTab({ tenant, unit, property }) {
  if (!tenant) return null;
  const leaseEnd = tenant.tenancy_end_date ? parseISO(tenant.tenancy_end_date) : null;
  const daysLeft = leaseEnd ? differenceInDays(leaseEnd, new Date()) : null;
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Home className="w-4 h-4" /> Your Property</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Row label="Property" value={property?.name || '—'} />
          <Row label="Address" value={[property?.address_line_1, property?.city, property?.postcode].filter(Boolean).join(', ') || '—'} />
          <Row label="Unit" value={unit?.unit_reference || '—'} />
          <Row label="Floor" value={unit?.floor || '—'} />
          <Row label="Bedrooms" value={unit?.bedrooms ?? '—'} />
          <Row label="Unit Type" value={unit?.unit_type?.replace(/_/g, ' ') || '—'} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Tenancy Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Row label="Tenancy Start" value={safeFormat(tenant.tenancy_start_date)} />
          <Row label="Tenancy End" value={safeFormat(tenant.tenancy_end_date)} />
          <Row label="Tenure" value={tenant.tenant_type?.replace(/_/g, ' ') || '—'} />
          <Row label="Status" value={<StatusPill status={tenant.status} />} />
          <Row label="Monthly Rent" value={unit?.monthly_rent ? `£${unit.monthly_rent.toLocaleString()}` : '—'} />
          <Row label="Deposit" value={tenant.deposit_amount ? `£${tenant.deposit_amount.toLocaleString()}` : '—'} />
          {tenant.deposit_scheme && <Row label="Deposit Scheme" value={tenant.deposit_scheme?.toUpperCase()} />}
          {daysLeft !== null && (
            <Row label="Days Until Expiry" value={
              <span className={daysLeft < 60 ? 'text-amber-600 font-semibold' : 'text-emerald-700 font-semibold'}>{daysLeft}d</span>
            } />
          )}
        </CardContent>
      </Card>
      {(tenant.emergency_contact_name || tenant.emergency_contact_phone) && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="w-4 h-4" /> Emergency Contact</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Row label="Name" value={tenant.emergency_contact_name || '—'} />
            <Row label="Phone" value={tenant.emergency_contact_phone || '—'} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

// ── Tab: Payments ─────────────────────────────────────────────────────────────

function PayRentModal({ open, onClose, unit, tenantId, propertyId }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const { data: transactions = [] } = useQuery({
    queryKey: ['tenant-transactions-unpaid', tenantId],
    queryFn: () => base44.entities.FinancialTransaction.filter({ tenant_id: tenantId }),
    enabled: !!tenantId && open,
  });

  const unpaidTransactions = transactions.filter(t => t.status !== 'paid' && t.transaction_type === 'rent_payment');

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="p-5 space-y-4">
            <div className="text-center">
              <PoundSterling className="w-10 h-10 text-green-600 mx-auto mb-2" />
              <h3 className="text-lg font-bold">Pay Rent</h3>
              <p className="text-xs text-muted-foreground mt-1">Select a payment to process</p>
            </div>

            {unpaidTransactions.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-sm font-medium">All payments are up to date!</p>
                <p className="text-xs text-muted-foreground mt-1">No outstanding rent payments found.</p>
                <Button className="mt-4" variant="outline" onClick={onClose}>Close</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {unpaidTransactions.map(t => (
                  <div
                    key={t.id}
                    className="border rounded-lg p-3 hover:bg-slate-50 cursor-pointer transition"
                    onClick={() => {
                      setSelectedTransaction(t);
                      setShowPaymentModal(true);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-sm">{t.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {safeFormat(t.due_date)} {t.status === 'overdue' && <span className="text-red-600 font-medium">(Overdue)</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">£{(t.amount || 0).toLocaleString()}</p>
                        <StatusPill status={t.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
            </div>
          </div>
        </div>
      </div>

      {selectedTransaction && (
        <RentPaymentModal
          open={showPaymentModal}
          onOpenChange={(isOpen) => {
            setShowPaymentModal(isOpen);
            if (!isOpen) {
              setSelectedTransaction(null);
              onClose();
            }
          }}
          amount={selectedTransaction.amount}
          propertyName={propertyId ? 'Property' : 'Your Property'}
          dueDate={selectedTransaction.due_date}
          transactionId={selectedTransaction.id}
          onSuccess={() => {
            setShowPaymentModal(false);
            setSelectedTransaction(null);
            onClose();
          }}
        />
      )}
    </>
  );
}

function PaymentsTab({ tenantId, unit, propertyId }) {
  const [showPayModal, setShowPayModal] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['tenant-transactions', tenantId],
    queryFn: () => base44.entities.FinancialTransaction.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });

  const totalOverdue = transactions.filter(t => t.status === 'overdue').reduce((s, t) => s + (t.amount || 0), 0);
  const paidTransactions = transactions.filter(t => t.status === 'paid');

  return (
    <div className="space-y-4">
      <PayRentModal open={showPayModal} onClose={() => setShowPayModal(false)} unit={unit} tenantId={tenantId} propertyId={propertyId} />

      {/* Pay now + Auto-pay banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {unit?.monthly_rent && (
          <div className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-base">Monthly Rent Due</p>
              <p className="text-white/80 text-sm">£{unit.monthly_rent.toLocaleString()} / month</p>
            </div>
            <Button onClick={() => setShowPayModal(true)} className="bg-white text-green-700 hover:bg-white/90 font-bold">Pay Now</Button>
          </div>
        )}
        <div className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 p-4 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-base">Auto-Pay Setup</p>
            <p className="text-white/80 text-sm">Never miss a payment</p>
          </div>
          <Button onClick={() => setShowRecurring(true)} variant="outline" className="bg-white text-blue-700 hover:bg-white/90 font-bold">Manage</Button>
        </div>
      </div>

      {/* Recurring Payments Modal */}
      {showRecurring && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Repeat className="w-5 h-5 text-blue-600" /> Automatic Payments
                  </h3>
                  <p className="text-xs text-muted-foreground">Manage your recurring rent payments</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowRecurring(false)}>Close</Button>
              </div>
              <RecurringPaymentsManager tenantId={tenantId} />
            </div>
          </div>
        </div>
      )}

      {totalOverdue > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>You have <strong>£{totalOverdue.toLocaleString()}</strong> overdue — please contact your property manager.</span>
        </div>
      )}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><PoundSterling className="w-4 h-4" /> Payment History</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No payment records found</p>
          ) : (
            <div className="divide-y">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {safeFormat(t.due_date)}
                      {t.paid_date ? ` · Paid: ${safeFormat(t.paid_date)}` : ''}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-semibold">£{(t.amount || 0).toLocaleString()}</p>
                    <StatusPill status={t.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab: Maintenance ──────────────────────────────────────────────────────────

const CATEGORIES = ['plumbing', 'electrical', 'structural', 'roofing', 'decorating', 'cleaning', 'fire_safety', 'general', 'other'];
const PRIORITIES = ['standard', 'urgent', 'emergency', 'low'];

function MaintenanceTab({ tenantId, propertyId, unitId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'general', priority: 'standard' });
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['tenant-maintenance', tenantId],
    queryFn: () => base44.entities.MaintenanceOrder.filter({ reported_by: tenantId }),
    enabled: !!tenantId,
  });

  const submit = useMutation({
    mutationFn: async () => {
      setUploading(true);
      const uploadedUrls = [];
      for (const file of photos) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }
      setUploading(false);
      return base44.entities.MaintenanceOrder.create({
        ...form,
        reported_by: tenantId,
        property_id: propertyId,
        unit_id: unitId,
        status: 'reported',
        notes: uploadedUrls.length ? `Attachments: ${uploadedUrls.join(', ')}` : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-maintenance', tenantId] });
      setShowForm(false);
      setForm({ title: '', description: '', category: 'general', priority: 'standard' });
      setPhotos([]);
    },
  });

  const STEPS = ['reported', 'assigned', 'in_progress', 'completed'];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(s => !s)} variant={showForm ? 'outline' : 'default'} className="gap-2">
          <Wrench className="w-4 h-4" /> {showForm ? 'Cancel' : 'New Request'}
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-base">Submit Maintenance Request</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Issue Title *</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Leaking kitchen tap" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description *</label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe the issue in detail…" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Photos / Videos (optional)</label>
              <label className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg cursor-pointer hover:border-primary/40 text-sm text-muted-foreground">
                <Upload className="w-4 h-4" />
                {photos.length ? `${photos.length} file(s) selected` : 'Click to attach photos or videos'}
                <input type="file" multiple accept="image/*,video/*" className="hidden"
                  onChange={e => setPhotos(Array.from(e.target.files))} />
              </label>
            </div>
            <Button
              className="w-full"
              disabled={!form.title || !form.description || submit.isPending || uploading}
              onClick={() => submit.mutate()}
            >
              {(submit.isPending || uploading) ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Submitting…</> : 'Submit Request'}
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : orders.length === 0 ? (
        <Card><CardContent className="text-sm text-muted-foreground text-center py-10">No maintenance requests yet</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {orders.map(o => {
            const stepIdx = STEPS.indexOf(o.status);
            return (
              <Card key={o.id}>
                <CardContent className="pt-4 pb-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{o.title}</p>
                      <p className="text-xs text-muted-foreground">{o.category?.replace(/_/g, ' ')} · Reported {safeFormat(o.created_date)}</p>
                    </div>
                    <StatusPill status={o.status} />
                  </div>
                  {o.description && <p className="text-sm text-muted-foreground">{o.description}</p>}
                  {/* Progress bar */}
                  <div className="flex items-center gap-1 mt-2">
                    {STEPS.map((s, i) => (
                      <React.Fragment key={s}>
                        <div className={`flex flex-col items-center`}>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                            ${i < stepIdx ? 'bg-emerald-500 text-white' : i === stepIdx ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                            {i < stepIdx ? '✓' : i + 1}
                          </div>
                          <span className="text-[9px] text-muted-foreground mt-0.5 text-center leading-tight w-12">{s.replace(/_/g, ' ')}</span>
                        </div>
                        {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mb-3 ${i < stepIdx ? 'bg-emerald-400' : 'bg-muted'}`} />}
                      </React.Fragment>
                    ))}
                  </div>
                  {o.assigned_contractor_name && (
                    <p className="text-xs text-muted-foreground">👷 Assigned to: <strong>{o.assigned_contractor_name}</strong></p>
                  )}
                  {o.scheduled_date && (
                    <p className="text-xs text-muted-foreground">📅 Scheduled: {safeFormat(o.scheduled_date)}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tab: Notifications ────────────────────────────────────────────────────────

function NotificationsTab({ tenantId }) {
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['tenant-notifications', tenantId],
    queryFn: () => base44.entities.TenantNotification.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });

  const markRead = useMutation({
    mutationFn: id => base44.entities.TenantNotification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenant-notifications', tenantId] }),
  });

  const TYPE_ICON = { urgent: '🚨', reminder: '⏰', update: 'ℹ️', document: '📄', maintenance: '🔧' };

  return (
    <div className="space-y-3">
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : notifications.length === 0 ? (
        <Card><CardContent className="text-sm text-muted-foreground text-center py-10">No notifications yet</CardContent></Card>
      ) : notifications.map(n => (
        <div
          key={n.id}
          onClick={() => !n.is_read && markRead.mutate(n.id)}
          className={`rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${!n.is_read ? 'bg-blue-50 border-blue-200' : 'bg-card'}`}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">{TYPE_ICON[n.notification_type] || 'ℹ️'}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm">{n.title}</p>
                {!n.is_read && <span className="text-[10px] bg-blue-600 text-white rounded-full px-2 py-0.5">New</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{safeFormat(n.sent_date)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Tab: Documents ─────────────────────────────────────────────────────────────

function DocumentsTab({ tenantId, propertyId }) {
  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['tenant-documents', tenantId, propertyId],
    queryFn: async () => {
      const byTenant = tenantId ? await base44.entities.Document.filter({ tenant_id: tenantId }) : [];
      const byProp = propertyId ? await base44.entities.Document.filter({ property_id: propertyId }) : [];
      const all = [...byTenant, ...byProp];
      return all.filter((d, i, arr) => arr.findIndex(x => x.id === d.id) === i); // dedupe
    },
    enabled: !!(tenantId || propertyId),
  });

  const DOC_ICONS = { welcome_pack: '👋', emergency_contacts: '🆘', tenancy_agreement: '📋', inspection: '🔍', other: '📄' };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
        <Lock className="w-3.5 h-3.5" /> Documents are securely stored. Only documents shared with you are visible here.
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : docs.length === 0 ? (
        <Card><CardContent className="text-sm text-muted-foreground text-center py-10">No documents have been shared yet</CardContent></Card>
      ) : docs.map(doc => (
        <Card key={doc.id}>
          <CardContent className="pt-4 pb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{DOC_ICONS[doc.document_type] || '📄'}</span>
              <div>
                <p className="font-medium text-sm">{doc.title || doc.name || 'Document'}</p>
                <p className="text-xs text-muted-foreground">{doc.document_type?.replace(/_/g, ' ')} · Added {safeFormat(doc.created_date)}</p>
              </div>
            </div>
            {doc.file_url && (
              <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80">
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Main Portal ───────────────────────────────────────────────────────────────

export default function TenantPortal() {
  const [tenantId, setTenantId] = useState(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      try { setTenantId(atob(token).split(':')[0]); } catch { /* invalid token */ }
    }
  }, []);

  const { data: tenant, isLoading: tenantLoading } = useQuery({
    queryKey: ['portal-tenant', tenantId],
    queryFn: () => base44.entities.Tenant.get(tenantId),
    enabled: !!tenantId,
  });

  const { data: unit } = useQuery({
    queryKey: ['portal-unit', tenant?.unit_id],
    queryFn: () => base44.entities.Unit.get(tenant.unit_id),
    enabled: !!tenant?.unit_id,
  });

  const { data: property } = useQuery({
    queryKey: ['portal-property', tenant?.property_id],
    queryFn: () => base44.entities.Property.get(tenant.property_id),
    enabled: !!tenant?.property_id,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['tenant-notifications', tenantId],
    queryFn: () => base44.entities.TenantNotification.filter({ tenant_id: tenantId }),
    enabled: !!tenantId,
  });

  const unread = notifications.filter(n => !n.is_read).length;

  if (!tenantId) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-10 pb-10 text-center space-y-3">
            <Lock className="w-10 h-10 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">Tenant Portal</h2>
            <p className="text-sm text-muted-foreground">
              Access your portal via the secure link sent to you by your property manager.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-10 pb-10 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="text-sm text-muted-foreground">Your access token is invalid or has expired. Please contact your property manager.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="font-serif font-bold text-lg">Tenant Portal</p>
            <p className="text-xs text-muted-foreground">{property?.name || 'My Property'} {unit ? `· ${unit.unit_reference}` : ''}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{tenant.full_name}</p>
            <StatusPill status={tenant.status} />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: '🏠', label: 'Unit', value: unit?.unit_reference || '—' },
            { icon: '📅', label: 'Lease Ends', value: safeFormat(tenant.tenancy_end_date, 'MMM yyyy') },
            { icon: '💷', label: 'Monthly Rent', value: unit?.monthly_rent ? `£${unit.monthly_rent.toLocaleString()}` : '—' },
            { icon: '🔔', label: 'Unread', value: unread > 0 ? `${unread} new` : 'All read' },
          ].map(s => (
            <div key={s.label} className="bg-card border rounded-xl p-3 text-center">
              <div className="text-xl mb-1">{s.icon}</div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="font-semibold text-sm mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="lease">
          <TabsList className="grid w-full grid-cols-6 mb-4 h-auto">
            <TabsTrigger value="lease" className="flex flex-col items-center gap-0.5 py-2 text-[11px]">
              <Home className="w-4 h-4" /> Lease
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex flex-col items-center gap-0.5 py-2 text-[11px]">
              <PoundSterling className="w-4 h-4" /> Payments
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex flex-col items-center gap-0.5 py-2 text-[11px]">
              <Wrench className="w-4 h-4" /> Repairs
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex flex-col items-center gap-0.5 py-2 text-[11px] relative">
              <Bell className="w-4 h-4" />
              Updates
              {unread > 0 && <span className="absolute top-1 right-2 w-2 h-2 bg-blue-600 rounded-full" />}
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex flex-col items-center gap-0.5 py-2 text-[11px]">
              <FileText className="w-4 h-4" /> Docs
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex flex-col items-center gap-0.5 py-2 text-[11px]">
              <MessageCircle className="w-4 h-4" /> Messages
            </TabsTrigger>
            </TabsList>

          <TabsContent value="lease"><LeaseTab tenant={tenant} unit={unit} property={property} /></TabsContent>
          <TabsContent value="payments"><PaymentsTab tenantId={tenantId} unit={unit} propertyId={tenant.property_id} /></TabsContent>
          <TabsContent value="maintenance"><MaintenanceTab tenantId={tenantId} propertyId={tenant.property_id} unitId={tenant.unit_id} /></TabsContent>
          <TabsContent value="notifications"><NotificationsTab tenantId={tenantId} /></TabsContent>
          <TabsContent value="documents"><DocumentsTab tenantId={tenantId} propertyId={tenant.property_id} /></TabsContent>
          <TabsContent value="messages"><MessageHub tenantId={tenantId} propertyId={tenant.property_id} unitId={tenant.unit_id} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}