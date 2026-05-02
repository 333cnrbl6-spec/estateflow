import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, Clock, Zap, FileText, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LaunchDashboard() {
  const [checklist, setChecklist] = useState({
    week1: [
      { id: 1, task: 'Security audit (2FA, IP whitelist, GDPR)', status: 'pending' },
      { id: 2, task: 'Load testing (5,000+ concurrent users)', status: 'pending' },
      { id: 3, task: 'Mobile app beta on TestFlight/Google Play', status: 'pending' },
      { id: 4, task: 'Documentation complete (API, Help, videos)', status: 'completed' },
      { id: 5, task: 'Customer onboarding flow tested', status: 'in-progress' },
      { id: 6, task: 'SLA & support policy documented', status: 'pending' }
    ],
    week2: [
      { id: 7, task: 'Pricing tiers finalized', status: 'pending' },
      { id: 8, task: 'Landing page updated with features', status: 'pending' },
      { id: 9, task: 'Sales collateral created', status: 'pending' },
      { id: 10, task: 'Email nurture sequence set up', status: 'pending' },
      { id: 11, task: 'Slack community/Discord launched', status: 'pending' },
      { id: 12, task: 'Stripe production keys configured', status: 'pending' }
    ],
    week3: [
      { id: 13, task: 'Invite 50 beta users', status: 'pending' },
      { id: 14, task: 'Monitor uptime & error rates', status: 'pending' },
      { id: 15, task: 'Collect & iterate on feedback', status: 'pending' }
    ],
    week4: [
      { id: 16, task: 'Press release & PR outreach', status: 'pending' },
      { id: 17, task: 'Twitter/LinkedIn campaign', status: 'pending' },
      { id: 18, task: 'Partner outreach to agencies', status: 'pending' },
      { id: 19, task: 'Enterprise sales calls', status: 'pending' },
      { id: 20, task: 'Customer success onboarding', status: 'pending' }
    ]
  });

  const toggleTask = (week, id) => {
    setChecklist(prev => ({
      ...prev,
      [week]: prev[week].map(t =>
        t.id === id
          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
          : t
      )
    }));
  };

  const toggleInProgress = (week, id) => {
    setChecklist(prev => ({
      ...prev,
      [week]: prev[week].map(t =>
        t.id === id
          ? { ...t, status: t.status === 'in-progress' ? 'pending' : 'in-progress' }
          : t
      )
    }));
  };

  const getProgress = (week) => {
    const tasks = checklist[week];
    const completed = tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  };

  const totalCompleted = Object.values(checklist).flat().filter(t => t.status === 'completed').length;
  const totalTasks = Object.values(checklist).flat().length;
  const overallProgress = Math.round((totalCompleted / totalTasks) * 100);

  const TaskItem = ({ task, week, onToggle, onInProgress }) => (
    <div className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <button onClick={() => onToggle(week, task.id)} className="flex-shrink-0">
          {task.status === 'completed' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : task.status === 'in-progress' ? (
            <Clock className="w-5 h-5 text-blue-600" />
          ) : (
            <div className="w-5 h-5 border-2 border-slate-300 rounded-full" />
          )}
        </button>
        <p className={task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'}>
          {task.task}
        </p>
      </div>
      <div className="flex items-center gap-2 ml-3">
        {task.status !== 'completed' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onInProgress(week, task.id)}
            className="text-xs"
          >
            {task.status === 'in-progress' ? 'Mark Done' : 'In Progress'}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">🚀 Launch Roadmap</h1>
          <p className="text-lg text-slate-600">30-day path to market leadership</p>
        </div>

        {/* Overall Progress */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Overall Progress</h2>
              <Badge className="text-lg px-3 py-1">{totalCompleted}/{totalTasks} tasks</Badge>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <p className="text-sm text-slate-600">{overallProgress}% complete • {Math.ceil((30 * (100 - overallProgress)) / 100)} days remaining</p>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-slate-900">{getProgress('week1')}%</p>
              <p className="text-sm text-slate-600 mt-1">Week 1</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-slate-900">{getProgress('week2')}%</p>
              <p className="text-sm text-slate-600 mt-1">Week 2</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-slate-900">{getProgress('week3')}%</p>
              <p className="text-sm text-slate-600 mt-1">Week 3</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-slate-900">{getProgress('week4')}%</p>
              <p className="text-sm text-slate-600 mt-1">Week 4</p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Checklists */}
        <Tabs defaultValue="week1" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="week1">Week 1</TabsTrigger>
            <TabsTrigger value="week2">Week 2</TabsTrigger>
            <TabsTrigger value="week3">Week 3</TabsTrigger>
            <TabsTrigger value="week4">Week 4</TabsTrigger>
          </TabsList>

          {['week1', 'week2', 'week3', 'week4'].map(week => (
            <TabsContent key={week} value={week} className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="capitalize">{week.replace('week', 'Week ')} Checklist</CardTitle>
                    <Progress value={getProgress(week)} className="w-24" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {checklist[week].map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      week={week}
                      onToggle={toggleTask}
                      onInProgress={toggleInProgress}
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Immediate Actions */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">🔴 Do This Today (May 2)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-slate-900">1. Set up Stripe production</p>
                <p className="text-xs text-slate-600 mt-1">Configure API keys, bank account, and webhook endpoints</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-slate-900">2. Configure email delivery</p>
                <p className="text-xs text-slate-600 mt-1">Set up Mailchimp/SendGrid + add SMTP secrets</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-slate-900">3. Create beta user list</p>
                <p className="text-xs text-slate-600 mt-1">Target 50 early adopters (agencies, landlords)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-slate-900">4. Schedule security audit</p>
                <p className="text-xs text-slate-600 mt-1">Book external pen test for Week 1</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-slate-900">5. Deploy Phase 4 to staging</p>
                <p className="text-xs text-slate-600 mt-1">Test collaboration, white-label, mobile features</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Launch Success Metrics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-2xl font-bold text-blue-900">50</p>
              <p className="text-sm text-blue-800 mt-1">Beta users by Day 21</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-2xl font-bold text-green-900">99.9%</p>
              <p className="text-sm text-green-800 mt-1">Uptime target by Day 30</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-2xl font-bold text-purple-900">&lt; 5%</p>
              <p className="text-sm text-purple-800 mt-1">Error rate max</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}