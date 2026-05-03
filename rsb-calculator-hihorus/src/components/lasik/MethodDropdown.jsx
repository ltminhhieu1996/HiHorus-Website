import React, { useState, useRef, useEffect } from "react";

const METHODS = [
  { value: "smartsurf", label: "SmartSurfAce - Schwind Amaris", hasFlap: false, color: "#6366f1" },
  { value: "femto", label: "FemtoLASIK - Schwind Amaris", hasFlap: true, color: "#0ea5e9" },
  { value: "smartsight", label: "SmartSight - Schwind Atos", hasFlap: true, color: "#8b5cf6" },
  { value: "clear", label: "CLEAR - Ziemer Z8", hasFlap: true, color: "#14b8a6" },
  { value: "smile_zeiss", label: "SMILE - Zeiss Visumax", hasFlap: false, color: "#f59e0b", wip: true },
  { value: "silk_jj", label: "SILK - Johnson & Johnson", hasFlap: false, color: "#ec4899", wip: true },
  { value: "femto_zeiss", label: "FemtoLASIK - Zeiss Visumax", hasFlap: true, color: "#06b6d4", wip: true },
];

export default function MethodDropdown({ method, setMethod, methodColor, dark, T, isWip, methodInfo }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="mb-4" ref={ref}>
      <label className="text-xs font-medium tracking-wide block mb-2" style={{ color: dark ? "#94a3b8" : "#64748b" }}>{T.method}</label>
      
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full rounded-lg px-3 py-2 text-sm font-semibold outline-none cursor-pointer flex items-center justify-between"
        style={{ background: dark ? "#0f172a" : "white", border: `1px solid ${methodColor}40`, color: methodColor }}
      >
        <span className="truncate text-left">{methodInfo?.label}</span>
        <svg className="w-3 h-3 flex-shrink-0 ml-2" fill="none" stroke="#94a3b8" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={open ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-1 rounded-xl overflow-hidden shadow-xl"
          style={{
            width: "260px",
            background: dark ? "#1e293b" : "white",
            border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
          }}
        >
          {METHODS.map((m) => (
            <button
              key={m.value}
              onClick={() => { setMethod(m.value); setOpen(false); }}
              className="w-full px-3 py-2.5 text-left flex items-center justify-between transition-colors relative"
              style={{
                background: method === m.value
                  ? dark ? `${m.color}20` : `${m.color}10`
                  : "transparent",
                borderBottom: dark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #f1f5f9",
              }}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
                <span
                  className="text-xs font-semibold truncate"
                  style={{ color: method === m.value ? m.color : dark ? "#cbd5e1" : "#334155" }}
                >
                  {m.label}
                </span>
              </div>
              {m.wip && (
                <span
                  className="text-[8px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 flex items-center gap-0.5"
                  style={{ background: `${m.color}20`, color: m.color, border: `1px solid ${m.color}30` }}
                >
                  🚧 Beta
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {isWip && (
        <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold"
          style={{ background: `${methodColor}15`, border: `1px solid ${methodColor}30`, color: methodColor }}>
          🚧 Đang phát triển — Chưa có dữ liệu tính toán
        </div>
      )}
    </div>
  );
}