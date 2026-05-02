import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeatureLocked({ feature, tier = 'Professional' }) {
  return (
    <Card className="border-yellow-200 bg-yellow-50 p-8">
      <div className="flex flex-col items-center text-center gap-4">
        <Lock className="w-12 h-12 text-yellow-600" />
        <div>
          <h3 className="font-bold text-slate-900 mb-2">{feature} is a {tier} feature</h3>
          <p className="text-sm text-slate-600 mb-4">Upgrade your plan to unlock this capability.</p>
        </div>
        <Button asChild>
          <Link to="/billing">Upgrade Plan</Link>
        </Button>
      </div>
    </Card>
  );
}