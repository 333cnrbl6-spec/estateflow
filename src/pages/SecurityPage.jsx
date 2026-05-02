import React from 'react';
import SecuritySettings from '@/components/security/SecuritySettings';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Security & Privacy</h1>
          <p className="text-lg text-slate-600">Manage 2FA, IP whitelist, audit logs, and GDPR requests</p>
        </div>
        <SecuritySettings />
      </div>
    </div>
  );
}