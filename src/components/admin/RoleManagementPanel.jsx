import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/RoleContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, AlertTriangle, Edit2, Trash2, Plus, Check, X, Loader2 } from 'lucide-react';

export default function RoleManagementPanel() {
  const { isAdmin, permissions } = useRole();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all users with their roles (move hooks before conditional)
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list();
      return allUsers.map(u => ({
        ...u,
        role: u.role || 'user',
        permissions: getPermissionsForRole(u.role)
      }));
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }) => {
      await base44.auth.updateMe({ role: newRole });
      return { userId, newRole };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      setShowEditDialog(false);
      setSelectedUser(null);
    },
  });

  // Check permission after hooks
  if (!isAdmin || !permissions.canManageRoles) {
    return (
      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          Only administrators can manage roles and permissions.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Role & Permission Management
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage user roles and permissions. All changes require backend validation.
          </p>
        </div>
      </div>

      {/* Role Hierarchy Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-blue-900">Role Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <span className="font-semibold">Admin:</span> Full access, can manage roles and users
            </p>
            <p>
              <span className="font-semibold">Subscriber:</span> Property management & operations
            </p>
            <p>
              <span className="font-semibold">Sales:</span> Sales demos and prospect research
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Total: {users.length} user(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Failed to load users: {error.message}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {users.map(user => (
                <UserRoleCard
                  key={user.id}
                  user={user}
                  onEdit={() => {
                    setSelectedUser(user);
                    setShowEditDialog(true);
                  }}
                  onUpdate={(newRole) => {
                    updateUserRoleMutation.mutate({ userId: user.id, newRole });
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      {selectedUser && (
        <EditRoleDialog
          user={selectedUser}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSave={(newRole) => {
            updateUserRoleMutation.mutate({ userId: selectedUser.id, newRole });
          }}
          isLoading={updateUserRoleMutation.isPending}
        />
      )}
    </div>
  );
}

function UserRoleCard({ user, onEdit, onUpdate }) {
  const roleColors = {
    admin: 'bg-red-100 text-red-800',
    subscriber: 'bg-blue-100 text-blue-800',
    sales: 'bg-amber-100 text-amber-800',
    user: 'bg-slate-100 text-slate-800',
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <p className="font-medium text-foreground">{user.full_name || user.email}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <div className="mt-2 flex items-center gap-2">
          <Badge className={roleColors[user.role]}>
            {user.role}
          </Badge>
          {user.permissions?.canManageRoles && (
            <Badge variant="outline" className="text-xs">
              Can Manage Roles
            </Badge>
          )}
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
        className="gap-2"
      >
        <Edit2 className="w-3.5 h-3.5" />
        Edit Role
      </Button>
    </div>
  );
}

function EditRoleDialog({ user, open, onOpenChange, onSave, isLoading }) {
  const [selectedRole, setSelectedRole] = useState(user.role);

  const roles = [
    { value: 'admin', label: 'Administrator', description: 'Full access and control' },
    { value: 'subscriber', label: 'Subscriber', description: 'Property management access' },
    { value: 'sales', label: 'Sales Staff', description: 'Sales and demo tools' },
    { value: 'user', label: 'Standard User', description: 'Read-only access' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Role for {user.full_name || user.email}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Current role: <span className="font-semibold">{user.role}</span>
          </div>

          <div className="space-y-3">
            {roles.map(role => (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`w-full text-left p-3 border-2 rounded-lg transition-colors ${
                  selectedRole === role.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    selectedRole === role.value ? 'border-primary bg-primary' : 'border-border'
                  }`}>
                    {selectedRole === role.value && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{role.label}</p>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm">
              Role changes are effective immediately. The backend will validate all permissions on next action.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => onSave(selectedRole)}
              disabled={selectedRole === user.role || isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Role
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Map role to its permissions
 */
function getPermissionsForRole(role) {
  const rolePermissions = {
    admin: {
      canManageRoles: true,
      canManageUsers: true,
      canAccessAuditLogs: true,
      canCreateDemos: true,
      canConfigureIntegrations: true,
    },
    subscriber: {
      canManageRoles: false,
      canManageUsers: true,
      canAccessAuditLogs: false,
      canCreateDemos: false,
      canConfigureIntegrations: true,
    },
    sales: {
      canManageRoles: false,
      canManageUsers: false,
      canAccessAuditLogs: false,
      canCreateDemos: true,
      canConfigureIntegrations: false,
    },
    user: {
      canManageRoles: false,
      canManageUsers: false,
      canAccessAuditLogs: false,
      canCreateDemos: false,
      canConfigureIntegrations: false,
    },
  };

  return rolePermissions[role] || rolePermissions.user;
}