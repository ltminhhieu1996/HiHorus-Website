import React from 'react';
import { cn } from '@/lib/utils';

function getRiskLabel(pct, lang) {
  if (pct <= 20) return { label: lang === 'vi' ? 'Nguy cơ Thấp' : 'Low Risk', color: 'text-green-600' };
  if (pct <= 35) return { label: lang === 'vi' ? 'Nguy cơ Vừa' : 'Moderate Risk', color: 'text-yellow-600' };
  return { label: lang === 'vi' ? 'Nguy cơ Cao' : 'High Risk', color: 'text-red-500' };
}

export default function ResultCards({ correctedIOP, targetIOP, reductionPct, lang = 'vi' }) {
  const risk = getRiskLabel(reductionPct, lang);
  const targetMin = Math.max(0, targetIOP - 1).toFixed(1);
  const targetMax = (targetIOP + 1).toFixed(1);

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-card rounded-2xl p-4 border border-border shadow-sm text-center">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
          {lang === 'vi' ? 'Nhãn áp hiệu chỉnh' : 'Corrected IOP'}
        </p>
        <p className="text-3xl font-bold text-foreground">{correctedIOP.toFixed(1)}</p>
        <p className="text-xs text-muted-foreground">mmHg</p>
        <p className="text-[10px] text-muted-foreground/70 mt-1">
          {lang === 'vi' ? 'Đã hiệu chỉnh CCT' : 'CCT Corrected'}
        </p>
      </div>

      <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20 shadow-sm text-center">
        <p className="text-[10px] font-medium text-primary uppercase tracking-wide mb-1">
          {lang === 'vi' ? 'Nhãn áp đích' : 'Target IOP'}
        </p>
        <p className="text-3xl font-bold text-primary">{targetIOP.toFixed(1)}</p>
        <p className="text-xs text-primary/70">mmHg</p>
        <p className="text-[10px] text-primary/50 mt-1">({targetMin} - {targetMax} mmHg)</p>
      </div>

      <div className="bg-card rounded-2xl p-4 border border-border shadow-sm text-center">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
          {lang === 'vi' ? 'Mức giảm cần đạt' : 'Target Reduction'}
        </p>
        <p className="text-3xl font-bold text-foreground">{Math.round(reductionPct)}%</p>
        <p className={cn("text-xs font-medium mt-1", risk.color)}>{risk.label}</p>
      </div>
    </div>
  );
}