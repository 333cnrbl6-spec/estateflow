import React, { useState } from 'react';
import { AlertTriangle, Phone, Mail, Info, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function ServiceRedirectDialog({ 
  open, 
  onOpenChange, 
  call, 
  gap, 
  alternativeServices,
  onRedirectComplete 
}) {
  const [selectedService, setSelectedService] = useState(null);
  const [notifyAccountHolder, setNotifyAccountHolder] = useState(true);
  const [notifySupplier, setNotifySupplier] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRedirect = async () => {
    setIsProcessing(true);
    // Email notifications would be handled here
    setTimeout(() => {
      onRedirectComplete({
        selectedService,
        notifyAccountHolder,
        notifySupplier,
        gapType: gap
      });
      setIsProcessing(false);
      onOpenChange(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
            Service Gap - External Redirect
          </DialogTitle>
          <DialogDescription>
            This issue type is not covered by the subscribed package. Redirecting to suitable service provider.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Issue */}
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Issue Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Property:</span>
                <span className="font-medium">{call.matched_property_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issue Type:</span>
                <span className="font-medium">{call.call_type?.replace(/_/g, ' ').toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subscription Gap:</span>
                <span className="font-medium text-amber-700">{gap?.replace(/_/g, ' ').toUpperCase()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Services */}
          {alternativeServices && alternativeServices.length > 0 ? (
            <div className="space-y-3">
              <p className="font-medium text-sm">Recommended Service Providers:</p>
              {alternativeServices.map((service, idx) => (
                <label
                  key={idx}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedService?.id === service.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-border hover:bg-secondary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedService?.id === service.id}
                      onCheckedChange={() => setSelectedService(service)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{service.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        {service.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-blue-600" />
                            <span>{service.phone}</span>
                          </div>
                        )}
                        {service.availability && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-green-600" />
                            <span>{service.availability}</span>
                          </div>
                        )}
                        {service.typical_response && (
                          <span className="text-muted-foreground">{service.typical_response}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <p className="text-sm text-blue-900">
                  No service providers available for this issue type. Consider: contacting local emergency services (999 for life-threatening), local authority (for gas leaks), or building surveyor for non-urgent matters.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Send Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={notifyAccountHolder}
                  onCheckedChange={setNotifyAccountHolder}
                />
                <span className="text-sm">
                  Email account holder about service gap & provider details
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={notifySupplier}
                  onCheckedChange={setNotifySupplier}
                />
                <span className="text-sm">
                  Email recommended supplier to log call request
                </span>
              </label>
            </CardContent>
          </Card>

          {/* Call Logging Notes */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="w-4 h-4" />
                Redirect Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>✓ Caller has been informed of service gap</p>
              <p>✓ Alternative provider details have been provided</p>
              <p>✓ Caller will contact provider directly (if available)</p>
              <p>✓ Call will be logged with redirect reason</p>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRedirect}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            {isProcessing ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Complete Redirect
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}