import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, LayoutDashboard } from 'lucide-react';

export default function DashboardHeader({ user, propertiesCount }) {
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const name = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground font-serif">
          {greeting()}, {name}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {propertiesCount > 0
            ? `Managing ${propertiesCount} propert${propertiesCount === 1 ? 'y' : 'ies'} · ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}`
            : 'Welcome to your Premiso dashboard — let\'s get started.'}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button asChild size="sm" variant="outline">
          <Link to="/properties/add">
            <Plus className="w-4 h-4" />
            Add Property
          </Link>
        </Button>
      </div>
    </div>
  );
}