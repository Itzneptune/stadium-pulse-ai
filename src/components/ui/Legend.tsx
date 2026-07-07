import React from 'react';
import { CATEGORY_COLORS, Category, Severity, getSeverityStyles, getSeverityFill } from '@/lib/design/tokens';
import { cn } from '@/lib/utils';

export function Legend() {
  const categories: Category[] = [
    'MEDICAL', 'SECURITY', 'FACILITY', 'CROWD', 'CONCESSION', 'RESTROOM', 'ACCESSIBILITY', 'TRANSIT', 'GATE'
  ];

  const severities: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  return (
    <div className="surface-card p-6 rounded-2xl flex flex-col gap-6">
      <div>
        <h3 className="text-h3 mb-4">Category Colors</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <div key={cat} className={cn("px-3 py-1 rounded-md text-xs font-bold tracking-wider", CATEGORY_COLORS[cat])}>
              {cat}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-h3 mb-4">Severity Scale</h3>
        <div className="flex flex-wrap gap-4 items-center">
          {severities.map(sev => (
            <div key={sev} className="flex flex-col items-center gap-2">
              {/* Badge format */}
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-bold tracking-wider border text-red-500", // using red as base for demo
                getSeverityStyles(sev)
              )}>
                {sev}
              </div>
              {/* Map Fill Format */}
              <svg width="24" height="24" viewBox="0 0 24 24" className="border border-wc-surface-hover rounded">
                <rect width="24" height="24" className={getSeverityFill(sev)} />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
