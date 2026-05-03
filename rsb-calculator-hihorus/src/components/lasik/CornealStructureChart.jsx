import React from "react";

export default function CornealStructureChart({ cornea, flap, ablation, residual, method, safe }) {
  if (!cornea || ablation === null || ablation === undefined) {
    return (
      <div className="p-5 flex flex-col items-center justify-center h-full min-h-[260px]">
        <svg viewBox="0 0 180 220" className="w-36 opacity-20" fill="none">
          <ellipse cx="90" cy="110" rx="60" ry="90" stroke="#64748b" strokeWidth="2" strokeDasharray="4 3" />
          <ellipse cx="90" cy="55" rx="50" ry="30" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
        <p className="text-xs text-slate-600 mt-3">Nhập thông số để xem cấu trúc</p>
      </div>
    );
  }

  const total = cornea;
  const flapPct = flap > 0 ? (flap / total) * 100 : 0;
  const ablationPct = (ablation / total) * 100;
  const residualPct = (residual / total) * 100;

  const safeColor = safe === true ? "#10b981" : safe === "caution" ? "#f59e0b" : "#ef4444";
  const safeBg = safe === true ? "#10b98122" : safe === "caution" ? "#f59e0b22" : "#ef444422";
  const safeLabel = safe === true ? "AN TOÀN" : safe === "caution" ? "THẬN TRỌNG" : "NGUY HIỂM";


  // SVG cross-section illustration
  // Total height of cornea SVG = 200px
  const svgH = 200;
  const svgW = 160;
  const cx = svgW / 2;

  const flapH = (flapPct / 100) * svgH;
  const ablationH = (ablationPct / 100) * svgH;
  const residualH = (residualPct / 100) * svgH;

  const flapY = 0;
  const ablationY = flapH;
  const residualY = flapH + ablationH;

  // Curved cornea shape - use bezier paths for lens-like appearance
  const leftX = 18;
  const rightX = svgW - 18;

  // Create layer rectangles with curved top/bottom using path
  const layerPath = (y1, h, curveAmt = 8) => {
    const y2 = y1 + h;
    return `M ${leftX} ${y1} Q ${cx} ${y1 - curveAmt} ${rightX} ${y1} L ${rightX} ${y2} Q ${cx} ${y2 + curveAmt} ${leftX} ${y2} Z`;
  };

  return (
    <div className="p-5 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Cấu trúc Giác mạc</h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: safeBg, color: safeColor, border: `1px solid ${safeColor}40` }}>
          {safeLabel}
        </span>
      </div>

      <div className="flex gap-4 items-start">
        {/* SVG Cross-section */}
        <div className="flex-shrink-0">
          <svg viewBox={`0 0 ${svgW} ${svgH + 20}`} width={svgW * 0.85} height={(svgH + 20) * 0.85} style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}>
            <defs>
              <linearGradient id="cornealGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="50%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
              <linearGradient id="flapGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#64748b" stopOpacity="0.7" />
              </linearGradient>
              <linearGradient id="ablationGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fb923c" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="residualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={safeColor} stopOpacity="0.9" />
                <stop offset="100%" stopColor={safeColor} stopOpacity="0.6" />
              </linearGradient>
              <clipPath id="cornealClip">
                <path d={`M ${leftX} 0 Q ${cx} -10 ${rightX} 0 L ${rightX} ${svgH} Q ${cx} ${svgH + 10} ${leftX} ${svgH} Z`} />
              </clipPath>
            </defs>

            {/* Background corneal outline */}
            <path
              d={`M ${leftX} 0 Q ${cx} -10 ${rightX} 0 L ${rightX} ${svgH} Q ${cx} ${svgH + 10} ${leftX} ${svgH} Z`}
              fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5"
            />

            {/* Flap layer */}
            {flap > 0 && (
              <rect x={leftX} y={flapY} width={rightX - leftX} height={Math.max(flapH, 2)} fill="url(#flapGrad)" clipPath="url(#cornealClip)" />
            )}

            {/* Ablation layer */}
            <rect x={leftX} y={ablationY} width={rightX - leftX} height={Math.max(ablationH, 2)} fill="url(#ablationGrad)" clipPath="url(#cornealClip)" />

            {/* Residual layer */}
            <rect x={leftX} y={residualY} width={rightX - leftX} height={Math.max(residualH, 2)} fill="url(#residualGrad)" clipPath="url(#cornealClip)" />

            {/* Layer divider lines */}
            {flap > 0 && (
              <line x1={leftX + 2} y1={flapH} x2={rightX - 2} y2={flapH} stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4 2" />
            )}
            <line x1={leftX + 2} y1={residualY} x2={rightX - 2} y2={residualY} stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4 2" />

            {/* Outer border glow */}
            <path
              d={`M ${leftX} 0 Q ${cx} -10 ${rightX} 0 L ${rightX} ${svgH} Q ${cx} ${svgH + 10} ${leftX} ${svgH} Z`}
              fill="none" stroke={safeColor} strokeWidth="1.5" opacity="0.5"
            />

            {/* Top surface reflection */}
            <path d={`M ${leftX + 6} 4 Q ${cx} -4 ${rightX - 6} 4`} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />

            {/* Value labels inside */}
            {flap > 0 && flapH > 14 && (
              <text x={cx} y={flapY + flapH / 2 + 4} textAnchor="middle" fontSize="9" fill="white" fontWeight="700">{flap}μm</text>
            )}
            {ablationH > 14 && (
              <text x={cx} y={ablationY + ablationH / 2 + 4} textAnchor="middle" fontSize="9" fill="white" fontWeight="700">{ablation}μm</text>
            )}
            {residualH > 14 && (
              <text x={cx} y={residualY + residualH / 2 + 4} textAnchor="middle" fontSize="9" fill="white" fontWeight="700">{residual}μm</text>
            )}
          </svg>
        </div>

        {/* Legend & values */}
        <div className="flex flex-col gap-2.5 flex-1 pt-1">
          {flap > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: "#94a3b8" }} />
              <div>
                <div className="text-[10px] text-slate-400">Vạt / Cap</div>
                <div className="text-xs font-bold text-slate-600">{flap} μm</div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0 bg-orange-400" />
            <div>
              <div className="text-[10px] text-slate-400">Mô mất đi</div>
              <div className="text-xs font-bold text-orange-500">{ablation} μm</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: safeColor }} />
            <div>
              <div className="text-[10px] text-slate-400">Mô tồn dư</div>
              <div className="text-xs font-bold" style={{ color: safeColor }}>{residual} μm</div>
            </div>
          </div>
          <div className="mt-1 pt-2 border-t border-slate-100">
            <div className="text-[10px] text-slate-400">CCT tổng cộng</div>
            <div className="text-xs font-bold text-slate-600">{cornea} μm</div>
          </div>
          <div className="text-[9px] text-slate-400 mt-1">{method}</div>
        </div>
      </div>

      {/* Threshold bar */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className="flex justify-between text-[9px] text-slate-400 mb-1">
          <span>Nguy hiểm &lt;280μm</span>
          <span>An toàn &gt;300μm</span>
        </div>
        <div className="h-1.5 rounded-full flex overflow-hidden">
          <div className="flex-1 bg-red-500/50" />
          <div className="w-8 bg-amber-400/50" />
          <div className="flex-1 bg-emerald-500/50" />
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: safeColor }} />
          <span className="text-[10px] font-semibold" style={{ color: safeColor }}>RSB hiện tại: {residual}μm</span>
        </div>
      </div>
    </div>
  );
}