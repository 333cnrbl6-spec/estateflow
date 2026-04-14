import React from 'react';
import { Shield, TrendingUp } from 'lucide-react';

export default function ComplianceProtectionBadge({ size = 'default', showMessage = true }) {
  const sizeClasses = {
    default: 'p-4',
    compact: 'p-2',
    large: 'p-6'
  };

  const textSizes = {
    default: 'text-sm',
    compact: 'text-xs',
    large: 'text-base'
  };

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg`}>
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
        <div>
          <p className={`font-bold text-green-900 ${textSizes[size]}`}>Compliance Protected</p>
          {showMessage && (
            <p className="text-xs text-green-700 mt-1">
              Enterprise-grade legal protection built-in at every scale
            </p>
          )}
        </div>
      </div>
    </div>
  );
}