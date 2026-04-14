import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Loader2 } from 'lucide-react';
import SignaturePad from 'signature_pad';

export default function TaskSignOff({ task, onClose, onSuccess }) {
  const [completionNotes, setCompletionNotes] = useState('');
  const [signatureData, setSignatureData] = useState(null);
  const canvasRef = useRef(null);
  const padRef = useRef(null);

  const signOffMutation = useMutation({
    mutationFn: async () => {
      const timestamp = new Date().toISOString();

      // Update task with completion details
      await base44.entities.Task.update(task.id, {
        status: 'completed',
        completion_date: timestamp,
        completion_notes: completionNotes,
        signature_data: signatureData
      });

      return { success: true };
    },
    onSuccess: onSuccess
  });

  const handleClearSignature = () => {
    if (padRef.current) {
      padRef.current.clear();
      setSignatureData(null);
    }
  };

  const handleSignatureCapture = () => {
    if (canvasRef.current) {
      const data = canvasRef.current.toDataURL('image/png');
      setSignatureData(data);
    }
  };

  useEffect(() => {
    if (canvasRef.current && !padRef.current) {
      padRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
      });
    }
  }, []);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Task & Sign Off</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Completion Notes</label>
            <Textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Describe work completed..."
              className="h-24 mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Digital Signature</label>
            <canvas
              ref={canvasRef}
              width={300}
              height={150}
              className="border-2 border-slate-300 rounded-lg mt-1 bg-white cursor-crosshair w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleClearSignature}
              variant="outline"
              className="flex-1"
              disabled={signOffMutation.isPending}
            >
              Clear Signature
            </Button>
            <Button
              onClick={handleSignatureCapture}
              variant="outline"
              className="flex-1"
              disabled={signOffMutation.isPending}
            >
              Capture
            </Button>
          </div>

          {signatureData && (
            <div className="p-3 bg-green-50 border border-green-200 rounded flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="w-4 h-4" />
              Signature captured
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={signOffMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => signOffMutation.mutate()}
              disabled={!completionNotes.trim() || !signatureData || signOffMutation.isPending}
              className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
            >
              {signOffMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Complete Task
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}