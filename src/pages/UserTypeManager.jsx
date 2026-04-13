import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Shield, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Key,
  Building2,
  MapPin
} from 'lucide-react';
import { toast } from "sonner";

export default function UserTypeManager() {
  const [activeTab, setActiveTab] = useState("types");
  const [editingType, setEditingType] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch user types
  const { data: userTypes, isLoading } = useQuery({
    queryKey: ['user-types'],
    queryFn: async () => {
      const types = await base44.entities.UserType.list();
      return types || [];
    }
  });

  // Fetch user roles
  const { data: userRoles } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const roles = await base44.entities.UserRole.list();
      return roles || [];
    }
  });

  // Create/Update user type mutation
  const saveUserTypeMutation = useMutation({
    mutationFn: async (userData) => {
      if (userData.id) {
        return await base44.entities.UserType.update(userData.id, userData);
      } else {
        return await base44.entities.UserType.create(userData);
      }
    },
    onSuccess: () => {
      toast.success('User type saved successfully');
      queryClient.invalidateQueries({ queryKey: ['user-types'] });
      setIsDialogOpen(false);
      setEditingType(null);
    },
    onError: (error) => {
      toast.error('Failed to save user type: ' + error.message);
    }
  });

  // Delete user type mutation
  const deleteUserTypeMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.UserType.delete(id);
    },
    onSuccess: () => {
      toast.success('User type deleted');
      queryClient.invalidateQueries({ queryKey: ['user-types'] });
    },
    onError: (error) => {
      toast.error('Failed to delete: ' + error.message);
    }
  });

  // Initialize default types
  const initializeDefaultsMutation = useMutation({
    mutationFn: async () => {
      const module = await import('@/lib/userTypeManager');
      return await module.default.initializeDefaultUserTypes();
    },
    onSuccess: () => {
      toast.success('Default user types initialized');
      queryClient.invalidateQueries({ queryKey: ['user-types'] });
    }
  });

  const handleSave = (data) => {
    saveUserTypeMutation.mutate(data);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this user type?')) {
      deleteUserTypeMutation.mutate(id);
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setIsDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingType(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">User Type Manager</h1>
            <p className="text-muted-foreground">
              Configure modular user types with intelligent data scoping and permissions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => initializeDefaultsMutation.mutate()}
              disabled={initializeDefaultsMutation.isPending}
            >
              <Settings className="w-4 h-4 mr-2" />
              Initialize Defaults
            </Button>
            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Create User Type
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="types">
            <Shield className="w-4 h-4 mr-2" />
            User Types ({userTypes?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <Users className="w-4 h-4 mr-2" />
            User Assignments ({userRoles?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Key className="w-4 h-4 mr-2" />
            Permission Matrix
          </TabsTrigger>
        </TabsList>

        {/* User Types Tab */}
        <TabsContent value="types" className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Loading user types...</p>
              </CardContent>
            </Card>
          ) : userTypes && userTypes.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userTypes.map((type) => (
                <Card key={type.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {type.display_name}
                          {!type.enabled && (
                            <Badge variant="secondary" className="text-xs">
                              Disabled
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{type.type_name}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Data Scoping:</span>
                        <div className="flex gap-1">
                          {type.data_scope?.company_filter && (
                            <Badge variant="outline" className="text-xs">
                              <Building2 className="w-3 h-3 mr-1" />
                              Company
                            </Badge>
                          )}
                          {type.data_scope?.property_filter && (
                            <Badge variant="outline" className="text-xs">
                              <Building2 className="w-3 h-3 mr-1" />
                              Properties
                            </Badge>
                          )}
                          {type.data_scope?.region_filter && (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="w-3 h-3 mr-1" />
                              Region
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Default Dashboard:</span>
                        <Badge variant="secondary" className="text-xs">
                          {type.ui_config?.default_dashboard || '/dashboard'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(type)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDelete(type.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No user types configured. Click "Initialize Defaults" to create standard user types, or "Create User Type" to add a custom one.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* User Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Role Assignments</CardTitle>
              <CardDescription>
                Manage which users have which roles and data access
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userRoles && userRoles.length > 0 ? (
                <div className="space-y-4">
                  {userRoles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{role.user_email}</p>
                          <p className="text-sm text-muted-foreground">
                            {role.user_type} • {role.company_name || 'No company'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          {role.assigned_properties?.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {role.assigned_properties.length} properties
                            </p>
                          )}
                          {role.assigned_regions?.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {role.assigned_regions.length} regions
                            </p>
                          )}
                        </div>
                        <Badge variant={role.is_active ? 'default' : 'secondary'}>
                          {role.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No user role assignments yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permission Matrix Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>
                Overview of permissions across user types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Entity Permissions</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Entity</th>
                          <th className="text-center p-2">Subscriber</th>
                          <th className="text-center p-2">Sales Person</th>
                          <th className="text-center p-2">Developer</th>
                          <th className="text-center p-2">Admin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['Property', 'Unit', 'Tenant', 'Company', 'FinancialTransaction', 'SalesLead', 'SalesListing'].map((entity) => (
                          <tr key={entity} className="border-b">
                            <td className="p-2 font-medium">{entity}</td>
                            <td className="text-center p-2">
                              <Badge variant="outline" className="text-xs">Read/Write</Badge>
                            </td>
                            <td className="text-center p-2">
                              <Badge variant="outline" className="text-xs">Read Only</Badge>
                            </td>
                            <td className="text-center p-2">
                              <Badge variant="outline" className="text-xs">Full</Badge>
                            </td>
                            <td className="text-center p-2">
                              <Badge variant="default" className="text-xs">Admin</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Feature Access</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { feature: 'Property Management', subscriber: true, sales: false, developer: true },
                      { feature: 'Sales Pipeline', subscriber: false, sales: true, developer: false },
                      { feature: 'Financial Reporting', subscriber: true, sales: false, developer: true },
                      { feature: 'Maintenance', subscriber: true, sales: false, developer: false },
                      { feature: 'Compliance', subscriber: true, sales: false, developer: true },
                      { feature: 'Development Pipeline', subscriber: false, sales: false, developer: true }
                    ].map((item) => (
                      <div key={item.feature} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">{item.feature}</span>
                        <div className="flex gap-2">
                          <Badge variant={item.subscriber ? 'default' : 'secondary'} className="text-xs">
                            Subscriber
                          </Badge>
                          <Badge variant={item.sales ? 'default' : 'secondary'} className="text-xs">
                            Sales
                          </Badge>
                          <Badge variant={item.developer ? 'default' : 'secondary'} className="text-xs">
                            Developer
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingType ? 'Edit User Type' : 'Create User Type'}
            </DialogTitle>
            <DialogDescription>
              Configure permissions, data scoping, and UI settings
            </DialogDescription>
          </DialogHeader>
          
          <UserTypeForm
            initialData={editingType}
            onSave={handleSave}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingType(null);
            }}
            isLoading={saveUserTypeMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserTypeForm({ initialData, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    type_name: initialData?.type_name || '',
    display_name: initialData?.display_name || '',
    description: initialData?.description || '',
    enabled: initialData?.enabled ?? true,
    permissions: initialData?.permissions || {},
    ui_config: initialData?.ui_config || {},
    data_scope: initialData?.data_scope || {}
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type_name">Type Name (ID)</Label>
          <Input
            id="type_name"
            value={formData.type_name}
            onChange={(e) => setFormData({ ...formData, type_name: e.target.value })}
            placeholder="e.g., subscriber, sales_person"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="display_name">Display Name</Label>
          <Input
            id="display_name"
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            placeholder="e.g., Property Manager"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description of this user type"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="enabled"
          checked={formData.enabled}
          onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
        />
        <Label htmlFor="enabled">Enabled</Label>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Data Scoping</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="company_filter"
              checked={formData.data_scope?.company_filter || false}
              onCheckedChange={(checked) => setFormData({ 
                ...formData, 
                data_scope: { ...formData.data_scope, company_filter: checked }
              })}
            />
            <Label htmlFor="company_filter">Company Filter</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="property_filter"
              checked={formData.data_scope?.property_filter || false}
              onCheckedChange={(checked) => setFormData({ 
                ...formData, 
                data_scope: { ...formData.data_scope, property_filter: checked }
              })}
            />
            <Label htmlFor="property_filter">Property Filter</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="region_filter"
              checked={formData.data_scope?.region_filter || false}
              onCheckedChange={(checked) => setFormData({ 
                ...formData, 
                data_scope: { ...formData.data_scope, region_filter: checked }
              })}
            />
            <Label htmlFor="region_filter">Region Filter</Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="default_dashboard">Default Dashboard</Label>
        <Input
          id="default_dashboard"
          value={formData.ui_config?.default_dashboard || ''}
          onChange={(e) => setFormData({ 
            ...formData, 
            ui_config: { ...formData.ui_config, default_dashboard: e.target.value }
          })}
          placeholder="/dashboard"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </form>
  );
}