import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Mail, UserPlus, Download, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BetaUserManagement() {
  const [betaUsers, setBetaUsers] = useState([
    { id: 1, name: 'Sarah Chen', email: 'sarah@agencypartners.com', company: 'Agency Partners LLC', type: 'agency', status: 'invited', joinedDate: null },
    { id: 2, name: 'Mike Thompson', email: 'mike@proptech.io', company: 'PropTech Solutions', type: 'landlord', status: 'active', joinedDate: '2026-05-01' },
    { id: 3, name: 'Emma Rodriguez', email: 'emma@landlordpro.uk', company: 'Landlord Pro', type: 'landlord', status: 'invited', joinedDate: null },
  ]);

  const [newUser, setNewUser] = useState({ name: '', email: '', company: '', type: 'agency' });
  const [feedback, setFeedback] = useState([
    { id: 1, user: 'Mike Thompson', feature: 'Workflow Automation', comment: 'Saves 5+ hours per week. Game changer.', rating: 5, date: '2026-05-02' },
    { id: 2, user: 'Sarah Chen', feature: 'Compliance Intelligence', comment: 'Finally, predictive alerts we can trust.', rating: 5, date: '2026-05-02' }
  ]);

  const addUser = () => {
    if (!newUser.name || !newUser.email) return;
    setBetaUsers([...betaUsers, {
      id: betaUsers.length + 1,
      ...newUser,
      status: 'invited',
      joinedDate: null
    }]);
    setNewUser({ name: '', email: '', company: '', type: 'agency' });
  };

  const sendInvite = (id) => {
    setBetaUsers(betaUsers.map(u => u.id === id ? { ...u, status: 'invite-sent' } : u));
  };

  const markActive = (id) => {
    setBetaUsers(betaUsers.map(u => u.id === id ? { ...u, status: 'active', joinedDate: new Date().toISOString().split('T')[0] } : u));
  };

  const activeCount = betaUsers.filter(u => u.status === 'active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <UserPlus className="w-8 h-8 text-blue-600" />
            Beta User Management
          </h1>
          <p className="text-lg text-slate-600">Track early adopters & gather product feedback</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-slate-900">{betaUsers.length}</p>
              <p className="text-sm text-slate-600 mt-1">Total invited</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">{activeCount}</p>
              <p className="text-sm text-slate-600 mt-1">Active users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-slate-900">{Math.round((activeCount / betaUsers.length) * 100)}%</p>
              <p className="text-sm text-slate-600 mt-1">Activation rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-slate-900">{feedback.length}</p>
              <p className="text-sm text-slate-600 mt-1">Feedback items</p>
            </CardContent>
          </Card>
        </div>

        {/* Add User Form */}
        <Card>
          <CardHeader>
            <CardTitle>Invite Beta User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Full name"
                value={newUser.name}
                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
              />
              <Input
                placeholder="Email"
                type="email"
                value={newUser.email}
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Company"
                value={newUser.company}
                onChange={e => setNewUser({ ...newUser, company: e.target.value })}
              />
              <select
                value={newUser.type}
                onChange={e => setNewUser({ ...newUser, type: e.target.value })}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="agency">Agency</option>
                <option value="landlord">Landlord</option>
                <option value="contractor">Contractor</option>
                <option value="integrator">Integrator</option>
              </select>
            </div>
            <Button onClick={addUser} className="w-full gap-2">
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </CardContent>
        </Card>

        {/* User List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Beta Users</CardTitle>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {betaUsers.map(user => (
              <div key={user.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <Badge className="text-xs capitalize">{user.type}</Badge>
                      {user.status === 'active' && <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>}
                      {user.status === 'invited' && <Badge className="bg-blue-100 text-blue-800 text-xs">Invited</Badge>}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{user.company}</p>
                    <p className="text-xs text-slate-500 mt-1">{user.email}</p>
                    {user.joinedDate && <p className="text-xs text-green-600 mt-1">Joined: {user.joinedDate}</p>}
                  </div>
                  <div className="flex gap-2">
                    {user.status === 'invited' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendInvite(user.id)}
                        className="gap-1"
                      >
                        <Send className="w-3 h-3" />
                        Send
                      </Button>
                    )}
                    {user.status !== 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markActive(user.id)}
                      >
                        Mark Active
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>User Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {feedback.map(item => (
              <div key={item.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{item.user}</p>
                    <p className="text-xs text-slate-600">{item.feature}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < item.rating ? 'text-yellow-500' : 'text-slate-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-700">{item.comment}</p>
                <p className="text-xs text-slate-500 mt-2">{item.date}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">📋 Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-orange-900">
            <p>✓ Send invites to all 50 beta users by May 8</p>
            <p>✓ Schedule kickoff calls with key accounts</p>
            <p>✓ Set up Slack channel for feedback (#premiso-beta)</p>
            <p>✓ Weekly check-ins to monitor adoption</p>
            <p>✓ Bug bounty program (€500-€5,000 per critical issue)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}