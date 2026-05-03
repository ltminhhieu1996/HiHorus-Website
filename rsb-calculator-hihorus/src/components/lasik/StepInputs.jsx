import React from "react";

export function useHoldButton(value, onChange, step, min, max, round) {
  const valueRef = React.useRef(value);
  const timerRef = React.useRef(null);
  const deltaRef = React.useRef(0);
  const holdFiredRef = React.useRef(false);
  React.useEffect(() => {valueRef.current = value;}, [value]);

  const clamp = (v) => {
    if (min !== undefined && v < min) return min;
    if (max !== undefined && v > max) return max;
    return v;
  };

  const start = (e, delta) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    deltaRef.current = delta;
    holdFiredRef.current = false;
    timerRef.current = setTimeout(() => {
      holdFiredRef.current = true;
      const fire = () => {
        const next = clamp(round(valueRef.current + deltaRef.current));
        valueRef.current = next;
        onChange(String(next));
        timerRef.current = setTimeout(fire, 130);
      };
      fire();
    }, 1000);
  };

  const stop = () => {
    clearTimeout(timerRef.current);
    if (!holdFiredRef.current) {
      const next = clamp(round(valueRef.current + deltaRef.current));
      valueRef.current = next;
      onChange(String(next));
    }
    holdFiredRef.current = false;
  };

  const cancel = () => {
    clearTimeout(timerRef.current);
    holdFiredRef.current = false;
  };

  return { start, stop, cancel };
}

export function StepInput({ label, value, onChange, unit, step = 0.25, min, max, hint, decimals = 2, dark, showSign = false }) {
  const [editing, setEditing] = React.useState(false);
  const [raw, setRaw] = React.useState("");

  const roundQ = (v) => Math.round(v * 10000) / 10000;
  const clamp = (v) => {
    if (min !== undefined && v < min) return min;
    if (max !== undefined && v > max) return max;
    return v;
  };

  const dec = useHoldButton(parseFloat(value), onChange, step, min, max, roundQ);
  const inc = useHoldButton(parseFloat(value), onChange, step, min, max, roundQ);

  const displayVal = () => {
    const num = parseFloat(value);
    const formatted = num.toFixed(decimals);
    return (showSign && num > 0) ? `+${formatted}` : formatted;
  };

  const commitEdit = () => {
    const parsed = parseFloat(raw.replace(",", "."));
    if (!isNaN(parsed)) onChange(String(clamp(roundQ(parsed))));
    setEditing(false);
  };

  const btnStyle = {
    background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.02)",
    border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
    color: dark ? "#e2e8f0" : "#475569"
  };

  const displayStyle = {
    background: dark ? "#0f172a" : "white",
    border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0"
  };

  return (
    <div className="mb-3.5">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium tracking-wide" style={{ color: dark ? "#94a3b8" : "#64748b" }}>{label}</label>
        {hint && <span className="text-[10px] rounded px-1.5 py-0.5" style={{ color: dark ? "#64748b" : "#94a3b8", background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc", border: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #f1f5f9" }}>{hint}</span>}
      </div>
      <div className="flex items-center gap-2">
        <button
          onPointerDown={(e) => dec.start(e, -step)} onPointerUp={dec.stop} onPointerCancel={dec.cancel} onPointerLeave={dec.cancel}
          className="w-8 h-8 rounded-lg text-lg font-light flex items-center justify-center transition-all flex-shrink-0 select-none touch-none"
          style={btnStyle}>
          −
        </button>
        {editing ? (
          <input autoFocus
            className="flex-1 rounded-lg text-center text-sm font-bold outline-none tabular-nums shadow-sm"
            style={{ background: dark ? "#1e293b" : "white", border: "1px solid #3b82f6", color: dark ? "#f1f5f9" : "#0f172a", height: "2rem", minHeight: "2rem", maxHeight: "2rem", boxSizing: "border-box", padding: "0", lineHeight: "2rem" }}
            value={raw} onChange={(e) => setRaw(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditing(false);}} />
        ) : (
          <div
            className="flex-1 flex items-center justify-center rounded-lg h-8 gap-1.5 cursor-text transition-colors shadow-sm"
            style={displayStyle}
            onClick={() => {setRaw(displayVal()); setEditing(true);}}>
            <span className="text-sm font-bold tabular-nums" style={{ color: dark ? "#f1f5f9" : "#0f172a" }}>{displayVal()}</span>
            <span className="text-xs" style={{ color: dark ? "#64748b" : "#94a3b8" }}>{unit}</span>
          </div>
        )}
        <button
          onPointerDown={(e) => inc.start(e, step)} onPointerUp={inc.stop} onPointerCancel={inc.cancel} onPointerLeave={inc.cancel}
          className="w-8 h-8 rounded-lg text-lg font-light flex items-center justify-center transition-all flex-shrink-0 select-none touch-none"
          style={btnStyle}>
          +
        </button>
      </div>
    </div>
  );
}

