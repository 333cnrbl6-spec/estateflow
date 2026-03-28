import React from 'react';
import { AlertTriangle, ChevronRight, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { differenceInDays, parseISO } from 'date-fns';

const DEADLINES = [
  { company: 'Powell & Co Assets Ltd', type: 'Accounts', due: '2026-03-31' },
  { company: 'EIV Estates Ltd', type: 'Confirmation Statement', due: '2026-04-02' },
  { company: 'Powell & Co Management Ltd', type: 'Accounts', due: '2026-05-31' },
];

export default function ComplianceAlert() {
  const today = new Date();
  const urgent = DEADLINES.filter(d => differenceInDays(new Date(d.due), today) <= 30)
    .sort((a, b) => new Date(a.due) - new Date(b.due));

  const s21Days = differenceInDays(parseISO('2026-05-01'), today);
  const showS21 = s21Days > 0 && s21Days <= 60;

  return (
    <>
      {/* S21 / Renters' Rights Act Banner */}
      {showS21 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Scale className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-900">
                Renters' Rights Act — S21 abolished in {s21Days} days
              </p>
              <p className="text-xs text-red-700 mt-0.5">
                Last valid S21: <strong>30 April 2026</strong> · All ASTs become periodic · Use S8 grounds for possession · Tenant info sheet required by 31 May 2026
              </p>
            </div>
          </div>
          <Link to="/regulatory-hub" className="text-xs text-red-700 hover:underline flex items-center gap-1 shrink-0">
            Regulatory Hub <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Companies House Deadlines */}
      {urgent.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Upcoming Companies House Deadlines</p>
                <div className="mt-2 space-y-1">
                  {urgent.map((d, i) => {
                    const days = differenceInDays(new Date(d.due), today);
                    return (
                      <p key={i} className="text-xs text-amber-800">
                        <span className="font-medium">{d.company}</span>
                        {' — '}{d.type}
                        {' · '}
                        <span className={days <= 7 ? 'font-bold text-red-700' : ''}>
                          {days <= 0 ? 'OVERDUE' : days === 1 ? 'tomorrow' : `${days} days`}
                        </span>
                        {' '}({d.due})
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
            <Link to="/compliance" className="text-xs text-amber-700 hover:underline flex items-center gap-1 shrink-0">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}