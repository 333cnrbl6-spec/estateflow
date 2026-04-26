import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge from '@/components/shared/StatusBadge';
import ScheduleMeetingDialog from '@/components/boardroom/ScheduleMeetingDialog';
import PricingVotingPanel from '@/components/boardroom/PricingVotingPanel';
import { DollarSign } from 'lucide-react';

export default function Boardroom() {
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  // Fetch all board meetings
  const meetingsQuery = useQuery({
    queryKey: ['board-meetings'],
    queryFn: () => base44.entities.BoardMeeting.list('-created_date', 50),
    staleTime: 2 * 60 * 1000
  });

  // Fetch pricing proposals
  const proposalsQuery = useQuery({
    queryKey: ['pricing-proposals'],
    queryFn: () => base44.entities.PricingProposal.list('-created_date', 20),
    staleTime: 2 * 60 * 1000
  });

  const { data: meetings = [], isLoading } = meetingsQuery;
  const { data: proposals = [] } = proposalsQuery;

  // Get selected meeting details
  const currentMeeting = selectedMeeting || meetings[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading boardroom...</p>
        </div>
      </div>
    );
  }

  if (!currentMeeting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-slate-900">Boardroom</h1>
            </div>
            <ScheduleMeetingDialog 
              open={scheduleDialogOpen} 
              onOpenChange={setScheduleDialogOpen}
              onMeetingCreated={() => meetingsQuery.refetch()}
            />
          </div>
          <Card className="text-center py-12">
            <p className="text-muted-foreground mb-4">No board meetings yet</p>
            <Button onClick={() => setScheduleDialogOpen(true)}>Schedule First Meeting</Button>
          </Card>
        </div>
      </div>
    );
  }

  const decisionCount = currentMeeting.decisions?.length || 0;
  const discussionCount = currentMeeting.discussion_threads?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-slate-900">Boardroom</h1>
            </div>
            <p className="text-slate-600">Strategic collaboration & cross-app decision-making</p>
          </div>
          <ScheduleMeetingDialog 
            open={scheduleDialogOpen} 
            onOpenChange={setScheduleDialogOpen}
            onMeetingCreated={() => meetingsQuery.refetch()}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar: Meeting List */}
          <div className="lg:col-span-1">
            <Card className="border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Meetings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {meetings.map(meeting => (
                  <button
                    key={meeting.id}
                    onClick={() => setSelectedMeeting(meeting)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      currentMeeting.id === meeting.id
                        ? 'bg-primary/10 border-primary text-slate-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <p className="text-sm font-medium truncate">{meeting.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(meeting.created_date), 'MMM d')}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={meeting.status} />
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Meeting Header */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-slate-900 mb-2">{currentMeeting.title}</CardTitle>
                    <CardDescription>
                      Called by {currentMeeting.called_by} • {format(new Date(currentMeeting.meeting_date), 'PPP p')}
                    </CardDescription>
                  </div>
                  <StatusBadge status={currentMeeting.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{currentMeeting.attendees?.length || 0}</div>
                    <p className="text-sm text-muted-foreground">Attendees</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{discussionCount}</div>
                    <p className="text-sm text-muted-foreground">Discussion Points</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{decisionCount}</div>
                    <p className="text-sm text-muted-foreground">Decisions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs: Perspectives & Decisions & Pricing */}
            <Tabs defaultValue="perspectives" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="perspectives" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Agent Perspectives
                </TabsTrigger>
                <TabsTrigger value="decisions" className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Decisions
                </TabsTrigger>
                <TabsTrigger value="pricing" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Pricing Votes
                </TabsTrigger>
              </TabsList>

              {/* Agent Perspectives */}
              <TabsContent value="perspectives" className="space-y-4 mt-6">
                {discussionCount === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      No agent perspectives recorded yet
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentMeeting.discussion_threads?.map((thread, idx) => (
                      <Card key={idx} className="border-slate-200 hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{thread.from}</CardTitle>
                              <CardDescription className="text-xs">
                                {format(new Date(thread.timestamp), 'PPP p')}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {thread.content && (
                            <div>
                              <p className="text-sm font-medium text-slate-700 mb-2">Perspective:</p>
                              <p className="text-sm text-slate-600 leading-relaxed">{thread.content}</p>
                            </div>
                          )}
                          {thread.recommendation && (
                            <div className="bg-blue-50 border-l-2 border-blue-500 p-3 rounded">
                              <p className="text-xs font-semibold text-blue-700 mb-1">Recommendation:</p>
                              <p className="text-sm text-blue-600">{thread.recommendation}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Decisions & Action Items */}
              <TabsContent value="decisions" className="space-y-4 mt-6">
                {decisionCount === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      No decisions recorded yet
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {currentMeeting.decisions?.map((decision, idx) => (
                      <Card key={idx} className="border-slate-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base text-slate-900">{decision.item}</CardTitle>
                            </div>
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-slate-700 mb-1">Decision:</p>
                            <p className="text-sm text-slate-600">{decision.decision}</p>
                          </div>
                          {decision.implementation_owner && (
                            <div>
                              <p className="text-sm font-medium text-slate-700 mb-1">Owner:</p>
                              <Badge variant="outline">{decision.implementation_owner}</Badge>
                            </div>
                          )}
                          {decision.deadline && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Clock className="w-4 h-4 text-slate-400" />
                              Due by {format(new Date(decision.deadline), 'MMM d, yyyy')}
                            </div>
                          )}
                          {decision.voted_by?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 mb-2">Voted by:</p>
                              <div className="flex flex-wrap gap-1">
                                {decision.voted_by.map((voter, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {voter}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Pricing Proposals */}
              <TabsContent value="pricing" className="space-y-4 mt-6">
                {proposals.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      No pricing proposals yet
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {proposals.map(proposal => (
                      <PricingVotingPanel 
                        key={proposal.id} 
                        proposal={proposal}
                        onVoted={() => proposalsQuery.refetch()}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Attendees */}
            {currentMeeting.attendees?.length > 0 && (
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Board Members Present
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {currentMeeting.attendees.map((attendee, idx) => (
                      <Badge key={idx} variant="outline" className="bg-slate-50">
                        {attendee}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}