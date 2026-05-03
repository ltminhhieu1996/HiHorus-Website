import React from 'react';
import { Minus, Plus, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function IOPInput({ label, value, onChange, unit, step = 0.5, min = 0, max = 100, tooltip }) {
  const decrement = () => onChange(Math.max(min, +(value - step).toFixed(2)));
  const increment = () => onChange(Math.min(max, +(value + step).toFixed(2)));

  return (
    <div className="mb-5">
      <div className="flex items-center gap-1.5 mb-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent><p className="text-xs max-w-[200px]">{tooltip}</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex items-center gap-0 bg-muted rounded-xl p-1">
        <button
          onClick={decrement}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
        >
          <Minus className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex-1 text-center">
          <input
            type="number"
            value={value}
            onChange={e => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
            }}
            className="w-24 text-center text-xl font-semibold bg-transparent border-none outline-none text-foreground"
          />
          <span className="text-xs text-muted-foreground ml-1">{unit}</span>
        </div>
        <button
          onClick={increment}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
        >
          <Plus className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}