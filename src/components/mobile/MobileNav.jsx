import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Wrench, FileText, User, LogOut } from 'lucide-react';

export default function MobileNav({ currentPath, userRole, onLogout }) {
  const navItems = {
    contractor: [
      { icon: Home, label: 'Jobs', path: '/contractor' },
      { icon: FileText, label: 'Invoices', path: '/contractor#invoices' },
      { icon: User, label: 'Profile', path: '/contractor#profile' }
    ],
    tenant: [
      { icon: Home, label: 'Home', path: '/tenant-self-service' },
      { icon: Wrench, label: 'Maintenance', path: '/tenant-self-service#requests' },
      { icon: FileText, label: 'Documents', path: '/tenant-self-service#docs' },
      { icon: User, label: 'Profile', path: '/tenant-self-service#profile' }
    ]
  };

  const items = navItems[userRole] || [];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center flex-1 py-2 text-xs font-medium text-muted-foreground hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5 mb-1" />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </nav>
  );
}