import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/shared/PageHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import VirtualCallQueue from '@/components/callcenter/VirtualCallQueue';

export default function VirtualCallCenterSetup() {
  const [showQueue, setShowQueue] = useState(false);
  const [ringcentralConfig, setRingcentralConfig] = useState({
    clientId: '',
    clientSecret: '',
    serverUrl: 'https://platform.ringcentral.com',
    phoneNumber: '',
  });
  const [testCall, setTestCall] = useState({
    callerPhone: '',
    propertyAddress: '',
    callType: 'general_enquiry',
    description: '',
  });

  const testCallMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('initiateRingcentralCall', testCall);
      return response.data;
    },
  });

  const handleTestCall = async (e) => {
    e.preventDefault();
    if (!testCall.callerPhone) {
      alert('Please enter a caller phone number');
      return;
    }
    await testCallMutation.mutateAsync();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Virtual Call Center"
        subtitle="RingCentral-powered inbound call handling with queue management"
      />

      {!showQueue ? (
        <>
          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  To enable virtual call center, you need to:
                  <ol className="list-decimal list-inside mt-2 space-y-2 text-sm">
                    <li>Create a RingCentral account at <a href="https://www.ringcentral.com" target="_blank" className="text-blue-600 underline">ringcentral.com</a></li>
                    <li>Create an API application to get Client ID and Client Secret</li>
                    <li>Set environment variables: RINGCENTRAL_CLIENT_ID, RINGCENTRAL_CLIENT_SECRET, RINGCENTRAL_PHONE_NUMBER, APP_URL</li>
                    <li>Configure your RingCentral phone number to forward to your app webhook</li>
                    <li>Install USB headset and access the virtual queue interface</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="bg-slate-100 p-4 rounded-lg space-y-3 text-sm">
                <p><strong>RingCentral Pricing:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Free trial with developer sandbox environment</li>
                  <li>Flexible business plans with included minutes</li>
                  <li>Pay-as-you-go for additional usage beyond plan</li>
                  <li>Better for small business call handling</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* RingCentral Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">RingCentral Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Client ID</Label>
                <Input
                  id="clientId"
                  placeholder="Your RingCentral Client ID"
                  value={ringcentralConfig.clientId}
                  onChange={(e) =>
                    setRingcentralConfig({ ...ringcentralConfig, clientId: e.target.value })
                  }
                  type="password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientSecret">Client Secret</Label>
                <Input
                  id="clientSecret"
                  placeholder="Your RingCentral Client Secret"
                  value={ringcentralConfig.clientSecret}
                  onChange={(e) =>
                    setRingcentralConfig({ ...ringcentralConfig, clientSecret: e.target.value })
                  }
                  type="password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">RingCentral Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="+1234567890"
                  value={ringcentralConfig.phoneNumber}
                  onChange={(e) =>
                    setRingcentralConfig({ ...ringcentralConfig, phoneNumber: e.target.value })
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                These are set as environment variables in your app settings dashboard.
              </p>
            </CardContent>
          </Card>

          {/* Test Call */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Inbound Call</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTestCall} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="callerPhone">Caller Phone Number</Label>
                  <Input
                    id="callerPhone"
                    placeholder="+1234567890"
                    value={testCall.callerPhone}
                    onChange={(e) =>
                      setTestCall({ ...testCall, callerPhone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyAddress">Property Address</Label>
                  <Input
                    id="propertyAddress"
                    placeholder="123 Main Street"
                    value={testCall.propertyAddress}
                    onChange={(e) =>
                      setTestCall({ ...testCall, propertyAddress: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Call Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Water leak in kitchen"
                    value={testCall.description}
                    onChange={(e) =>
                      setTestCall({ ...testCall, description: e.target.value })
                    }
                  />
                </div>
                <Button
                  type="submit"
                  disabled={testCallMutation.isPending}
                  className="w-full"
                >
                  {testCallMutation.isPending ? 'Initiating...' : 'Test Call'}
                </Button>
                {testCallMutation.isSuccess && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Test call initiated successfully! Check the queue below.
                    </AlertDescription>
                  </Alert>
                )}
                {testCallMutation.isError && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {testCallMutation.error?.message || 'Failed to initiate call'}
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
          </Card>

          <Button
            onClick={() => setShowQueue(true)}
            size="lg"
            className="w-full"
          >
            Go to Call Queue
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="outline"
            onClick={() => setShowQueue(false)}
            className="mb-4"
          >
            ← Back to Setup
          </Button>
          <VirtualCallQueue />
        </>
      )}
    </div>
  );
}