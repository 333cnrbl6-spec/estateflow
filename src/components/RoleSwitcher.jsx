import React from 'react';
import { useRole } from '@/lib/RoleContext';
import { ROLES, ROLE_LABELS } from '@/lib/roleConfig';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Shield, TrendingUp, Users } from 'lucide-react';

const ROLE_ICONS = {
  sales: TrendingUp,
  admin: Shield,
  subscriber: Users,
};

const ROLE_COLORS = {
  sales: { bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  admin: { bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700' },
  subscriber: { bg: 'bg-green-50', badge: 'bg-green-100 text-green-700' },
};

export default function RoleSwitcher() {
  const { currentRole, switchRole, resetRole, demoMode, isAdmin } = useRole();

  if (!isAdmin) return null; // Only show for admins

  const RoleIcon = ROLE_ICONS[currentRole];
  const roleColor = ROLE_COLORS[currentRole];

  return (
    <div className="flex items-center gap-2">
      {demoMode && (
        <Badge variant="outline" className="gap-1 bg-amber-50 border-amber-200 text-amber-700">
          <AlertCircle className="w-3 h-3" /> Demo Mode
        </Badge>
      )}

      <DropdownMenu>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 ${roleColor.bg}`}
        >
          {RoleIcon && <RoleIcon className="w-4 h-4" />}
          <span className="text-xs font-medium">{ROLE_LABELS[currentRole]}</span>
        </Button>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Switch Role (Admin Only)</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {Object.entries(ROLES).map(([key, role]) => (
            <DropdownMenuCheckboxItem
              key={role}
              checked={currentRole === role}
              onCheckedChange={() => switchRole(role)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {React.createElement(ROLE_ICONS[role], { className: 'w-4 h-4' })}
                <div>
                  <p className="font-medium text-sm">{ROLE_LABELS[role]}</p>
                  <p className="text-xs text-muted-foreground">
                    {role === ROLES.SALES && 'View as sales staff'}
                    {role === ROLES.ADMIN && 'Full administrative access'}
                    {role === ROLES.SUBSCRIBER && 'View as subscriber'}
                  </p>
                </div>
              </div>
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />
          {demoMode && (
            <DropdownMenuItem onClick={resetRole} className="text-xs">
              Reset to Default Role
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}