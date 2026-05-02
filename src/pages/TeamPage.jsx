import React from 'react';
import TeamManagement from '@/components/team/TeamManagement';

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Team Management</h1>
          <p className="text-lg text-slate-600">Invite team members and manage access roles</p>
        </div>
        <TeamManagement />
      </div>
    </div>
  );
}