export function NumberStepInput({ label, value, onChange, unit, step = 1, min, max, hint, dark }) {
  const [editing, setEditing] = React.useState(false);
  const [raw, setRaw] = React.useState("");

  const roundInt = (v) => Math.round(v);
  const clamp = (v) => {
    if (min !== undefined && v < min) return min;
    if (max !== undefined && v > max) return max;
    return v;
  };

  const dec = useHoldButton(parseFloat(value), onChange, step, min, max, roundInt);
  const inc = useHoldButton(parseFloat(value), onChange, step, min, max, roundInt);

  const commitEdit = () => {
    const parsed = parseFloat(raw.replace(",", "."));
    if (!isNaN(parsed)) onChange(String(clamp(Math.round(parsed))));
    setEditing(false);
  };

  const btnStyle = {
    background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.02)",
    border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
    color: dark ? "#e2e8f0" : "#475569"
  };

  const displayStyle = {
    background: dark ? "#0f172a" : "white",
    border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0"
  };

  return (
    <div className="mb-3.5">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium tracking-wide" style={{ color: dark ? "#94a3b8" : "#64748b" }}>{label}</label>
        {hint && <span className="text-[10px] rounded px-1.5 py-0.5" style={{ color: dark ? "#64748b" : "#94a3b8", background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc", border: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #f1f5f9" }}>{hint}</span>}
      </div>
      <div className="flex items-center gap-2">
        <button
          onPointerDown={(e) => dec.start(e, -step)} onPointerUp={dec.stop} onPointerCancel={dec.cancel} onPointerLeave={dec.cancel}
          className="w-8 h-8 rounded-lg text-lg font-light flex items-center justify-center transition-all flex-shrink-0 select-none touch-none"
          style={btnStyle}>
          −
        </button>
        {editing ? (
          <input autoFocus
            className="flex-1 rounded-lg text-center text-sm font-bold outline-none tabular-nums shadow-sm"
            style={{ background: dark ? "#1e293b" : "white", border: "1px solid #3b82f6", color: dark ? "#f1f5f9" : "#0f172a", height: "2rem", minHeight: "2rem", maxHeight: "2rem", boxSizing: "border-box", padding: "0", lineHeight: "2rem" }}
            value={raw} onChange={(e) => setRaw(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditing(false);}} />
        ) : (
          <div
            className="flex-1 flex items-center justify-center rounded-lg h-8 gap-1.5 cursor-text transition-colors shadow-sm"
            style={displayStyle}
            onClick={() => {setRaw(String(value)); setEditing(true);}}>
            <span className="text-sm font-bold tabular-nums" style={{ color: dark ? "#f1f5f9" : "#0f172a" }}>{value}</span>
            <span className="text-xs" style={{ color: dark ? "#64748b" : "#94a3b8" }}>{unit}</span>
          </div>
        )}
        <button
          onPointerDown={(e) => inc.start(e, step)} onPointerUp={inc.stop} onPointerCancel={inc.cancel} onPointerLeave={inc.cancel}
          className="w-8 h-8 rounded-lg text-lg font-light flex items-center justify-center transition-all flex-shrink-0 select-none touch-none"
          style={btnStyle}>
          +
        </button>
      </div>
    </div>
  );
}