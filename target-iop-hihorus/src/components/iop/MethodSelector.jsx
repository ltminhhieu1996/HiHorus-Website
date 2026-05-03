import React from 'react';
import { ClipboardList, BookOpen, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MethodSelector({ selected, onChange, lang }) {
  const methods = [
    { id: 'jampel', label: lang === 'vi' ? 'Jampel 1999' : 'Jampel 1999', sub: null, icon: ClipboardList },
    { id: 'aao', label: lang === 'vi' ? 'AAO Guidelines' : 'AAO Guidelines', sub: null, icon: BookOpen },
    { id: 'clinical', label: lang === 'vi' ? 'Nghiên cứu LS' : 'Clinical Studies', sub: 'Damji · CIGTS · AGIS', icon: FlaskConical },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-primary text-lg">⚡</span>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {lang === 'vi' ? 'Phương pháp tính toán' : 'Calculation Method'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {methods.map(m => {
          const Icon = m.icon;
          const active = selected === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onChange(m.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                active
                  ? "border-primary bg-accent shadow-sm"
                  : "border-border bg-card hover:border-primary/40 hover:bg-accent/50"
              )}
            >
              <Icon className={cn("w-5 h-5", active ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-xs font-medium text-center", active ? "text-primary" : "text-muted-foreground")}>
                {m.label}
              </span>
              {m.sub && (
                <span className={cn("text-[9px] text-center leading-tight", active ? "text-primary/60" : "text-muted-foreground/60")}>
                  {m.sub}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}