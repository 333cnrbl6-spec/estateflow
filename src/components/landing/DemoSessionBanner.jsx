/**
 * DemoSessionBanner
 * Persistent watermark/banner shown inside the demo environment.
 * Makes it clear this is a limited-access evaluation — not a live subscription.
 */
import React, { useState, useEffect } from 'react';
import { Clock, Lock, X } from 'lucide-react';

function getTimeRemaining(expiresAt) {
  const ms = expiresAt - Date.now();
  if (ms <= 0) return null;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m remaining` : `${m}m remaining`;
}

export default function DemoSessionBanner({ session, onExpired }) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(session?.expiresAt));
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const t = getTimeRemaining(session?.expiresAt);
      setTimeLeft(t);
      if (!t) { clearInterval(interval); onExpired?.(); }
    }, 60000);
    return () => clearInterval(interval);
  }, [session?.expiresAt, onExpired]);

  if (!session || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs">
      <div className="bg-slate-900/95 backdrop-blur-sm text-white rounded-xl shadow-2xl p-4 border border-slate-700">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Personalised Demo</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Prepared for <span className="text-slate-200">{session.company || session.email}</span>
              </p>
              {timeLeft && (
                <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {timeLeft}
                </p>
              )}
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="text-slate-500 hover:text-slate-300 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-3 leading-relaxed">
          © Premiso {new Date().getFullYear()}. All rights reserved. This environment is for evaluation only.
          Unauthorised use, reproduction or data extraction is prohibited.
        </p>
      </div>
    </div>
  );
}