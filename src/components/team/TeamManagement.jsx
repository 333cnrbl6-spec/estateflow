import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Trash2, Shield } from 'lucide-react';

export default function TeamManagement() {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const queryClient = useQueryClient();

  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => base44.asServiceRole.entities.TeamMember.list('-updated_date', 100),
    staleTime: 5 * 60 * 1000
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      return base44.functions.invoke('inviteTeamMember', {
        email,
        role
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setEmail('');
      setRole('viewer');
      setShowInviteForm(false);
    }
  });

  const roleColors = {
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-blue-100 text-blue-800',
    accountant: 'bg-green-100 text-green-800',
    maintenance_coordinator: 'bg-yellow-100 text-yellow-800',
    viewer: 'bg-gray-100 text-gray-800'
  };

  const statusColors = {
    invited: 'bg-yellow-50',
    active: 'bg-green-50',
    suspended: 'bg-red-50'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Team Members
        </h2>
        <Button onClick={() => setShowInviteForm(!showInviteForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      {showInviteForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6 space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            >
              <option value="admin">Admin - Full access</option>
              <option value="manager">Manager - Can edit properties & maintenance</option>
              <option value="accountant">Accountant - View financials only</option>
              <option value="maintenance_coordinator">Maintenance Coordinator - Manage maintenance</option>
              <option value="viewer">Viewer - Read-only access</option>
            </select>
            <div className="flex gap-2">
              <Button 
                onClick={() => inviteMutation.mutate()}
                disabled={!email || inviteMutation.isPending}
              >
                Send Invite
              </Button>
              <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-slate-600">Loading team members...</p>
        ) : teamMembers.length === 0 ? (
          <Card className="p-6 text-center text-slate-600">
            No team members yet. Invite someone to get started.
          </Card>
        ) : (
          teamMembers.map(member => (
            <Card key={member.id} className={statusColors[member.status]}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="font-semibold text-slate-900">{member.full_name}</p>
                      <p className="text-sm text-slate-600">{member.email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={roleColors[member.role]}>
                    {member.role}
                  </Badge>
                  <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                    {member.status}
                  </Badge>
                  {member.status === 'active' && (
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}