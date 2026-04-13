import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle, Clock, Wrench, CheckCircle2, ChevronRight,
  User, Building2, Calendar, DollarSign, Plus, MoreVertical
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const COLUMNS = [
  { id: 'reported',    label: 'Requested',   icon: AlertTriangle, color: 'border-t-red-400',    bg: 'bg-red-50',    count_color: 'bg-red-100 text-red-700' },
  { id: 'assigned',   label: 'Scheduled',   icon: Calendar,      color: 'border-t-amber-400',  bg: 'bg-amber-50',  count_color: 'bg-amber-100 text-amber-700' },
  { id: 'in_progress',label: 'In Progress', icon: Wrench,        color: 'border-t-blue-400',   bg: 'bg-blue-50',   count_color: 'bg-blue-100 text-blue-700' },
  { id: 'completed',  label: 'Completed',   icon: CheckCircle2,  color: 'border-t-green-400',  bg: 'bg-green-50',  count_color: 'bg-green-100 text-green-700' },
];

const PRIORITY_STYLES = {
  emergency: 'bg-red-100 text-red-700 border-red-200',
  urgent:    'bg-orange-100 text-orange-700 border-orange-200',
  standard:  'bg-blue-100 text-blue-700 border-blue-200',
  low:       'bg-slate-100 text-slate-600 border-slate-200',
};

const CATEGORY_ICONS = {
  plumbing: '🔧', electrical: '⚡', structural: '🏗️', roofing: '🏠',
  fire_safety: '🔥', lift: '🛗', security: '🔒', general: '🔨', other: '📋',
};

function JobCard({ order, property, onEdit, onMove, onAssign, onViewCost }) {
  const priority = order.priority || 'standard';
  const catIcon = CATEGORY_ICONS[order.category] || '📋';

  return (
    <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onEdit(order)}>
      <div className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{catIcon}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[priority]}`}>
              {priority}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
              {COLUMNS.filter(c => c.id !== order.status).map(col => (
                <DropdownMenuItem key={col.id} onClick={() => onMove(order.id, col.id)}>
                  Move to {col.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={() => onAssign(order)}>Assign Contractor</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewCost(order)}>View Cost Summary</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <p className="text-sm font-semibold text-slate-800 leading-snug">{order.title}</p>

        {/* Property */}
        {property && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Building2 className="w-3 h-3" /> {property.name}
          </div>
        )}

        {/* Contractor */}
        {order.assigned_contractor_name ? (
          <div className="flex items-center gap-1.5 text-xs bg-slate-50 rounded-lg px-2 py-1.5">
            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-2.5 h-2.5 text-primary" />
            </div>
            <span className="font-medium text-slate-700 truncate">{order.assigned_contractor_name}</span>
          </div>
        ) : (
          <button onClick={e => { e.stopPropagation(); onAssign(order); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors w-full">
            <Plus className="w-3 h-3" /> Assign contractor
          </button>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-dashed">
          {order.scheduled_date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {new Date(order.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </div>
          )}
          {order.estimated_cost && (
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 ml-auto">
              <DollarSign className="w-3 h-3" />
              £{Number(order.estimated_cost).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ column, orders, properties, onEdit, onMove, onAssign, onViewCost, onAdd }) {
  const Icon = column.icon;
  const count = orders.length;

  return (
    <div className={`flex flex-col rounded-xl border-t-4 ${column.color} bg-slate-50 min-h-96 w-full`}>
      {/* Column Header */}
      <div className="px-3 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-semibold text-slate-700">{column.label}</span>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${column.count_color}`}>{count}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onAdd(column.id)}>
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Cards */}
      <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
        {orders.map(order => (
          <JobCard
            key={order.id}
            order={order}
            property={properties[order.property_id]}
            onEdit={onEdit}
            onMove={onMove}
            onAssign={onAssign}
            onViewCost={onViewCost}
          />
        ))}
        {orders.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-muted-foreground border-2 border-dashed rounded-xl">
            No jobs here
          </div>
        )}
      </div>
    </div>
  );
}

export default function MaintenanceKanban({ orders, properties, onEdit, onAssign, onViewCost, onAdd }) {
  const qc = useQueryClient();

  const moveMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.MaintenanceOrder.update(id, { status }),
    onSuccess: () => qc.invalidateQueries(['maintenance_orders']),
  });

  const propertyMap = Object.fromEntries((properties || []).map(p => [p.id, p]));

  const columnOrders = (colId) => (orders || [])
    .filter(o => o.status === colId)
    .sort((a, b) => {
      const p = { emergency: 0, urgent: 1, standard: 2, low: 3 };
      return (p[a.priority] ?? 2) - (p[b.priority] ?? 2);
    });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMNS.map(col => (
        <KanbanColumn
          key={col.id}
          column={col}
          orders={columnOrders(col.id)}
          properties={propertyMap}
          onEdit={onEdit}
          onMove={(id, status) => moveMutation.mutate({ id, status })}
          onAssign={onAssign}
          onViewCost={onViewCost}
          onAdd={onAdd}
        />
      ))}
    </div>
  );
}