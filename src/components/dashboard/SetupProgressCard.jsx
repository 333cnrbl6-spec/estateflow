import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';

const STEPS = [
  { label: 'Companies added', done: true },
  { label: 'Properties added', done: true },
  { label: 'Compliance reviewed', done: true },
  { label: 'Verify unit rent figures', done: false },
  { label: 'Replace sample tenants', done: false },
  { label: 'Connect accounting (Xero/FreeAgent)', done: false },
  { label: 'Connect banking feed', done: false },
];

export default function SetupProgressCard() {
  const done = STEPS.filter(s => s.done).length;
  const pct = Math.round((done / STEPS.length) * 100);

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Setup Progress</h3>
        <Link to="/setup" className="text-xs text-primary hover:underline flex items-center gap-1">
          Go to Setup <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-sm font-semibold text-foreground">{pct}%</span>
      </div>
      <div className="space-y-1.5">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            {s.done
              ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
              : <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            }
            <span className={`text-xs ${s.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}