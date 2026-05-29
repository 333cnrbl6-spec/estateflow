import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronRight, Building2, Users, Wrench, MessageSquare, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

const BRAND = { navy: '#0A1E3F', blue: '#007BFF', orange: '#FF7A00' };

const steps = [
  {
    number: 1,
    icon: Building2,
    title: 'Add your first property',
    description: 'Enter your property details including address, type, and unit configuration. This is the foundation of your portfolio.',
    action: 'Add Property',
    path: '/properties/add',
  },
  {
    number: 2,
    icon: Users,
    title: 'Add or link a tenancy',
    description: 'Create a tenancy record and link it to a property or unit. Capture key dates, rent details, and tenant information.',
    action: 'View Tenancies',
    path: '/pipeline',
  },
  {
    number: 3,
    icon: Wrench,
    title: 'Review maintenance settings',
    description: 'Set up your maintenance workflow preferences, contractor access, and escalation rules to keep your properties in good order.',
    action: 'Maintenance Overview',
    path: '/maintenance',
  },
  {
    number: 4,
    icon: MessageSquare,
    title: 'Set communication preferences',
    description: 'Configure how you communicate with tenants, contractors, and team members. Review notification and messaging settings.',
    action: 'Communications Log',
    path: '/messages',
  },
  {
    number: 5,
    icon: LayoutDashboard,
    title: 'Explore your dashboard',
    description: 'Your dashboard gives you a live overview of portfolio performance, outstanding actions, compliance status, and key metrics.',
    action: 'Go to Dashboard',
    path: '/dashboard',
  },
];

export default function GuidedSetup() {
  const [completed, setCompleted] = useState({});

  const toggleStep = (n) => {
    setCompleted(prev => ({ ...prev, [n]: !prev[n] }));
  };

  const doneCount = Object.values(completed).filter(Boolean).length;
  const progress = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="min-h-screen p-6" style={{ background: '#f8faff', fontFamily: 'Poppins, Inter, sans-serif' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: BRAND.navy }}>
              P
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: BRAND.navy }}>Getting Started with Premiso</h1>
              <p className="text-sm text-slate-500">Complete these steps to set up your account</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #e8eef8' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold" style={{ color: BRAND.navy }}>{doneCount} of {steps.length} steps complete</span>
              <span className="text-sm font-bold" style={{ color: BRAND.blue }}>{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.orange})` }}
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step) => {
            const Icon = step.icon;
            const isDone = completed[step.number];
            return (
              <div
                key={step.number}
                className="bg-white rounded-xl p-5 transition-all"
                style={{
                  border: isDone ? `1.5px solid ${BRAND.blue}40` : '1px solid #e8eef8',
                  background: isDone ? '#f0f7ff' : '#fff',
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Step number / check */}
                  <button
                    onClick={() => toggleStep(step.number)}
                    className="flex-shrink-0 mt-0.5 transition-all"
                    title={isDone ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {isDone
                      ? <CheckCircle2 className="w-6 h-6" style={{ color: BRAND.blue }} />
                      : <Circle className="w-6 h-6 text-slate-300 hover:text-slate-400" />
                    }
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: isDone ? BRAND.blue : '#f1f5f9' }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: isDone ? '#fff' : '#94a3b8' }} />
                      </div>
                      <h3 className="font-semibold text-sm" style={{ color: isDone ? BRAND.blue : BRAND.navy }}>
                        Step {step.number}: {step.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">{step.description}</p>
                    <Link
                      to={step.path}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                      style={{ background: BRAND.navy, color: '#fff' }}
                    >
                      {step.action} <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion message */}
        {doneCount === steps.length && (
          <div className="mt-6 rounded-xl p-6 text-center text-white" style={{ background: BRAND.navy }}>
            <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-green-400" />
            <h3 className="font-bold text-lg mb-1">You're all set!</h3>
            <p className="text-sm opacity-75 mb-4">Your Premiso account is configured and ready to use.</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition hover:opacity-90"
              style={{ background: BRAND.blue, color: '#fff' }}
            >
              Go to Dashboard <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        <p className="text-xs text-center text-slate-400 mt-6">Premiso BETA · SynergyFlow Group</p>
      </div>
    </div>
  );
}