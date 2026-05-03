import React from 'react';

export default function IOPGauge({ correctedIOP, targetIOP }) {
  const minRange = 5;
  const maxRange = 45;
  const total = maxRange - minRange;

  const correctedPct = Math.min(100, Math.max(0, ((correctedIOP - minRange) / total) * 100));
  const targetPct = Math.min(100, Math.max(0, ((targetIOP - minRange) / total) * 100));

  const ticks = [5, 10, 15, 17.2, 21, 30, 45];

  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-primary">⊙</span>
        <span className="text-sm font-semibold">Biểu đồ Nhãn áp</span>
      </div>

      <div className="mb-2">
        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
          <span className="w-3 h-1.5 rounded-full bg-green-400 inline-block"></span>
          Vùng mục tiêu
        </p>
      </div>

      {/* Gauge bar */}
      <div className="relative h-7 rounded-full overflow-hidden bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 mb-2">
        {/* Target zone overlay */}
        <div
          className="absolute top-0 h-full bg-green-400/40 border-l-2 border-r-2 border-green-600/50"
          style={{
            left: `${Math.max(0, targetPct - 5)}%`,
            width: '10%',
          }}
        />
        {/* Corrected IOP marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-3 border-primary shadow-lg flex items-center justify-center z-10"
          style={{ left: `calc(${correctedPct}% - 10px)` }}
        >
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
        {/* Target marker */}
        <div
          className="absolute -top-1 w-0 h-0 z-10"
          style={{
            left: `calc(${targetPct}% - 5px)`,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '6px solid hsl(var(--primary))',
          }}
        />
      </div>

      {/* Tick labels - 2 rows: odd ticks top, even ticks bottom, target always shown */}
      <div className="relative h-8 mb-3">
        {[5, 15, 21, 30, 45].map((v, i) => {
          const pct = ((v - minRange) / total) * 100;
          // hide tick if too close to target label
          const tooClose = Math.abs(pct - targetPct) < 8;
          if (tooClose) return null;
          const isTop = i % 2 === 0;
          return (
            <span
              key={v}
              className="absolute text-[10px] text-muted-foreground -translate-x-1/2"
              style={{ left: `${pct}%`, top: isTop ? 0 : 14 }}
            >
              {v}
            </span>
          );
        })}
        {/* Target label always shown, opposite row from nearby ticks */}
        <span
          className="absolute text-[10px] font-bold text-primary -translate-x-1/2 bg-primary/10 px-1 rounded"
          style={{ left: `${Math.min(92, Math.max(8, targetPct))}%`, top: 0 }}
        >
          ▼{targetIOP.toFixed(1)}
        </span>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-center gap-3 text-sm">
        <span className="font-semibold">{correctedIOP.toFixed(1)} mmHg</span>
        <span className="text-muted-foreground">→</span>
        <span className="font-semibold text-primary">{targetIOP.toFixed(1)} mmHg</span>
        <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
          -{Math.round(((correctedIOP - targetIOP) / correctedIOP) * 100)}%
        </span>
      </div>
    </div>
  );
}