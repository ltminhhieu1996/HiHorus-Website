import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, X } from 'lucide-react';
import { Drawer } from 'vaul';
import ResultCards from './ResultCards';
import IOPGauge from './IOPGauge';
import CalculationDetails from './CalculationDetails';
import ClinicalRecommendation from './ClinicalRecommendation';

function getRisk(pct, lang) {
  if (pct <= 20) return { label: lang === 'vi' ? 'Nguy cơ Thấp' : 'Low Risk', color: 'text-green-500' };
  if (pct <= 35) return { label: lang === 'vi' ? 'Nguy cơ Vừa' : 'Moderate Risk', color: 'text-yellow-500' };
  return { label: lang === 'vi' ? 'Nguy cơ Cao' : 'High Risk', color: 'text-red-500' };
}

export default function MobileResultBar({ correctedIOP, targetIOP, reductionPct, lang, method, z, y, aaoLevel, clinicalStage }) {
  const [open, setOpen] = useState(false);
  const risk = getRisk(reductionPct, lang);

  return (
    <div className="lg:hidden">
      <Drawer.Root open={open} onOpenChange={setOpen}>
        {/* Sticky bar */}
        <Drawer.Trigger asChild>
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-xl cursor-pointer">
            {/* Pull indicator */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-8 h-1 rounded-full bg-border" />
            </div>
            <div className="px-4 pb-4 pt-1">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {lang === 'vi' ? 'NA Hiệu chỉnh' : 'Corrected IOP'}
                  </p>
                  <p className="text-xl font-bold text-foreground">{correctedIOP.toFixed(1)}</p>
                  <p className="text-[10px] text-muted-foreground">mmHg</p>
                </div>
                <div className="border-x border-border">
                  <p className="text-[10px] text-primary uppercase tracking-wide font-semibold">
                    {lang === 'vi' ? 'NA Đích' : 'Target IOP'}
                  </p>
                  <p className="text-xl font-bold text-primary">{targetIOP.toFixed(1)}</p>
                  <p className="text-[10px] text-muted-foreground">mmHg</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {lang === 'vi' ? 'Mức giảm' : 'Reduction'}
                  </p>
                  <p className="text-xl font-bold text-foreground">{Math.round(reductionPct)}%</p>
                  <p className={cn("text-[10px] font-semibold", risk.color)}>{risk.label}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <ChevronUp className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-primary font-medium">
                  {lang === 'vi' ? 'Xem chi tiết' : 'View details'}
                </span>
              </div>
            </div>
          </div>
        </Drawer.Trigger>

        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl flex flex-col max-h-[92vh]">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-10 h-1.5 rounded-full bg-border" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 shrink-0 border-b border-border">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {lang === 'vi' ? 'Kết quả Tính toán' : 'Calculation Results'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {lang === 'vi' ? 'Nhãn áp đích chi tiết' : 'Detailed target IOP'}
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-4 py-4 space-y-4 pb-8">
              <ResultCards correctedIOP={correctedIOP} targetIOP={targetIOP} reductionPct={reductionPct} lang={lang} />
              <IOPGauge correctedIOP={correctedIOP} targetIOP={targetIOP} />
              <CalculationDetails
                method={method}
                correctedIOP={correctedIOP}
                targetIOP={targetIOP}
                z={z}
                y={y}
                aaoLevel={aaoLevel}
                clinicalStage={clinicalStage}
                lang={lang}
              />
              <ClinicalRecommendation reductionPct={reductionPct} lang={lang} />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}