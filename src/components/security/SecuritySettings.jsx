import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, Eye, AlertCircle, CheckCircle2, Smartphone } from 'lucide-react';

export default function SecuritySettings() {
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFAMethod, setTwoFAMethod] = useState('totp');
  const [newIP, setNewIP] = useState('');
  const [ipDescription, setIPDescription] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user-security'],
    queryFn: () => base44.auth.me(),
    staleTime: 60 * 1000
  });

  const { data: twoFAStatus } = useQuery({
    queryKey: ['2fa-status', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const records = await base44.asServiceRole.entities.TwoFactorAuth.filter({
        user_id: user.id
      });
      return records[0] || null;
    }
  });

  const { data: whitelistIPs = [] } = useQuery({
    queryKey: ['ip-whitelist'],
    queryFn: () => base44.asServiceRole.entities.IPWhitelist.filter({
      user_id: user?.id
    }),
    enabled: !!user?.id
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['security-audit'],
    queryFn: () => base44.asServiceRole.entities.SecurityAuditLog.filter(
      { user_id: user?.id },
      '-timestamp',
      50
    ),
    enabled: !!user?.id
  });

  const setup2FAMutation = useMutation({
    mutationFn: async () => {
      return base44.functions.invoke('setup2FA', { method: twoFAMethod });
    },
    onSuccess: () => {
      setShow2FASetup(false);
    }
  });

  const addIPMutation = useMutation({
    mutationFn: async () => {
      return base44.functions.invoke('addIPWhitelist', {
        ip_address: newIP,
        description: ipDescription
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ip-whitelist'] });
      setNewIP('');
      setIPDescription('');
    }
  });

  const gdprMutation = useMutation({
    mutationFn: async (type) => {
      return base44.functions.invoke('requestGDPRData', {
        request_type: type
      });
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Tabs defaultValue="2fa" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="2fa">2FA</TabsTrigger>
          <TabsTrigger value="ip">IP Whitelist</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR</TabsTrigger>
        </TabsList>

        {/* 2FA Tab */}
        <TabsContent value="2fa">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Two-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {twoFAStatus?.enabled ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 font-semibold">
                    <CheckCircle2 className="w-5 h-5" />
                    2FA is enabled
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    Using {twoFAStatus.method.toUpperCase()} method
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-700 font-semibold">
                    <AlertCircle className="w-5 h-5" />
                    2FA is not enabled
                  </div>
                  <p className="text-sm text-yellow-600 mt-2">
                    Add an extra layer of security to your account
                  </p>
                </div>
              )}

              {!show2FASetup && !twoFAStatus?.enabled && (
                <Button 
                  onClick={() => setShow2FASetup(true)}
                  className="w-full"
                >
                  Enable 2FA
                </Button>
              )}

              {show2FASetup && (
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                  <label className="text-sm font-medium">Choose 2FA method:</label>
                  <select
                    value={twoFAMethod}
                    onChange={e => setTwoFAMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded"
                  >
                    <option value="totp">Authenticator App (TOTP)</option>
                    <option value="sms">SMS Text Message</option>
                    <option value="email">Email Code</option>
                  </select>
                  <Button 
                    onClick={() => setup2FAMutation.mutate()}
                    disabled={setup2FAMutation.isPending}
                    className="w-full"
                  >
                    {setup2FAMutation.isPending ? 'Setting up...' : 'Continue Setup'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* IP Whitelist Tab */}
        <TabsContent value="ip">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                IP Whitelist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <input
                  type="text"
                  value={newIP}
                  onChange={e => setNewIP(e.target.value)}
                  placeholder="192.168.1.0/24 or 203.0.113.45"
                  className="w-full px-3 py-2 border border-slate-200 rounded"
                />
                <input
                  type="text"
                  value={ipDescription}
                  onChange={e => setIPDescription(e.target.value)}
                  placeholder="e.g., Office network"
                  className="w-full px-3 py-2 border border-slate-200 rounded"
                />
                <Button 
                  onClick={() => addIPMutation.mutate()}
                  disabled={!newIP || addIPMutation.isPending}
                  className="w-full"
                >
                  Add IP
                </Button>
              </div>

              <div className="space-y-2">
                {whitelistIPs.map(ip => (
                  <div key={ip.id} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm font-semibold">{ip.ip_address}</p>
                      <p className="text-xs text-slate-600">{ip.description}</p>
                    </div>
                    <Badge variant={ip.status === 'active' ? 'default' : 'secondary'}>
                      {ip.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Security Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-3 border border-slate-200 rounded-lg text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        {log.event_type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-600">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    {log.ip_address && (
                      <p className="text-xs text-slate-600 font-mono">{log.ip_address}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GDPR Tab */}
        <TabsContent value="gdpr">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Data Protection (GDPR)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-700">
                Exercise your GDPR rights. We'll respond within 30 days.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => gdprMutation.mutate('access')}
                  disabled={gdprMutation.isPending}
                  variant="outline"
                  className="w-full text-left justify-start"
                >
                  Request Data Access
                </Button>
                <Button 
                  onClick={() => gdprMutation.mutate('portability')}
                  disabled={gdprMutation.isPending}
                  variant="outline"
                  className="w-full text-left justify-start"
                >
                  Request Data Portability
                </Button>
                <Button 
                  onClick={() => gdprMutation.mutate('deletion')}
                  disabled={gdprMutation.isPending}
                  variant="destructive"
                  className="w-full"
                >
                  Request Data Deletion
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}