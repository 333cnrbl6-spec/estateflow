import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SubscriptionManager from '@/components/billing/SubscriptionManager';
import AccountSettings from '@/components/billing/AccountSettings';
import SupportTicketForm from '@/components/support/SupportTicketForm';

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Billing & Account</h1>
          <p className="text-lg text-slate-600">Manage your subscription, payment methods, and account settings</p>
        </div>

        <Tabs defaultValue="subscription" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="subscription" className="space-y-6">
            <SubscriptionManager />
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <AccountSettings />
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <SupportTicketForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}