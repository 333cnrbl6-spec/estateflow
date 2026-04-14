/**
 * CompaniesHouseWizard
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared wizard used by BOTH the landing-page demo builder AND the subscriber
 * onboarding flow.
 *
 * Steps:
 *   0  Search & select group companies    (multi-select from CH results)
 *   1  Confirm directors / officers / PSC (merged from all selected companies)
 *   2  Other directorships               (CH officer appointments lookup)
 *   3  Summary & confirm
 *
 * Props:
 *   mode          'demo' | 'onboarding'
 *   onComplete    fn({ company, allCompanies, officers, selectedAssociated })
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  Search, Loader2, CheckCircle2, Circle, Check, X,
  Building2, Users, ChevronRight, AlertCircle, ExternalLink,
  RefreshCw, Plus, Star,
} from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────────────────────

async function ch(action, params = {}) {
  const res = await base44.functions.invoke('companiesHouseSearch', { action, ...params });
  return res.data;
}

function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();
  const colour = s === 'active' ? 'bg-green-100 text-green-700'
    : s === 'dissolved' ? 'bg-red-100 text-red-600'
    : 'bg-slate-100 text-slate-500';
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colour} capitalize`}>{status || 'Unknown'}</span>;
}

function PersonRow({ person, selected, onToggle, sourceTags }) {
  const isResigned = !!person.resigned_on;
  return (
    <button
      onClick={() => onToggle(person)}
      className={`w-full flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all ${
        selected ? 'border-primary bg-primary/5' : isResigned
          ? 'border-slate-100 opacity-60 hover:border-slate-200'
          : 'border-slate-200 hover:border-primary/40'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
          selected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
        }`}>
          {(person.name || '?').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-800 text-sm truncate">{person.name}</p>
            {sourceTags && sourceTags.length > 1 && (
              <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                {sourceTags.length} cos
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {person.role}
            {person.appointed_on ? ` · Appointed ${person.appointed_on}` : ''}
            {person.resigned_on ? ` · Resigned ${person.resigned_on}` : ''}
            {person.nature_of_control ? ` · ${person.nature_of_control}` : ''}
          </p>
          {sourceTags && sourceTags.length > 0 && (
            <p className="text-xs text-slate-400 mt-0.5 truncate">{sourceTags.join(' · ')}</p>
          )}
        </div>
      </div>
      {selected ? <Check className="w-5 h-5 text-primary shrink-0" /> : <Circle className="w-5 h-5 text-slate-300 shrink-0" />}
    </button>
  );
}

// ─── STEP 0 — Company Search (multi-select) ───────────────────────────────

function StepCompany({ query, setQuery, results, loading, error, selectedCompanies, onSearch, onToggleCompany, onSetPrimary }) {
  const primaryId = selectedCompanies[0]?.company_number;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Find your company group</h3>
        <p className="text-sm text-slate-500 mt-1">
          Search Companies House. Select <strong>one or more</strong> companies — we'll merge their directors to identify your whole group.
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
            placeholder="Company name or number e.g. Powell & Co"
            className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:border-primary focus:outline-none text-sm transition-colors"
          />
        </div>
        <Button onClick={onSearch} disabled={loading || !query.trim()} className="shrink-0 px-5">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Results grid — multi-select */}
      {results.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            {results.length} results — tick all that belong to your group
          </p>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {results.map((co, i) => {
              const isSelected = !!selectedCompanies.find(s => s.company_number === co.company_number);
              const isPrimary = co.company_number === primaryId;
              return (
                <button key={i} onClick={() => onToggleCompany(co)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all group ${
                    isSelected
                      ? isPrimary ? 'border-primary bg-primary/5' : 'border-blue-400 bg-blue-50'
                      : 'border-slate-200 hover:border-primary/30'
                  }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isSelected ? (
                          <Check className={`w-4 h-4 shrink-0 ${isPrimary ? 'text-primary' : 'text-blue-500'}`} />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        <p className={`font-semibold text-sm ${isSelected ? (isPrimary ? 'text-primary' : 'text-blue-800') : 'text-slate-800'}`}>
                          {co.company_name}
                        </p>
                        <StatusBadge status={co.status} />
                        {isPrimary && (
                          <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                            <Star className="w-3 h-3" /> Primary
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 ml-6">{co.company_number} · {co.company_type}</p>
                      {co.registered_address && <p className="text-xs text-slate-400 mt-0.5 ml-6 truncate">{co.registered_address}</p>}
                      {co.date_of_creation && <p className="text-xs text-slate-400 ml-6">Incorporated {co.date_of_creation}</p>}
                    </div>
                    {/* If selected but not primary, allow setting as primary */}
                    {isSelected && !isPrimary && (
                      <button
                        onClick={e => { e.stopPropagation(); onSetPrimary(co); }}
                        className="text-xs text-blue-600 hover:text-primary border border-blue-200 rounded px-2 py-1 shrink-0 whitespace-nowrap"
                      >
                        Set primary
                      </button>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected summary */}
      {selectedCompanies.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-primary uppercase tracking-wider">
            {selectedCompanies.length} compan{selectedCompanies.length !== 1 ? 'ies' : 'y'} selected
          </p>
          {selectedCompanies.map((co, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                {i === 0 ? <Star className="w-3.5 h-3.5 text-primary shrink-0" /> : <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                <span className="font-medium text-slate-800 truncate">{co.company_name}</span>
                {i === 0 && <span className="text-xs text-slate-400 shrink-0">primary</span>}
              </div>
              <button onClick={() => onToggleCompany(co)} className="text-slate-300 hover:text-red-400 ml-2 shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── STEP 1 — Officers & PSC (merged from all companies) ──────────────────

function StepOfficers({ allCompanies, officersByCompany, pscByCompany, loadingCompanies, error, selected, onToggle, onRefetch }) {
  // Merge all officers across companies, tracking which companies each person appears in
  const mergedOfficers = [];
  const mergedPsc = [];
  const nameRoleKey = (p) => `${p.name}||${p.role}`;

  allCompanies.forEach(co => {
    const offs = officersByCompany[co.company_number] || [];
    offs.forEach(o => {
      const key = nameRoleKey(o);
      const existing = mergedOfficers.find(m => nameRoleKey(m) === key);
      if (existing) {
        if (!existing._sourceTags.includes(co.company_name)) existing._sourceTags.push(co.company_name);
      } else {
        mergedOfficers.push({ ...o, _sourceTags: [co.company_name] });
      }
    });
    const pscs = pscByCompany[co.company_number] || [];
    pscs.forEach(p => {
      const existing = mergedPsc.find(m => m.name === p.name);
      if (existing) {
        if (!existing._sourceTags.includes(co.company_name)) existing._sourceTags.push(co.company_name);
      } else {
        mergedPsc.push({ ...p, _sourceTags: [co.company_name] });
      }
    });
  });

  const current = mergedOfficers.filter(o => !o.resigned_on);
  const resigned = mergedOfficers.filter(o => o.resigned_on);
  const anyLoading = Object.values(loadingCompanies).some(Boolean);
  const primaryCompany = allCompanies[0];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Directors & Officers</h3>
          <p className="text-sm text-slate-500 mt-1">
            Combined officers from <strong>{allCompanies.length} compan{allCompanies.length !== 1 ? 'ies' : 'y'}</strong>. Select who to include.
          </p>
        </div>
        <button onClick={onRefetch} className="text-slate-400 hover:text-primary mt-1" title="Refresh from Companies House">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Company fetch status */}
      {allCompanies.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {allCompanies.map(co => {
            const isLoading = loadingCompanies[co.company_number];
            const isDone = !isLoading && (officersByCompany[co.company_number] !== undefined);
            return (
              <span key={co.company_number} className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
                isLoading ? 'bg-amber-50 text-amber-600' : isDone ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : isDone ? <Check className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                {co.company_name.length > 25 ? co.company_name.slice(0, 25) + '…' : co.company_name}
              </span>
            );
          })}
        </div>
      )}

      {anyLoading && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-slate-500">Fetching officers from Companies House...</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!anyLoading && (
        <>
          {current.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Officers</p>
              {current.map((o, i) => (
                <PersonRow key={i} person={o}
                  sourceTags={allCompanies.length > 1 ? o._sourceTags : null}
                  selected={!!selected.find(s => s.name === o.name && s.role === o.role)}
                  onToggle={onToggle} />
              ))}
            </div>
          )}

          {mergedPsc.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Persons with Significant Control</p>
              {mergedPsc.map((p, i) => (
                <PersonRow key={i} person={p}
                  sourceTags={allCompanies.length > 1 ? p._sourceTags : null}
                  selected={!!selected.find(s => s.name === p.name)}
                  onToggle={onToggle} />
              ))}
            </div>
          )}

          {resigned.length > 0 && (
            <details className="group">
              <summary className="text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600 list-none flex items-center gap-1">
                <ChevronRight className="w-3.5 h-3.5 group-open:rotate-90 transition-transform" />
                Resigned Officers ({resigned.length})
              </summary>
              <div className="space-y-2 mt-2">
                {resigned.map((o, i) => (
                  <PersonRow key={i} person={o}
                    sourceTags={allCompanies.length > 1 ? o._sourceTags : null}
                    selected={!!selected.find(s => s.name === o.name && s.role === o.role)}
                    onToggle={onToggle} />
                ))}
              </div>
            </details>
          )}

          {mergedOfficers.length === 0 && mergedPsc.length === 0 && !error && (
            <div className="text-center py-8 border-2 border-dashed rounded-xl text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No officers found. They may not yet be publicly listed.</p>
            </div>
          )}
        </>
      )}

      {selected.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-2 text-xs text-primary font-medium">
          {selected.length} person{selected.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}

// ─── STEP 2 — Associated companies via directorships ─────────────────────

function StepAssociated({
  allCompanies, selectedOfficers, appointmentsMap, loadingMap,
  onSearchAppointments, selectedAssociated, onToggleAssociated,
  manualQuery, setManualQuery, onManualSearch, manualResults, manualLoading,
}) {
  const knownNumbers = new Set(allCompanies.map(c => c.company_number));
  const allFound = Object.values(appointmentsMap).flat();
  const unique = allFound.filter((a, idx, arr) =>
    arr.findIndex(b => b.company_number === a.company_number) === idx &&
    !knownNumbers.has(a.company_number)
  );

  const anyLoading = Object.values(loadingMap).some(Boolean) || manualLoading;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Other Directorships</h3>
        <p className="text-sm text-slate-500 mt-1">
          Find other companies your directors are involved with — to identify any remaining group companies.
          Tick any you'd like to include.
        </p>
      </div>

      {/* Search buttons per officer */}
      {selectedOfficers.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search by officer</p>
          {selectedOfficers.map((o, i) => {
            const done = !!appointmentsMap[o.name];
            const loading = loadingMap[o.name];
            return (
              <button key={i} onClick={() => !done && onSearchAppointments(o)}
                disabled={loading}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 text-sm transition-all ${
                  done ? 'border-green-200 bg-green-50 text-green-800' : 'border-slate-200 hover:border-primary/40 text-slate-700'
                }`}>
                <span className="flex items-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> :
                    done ? <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                    <ExternalLink className="w-4 h-4 text-slate-400" />}
                  <span>{done ? `Searched: ${o.name}` : `Search directorships — ${o.name}`}</span>
                </span>
                {done && <span className="text-xs text-green-600 font-medium">{(appointmentsMap[o.name] || []).length} found</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Results — active first, resigned collapsed */}
      {unique.length > 0 && (() => {
        const active = unique.filter(co => !co.resigned_on);
        const resigned = unique.filter(co => !!co.resigned_on);
        const renderCo = (co, i) => {
          const sel = !!selectedAssociated.find(s => s.company_number === co.company_number);
          return (
            <button key={i} onClick={() => onToggleAssociated(co)}
              className={`w-full flex items-start justify-between p-3 rounded-xl border-2 text-left transition-all ${
                sel ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/40'
              }`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-800 text-sm">{co.company_name}</p>
                  <StatusBadge status={co.company_status || (co.resigned_on ? 'Resigned' : 'Active')} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {co.company_number}
                  {co.role ? ` · ${co.role}` : ''}
                  {co.appointed_on ? ` · Appointed ${co.appointed_on}` : ''}
                  {co.resigned_on ? ` · Resigned ${co.resigned_on}` : ''}
                </p>
              </div>
              {sel ? <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" /> : <Circle className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />}
            </button>
          );
        };
        return (
          <div className="space-y-3">
            {active.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Directorships ({active.length})</p>
                {active.map(renderCo)}
              </div>
            )}
            {resigned.length > 0 && (
              <details className="group">
                <summary className="text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600 list-none flex items-center gap-1">
                  <ChevronRight className="w-3.5 h-3.5 group-open:rotate-90 transition-transform" />
                  Past / Resigned Directorships ({resigned.length})
                </summary>
                <div className="space-y-2 mt-2 opacity-70">
                  {resigned.map(renderCo)}
                </div>
              </details>
            )}
          </div>
        );
      })()}

      {anyLoading && (
        <div className="text-center py-4 text-slate-400 text-sm flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Searching Companies House...
        </div>
      )}

      {!anyLoading && Object.keys(appointmentsMap).length > 0 && unique.length === 0 && (
        <div className="text-center py-4 border-2 border-dashed rounded-xl text-slate-400 text-sm">
          No other directorships found for the selected officers. Use manual search below to add companies.
        </div>
      )}

      {/* Manual search */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Add another company manually</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={manualQuery}
              onChange={e => setManualQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onManualSearch()}
              placeholder="Search by company name..."
              className="w-full pl-10 pr-4 py-2.5 border-2 rounded-xl focus:border-primary focus:outline-none text-sm transition-colors"
            />
          </div>
          <Button size="sm" onClick={onManualSearch} disabled={manualLoading || !manualQuery.trim()} className="shrink-0">
            {manualLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
        {manualResults.length > 0 && (
          <div className="mt-2 border-2 rounded-xl divide-y overflow-hidden">
            {manualResults.map((co, i) => (
              <button key={i} onClick={() => onToggleAssociated(co)}
                className="w-full text-left p-3 hover:bg-primary/5 transition-colors text-sm">
                <p className="font-semibold text-slate-800">{co.company_name}</p>
                <p className="text-xs text-slate-500">{co.company_number} · {co.registered_address}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected summary */}
      {selectedAssociated.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-1">
          <p className="text-xs font-bold text-blue-800">{selectedAssociated.length} additional compan{selectedAssociated.length !== 1 ? 'ies' : 'y'} selected:</p>
          {selectedAssociated.map((co, i) => (
            <div key={i} className="flex items-center justify-between text-xs text-blue-700">
              <span>{co.company_name}</span>
              <button onClick={() => onToggleAssociated(co)} className="text-blue-400 hover:text-red-400 ml-2">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── STEP 3 — Summary ─────────────────────────────────────────────────────

function StepSummary({ allCompanies, selectedOfficers, selectedAssociated, mode }) {
  const primaryCompany = allCompanies[0];
  const extraGroupCompanies = allCompanies.slice(1);
  const totalCompanies = allCompanies.length + selectedAssociated.length;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-900">
          {mode === 'demo' ? 'Ready to build your demo' : 'Confirm your details'}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Review what we'll set up across <strong>{totalCompanies} compan{totalCompanies !== 1 ? 'ies' : 'y'}</strong>, then confirm to continue.
        </p>
      </div>

      <div className="space-y-3 border-2 rounded-xl p-5 bg-slate-50 divide-y">
        {/* Primary company */}
        <div className="pb-3">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Primary Company</p>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="font-bold text-slate-900">{primaryCompany?.company_name}</p>
              <p className="text-xs text-slate-500">{primaryCompany?.company_number} · {primaryCompany?.registered_address}</p>
            </div>
          </div>
        </div>

        {/* Group companies selected at step 0 */}
        {extraGroupCompanies.length > 0 && (
          <div className="py-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Group Companies ({extraGroupCompanies.length})</p>
            <div className="space-y-1.5">
              {extraGroupCompanies.map((co, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-slate-800">{co.company_name}</span>
                  <span className="text-slate-400 text-xs">· {co.company_number}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedOfficers.length > 0 && (
          <div className="py-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Officers ({selectedOfficers.length})</p>
            <div className="space-y-1">
              {selectedOfficers.map((o, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold shrink-0">
                    {o.name.charAt(0)}
                  </div>
                  <span className="text-slate-800">{o.name}</span>
                  <span className="text-slate-400 text-xs">· {o.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedAssociated.length > 0 && (
          <div className="pt-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Additional Associated Companies ({selectedAssociated.length})</p>
            <div className="space-y-1">
              {selectedAssociated.map((co, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-slate-800">{co.company_name}</span>
                  <span className="text-slate-400 text-xs">· {co.company_number}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STEP LABELS ──────────────────────────────────────────────────────────

const STEPS = [
  { id: 'company',    label: 'Company' },
  { id: 'officers',  label: 'Directors' },
  { id: 'associated', label: 'Group' },
  { id: 'confirm',   label: 'Confirm' },
];

// ─── MAIN WIZARD ──────────────────────────────────────────────────────────

export default function CompaniesHouseWizard({ mode = 'demo', onComplete }) {
  const [step, setStep] = useState(0);

  // Step 0 — multi-company selection
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [selectedCompanies, setSelectedCompanies] = useState([]); // first = primary

  // Step 1 — merged officers per company
  const [officersByCompany, setOfficersByCompany] = useState({});   // { company_number: [officers] }
  const [pscByCompany, setPscByCompany] = useState({});
  const [loadingCompanies, setLoadingCompanies] = useState({});
  const [officersError, setOfficersError] = useState(null);
  const [selectedOfficers, setSelectedOfficers] = useState([]);

  // Step 2
  const [appointmentsMap, setAppointmentsMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [selectedAssociated, setSelectedAssociated] = useState([]);
  const [manualQuery, setManualQuery] = useState('');
  const [manualResults, setManualResults] = useState([]);
  const [manualLoading, setManualLoading] = useState(false);

  // ── CH search ──────────────────────────────────────────────────────────
  const searchCompanies = async () => {
   if (!query.trim()) return;
   setSearching(true);
   setSearchError(null);
   setResults([]);
   try {
     const data = await ch('search_companies', { query: query.trim() });
     if (data.error) {
       setSearchError(data.error);
     } else {
       setResults(data.companies || []);
       if (!data.companies?.length) setSearchError('No companies found. Try a different name or company number.');
     }
   } catch (err) {
     setSearchError(err.message || 'Search failed. Check your connection and try again.');
   } finally {
     setSearching(false);
   }
  };

  const toggleCompany = (co) => {
    setSelectedCompanies(prev => {
      const exists = prev.find(s => s.company_number === co.company_number);
      if (exists) return prev.filter(s => s.company_number !== co.company_number);
      return [...prev, co];
    });
  };

  const setPrimaryCompany = (co) => {
    setSelectedCompanies(prev => {
      const rest = prev.filter(s => s.company_number !== co.company_number);
      return [co, ...rest];
    });
  };

  // ── Fetch officers for all selected companies ──────────────────────────
  const fetchAllOfficers = async (companies) => {
    const targets = companies || selectedCompanies;
    if (!targets.length) return;
    setOfficersError(null);

    // Kick off parallel fetches
    const newLoading = {};
    targets.forEach(co => { newLoading[co.company_number] = true; });
    setLoadingCompanies(newLoading);

    const results = await Promise.allSettled(
      targets.map(co =>
        Promise.all([
          ch('get_officers', { company_number: co.company_number }),
          ch('get_psc', { company_number: co.company_number }),
        ]).then(([offRes, pscRes]) => ({ company_number: co.company_number, officers: offRes.officers || [], psc: pscRes.psc || [] }))
      )
    );

    const newOfficers = {};
    const newPsc = {};
    results.forEach(r => {
      if (r.status === 'fulfilled') {
        newOfficers[r.value.company_number] = r.value.officers;
        newPsc[r.value.company_number] = r.value.psc;
      }
    });
    setOfficersByCompany(newOfficers);
    setPscByCompany(newPsc);

    // Auto-select all unique active officers across companies
    const autoSelected = [];
    const seen = new Set();
    Object.values(newOfficers).flat().forEach(o => {
      if (!o.resigned_on) {
        const key = o.name + o.role;
        if (!seen.has(key)) { seen.add(key); autoSelected.push(o); }
      }
    });
    setSelectedOfficers(autoSelected);

    setLoadingCompanies({});
  };

  const toggleOfficer = (person) => {
    setSelectedOfficers(prev => {
      const key = person.name + person.role;
      return prev.find(p => p.name + p.role === key)
        ? prev.filter(p => p.name + p.role !== key)
        : [...prev, person];
    });
  };

  // ── Appointments ───────────────────────────────────────────────────────
  const searchAppointments = async (officer) => {
    setLoadingMap(prev => ({ ...prev, [officer.name]: true }));
    try {
      const searchRes = await ch('search_officer', { query: officer.name });
      const match = (searchRes.officers || []).find(o =>
        o.name?.toLowerCase().includes(officer.name.split(' ')[0].toLowerCase())
      );
      const officer_id = match?.officer_id || officer.name;
      const appRes = await ch('get_officer_appointments', {
        officer_id,
        query: officer.name,
        company_number: selectedCompanies[0]?.company_number,
      });
      setAppointmentsMap(prev => ({ ...prev, [officer.name]: appRes.appointments || [] }));
    } catch {
      setAppointmentsMap(prev => ({ ...prev, [officer.name]: [] }));
    } finally {
      setLoadingMap(prev => ({ ...prev, [officer.name]: false }));
    }
  };

  const toggleAssociated = (co) => {
    setSelectedAssociated(prev => {
      const key = co.company_number || co.company_name;
      return prev.find(p => (p.company_number || p.company_name) === key)
        ? prev.filter(p => (p.company_number || p.company_name) !== key)
        : [...prev, co];
    });
  };

  const manualSearch = async () => {
    if (!manualQuery.trim()) return;
    setManualLoading(true);
    setManualResults([]);
    try {
      const data = await ch('search_companies', { query: manualQuery.trim() });
      setManualResults((data.companies || []).slice(0, 5));
    } catch {
      setManualResults([]);
    } finally {
      setManualLoading(false);
    }
  };

  // ── Navigation ─────────────────────────────────────────────────────────
  const goNext = () => {
    if (step === 0 && selectedCompanies.length) {
      fetchAllOfficers(selectedCompanies);
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      onComplete?.({
        company: selectedCompanies[0],
        allCompanies: selectedCompanies,
        officers: selectedOfficers,
        selectedAssociated,
      });
    }
  };

  const canNext = () => {
    if (step === 0) return selectedCompanies.length > 0;
    if (step === 1) return true;
    if (step === 2) return true;
    if (step === 3) return selectedCompanies.length > 0;
    return false;
  };

  const ctaLabel = () => {
    if (step === 3) return mode === 'demo' ? 'Build My Demo →' : 'Continue Setup →';
    return 'Continue';
  };

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Progress stepper */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className={`flex items-center gap-1.5 shrink-0 ${i <= step ? 'text-primary' : 'text-slate-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                i < step ? 'bg-primary border-primary text-white' :
                i === step ? 'border-primary text-primary bg-white shadow-sm' :
                'border-slate-200 text-slate-300 bg-white'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${i === step ? 'text-primary' : ''}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 min-w-[16px] transition-all ${i < step ? 'bg-primary' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white border-2 rounded-2xl p-6 md:p-8 shadow-sm min-h-[360px] flex flex-col">
        <div className="flex-1">
          {step === 0 && (
            <StepCompany
              query={query} setQuery={setQuery}
              results={results} loading={searching} error={searchError}
              selectedCompanies={selectedCompanies}
              onSearch={searchCompanies}
              onToggleCompany={toggleCompany}
              onSetPrimary={setPrimaryCompany}
            />
          )}
          {step === 1 && (
            <StepOfficers
              allCompanies={selectedCompanies}
              officersByCompany={officersByCompany}
              pscByCompany={pscByCompany}
              loadingCompanies={loadingCompanies}
              error={officersError}
              selected={selectedOfficers}
              onToggle={toggleOfficer}
              onRefetch={() => fetchAllOfficers(selectedCompanies)}
            />
          )}
          {step === 2 && (
            <StepAssociated
              allCompanies={selectedCompanies}
              selectedOfficers={selectedOfficers}
              appointmentsMap={appointmentsMap}
              loadingMap={loadingMap}
              onSearchAppointments={searchAppointments}
              selectedAssociated={selectedAssociated}
              onToggleAssociated={toggleAssociated}
              manualQuery={manualQuery} setManualQuery={setManualQuery}
              onManualSearch={manualSearch}
              manualResults={manualResults} manualLoading={manualLoading}
            />
          )}
          {step === 3 && (
            <StepSummary
              allCompanies={selectedCompanies}
              selectedOfficers={selectedOfficers}
              selectedAssociated={selectedAssociated}
              mode={mode}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t">
          <Button variant="outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
            ← Back
          </Button>
          <span className="text-xs text-slate-400">Step {step + 1} of {STEPS.length}</span>
          <Button onClick={goNext} disabled={!canNext()} className={step === 3 ? 'bg-amber-500 hover:bg-amber-400 text-white font-bold' : ''}>
            {ctaLabel()}
          </Button>
        </div>
      </div>
    </div>
  );
}