/**
 * BackupManagement — Backup & restore UI
 * Create manual backups, view history, restore from snapshots
 */

import { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { HardDrive, RotateCcw, Plus, Trash2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { auditLogger } from '@/lib/auditLogger';
import { formatDistanceToNow } from 'date-fns';

const AVAILABLE_ENTITIES = ['Property', 'Unit', 'Tenant', 'Task', 'MaintenanceOrder', 'FinancialTransaction'];

export default function BackupManagement() {
  const [backupName, setBackupName] = useState('');
  const [selectedEntities, setSelectedEntities] = useState(['Property', 'Tenant']);
  const [restoreId, setRestoreId] = useState(null);
  const [dryRun, setDryRun] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  const { data: backups = [] } = useQuery({
    queryKey: ['backups'],
    queryFn: () => base44.entities.Backup.list('-backup_timestamp', 50),
  });

  const filteredBackups = useMemo(() => {
    if (filterStatus === 'all') return backups;
    return backups.filter(b => b.status === filterStatus);
  }, [backups, filterStatus]);

  const createBackupMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.functions.invoke('createBackup', data);
      await auditLogger.logMutation('Backup', 'create', result.backup_id, data);
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
      setBackupName('');
      setSelectedEntities(['Property', 'Tenant']);
      handleSuccess(`Backup created: ${result.message}`);
    },
    onError: (error) => handleError(error, 'Failed to create backup'),
  });

  const restoreBackupMutation = useMutation({
    mutationFn: async (backupId) => {
      const result = await base44.functions.invoke('restoreBackup', {
        backup_id: backupId,
        dry_run: dryRun,
      });
      await auditLogger.logMutation('Backup', 'restore', backupId, { dry_run: dryRun });
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
      setRestoreId(null);
      handleSuccess(result.message);
    },
    onError: (error) => handleError(error, 'Failed to restore backup'),
  });

  const deleteBackupMutation = useMutation({
    mutationFn: async (backupId) => {
      await base44.entities.Backup.delete(backupId);
      await auditLogger.logMutation('Backup', 'delete', backupId, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
      handleSuccess('Backup deleted');
    },
    onError: (error) => handleError(error, 'Failed to delete backup'),
  });

  const handleCreateBackup = () => {
    if (!backupName.trim()) {
      handleError({ message: 'Backup name required' });
      return;
    }
    createBackupMutation.mutate({
      backup_name: backupName,
      entities_to_backup: selectedEntities,
      backup_type: 'manual',
    });
  };

  const getStatusIcon = (status) => {
    const icons = {
      ready: <CheckCircle2 className="w-4 h-4 text-green-600" />,
      creating: <Clock className="w-4 h-4 text-blue-600 animate-spin" />,
      restoring: <RotateCcw className="w-4 h-4 text-amber-600 animate-spin" />,
      failed: <AlertCircle className="w-4 h-4 text-red-600" />,
    };
    return icons[status] || icons.ready;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <HardDrive className="w-8 h-8 text-primary" />
            Backup & Recovery
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Create and restore entity snapshots</p>
        </div>

        {/* Create Backup Card */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Create Manual Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Backup name (e.g., 'Pre-bulk-import-2026-04-15')"
              value={backupName}
              onChange={(e) => setBackupName(e.target.value)}
            />

            <div>
              <label className="text-sm font-medium mb-2 block">Entities to Backup</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ENTITIES.map((entity) => (
                  <button
                    key={entity}
                    onClick={() =>
                      setSelectedEntities(
                        selectedEntities.includes(entity)
                          ? selectedEntities.filter((e) => e !== entity)
                          : [...selectedEntities, entity]
                      )
                    }
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      selectedEntities.includes(entity)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {entity}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCreateBackup}
              disabled={createBackupMutation.isPending || selectedEntities.length === 0}
              className="w-full"
            >
              {createBackupMutation.isPending ? 'Creating...' : 'Create Backup'}
            </Button>
          </CardContent>
        </Card>

        {/* Backup History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Backup History</h2>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="creating">Creating</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredBackups.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No backups found</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredBackups.map((backup) => (
                <Card key={backup.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{backup.backup_name}</h3>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(backup.status)}
                            <Badge className="text-[10px]">{backup.status}</Badge>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>{backup.total_records} records • {formatBytes(backup.backup_size_bytes)}</p>
                          <p>
                            Created {formatDistanceToNow(new Date(backup.backup_timestamp), { addSuffix: true })} by {backup.created_by}
                          </p>
                          {backup.last_restored && (
                            <p className="text-green-600">Last restored {formatDistanceToNow(new Date(backup.last_restored), { addSuffix: true })}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {backup.status === 'ready' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRestoreId(backup.id)}
                            disabled={restoreBackupMutation.isPending}
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Restore
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteBackupMutation.mutate(backup.id)}
                          disabled={deleteBackupMutation.isPending}
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={!!restoreId} onOpenChange={() => setRestoreId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Backup?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>This will replace current data with the backed-up version.</p>
              <label className="flex items-center gap-2 cursor-pointer mt-3">
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Dry run (preview only, no actual restore)</span>
              </label>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => restoreId && restoreBackupMutation.mutate(restoreId)}
              disabled={restoreBackupMutation.isPending}
            >
              {restoreBackupMutation.isPending ? 'Restoring...' : 'Confirm Restore'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}