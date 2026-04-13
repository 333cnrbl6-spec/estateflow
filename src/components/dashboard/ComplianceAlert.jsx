import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { differenceInDays, parseISO } from 'date-fns';
import S21Banner from '@/components/shared/S21Banner';
import { useDemoFilter } from '@/hooks/useDemoFilter';

export default function ComplianceAlert() {
  const { demoCompanyId, loading } = useDemoFilter();
  const today = new Date();

  const { data: companies = [] } = useQuery({
    queryKey: ['companies-compliance-alert', demoCompanyId],
    queryFn: async () => {
      if (demoCompanyId) {
        const c = await base44.entities.Company.get(demoCompanyId);
        return c ? [c] : [];
      }
      return base44.entities.Company.list('-created_date', 200);
    },
    enabled: !loading,
  });

  // Build deadline list from entity data
  const deadlines = companies.flatMap(c => {
    const items = [];
    if (c.accounts_next_due) items.push({ company: c.name, type: 'Accounts', due: c.accounts_next_due });
    if (c.confirmation_next_due) items.push({ company: c.name, type: 'Confirmation Statement', due: c.confirmation_next_due });
    return items;
  });

  const urgent = deadlines
    .filter(d => differenceInDays(parseISO(d.due), today) <= 30)
    .sort((a, b) => new Date(a.due) - new Date(b.due));

  return (
    <>
      <div className="mb-4"><S21Banner compact /></div>

      {urgent.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-lg p-4 mb-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center mt-0.5 shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">Companies House Deadlines</p>
                <div className="mt-2 space-y-2">
                  {urgent.map((d, i) => {
                    const days = differenceInDays(parseISO(d.due), today);
                    return (
                      <div key={i} className="flex items-center justify-between text-xs bg-white/50 rounded px-2 py-1.5">
                        <div>
                          <span className="font-semibold text-foreground">{d.company}</span>
                          <span className="text-muted-foreground"> • {d.type}</span>
                        </div>
                        <span className={`font-semibold px-2 py-0.5 rounded ${days <= 0 ? 'bg-destructive text-white' : days <= 7 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {days <= 0 ? 'OVERDUE' : days === 1 ? '1d' : `${days}d`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <Link to="/compliance" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 shrink-0 transition-colors">
              View <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}