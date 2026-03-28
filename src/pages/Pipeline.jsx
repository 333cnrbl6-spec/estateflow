import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { differenceInDays, parseISO, format, addDays, addMonths, addYears } from 'date-fns';
import {
  Plus, ChevronRight, AlertTriangle, CheckCircle2, Clock, MapPin, User, 
  FileText, Shield, Home, Key, ClipboardList, Calendar, RotateCcw, LogOut,
  ExternalLink, Info, Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';
import S21Banner from '@/components/shared/S21Banner';
import PipelineCard from '@/components/pipeline/PipelineCard';
import PipelineDetailDrawer from '@/components/pipeline/PipelineDetailDrawer';
import { cn } from '@/lib/utils';

const STAGES = [
  { id: 'applicant', label: 'Applicant', icon: User, color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'referencing', label: 'Referencing', icon: FileText, color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { id: 'offer_agreed', label: 'Offer Agreed', icon: CheckCircle2, color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
  { id: 'pre_tenancy_certs', label: 'Pre-Tenancy Certs', icon: Shield, color: 'bg-violet-50 border-violet-200 text-violet-700' },
  { id: 'tenancy_signed', label: 'Tenancy Signed', icon: FileText, color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { id: 'handover', label: 'Handover', icon: Key, color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { id: 'occupied', label: 'Occupied', icon: Home, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { id: 'periodic_check', label: 'Periodic Check', icon: ClipboardList, color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { id: 'notice_served', label: 'Notice Served', icon: AlertTriangle, color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { id: 'vacating', label: 'Vacating', icon: LogOut, color: 'bg-red-50 border-red-200 text-red-700' },
  { id: 'void', label: 'Void', icon: RotateCcw, color: 'bg-slate-100 border-slate-200 text-slate-600' },
];

export default function Pipeline() {
  const [search, setSearch] = useState('');
  const [filterJurisdiction, setFilterJurisdiction] = useState('all');
  const [filterStage, setFilterStage] = useState('active');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const queryClient = useQueryClient();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['tenancy_pipeline'],
    queryFn: () => base44.entities.TenancyPipeline.list('-updated_date', 200),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TenancyPipeline.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenancy_pipeline'] }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TenancyPipeline.create(data),
    onSuccess: (newRecord) => {
      queryClient.invalidateQueries({ queryKey: ['tenancy_pipeline'] });
      setIsCreating(false);
      setSelectedRecord(newRecord);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TenancyPipeline.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenancy_pipeline'] });
      setSelectedRecord(null);
    },
  });

  const activeRecords = records.filter(r => r.stage !== 'archived');
  const archivedRecords = records.filter(r => r.stage === 'archived');

  const filtered = activeRecords.filter(r => {
    const matchSearch = !search || 
      r.property_address?.toLowerCase().includes(search.toLowerCase()) ||
      r.applicant_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.unit_reference?.toLowerCase().includes(search.toLowerCase()) ||
      r.reference?.toLowerCase().includes(search.toLowerCase());
    const matchJurisdiction = filterJurisdiction === 'all' || r.jurisdiction === filterJurisdiction;
    const matchStage = filterStage === 'active' ? r.stage !== 'void' : 
                       filterStage === 'all' ? true : r.stage === filterStage;
    return matchSearch && matchJurisdiction && matchStage;
  });

  // Group by stage for kanban
  const byStage = STAGES.reduce((acc, s) => {
    acc[s.id] = filtered.filter(r => r.stage === s.id);
    return acc;
  }, {});

  const urgentCount = records.filter(r => {
    const today = new Date();
    const checks = [r.gas_safety_expiry_date, r.eicr_expiry_date, r.epc_expiry_date, r.next_periodic_inspection_date, r.hmo_licence_expiry];
    return checks.some(d => {
      if (!d) return false;
      const days = differenceInDays(parseISO(d), today);
      return days >= 0 && days <= 30;
    });
  }).length;

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader title="Tenancy Pipeline" subtitle="End-to-end residential tenancy management — England & Wales">
        <Button onClick={() => { setIsCreating(true); setSelectedRecord(null); }} size="sm">
          <Plus className="w-4 h-4" /> New Application
        </Button>
      </PageHeader>

      <div className="mb-4"><S21Banner compact /></div>

      {/* Alert bar */}
      {urgentCount > 0 && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-sm text-amber-700 font-medium">{urgentCount} certification(s) expiring within 30 days — check compliance tab on affected records</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Active Pipeline', count: activeRecords.filter(r => !['void','archived'].includes(r.stage)).length, cls: 'bg-primary/5 border-primary/20', text: 'text-primary' },
          { label: 'Occupied', count: activeRecords.filter(r => r.stage === 'occupied').length, cls: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
          { label: 'Void / Available', count: activeRecords.filter(r => r.stage === 'void').length, cls: 'bg-slate-100 border-slate-200', text: 'text-slate-600' },
          { label: 'Notice Served', count: activeRecords.filter(r => r.stage === 'notice_served').length, cls: 'bg-orange-50 border-orange-200', text: 'text-orange-700' },
          { label: 'Cert Alerts', count: urgentCount, cls: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
        ].map(({ label, count, cls, text }) => (
          <div key={label} className={cn('rounded-xl border p-3 text-left', cls)}>
            <p className={cn('text-xl font-bold', text)}>{count}</p>
            <p className={cn('text-xs font-medium mt-0.5', text)}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Input placeholder="Search property, applicant, ref..." value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
        <Select value={filterJurisdiction} onValueChange={setFilterJurisdiction}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jurisdictions</SelectItem>
            <SelectItem value="england">England</SelectItem>
            <SelectItem value="wales">Wales</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active (excl. void)</SelectItem>
            <SelectItem value="all">All Stages</SelectItem>
            {STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Pipeline Kanban */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {STAGES.map(stage => {
            const stageRecords = byStage[stage.id] || [];
            const StageIcon = stage.icon;
            return (
              <div key={stage.id} className="w-64 flex-shrink-0">
                <div className={cn('flex items-center gap-2 px-3 py-2 rounded-t-lg border border-b-0', stage.color)}>
                  <StageIcon className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">{stage.label}</span>
                  <span className="ml-auto text-xs bg-white/60 rounded-full px-1.5 py-0.5 font-bold">{stageRecords.length}</span>
                </div>
                <div className={cn('min-h-32 border rounded-b-lg p-2 space-y-2 bg-white', stage.color.includes('emerald') ? 'border-emerald-200' : 'border-border')}>
                  {stageRecords.map(r => (
                    <PipelineCard
                      key={r.id}
                      record={r}
                      onClick={() => setSelectedRecord(r)}
                    />
                  ))}
                  {stageRecords.length === 0 && (
                    <p className="text-[11px] text-muted-foreground text-center py-4">No records</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Drawer */}
      {(selectedRecord || isCreating) && (
        <PipelineDetailDrawer
          record={isCreating ? null : selectedRecord}
          onClose={() => { setSelectedRecord(null); setIsCreating(false); }}
          onSave={(data) => {
            if (isCreating) {
              createMutation.mutate(data);
            } else {
              updateMutation.mutate({ id: selectedRecord.id, data });
              setSelectedRecord({ ...selectedRecord, ...data });
            }
          }}
          onDelete={() => deleteMutation.mutate(selectedRecord.id)}
          saving={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}