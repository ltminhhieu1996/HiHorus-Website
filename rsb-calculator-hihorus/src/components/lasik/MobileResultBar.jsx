import React, { useState } from "react";
import MethodVideo from "./MethodVideo";
import { motion, AnimatePresence } from "framer-motion";
import {
  SMART_SURF_DATA, FEMTO_DATA, SMARTSIGHT_DATA,
  lookupAblationDepth, lookupClearZ8Depth
} from "./lasikData";

const METHODS_LOCAL = [
  { value: "smartsurf", label: "SmartSurfAce - Schwind Amaris", hasFlap: false, color: "#6366f1" },
  { value: "femto", label: "FemtoLASIK - Schwind Amaris", hasFlap: true, color: "#0ea5e9" },
  { value: "smartsight", label: "SmartSight - Schwind Atos", hasFlap: true, color: "#8b5cf6" },
  { value: "clear", label: "CLEAR - Ziemer Z8", hasFlap: true, color: "#14b8a6" }
];

const CARD = {
  background: "white",
  border: "1px solid rgba(0,0,0,0.06)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)"
};

function evalSafety(rsb) {
  if (rsb === null || rsb === undefined) return null;
  if (rsb < 250) return false;
  if (rsb <= 300) return "caution";
  return true;
}
function evalPTA(pta) {
  if (pta === null || pta === undefined) return null;
  if (pta > 40) return false;
  if (pta >= 35) return "caution";
  return true;
}

