import React, { useState, useEffect } from "react";
import { StepInput } from "./StepInputs";

const NOMOGRAM_GROUPS = [
  {
    label: "18 – 25", minAge: 18, maxAge: 25,
    rows: [
      { seqLabel: "< 1.00",       maxAbs: 1.00,                target: 0.50, adj: 0.4 },
      { seqLabel: "1.00 – 2.50",  minAbs: 1.00, maxAbs: 2.50,  target: 0.50, adj: 0.2 },
      { seqLabel: "2.50 – 4.50",  minAbs: 2.50, maxAbs: 4.50,  target: 0.50, adj: 0.0 },
      { seqLabel: "4.50 – 6.50",  minAbs: 4.50, maxAbs: 6.50,  target: 0.50, adj: -0.3 },
      { seqLabel: "≥ 6.50",       minAbs: 6.50,                target: 0.50, adj: -0.6 },
    ]
  },
  {
    label: "26 – 30", minAge: 26, maxAge: 30,
    rows: [
      { seqLabel: "< 1.25",       maxAbs: 1.25,                target: 0.25, adj: 0.4 },
      { seqLabel: "1.25 – 2.75",  minAbs: 1.25, maxAbs: 2.75,  target: 0.25, adj: 0.2 },
      { seqLabel: "2.75 – 4.75",  minAbs: 2.75, maxAbs: 4.75,  target: 0.25, adj: 0.0 },
      { seqLabel: "4.75 – 6.75",  minAbs: 4.75, maxAbs: 6.75,  target: 0.25, adj: -0.3 },
      { seqLabel: "≥ 6.75",       minAbs: 6.75,                target: 0.50, adj: -0.6 },
    ]
  },
  {
    label: "31 – 40+", minAge: 31, maxAge: 999,
    rows: [
      { seqLabel: "< 1.50",       maxAbs: 1.50,                target: 0.00, adj: 0.4 },
      { seqLabel: "1.50 – 3.00",  minAbs: 1.50, maxAbs: 3.00,  target: 0.00, adj: 0.2 },
      { seqLabel: "3.00 – 5.00",  minAbs: 3.00, maxAbs: 5.00,  target: 0.00, adj: 0.0 },
      { seqLabel: "5.00 – 7.00",  minAbs: 5.00, maxAbs: 7.00,  target: 0.00, adj: -0.3 },
      { seqLabel: "≥ 7.00",       minAbs: 7.00,                target: 0.25, adj: -0.6 },
    ]
  }
];

const GROUP_COLORS = [
  { bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.35)", text: "#93c5fd", headerBg: "rgba(96,165,250,0.12)" },
  { bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.35)", text: "#6ee7b7", headerBg: "rgba(52,211,153,0.12)" },
  { bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.35)", text: "#fcd34d", headerBg: "rgba(251,191,36,0.12)" },
];

function getActiveGroupAndRow(age, seqAbs) {
  let groupIdx = 2;
  if (age >= 18 && age <= 25) groupIdx = 0;
  else if (age >= 26 && age <= 30) groupIdx = 1;
  const group = NOMOGRAM_GROUPS[groupIdx];
  let row = group.rows[group.rows.length - 1];
  for (const r of group.rows) {
    const minOk = r.minAbs === undefined || seqAbs >= r.minAbs;
    const maxOk = r.maxAbs === undefined || seqAbs < r.maxAbs;
    if (minOk && maxOk) { row = r; break; }
  }
  return { groupIdx, group, row };
}

function getAutoValues(age, seqAbs, kmeanVal) {
  const { row } = getActiveGroupAndRow(age, seqAbs);
  let adj = row.adj;
  if (kmeanVal >= 46.0) adj = Math.round((adj - 0.2) * 10) / 10;
  if (age > 45) adj = Math.round((adj - 0.1) * 10) / 10;
  return { target: row.target, adj: Math.round(adj * 10) / 10 };
}

