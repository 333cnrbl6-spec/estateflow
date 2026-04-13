import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Link, Copy, Check, ExternalLink, Mail, QrCode } from 'lucide-react';

export default function TenantPortalAccess({ tenant }) {
  const [open, setOpen] = useState(false);
  const [portalData, setPortalData] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateToken = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateTenantToken', {
        tenant_id: tenant.id,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setPortalData(data);
      toast.success('Portal access generated successfully');
    },
    onError: (error) => {
      toast.error('Failed to generate portal access: ' + error.message);
    },
  });

  const handleCopyLink = async () => {
    if (portalData?.portal_url) {
      await navigator.clipboard.writeText(portalData.portal_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied to clipboard');
    }
  };

  const handleEmailLink = () => {
    if (tenant.email && portalData?.portal_url) {
      const subject = encodeURIComponent('Your Tenant Portal Access');
      const body = encodeURIComponent(
        `Dear ${tenant.full_name},\n\n` +
        `You have been granted access to the tenant portal for your property.\n\n` +
        `Portal Link: ${portalData.portal_url}\n\n` +
        `This link will expire on: ${new Date(portalData.expires_at).toLocaleDateString()}\n\n` +
        `Through the portal, you can:\n` +
        `- View your lease details\n` +
        `- Make rent payments\n` +
        `- Submit maintenance requests\n` +
        `- Access important documents\n` +
        `- Communicate with your property manager\n\n` +
        `Please save this link for future access.\n\n` +
        `Best regards,\n` +
        `Property Management Team`
      );
      window.open(`mailto:${tenant.email}?subject=${subject}&body=${body}`);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Link className="w-4 h-4" />
        Portal Access
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="w-5 h-5 text-primary" />
              Tenant Portal Access
            </DialogTitle>
            <DialogDescription>
              Generate secure portal access for {tenant.full_name}
            </DialogDescription>
          </DialogHeader>

          {!portalData ? (
            <div className="space-y-4 py-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm text-blue-900">What tenants can do:</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>✓ View lease and tenancy details</li>
                  <li>✓ Make rent payments (one-time or recurring)</li>
                  <li>✓ Submit and track maintenance requests</li>
                  <li>✓ Access important documents</li>
                  <li>✓ Receive notifications and updates</li>
                  <li>✓ Message property manager</li>
                </ul>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Click "Generate Access" to create a secure portal link for this tenant.</p>
                <p className="mt-2">The link will be valid for 90 days and can be regenerated at any time.</p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => generateToken.mutate()}
                  disabled={generateToken.isPending}
                  className="gap-2"
                >
                  {generateToken.isPending ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Link className="w-4 h-4" />
                      Generate Access
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tenant Info */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tenant:</span>
                  <span className="font-medium">{portalData.tenant_name}</span>
                </div>
                {portalData.property_name && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Property:</span>
                    <span className="font-medium">{portalData.property_name}</span>
                  </div>
                )}
                {portalData.unit_reference && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Unit:</span>
                    <span className="font-medium">{portalData.unit_reference}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expires:</span>
                  <Badge variant="outline" className="text-xs">
                    {new Date(portalData.expires_at).toLocaleDateString()}
                  </Badge>
                </div>
              </div>

              {/* Portal Link */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Portal Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={portalData.portal_url}
                    readOnly
                    className="text-xs font-mono"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleEmailLink}
                  className="flex-1 gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email to Tenant
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(portalData.portal_url, '_blank')}
                  className="flex-1 gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Portal
                </Button>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPortalData(null);
                    generateToken.mutate();
                  }}
                  disabled={generateToken.isPending}
                >
                  Regenerate Link
                </Button>
                <Button onClick={() => setOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}