export default function MobileResultBar({
  result, safe, safeColor, safeLabel,
  ptaSafe, ptaColor, ptaLabel, methodColor,
  T, lang, method, oz, seKey, seRaw, flap, cornea,
  dark, noData,
  children
}) {
  const [open, setOpen] = useState(false);
  const isVi = lang === "vi";

  const worstSafe = (safe === false || ptaSafe === false) ? false
    : (safe === "caution" || ptaSafe === "caution") ? "caution" : true;
  const verdictColor = worstSafe === true ? "#10b981" : worstSafe === "caution" ? "#f59e0b" : "#ef4444";
  const verdictLabel = worstSafe === true ? T.safe : worstSafe === "caution" ? T.caution : T.danger;

  const ct = result?.cornealThickness;
  const altMethods = result ? METHODS_LOCAL.filter(m => m.value !== method).map(m => {
    let abl = null;
    if (m.value === "smartsurf") abl = lookupAblationDepth(SMART_SURF_DATA, oz, seKey);
    else if (m.value === "femto") abl = lookupAblationDepth(FEMTO_DATA, oz, seKey);
    else if (m.value === "smartsight") abl = lookupAblationDepth(SMARTSIGHT_DATA, oz, seKey);
    else if (m.value === "clear") { const b = lookupClearZ8Depth(oz, seKey); abl = b !== null ? Math.round(b) : null; }
    if (abl === null) return null;
    const flapVal = m.hasFlap ? parseFloat(flap) : 0;
    const rsb = ct - flapVal - abl;
    const pta = Math.round((flapVal + abl) / ct * 1000) / 10;
    return { ...m, rsb, pta, rsbSafe: evalSafety(rsb), ptaSafe: evalPTA(pta) };
  }).filter(Boolean) : [];

  const showAlts = altMethods.filter(m => {
    const mWorst = (m.rsbSafe === false || m.ptaSafe === false) ? false
      : (m.rsbSafe === "caution" || m.ptaSafe === "caution") ? "caution" : true;
    if (worstSafe === true) return mWorst === true;
    if (worstSafe === "caution") return mWorst === true || mWorst === "caution";
    return mWorst !== null;
  });

  if (!result && noData) {
    return (
      <div
        className="fixed bottom-0 inset-x-0 sm:hidden z-40"
        style={{
          background: dark ? "rgba(15,23,42,0.97)" : "rgba(254,243,199,0.97)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(251,191,36,0.35)",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
          paddingBottom: "env(safe-area-inset-bottom, 8px)"
        }}>
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: "rgba(251,191,36,0.2)", border: "1px solid rgba(251,191,36,0.4)" }}>
              <span className="text-base">⚠️</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-amber-700">{T.noDataTitle}</div>
              <p className="text-xs text-amber-700/70">{T.noDataDesc}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-amber-300/40">
            <div className="text-[10px] font-semibold text-amber-700 mb-1">{T.altOptions}</div>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] text-amber-700/80 flex items-center gap-1"><span className="text-amber-500">→</span>{T.icl}</span>
              <span className="text-amber-400 text-[10px]">·</span>
              <span className="text-[10px] text-amber-700/80 flex items-center gap-1"><span className="text-amber-500">→</span>{T.reduceRefraction}</span>
              <span className="text-amber-400 text-[10px]">·</span>
              <span className="text-[10px] text-amber-700/80 flex items-center gap-1"><span className="text-amber-500">→</span>{T.consultRefraction}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <>
      {/* Bottom bar — larger, cleaner */}
      <div
        className="fixed bottom-0 inset-x-0 sm:hidden z-40"
        style={{
          background: dark ? "rgba(15,23,42,0.97)" : "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderTop: dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
          paddingBottom: "env(safe-area-inset-bottom, 8px)"
        }}>
        <div className="px-4 pt-3 pb-3">
          {/* Label row */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: dark ? "#64748b" : "#94a3b8" }}>Kết quả tính toán</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${verdictColor}15`, color: verdictColor }}>
              {verdictLabel}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3">
          {/* Ablation */}
          <div className="flex-1 rounded-xl py-2.5 px-3 text-center" style={{ background: `${methodColor}09`, border: `1px solid ${methodColor}20` }}>
            <div className="text-[9px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: dark ? "#64748b" : "#94a3b8" }}>{T.ablation}</div>
            <div className="flex items-baseline justify-center gap-1 leading-tight">
              <div className="text-2xl font-black tabular-nums" style={{ color: methodColor }}>{result.ablationDepth}</div>
              <div className="text-[8px] opacity-50" style={{ color: methodColor }}>±5</div>
            </div>
            <div className="text-[9px] mt-0.5" style={{ color: dark ? "#64748b" : "#94a3b8" }}>μm</div>
          </div>

          {/* RSB */}
          <div className="flex-1 rounded-xl py-2.5 px-3 text-center" style={{ background: `${safeColor}09`, border: `1px solid ${safeColor}25` }}>
            <div className="text-[9px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: dark ? "#64748b" : "#94a3b8" }}>RSB</div>
            <div className="flex items-baseline justify-center gap-1 leading-tight">
              <div className="text-2xl font-black tabular-nums" style={{ color: safeColor }}>{result.residualStroma}</div>
              <div className="text-[8px] opacity-50" style={{ color: safeColor }}>±5</div>
            </div>
            <div className="text-[9px] font-bold mt-0.5" style={{ color: safeColor }}>{safeLabel}</div>
          </div>

          {/* PTA */}
          <div className="flex-1 rounded-xl py-2.5 px-3 text-center" style={{ background: `${ptaColor}09`, border: `1px solid ${ptaColor}25` }}>
            <div className="text-[9px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: dark ? "#64748b" : "#94a3b8" }}>PTA</div>
            <div className="text-2xl font-black tabular-nums leading-tight" style={{ color: ptaColor }}>{result.pta}%</div>
            <div className="text-[9px] font-bold mt-0.5" style={{ color: ptaColor }}>{ptaLabel}</div>
          </div>
          </div>

          {/* Xem chi tiết button — centered text style */}
          <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-1.5 pt-2 pb-0.5 transition-opacity active:opacity-60"
          >
          <svg className="w-3.5 h-3.5" fill="none" stroke={verdictColor} viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
          <span className="text-xs font-semibold" style={{ color: verdictColor }}>
            {isVi ? "Xem chi tiết" : "View details"}
          </span>
          </button>
        </div>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 sm:hidden z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {/* Backdrop — tap to close */}
            <div className="absolute inset-0" style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }} onClick={() => setOpen(false)} />

            {/* Panel */}
            <motion.div
              className="absolute inset-x-0 bottom-0 rounded-t-3xl flex flex-col"
              style={{ background: dark ? "#0f172a" : "#f8fafc", maxHeight: "92vh", boxShadow: "0 -8px 40px rgba(0,0,0,0.3)" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 38, stiffness: 380, mass: 0.8 }}
            >

              {/* Close button row */}
              <div className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-2">
                <span className="text-sm font-bold" style={{ color: dark ? "#f1f5f9" : "#1e293b" }}>
                  {isVi ? "Kết quả đầy đủ" : "Full Results"}
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm transition-all active:scale-95"
                  style={{
                    background: `${verdictColor}12`,
                    border: `1.5px solid ${verdictColor}35`,
                    color: verdictColor,
                  }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  {isVi ? "Đóng" : "Close"}
                </button>
              </div>

              {/* Verdict badge */}
              <div className="flex-shrink-0 px-4 pb-3" style={{ borderBottom: dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #f1f5f9" }}>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg" style={{ background: `${verdictColor}15`, color: verdictColor, border: `1px solid ${verdictColor}20` }}>
                  {verdictLabel}
                </span>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-8">

                {/* Big stat cards */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-2xl p-3 text-center" style={{ background: `${methodColor}08`, border: `1px solid ${methodColor}20` }}>
                    <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{ color: dark ? "#64748b" : "#94a3b8" }}>{T.ablation}</div>
                    <div className="flex items-baseline justify-center gap-1.5">
                      <div className="text-3xl font-black tabular-nums" style={{ color: methodColor }}>{result.ablationDepth}</div>
                      <div className="text-[9px] opacity-50" style={{ color: methodColor }}>±5</div>
                    </div>
                    <div className="text-[10px]" style={{ color: dark ? "#64748b" : "#94a3b8" }}>μm</div>
                  </div>
                  <div className="rounded-2xl p-3 text-center" style={{ background: `${safeColor}08`, border: `1px solid ${safeColor}25` }}>
                    <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{ color: dark ? "#64748b" : "#94a3b8" }}>RSB</div>
                    <div className="flex items-baseline justify-center gap-1.5">
                      <div className="text-3xl font-black tabular-nums" style={{ color: safeColor }}>{result.residualStroma}</div>
                      <div className="text-[9px] opacity-50" style={{ color: safeColor }}>±5</div>
                    </div>
                    <div className="text-[10px] font-bold" style={{ color: safeColor }}>{safeLabel}</div>
                  </div>
                  <div className="rounded-2xl p-3 text-center" style={{ background: `${ptaColor}08`, border: `1px solid ${ptaColor}25` }}>
                    <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{ color: dark ? "#64748b" : "#94a3b8" }}>PTA</div>
                    <div className="text-3xl font-black tabular-nums" style={{ color: ptaColor }}>{result.pta}</div>
                    <div className="text-[10px] font-bold" style={{ color: ptaColor }}>%</div>
                  </div>
                </div>

                {/* Charts as children */}
                {children}

                {/* Recommendations */}
                <div className="rounded-2xl p-4" style={{
                  background: dark ? `linear-gradient(135deg, ${verdictColor}12, #1e293b)` : `linear-gradient(135deg, ${verdictColor}06, white)`,
                  border: `1px solid ${verdictColor}18`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: `${verdictColor}15`, border: `1px solid ${verdictColor}25` }}>
                      <div className="w-1 h-1 rounded-full" style={{ background: verdictColor }} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: dark ? "#94a3b8" : "#475569" }}>{T.recommendations}</span>
                  </div>

                  <div className="flex gap-2 flex-wrap mb-3">
                    <div className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs" style={{ background: `${safeColor}10`, border: `1px solid ${safeColor}18` }}>
                      <span className="font-bold" style={{ color: safeColor }}>RSB {result.residualStroma}μm</span>
                      <span className="text-[10px]" style={{ color: safeColor }}>{safeLabel}</span>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs" style={{ background: `${ptaColor}10`, border: `1px solid ${ptaColor}18` }}>
                      <span className="font-bold" style={{ color: ptaColor }}>PTA {result.pta}%</span>
                      <span className="text-[10px]" style={{ color: ptaColor }}>{ptaLabel}</span>
                    </div>
                  </div>

                  <ul className="space-y-1.5">
                    {worstSafe === true && (
                      <>
                        <li className="text-sm flex items-start gap-2" style={{ color: dark ? "#cbd5e1" : "#334155" }}><span style={{ color: verdictColor }}>✓</span>{T.safeMsg1(result.residualStroma)}</li>
                        <li className="text-sm flex items-start gap-2" style={{ color: dark ? "#94a3b8" : "#64748b" }}><span style={{ color: verdictColor }}>✓</span>{T.safeMsg2}</li>
                      </>
                    )}
                    {worstSafe === "caution" && (
                      <>
                        {safe === "caution" && <li className="text-sm flex items-start gap-2" style={{ color: dark ? "#cbd5e1" : "#334155" }}><span style={{ color: verdictColor }}>⚠</span>{T.cautionMsg1(result.residualStroma)}</li>}
                        {ptaSafe === "caution" && <li className="text-sm flex items-start gap-2" style={{ color: dark ? "#cbd5e1" : "#334155" }}><span style={{ color: verdictColor }}>⚠</span>{isVi ? `PTA ${result.pta}% ở ngưỡng thận trọng (35–40%)` : `PTA ${result.pta}% in caution range (35–40%)`}</li>}
                        <li className="text-sm flex items-start gap-2" style={{ color: dark ? "#94a3b8" : "#64748b" }}><span style={{ color: verdictColor }}>→</span>{T.cautionMsg2}</li>
                        <li className="text-sm flex items-start gap-2" style={{ color: dark ? "#94a3b8" : "#64748b" }}><span style={{ color: verdictColor }}>→</span>{T.cautionMsg3}</li>
                      </>
                    )}
                    {worstSafe === false && (
                      <>
                        {safe === false && <li className="text-sm flex items-start gap-2" style={{ color: verdictColor }}><span>✕</span>{T.dangerMsg1(result.residualStroma)}</li>}
                        {ptaSafe === false && <li className="text-sm flex items-start gap-2" style={{ color: verdictColor }}><span>✕</span>{isVi ? `PTA ${result.pta}% vượt ngưỡng nguy hiểm (>40%)` : `PTA ${result.pta}% exceeds danger threshold (>40%)`}</li>}
                        <li className="text-sm flex items-start gap-2" style={{ color: dark ? "#94a3b8" : "#64748b" }}><span>→</span>{T.dangerMsg3}</li>
                      </>
                    )}
                    {(safe === false || ptaSafe === false) &&
                      <li className="text-sm flex items-start gap-2 mt-1 font-semibold" style={{ color: "#a78bfa" }}>
                        <span>💎</span>
                        {isVi ? "Cân nhắc Phakic ICL / IPCL thay thế" : "Consider Phakic ICL / IPCL as alternative"}
                      </li>
                    }
                    {method === "smartsurf" && seRaw && Math.abs(seRaw) > 6 &&
                      <li className="text-sm flex items-start gap-2 mt-1 font-semibold" style={{ color: "#fb923c" }}>
                        <span>⚠</span>
                        {isVi ? `Tổng độ khúc xạ ${Math.abs(seRaw).toFixed(2)}D > 6D — Cân nhắc phương pháp khác hoặc ICL` : `Total refraction ${Math.abs(seRaw).toFixed(2)}D > 6D — Consider alternative methods or ICL`}
                      </li>
                    }
                  </ul>

                  {showAlts.length > 0 && (
                    <div className="mt-3 pt-2.5" style={{ borderTop: dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #f1f5f9" }}>
                      <div className="text-xs font-semibold mb-2" style={{ color: worstSafe === true ? "#059669" : "#d97706" }}>
                        {worstSafe === true ? (isVi ? "💡 Phương pháp khác:" : "💡 Other methods:") : T.betterMethods}
                      </div>
                      <div className="space-y-1.5">
                        {showAlts.map(m => {
                          const mWorst = (m.rsbSafe === false || m.ptaSafe === false) ? false
                            : (m.rsbSafe === "caution" || m.ptaSafe === "caution") ? "caution" : true;
                          const mc = mWorst === true ? "#10b981" : mWorst === "caution" ? "#f59e0b" : "#ef4444";
                          return (
                            <div key={m.value} className="flex items-center gap-2 text-xs flex-wrap">
                              <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
                              <span style={{ color: m.color }} className="font-semibold">{m.label}</span>
                              <span style={{ color: dark ? "#64748b" : "#94a3b8" }}>RSB</span>
                              <span className="font-bold" style={{ color: evalSafety(m.rsb) === true ? "#10b981" : evalSafety(m.rsb) === "caution" ? "#f59e0b" : "#ef4444" }}>{m.rsb}μm</span>
                              <span style={{ color: dark ? "#334155" : "#cbd5e1" }}>·</span>
                              <span style={{ color: dark ? "#64748b" : "#94a3b8" }}>PTA</span>
                              <span className="font-bold" style={{ color: evalPTA(m.pta) === true ? "#10b981" : evalPTA(m.pta) === "caution" ? "#f59e0b" : "#ef4444" }}>{m.pta}%</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ background: `${mc}12`, color: mc }}>
                                {mWorst === true ? T.safe : mWorst === "caution" ? T.caution : T.danger}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="h-2" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}