export default function NomogramSection({ birthYear, seRaw, kmean, target, setTarget, adj, setAdj, lang }) {
  const [isAuto, setIsAuto] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const currentYear = new Date().getFullYear();
  const age = currentYear - parseInt(birthYear || "1990");
  const seqAbs = Math.abs(seRaw);
  const kmeanVal = parseFloat(kmean || "43.5");
  const isVi = lang === "vi";

  const { groupIdx, row: activeRow } = getActiveGroupAndRow(age, seqAbs);
  const autoVals = getAutoValues(age, seqAbs, kmeanVal);
  const simKWarning = kmeanVal >= 46.0;
  const ageWarning = age > 45;

  useEffect(() => {
    if (isAuto) {
      setTarget(autoVals.target.toFixed(2));
      setAdj(autoVals.adj.toFixed(1));
    }
  }, [isAuto, age, seqAbs, kmeanVal]);

  const adjTissue = Math.round((parseFloat(adj) / 0.1) * 1.5 * 10) / 10;
  const effectiveSE = Math.round((seRaw - parseFloat(target)) * 4) / 4;

  return (
    <div className="rounded-2xl p-3 sm:p-4" style={{
      background: "rgba(15,23,42,0.85)",
      border: "1px solid rgba(20,184,166,0.35)",
      backdropFilter: "blur(16px)"
    }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-5 rounded-full flex-shrink-0" style={{ background: "linear-gradient(180deg, #14b8a6, #0d9488)" }} />
        <span className="text-xs font-bold text-teal-300 tracking-wide">CLEAR Nomogram</span>

        {/* Info toggle button */}
        <div className="relative">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="w-4 h-4 rounded-full border flex items-center justify-center text-[8px] font-bold select-none transition-colors"
            style={{
              borderColor: showInfo ? "#14b8a6" : "#475569",
              color: showInfo ? "#14b8a6" : "#64748b",
              background: showInfo ? "rgba(20,184,166,0.15)" : "transparent"
            }}>i</button>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {!isAuto && (
            <button onClick={() => setIsAuto(true)}
              className="text-[9px] px-2 py-0.5 rounded-md font-semibold transition-all hover:opacity-80"
              style={{ background: "rgba(20,184,166,0.15)", border: "1px solid rgba(20,184,166,0.4)", color: "#14b8a6" }}>
              ↺ Auto
            </button>
          )}
          <span className="text-[9px] px-2 py-0.5 rounded-md font-bold" style={{
            background: isAuto ? "rgba(20,184,166,0.15)" : "rgba(251,191,36,0.15)",
            color: isAuto ? "#14b8a6" : "#fbbf24"
          }}>
            {isAuto ? "AUTO" : "MANUAL"}
          </span>
        </div>
      </div>

      {/* Collapsible info panel */}
      {showInfo && (
        <div className="mb-3 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(20,184,166,0.2)", background: "rgba(15,23,42,0.6)" }}>
          {/* Warnings */}
          {(simKWarning || ageWarning) && (
            <div className="flex flex-wrap gap-1.5 px-2 pt-2">
              {simKWarning && (
                <span className="text-[9px] px-2 py-0.5 rounded font-semibold"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                  Sim-K≥46 → Adj −0.2D
                </span>
              )}
              {ageWarning && (
                <span className="text-[9px] px-2 py-0.5 rounded font-semibold"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                  Age&gt;45 → Adj −0.1D
                </span>
              )}
            </div>
          )}

          {/* Table headers */}
          <div className="grid grid-cols-3 gap-1 px-2 pt-2 pb-1">
            <div className="text-[8px] text-slate-600 font-semibold uppercase">Manifest SEQ</div>
            <div className="text-[8px] text-slate-600 font-semibold uppercase text-center">Target</div>
            <div className="text-[8px] text-slate-600 font-semibold uppercase text-center">Adj</div>
          </div>

          {/* Groups */}
          <div className="px-1 pb-1 space-y-1">
            {NOMOGRAM_GROUPS.map((group, gi) => {
              const c = GROUP_COLORS[gi];
              const isActive = gi === groupIdx;
              return (
                <div key={gi} className="rounded-lg overflow-hidden" style={{
                  border: isActive ? `1px solid ${c.border}` : "1px solid transparent",
                  background: isActive ? c.bg : "transparent"
                }}>
                  <div className="px-1.5 py-1" style={{ background: isActive ? c.headerBg : "transparent" }}>
                    <span className="text-[8px] font-bold" style={{ color: isActive ? c.text : "#334155" }}>
                      {isVi ? "Tuổi" : "Age"} {group.label}
                    </span>
                  </div>
                  <div className="px-0.5 pb-0.5 space-y-0.5">
                    {group.rows.map((row, ri) => {
                      const isActiveRow = isActive && row === activeRow;
                      return (
                        <div key={ri} className="grid grid-cols-3 gap-1 rounded px-1.5 py-0.5" style={{
                          background: isActiveRow ? "rgba(20,184,166,0.25)" : "transparent",
                          border: isActiveRow ? "1px solid rgba(20,184,166,0.5)" : "1px solid transparent"
                        }}>
                          <div className="text-[8px] font-mono" style={{ color: isActiveRow ? "#e2e8f0" : "#475569" }}>{row.seqLabel}D</div>
                          <div className="text-[8px] font-bold text-center" style={{ color: isActiveRow ? "#14b8a6" : "#334155" }}>
                            {row.target >= 0 ? "+" : ""}{row.target.toFixed(2)}
                          </div>
                          <div className="text-[8px] font-bold text-center" style={{
                            color: isActiveRow ? (row.adj > 0 ? "#34d399" : row.adj < 0 ? "#f87171" : "#94a3b8") : "#334155"
                          }}>
                            {row.adj > 0 ? "+" : ""}{row.adj.toFixed(1)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notes */}
          <div className="px-2 pb-2 pt-1 space-y-0.5 text-[8px] text-slate-600 border-t border-slate-800 mt-1">
            <div>• Sim-K ≥ 46.0D: Sphere Adj −0.2D</div>
            <div>• Age &gt; 45y: Sphere Adj −0.1D</div>
            <div>• 0.1D Adj → +1.5µm tissue  •  0.25D Target → 0.25D SE offset</div>
          </div>
        </div>
      )}

      {/* Always visible: Target + Adj */}
      <div className="grid grid-cols-2 gap-3">
        <StepInput
          label="Target (D)"
          value={target}
          onChange={(v) => { setIsAuto(false); setTarget(v); }}
          unit="D" step={0.25} min={-1} max={1}
          hint={`Auto: +${autoVals.target.toFixed(2)}`}
          decimals={2}
        />
        <StepInput
          label="Sphere Adj (D)"
          value={adj}
          onChange={(v) => { setIsAuto(false); setAdj(v); }}
          unit="D" step={0.1} min={-2} max={1}
          hint={`${adjTissue >= 0 ? "+" : ""}${adjTissue}µm`}
          decimals={1}
        />
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-2 mt-2">
        <div className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px]" style={{ background: "rgba(30,41,59,0.7)" }}>
          <span className="text-slate-500">{isVi ? "SE điều trị:" : "Effective SE:"}</span>
          <span className="font-bold text-teal-400">{effectiveSE}D</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px]" style={{ background: "rgba(30,41,59,0.7)" }}>
          <span className="text-slate-500">{isVi ? "Mô Adj:" : "Adj tissue:"}</span>
          <span className="font-bold" style={{ color: adjTissue >= 0 ? "#f97316" : "#60a5fa" }}>
            {adjTissue >= 0 ? "+" : ""}{adjTissue}µm
          </span>
        </div>
      </div>
    </div>
  );
}