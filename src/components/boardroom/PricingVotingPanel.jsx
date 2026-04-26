import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function PricingVotingPanel({ proposal, onVoted }) {
  const [user, setUser] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      const voted = proposal.votes?.some(v => v.voter_email === u.email);
      setHasVoted(voted);
    });
  }, [proposal]);

  const handleVote = async (voteValue) => {
    if (!user) {
      toast.error('Must be logged in to vote');
      return;
    }

    setLoading(true);
    try {
      const existingVote = proposal.votes?.find(v => v.voter_email === user.email);
      
      let updatedVotes = proposal.votes || [];
      if (existingVote) {
        updatedVotes = updatedVotes.map(v => 
          v.voter_email === user.email 
            ? { ...v, vote: voteValue, voted_at: new Date().toISOString() }
            : v
        );
      } else {
        updatedVotes.push({
          voter_email: user.email,
          vote: voteValue,
          voted_at: new Date().toISOString()
        });
      }

      // Recalculate vote totals
      const voteResult = {
        for: updatedVotes.filter(v => v.vote === 'for').length,
        against: updatedVotes.filter(v => v.vote === 'against').length,
        abstain: updatedVotes.filter(v => v.vote === 'abstain').length,
        total_eligible: updatedVotes.length,
        passed: updatedVotes.filter(v => v.vote === 'for').length > updatedVotes.filter(v => v.vote === 'against').length
      };

      await base44.entities.PricingProposal.update(proposal.id, {
        votes: updatedVotes,
        vote_result: voteResult,
        status: proposal.status === 'draft' ? 'voting' : proposal.status
      });

      setHasVoted(true);
      toast.success(`Vote recorded: ${voteValue.toUpperCase()}`);
      onVoted?.();
    } catch (error) {
      toast.error('Failed to record vote: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const voteResult = proposal.vote_result || { for: 0, against: 0, abstain: 0 };
  const totalVotes = voteResult.for + voteResult.against + voteResult.abstain;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{proposal.title}</CardTitle>
          <Badge variant={proposal.status === 'approved' ? 'default' : proposal.status === 'voting' ? 'secondary' : 'outline'}>
            {proposal.status}
          </Badge>
        </div>
        {proposal.description && <p className="text-sm text-slate-600 mt-2">{proposal.description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pricing Preview */}
        <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded border">
          {['starter', 'professional', 'enterprise'].map(tier => (
            <div key={tier}>
              <p className="font-semibold capitalize mb-1">{tier}</p>
              <p className="text-lg font-bold">£{proposal.pricing_structure?.[tier]?.monthly_price || 0}</p>
              <p className="text-slate-500">/mo</p>
            </div>
          ))}
        </div>

        {/* Out-of-Hours Add-on */}
        <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs">
          <p className="font-semibold text-amber-900">Out-of-Hours Add-on</p>
          <p className="text-amber-800 mt-1">
            £{proposal.addon_pricing?.out_of_hours_monthly || 0}/mo + £{proposal.addon_pricing?.out_of_hours_setup || 0} setup
          </p>
        </div>

        {/* Vote Results */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">Votes: {totalVotes}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-green-600" />
              <div className="flex-1 h-2 bg-green-200 rounded" style={{ width: `${totalVotes > 0 ? (voteResult.for / totalVotes) * 100 : 0}%` }}></div>
              <span className="text-xs">{voteResult.for}</span>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsDown className="w-4 h-4 text-red-600" />
              <div className="flex-1 h-2 bg-red-200 rounded" style={{ width: `${totalVotes > 0 ? (voteResult.against / totalVotes) * 100 : 0}%` }}></div>
              <span className="text-xs">{voteResult.against}</span>
            </div>
            {voteResult.abstain > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs w-4">∘</span>
                <div className="flex-1 h-2 bg-slate-200 rounded" style={{ width: `${totalVotes > 0 ? (voteResult.abstain / totalVotes) * 100 : 0}%` }}></div>
                <span className="text-xs">{voteResult.abstain}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        {proposal.status === 'approved' && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded text-sm">
            <Check className="w-4 h-4" />
            <span>Approved by vote</span>
          </div>
        )}

        {/* Vote Buttons */}
        {proposal.status === 'voting' && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleVote('for')}
              disabled={loading}
              variant={hasVoted ? 'outline' : 'default'}
              className="flex-1"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              For
            </Button>
            <Button
              onClick={() => handleVote('against')}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Against
            </Button>
            <Button
              onClick={() => handleVote('abstain')}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              Abstain
            </Button>
          </div>
        )}

        {hasVoted && proposal.status === 'voting' && (
          <p className="text-xs text-slate-600 text-center">✓ You have voted</p>
        )}
      </CardContent>
    </Card>
  );
}