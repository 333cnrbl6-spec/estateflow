import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2, CheckCircle, User } from 'lucide-react';

export default function ContractorAssignmentPanel({ maintenanceRequest, onAssigned }) {
  const [selectedContractor, setSelectedContractor] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const { data: contractors = [], isLoading: contractorsLoading } = useQuery({
    queryKey: ['available-contractors'],
    queryFn: async () => {
      // Fetch contractors from User entity with contractor role
      const users = await base44.entities.User.list();
      return users.filter(u => u.role === 'contractor' || u.role?.includes('contractor'));
    }
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.invoke('assignContractorToTask', {
        maintenance_request_id: maintenanceRequest.id,
        contractor_email: selectedContractor,
        notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      onAssigned?.();
      setSelectedContractor('');
      setNotes('');
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  const handleAssign = async () => {
    if (!selectedContractor) {
      setError('Please select a contractor');
      return;
    }
    assignMutation.mutate();
  };

  if (maintenanceRequest.assigned_contractor) {
    return (
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Assigned Contractor</p>
            <p className="font-medium text-foreground">{maintenanceRequest.assigned_contractor}</p>
          </div>
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-blue-50 border-blue-200">
      <h4 className="font-medium text-foreground mb-4">Assign Contractor</h4>

      <div className="space-y-4">
        {/* Contractor Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Select Contractor *</label>
          {contractorsLoading ? (
            <div className="p-3 bg-white border border-blue-200 rounded text-center text-sm text-muted-foreground">
              Loading contractors...
            </div>
          ) : contractors.length === 0 ? (
            <div className="p-3 bg-white border border-blue-200 rounded text-center text-sm text-muted-foreground">
              No contractors available
            </div>
          ) : (
            <select
              value={selectedContractor}
              onChange={(e) => {
                setSelectedContractor(e.target.value);
                setError(null);
              }}
              className="w-full px-3 py-2 border border-input rounded-md bg-white text-foreground"
            >
              <option value="">Choose a contractor...</option>
              {contractors.map(c => (
                <option key={c.id} value={c.email}>
                  {c.full_name} ({c.email})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Assignment Notes */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Notes (Optional)</label>
          <textarea
            placeholder="e.g., Priority repair - tenant working from home"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="2"
            className="w-full px-3 py-2 border border-input rounded-md bg-white text-foreground placeholder-muted-foreground resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Assign Button */}
        <Button
          onClick={handleAssign}
          disabled={!selectedContractor || assignMutation.isPending}
          className="w-full"
        >
          {assignMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Assigning...
            </>
          ) : (
            <>
              <User className="w-4 h-4 mr-2" />
              Assign to Contractor
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}