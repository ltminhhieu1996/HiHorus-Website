import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../components/ThemeContext";
import {
  SMART_SURF_DATA, FEMTO_DATA, SMARTSIGHT_DATA, CLEARZ8_DATA,
  lookupAblationDepth, lookupClearZ8Depth } from
"../components/lasik/lasikData";
import MethodVideo from "../components/lasik/MethodVideo";
import OZOptimizationChart from "../components/lasik/OZOptimizationChart";
import NomogramSection from "../components/lasik/NomogramSection";
import PDFExportModal from "../components/lasik/PDFExportModal";
import { StepInput, NumberStepInput } from "../components/lasik/StepInputs";
import MobileResultBar from "../components/lasik/MobileResultBar";
import MethodDropdown from "../components/lasik/MethodDropdown";

const METHODS = [
{ value: "smartsurf", label: "SmartSurfAce - Schwind Amaris", hasFlap: false, color: "#6366f1" },
{ value: "femto", label: "FemtoLASIK - Schwind Amaris", hasFlap: true, color: "#0ea5e9" },
{ value: "smartsight", label: "SmartSight - Schwind Atos", hasFlap: true, color: "#8b5cf6" },
{ value: "clear", label: "CLEAR - Ziemer Z8", hasFlap: true, color: "#14b8a6" },
{ value: "smile_zeiss", label: "SMILE - Zeiss Visumax", hasFlap: false, color: "#f59e0b", wip: true },
{ value: "silk_jj", label: "SILK - Johnson & Johnson", hasFlap: false, color: "#ec4899", wip: true },
{ value: "femto_zeiss", label: "FemtoLASIK - Zeiss Visumax", hasFlap: true, color: "#06b6d4", wip: true },
];


const TRANSLATIONS = {
  vi: {
    subtitle: "Tính mô tồn dư sau phẫu thuật khúc xạ",
    inputParams: "Thông số Input",
    method: "Phương pháp",
    cct: "CCT — Chiều dày giác mạc",
    sphere: "Sphere — Độ cận",
    cylinder: "Cylinder — Độ loạn",
    flapCap: "Flap / Cap thickness",
    oz: "OZ — Vùng quang học",
    ablation: "Mô mất đi",
    assessment: "Đánh giá",
    safe: "AN TOÀN", caution: "THẬN TRỌNG", danger: "NGUY HIỂM",
    recommendations: "Khuyến nghị phẫu thuật",
    ptaFormula: "PTA = (Flap + Ablation) / CCT × 100%",
    approxNote: "±5μm",
    safeMsg1: (rsb) => `RSB ${rsb}μm — an toàn cho phẫu thuật`,
    safeMsg2: "Tiến hành theo các thông số đã lên kế hoạch",
    cautionMsg1: (rsb) => `RSB ${rsb}μm ở ngưỡng thận trọng (250–300μm)`,
    cautionMsg2: "Cân nhắc giảm OZ hoặc điều chỉnh thông số",
    cautionMsg3: "Tham khảo thêm ý kiến bác sĩ chuyên khoa",
    betterMethods: "💡 Phương pháp cho RSB cao hơn:",
    dangerMsg1: (rsb) => `RSB ${rsb}μm dưới ngưỡng an toàn!`,
    dangerMsg2: "Không nên thực hiện phẫu thuật với thông số này",
    dangerMsg3: "Điều chỉnh: giảm độ khúc xạ hoặc chọn phương pháp khác",
    noDataTitle: "Không có dữ liệu",
    noDataDesc: "Độ khúc xạ quá cao hoặc không đủ điều kiện phẫu thuật laser.",
    altOptions: "💡 Cân nhắc phương án thay thế:",
    icl: "ICL / IPCL", reduceRefraction: "Giảm độ khúc xạ mục tiêu", consultRefraction: "Tư vấn bác sĩ chuyên khoa",
    emptyState: "Nhập thông số để xem kết quả",
    rsbRange: ["RSB <250", "250–300", ">300"],
    poweredBy: "Powered by HiHorus",
    birthYear: "Năm sinh BN",
    eye: "Mắt",
    rightEye: "Mắt phải (OD)",
    leftEye: "Mắt trái (OS)",
    exportPDF: "Xuất PDF"
  },
  en: {
    subtitle: "Residual stromal bed after refractive surgery",
    inputParams: "Input Parameters",
    method: "Method",
    cct: "CCT — Corneal thickness",
    sphere: "Sphere — Myopia",
    cylinder: "Cylinder — Astigmatism",
    flapCap: "Flap / Cap thickness",
    oz: "OZ — Optical zone",
    ablation: "Ablation",
    assessment: "Assessment",
    safe: "SAFE", caution: "CAUTION", danger: "DANGER",
    recommendations: "Surgical Recommendations",
    ptaFormula: "PTA = (Flap + Ablation) / CCT × 100%",
    approxNote: "±5μm",
    safeMsg1: (rsb) => `RSB ${rsb}μm — safe for surgery`,
    safeMsg2: "Proceed with the planned parameters",
    cautionMsg1: (rsb) => `RSB ${rsb}μm in caution range (250–300μm)`,
    cautionMsg2: "Consider reducing OZ or adjusting parameters",
    cautionMsg3: "Consult with a specialist",
    betterMethods: "💡 Methods with higher RSB:",
    dangerMsg1: (rsb) => `RSB ${rsb}μm below minimum safety threshold!`,
    dangerMsg2: "Surgery should not be performed with these parameters",
    dangerMsg3: "Adjust: reduce refraction or choose another method",
    noDataTitle: "No data for these parameters",
    noDataDesc: "Refraction too high or insufficient for laser surgery.",
    altOptions: "💡 Consider alternatives:",
    icl: "ICL / IPCL", reduceRefraction: "Reduce target refraction", consultRefraction: "Consult a refractive specialist",
    emptyState: "Enter parameters to see calculation results",
    rsbRange: ["RSB <250", "250–300", ">300"],
    poweredBy: "Powered by HiHorus",
    birthYear: "Patient Birth Year",
    eye: "Eye",
    rightEye: "Right Eye (OD)",
    leftEye: "Left Eye (OS)",
    exportPDF: "Export PDF"
  }
};

function evaluateSafety(rsb) {
  if (rsb === null || rsb === undefined) return null;
  if (rsb < 250) return false;
  if (rsb <= 300) return "caution";
  return true;
}

function evaluatePTA(pta) {
  if (pta === null || pta === undefined) return null;
  if (pta > 40) return false;
  if (pta >= 35) return "caution";
  return true;
}

const CARD = {
  background: "white",
  border: "1px solid rgba(0,0,0,0.06)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)"
};

export default function Home() {
  const pageRef = React.useRef(null);
  const [method, setMethod] = useState("clear");
  const [cornea, setCornea] = useState("528");
  const [sphere, setSphere] = useState("-5.00");
  const [cylinder, setCylinder] = useState("-0.75");
  const [flap, setFlap] = useState("110");
  const [oz, setOz] = useState("6.5");
  const [result, setResult] = useState(null);
  const [kmean, setKmean] = useState("43.8");
  const [qValue, setQValue] = useState("-0.26");
  const [noData, setNoData] = useState(false);
  const [lang, setLang] = useState("vi");
  const [birthYear, setBirthYear] = useState("2000");
  const [eye, setEye] = useState("right");
  const [showPDF, setShowPDF] = useState(false);
  const [nomogramTarget, setNomogramTarget] = useState("0.00");
  const [nomogramAdj, setNomogramAdj] = useState("0.0");
  const [generalTarget, setGeneralTarget] = useState("0.00");

  const [showPTAInfo, setShowPTAInfo] = useState(false);
  const ptaInfoRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ptaInfoRef.current && !ptaInfoRef.current.contains(e.target)) setShowPTAInfo(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { dark, toggle: toggleDark } = useTheme();

  const T = TRANSLATIONS[lang];
  const methodInfo = METHODS.find((m) => m.value === method);
  const hasFlap = methodInfo?.hasFlap;
  const isClear = method === "clear";
  const isWip = methodInfo?.wip === true;

  const seRaw = parseFloat(sphere) + parseFloat(cylinder);
  const seKey = String(Math.round(seRaw * 4) / 4);
  const effectiveSE = Math.round((seRaw - parseFloat(nomogramTarget)) * 4) / 4;
  const effectiveSEKey = String(effectiveSE);

  useEffect(() => {calculate();}, [method, cornea, sphere, cylinder, flap, oz, kmean, qValue, nomogramTarget, nomogramAdj, generalTarget]);

  function clearAdjustment() {
    // Kmean: mỗi giảm 1.2 → giảm 1μm mô mất đi (ref 43.8)
    // Q: mỗi tăng 0.045 → tăng 1μm mô mất đi (ref -0.26)
    const kDelta = (parseFloat(kmean) - 43.8) / (-1.2); // dương khi Kmean giảm
    const qDelta = (parseFloat(qValue) - (-0.26)) / 0.045; // dương khi Q tăng
    return Math.round((kDelta + qDelta) * 10) / 10;
  }

  function calculate() {
    if (isWip) {setResult(null);setNoData(false);return;}
    const ct = parseFloat(cornea);
    const flapVal = hasFlap ? parseFloat(flap) : 0;
    if (!ct || isNaN(ct)) {setResult(null);setNoData(false);return;}

    const targetOffset = parseFloat(nomogramTarget);
    const effectiveSERaw = seRaw - targetOffset;
    const effectiveSE = Math.round(effectiveSERaw * 4) / 4;
    const effectiveSEKey = String(effectiveSE);

    const generalTargetOffset = parseFloat(generalTarget);
    const generalSEKey = String(Math.round((seRaw - generalTargetOffset) * 4) / 4);

    const currentYear = new Date().getFullYear();
    const patientAge = currentYear - parseInt(birthYear || "1990");
    const ageAdjustment = patientAge < 24 ? 1 : 0;

    let ablation = null;
    if (isClear) {
      const base = lookupClearZ8Depth(oz, effectiveSEKey);
      if (base === null) {setResult(null);setNoData(true);return;}
      const adjTissue = Math.round(parseFloat(nomogramAdj) / 0.1 * 1.5 * 10) / 10;
      ablation = Math.round(base + clearAdjustment() + adjTissue + ageAdjustment + 1);
    } else if (method === "smartsurf") {
      const baseAbl = lookupAblationDepth(SMART_SURF_DATA, oz, generalSEKey);
      ablation = baseAbl !== null ? baseAbl + 2 + ageAdjustment : null;
    } else if (method === "femto") {
      const baseAbl = lookupAblationDepth(FEMTO_DATA, oz, generalSEKey);
      ablation = baseAbl !== null ? baseAbl + 1 + ageAdjustment : null;
    } else if (method === "smartsight") {
      const baseAbl = lookupAblationDepth(SMARTSIGHT_DATA, oz, generalSEKey);
      ablation = baseAbl !== null ? baseAbl + 1 + ageAdjustment : null;
    }

    if (ablation === null) {setResult(null);setNoData(true);return;}

    setNoData(false);
    const rsb = ct - flapVal - ablation;
    const pta = Math.round((flapVal + ablation) / ct * 1000) / 10;
    const safe = evaluateSafety(rsb);
    setResult({ ablationDepth: ablation, residualStroma: rsb, pta, cornealThickness: ct, flapThickness: flapVal, method: methodInfo?.label || method, safe });
  }

  const safe = result?.safe;
  const safeColor = safe === true ? "#10b981" : safe === "caution" ? "#f59e0b" : safe === false ? "#ef4444" : "#94a3b8";
  const safeLabel = safe === true ? T.safe : safe === "caution" ? T.caution : safe === false ? T.danger : "—";
  const methodColor = methodInfo?.color || "#0ea5e9";
  const ptaSafe = result ? evaluatePTA(result.pta) : null;
  const ptaColor = ptaSafe === true ? "#10b981" : ptaSafe === "caution" ? "#f59e0b" : ptaSafe === false ? "#ef4444" : "#94a3b8";
  const ptaLabel = ptaSafe === true ? T.safe : ptaSafe === "caution" ? T.caution : ptaSafe === false ? T.danger : "—";

  const bg = dark
    ? "linear-gradient(135deg, #0f172a 0%, #111827 55%, #0f1f1a 100%)"
    : "linear-gradient(135deg, #eef2ff 0%, #f8fafc 55%, #ecfdf5 100%)";
  const cardStyle = dark
    ? { background: "#1e293b", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)" }
    : CARD;

  return (
    <div ref={pageRef} className="min-h-screen" style={{ background: bg }}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.08] blur-3xl" style={{ background: methodColor }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-[0.05] blur-3xl" style={{ background: safeColor }} />
      </div>

      {/* Header */}
      <div className="relative border-b px-4 py-3" style={{ background: dark ? "rgba(15,23,42,0.97)" : "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", borderColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", boxShadow: "0 1px 12px rgba(0,0,0,0.04)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)", border: `1px solid ${methodColor}30` }}>
              <img src="https://media.base44.com/images/public/69a99af8642f7fbd093b18fa/7f92672da_hihorus-logo-square.png" alt="HiHorus" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight tracking-tight" style={{ color: dark ? "#f1f5f9" : "#0f172a" }}>RSB Calculator</h1>
              <p className="text-[10px] font-medium" style={{ color: dark ? "#94a3b8" : "#64748b" }}>ThS. BS Lê Thái Minh Hiếu</p>
              <p className="text-[10px] hidden sm:block" style={{ color: dark ? "#64748b" : "#94a3b8" }}>{T.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
              style={{ background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)", border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.09)" }}
              title={dark ? "Chế độ sáng" : "Chế độ tối"}>
              {dark
                ? <svg className="w-4 h-4" fill="#fbbf24" viewBox="0 0 24 24"><path d="M12 2a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zm0 16a1 1 0 011 1v1a1 1 0 01-2 0v-1a1 1 0 011-1zm8-8a1 1 0 010 2h-1a1 1 0 010-2h1zM4 12a1 1 0 010 2H3a1 1 0 010-2h1zm13.66-5.66a1 1 0 010 1.42l-.71.7a1 1 0 01-1.41-1.41l.7-.71a1 1 0 011.42 0zM7.05 16.95a1 1 0 010 1.41l-.7.71a1 1 0 01-1.42-1.42l.71-.7a1 1 0 011.41 0zm9.9 0a1 1 0 011.41 0l.71.7a1 1 0 01-1.42 1.42l-.7-.71a1 1 0 010-1.41zM5.64 7.05a1 1 0 011.41 0l.71.71A1 1 0 016.35 9.17l-.71-.71a1 1 0 010-1.41zM12 6a6 6 0 100 12A6 6 0 0012 6z"/></svg>
                : <svg className="w-4 h-4" fill="#475569" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>
              }
            </button>
            <button
              onClick={() => setLang(lang === "vi" ? "en" : "vi")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: dark ? "rgba(255,255,255,0.08)" : "white", border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.09)", color: dark ? "#94a3b8" : "#475569" }}>
              <span>{lang === "vi" ? "🇬🇧" : "🇻🇳"}</span>
              <span>{lang === "vi" ? "EN" : "VI"}</span>
            </button>
            {result &&
            <button
              onClick={() => setShowPDF(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.25)", color: "#0d9488" }}>
                📄 {T.exportPDF}
              </button>
            }
            <span className="hidden md:inline text-[10px] text-slate-400 italic">{T.poweredBy}</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="mx-auto pb-32 px-3 py-4 relative max-w-7xl sm:px-6 sm:py-6 sm:pb-6" style={{ background: dark ? "transparent" : "rgba(240,249,255,0.5)" }}>
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">

          {/* LEFT PANEL */}
          <div className="w-full lg:w-72 lg:flex-shrink-0">
            <div className="rounded-2xl p-4 sm:p-5 space-y-1" style={cardStyle}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-5 rounded-full" style={{ background: `linear-gradient(180deg, ${methodColor}, ${methodColor}50)` }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: dark ? "#94a3b8" : "#475569" }}>{T.inputParams}</span>
              </div>

              {/* Patient row */}
              <div className="mb-4 pb-4 flex items-end gap-2" style={{ borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#f1f5f9"}` }}>
                <div className="flex-1">
                  <label className="text-xs font-medium tracking-wide block mb-1.5" style={{ color: dark ? "#94a3b8" : "#64748b" }}>{T.birthYear}</label>
                  <input
                    type="text"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="w-full h-8 rounded-lg text-center text-sm font-bold outline-none transition-colors tabular-nums"
                    style={{ background: dark ? "#0f172a" : "white", border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0", color: dark ? "#f1f5f9" : "#0f172a" }} />

                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium tracking-wide block mb-1.5" style={{ color: dark ? "#94a3b8" : "#64748b" }}>{T.eye}</label>
                  <div className="grid grid-cols-2 gap-1">
                    {["right", "left"].map((e) =>
                    <button key={e}
                    onClick={() => setEye(e)}
                    className="h-8 rounded-lg text-[10px] font-semibold transition-all"
                    style={{
                      background: eye === e ? `${methodColor}18` : "rgba(0,0,0,0.03)",
                      border: `1px solid ${eye === e ? methodColor + "50" : "rgba(0,0,0,0.06)"}`,
                      color: eye === e ? methodColor : "#94a3b8"
                    }}>
                        {e === "right" ? "OD" : "OS"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Method */}
              <MethodDropdown method={method} setMethod={setMethod} methodColor={methodColor} dark={dark} T={T} isWip={isWip} methodInfo={methodInfo} />

              <div className="space-y-0">
                <NumberStepInput label={T.cct} value={cornea} onChange={setCornea} unit="μm" step={1} min={400} max={700} dark={dark} />
                <StepInput label={T.sphere} value={sphere} onChange={setSphere} unit="D" step={0.25} min={-14} max={0} dark={dark} />
                <StepInput label={T.cylinder} value={cylinder} onChange={setCylinder} unit="D" step={0.25} min={-5} max={0} dark={dark} />
                {hasFlap && <NumberStepInput label={T.flapCap} value={flap} onChange={setFlap} unit="μm" step={5} min={80} max={160} dark={dark} />}
                {!isClear && (
                  <StepInput
                    label={lang === "vi" ? "Target — Mục tiêu khúc xạ" : "Target — Refractive target"}
                    value={generalTarget}
                    onChange={setGeneralTarget}
                    unit="D" step={0.25} min={-2} max={2}
                    decimals={2}
                    showSign={true}
                    dark={dark}
                  />
                )}
                <StepInput label={T.oz} value={oz} onChange={setOz} unit="mm" step={0.1} min={6.0} max={7.5} decimals={1} dark={dark} />
              </div>

              {isClear &&
              <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="text-[10px] font-semibold text-teal-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <div className="w-1 h-3 rounded-full bg-teal-400" />
                    Q-value Adjustment
                  </div>
                  <StepInput label="Kmean" value={kmean} onChange={setKmean} unit="D" step={0.1} min={38} max={50} hint="ref 43.8" dark={dark} />
                  <StepInput label="Q value" value={qValue} onChange={setQValue} unit="" step={0.01} min={-1} max={0.5} hint="ref -0.26" decimals={2} dark={dark} />
                </div>
              }
            </div>
          </div>

          {/* RIGHT PANEL — hidden on mobile */}
          <div className="hidden sm:flex flex-1 flex-col gap-3 sm:gap-4">

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {/* Ablation */}
              <div className="rounded-2xl p-3 sm:p-5 relative overflow-hidden" style={cardStyle}>
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.07] blur-2xl" style={{ background: methodColor }} />
                <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest mb-1 sm:mb-3" style={{ color: dark ? "#64748b" : "#94a3b8" }}>{T.ablation}</div>
                <div className="flex items-end gap-1">
                  <div className="text-3xl sm:text-5xl font-black tabular-nums" style={{ color: result ? methodColor : "#cbd5e1" }}>
                    {result ? result.ablationDepth : "—"}
                  </div>
                  {result && <span className="text-[9px] mb-1 sm:mb-2" style={{ color: dark ? "#64748b" : "#94a3b8" }}>{T.approxNote}</span>}
                </div>
                <div className="text-[10px] sm:text-xs mt-1 mb-1 sm:mb-3" style={{ color: dark ? "#64748b" : "#94a3b8" }}>μm</div>
                {result &&
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md font-semibold truncate max-w-full" style={{ background: `${methodColor}10`, color: methodColor, border: `1px solid ${methodColor}20` }}>
                    {result.method}
                  </span>
                }
              </div>

              {/* RSB */}
              <div className="rounded-2xl p-3 sm:p-5 relative overflow-hidden" style={{
                ...cardStyle,
                border: result ? `1px solid ${safeColor}25` : cardStyle.border
              }}>
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-[0.07] blur-3xl" style={{ background: safeColor }} />
                <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest mb-1 sm:mb-3" style={{ color: dark ? "#64748b" : "#94a3b8" }}>RSB</div>
                <div className="flex items-end gap-1">
                  <div className="text-3xl sm:text-5xl font-black tabular-nums" style={{ color: result ? safeColor : "#cbd5e1" }}>
                    {result ? result.residualStroma : "—"}
                  </div>
                  {result && <span className="text-[9px] mb-1 sm:mb-2" style={{ color: dark ? "#64748b" : "#94a3b8" }}>{T.approxNote}</span>}
                </div>
                <div className="text-[10px] sm:text-xs mt-1 mb-1 sm:mb-2" style={{ color: dark ? "#64748b" : "#94a3b8" }}>μm</div>
                {result &&
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse" style={{ background: safeColor }} />
                    <span className="text-[10px] sm:text-xs font-bold" style={{ color: safeColor }}>{safeLabel}</span>
                  </div>
                }
              </div>

              {/* PTA */}
              <div className="rounded-2xl p-3 sm:p-5 relative" style={{
                ...cardStyle,
                border: result ? `1px solid ${ptaColor}25` : cardStyle.border,
                zIndex: 20
              }}>
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.07] blur-3xl pointer-events-none" style={{ background: ptaColor }} />
                <div className="flex items-center gap-1.5 mb-1 sm:mb-3">
                  <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest" style={{ color: dark ? "#64748b" : "#94a3b8" }}>PTA</div>
                  <div className="relative" style={{ zIndex: 60 }} ref={ptaInfoRef}>
                    <button
                      onClick={() => setShowPTAInfo(!showPTAInfo)}
                      className="w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] font-bold select-none transition-colors"
                      style={{
                        borderColor: showPTAInfo ? "#3b82f6" : "#cbd5e1",
                        color: showPTAInfo ? "#3b82f6" : "#94a3b8",
                        background: showPTAInfo ? "rgba(59,130,246,0.1)" : "transparent"
                      }}>i</button>
                    {showPTAInfo && (
                      <div className="absolute left-0 top-full mt-2" style={{ zIndex: 9999 }}>
                        <div className="rounded-xl px-3 py-2.5 shadow-xl space-y-1.5" style={{ width: "max-content", maxWidth: "280px", background: dark ? "#1e293b" : "white", border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0" }}>
                          <p className="text-[11px] font-mono" style={{ color: dark ? "#cbd5e1" : "#334155" }}>{T.ptaFormula}</p>
                          <div className="pt-1.5 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full flex-shrink-0 bg-emerald-500" />
                              <span className="text-[10px]" style={{ color: dark ? "#cbd5e1" : "#334155" }}><b>An toàn:</b> PTA &lt; 35%</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full flex-shrink-0 bg-amber-400" />
                              <span className="text-[10px]" style={{ color: dark ? "#cbd5e1" : "#334155" }}><b>Thận trọng:</b> PTA 35–40%</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full flex-shrink-0 bg-red-500" />
                              <span className="text-[10px]" style={{ color: dark ? "#cbd5e1" : "#334155" }}><b>Nguy hiểm:</b> PTA &gt; 40%</span>
                            </div>
                          </div>
                          <div className="pt-1.5 space-y-1" style={{ borderTop: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #f1f5f9" }}>
                            <p className="text-[9px] font-semibold uppercase" style={{ color: dark ? "#64748b" : "#94a3b8" }}>References</p>
                            <a href="https://pubmed.ncbi.nlm.nih.gov/24727263/" target="_blank" rel="noopener noreferrer"
                            className="block text-[9px] text-blue-500 hover:text-blue-600 underline">
                              Santhiago et al. 2014 — PTA &amp; ectasia risk (PMID 24727263)
                            </a>
                            <a href="https://pubmed.ncbi.nlm.nih.gov/27096376/" target="_blank" rel="noopener noreferrer"
                            className="block text-[9px] text-blue-500 hover:text-blue-600 underline">
                              Santhiago et al. 2016 — PTA threshold (PMID 27096376)
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-3xl sm:text-5xl font-black tabular-nums" style={{ color: result ? ptaColor : "#cbd5e1" }}>
                  {result ? result.pta : "—"}
                </div>
                <div className="text-[10px] sm:text-xs mt-1 mb-1 sm:mb-2" style={{ color: dark ? "#64748b" : "#94a3b8" }}>%</div>
                {result &&
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse" style={{ background: ptaColor }} />
                    <span className="text-[10px] sm:text-xs font-bold" style={{ color: ptaColor }}>{ptaLabel}</span>
                  </div>
                }
              </div>

              {/* Assessment */}
              <div className="rounded-2xl p-3 sm:p-4 relative overflow-hidden flex flex-col" style={cardStyle}>
                <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest mb-2 sm:mb-3" style={{ color: dark ? "#64748b" : "#94a3b8" }}>{T.assessment}</div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[10px] sm:text-xs font-semibold shrink-0" style={{ color: dark ? "#64748b" : "#94a3b8" }}>RSB</span>
                  <span className="text-xs sm:text-sm font-black truncate" style={{ color: result ? safeColor : "#cbd5e1" }}>{result ? safeLabel : "—"}</span>
                </div>
                <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
                  <span className="text-[10px] sm:text-xs font-semibold shrink-0" style={{ color: dark ? "#64748b" : "#94a3b8" }}>PTA</span>
                  <span className="text-xs sm:text-sm font-black truncate" style={{ color: result ? ptaColor : "#cbd5e1" }}>{result ? ptaLabel : "—"}</span>
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden mb-1">
                    <div className="flex-1 bg-red-400/40 rounded-l-full" />
                    <div className="flex-1 bg-amber-400/40" />
                    <div className="flex-1 bg-emerald-400/40 rounded-r-full" />
                  </div>
                  <div className="flex justify-between text-[8px] sm:text-[9px] text-slate-400 mt-1">
                    {T.rsbRange.map((r, i) => <span key={i}>{r}</span>)}
                  </div>
                </div>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl overflow-hidden" style={cardStyle}>
                <MethodVideo method={method} />
              </div>
              <div className="rounded-2xl overflow-hidden" style={cardStyle}>
                <OZOptimizationChart
                  method={method} se={seKey} sphere={sphere} cylinder={cylinder}
                  cornea={cornea} flap={hasFlap ? parseFloat(flap) : 0}
                  currentOz={oz} result={result} />
              </div>
            </div>

            {/* Bottom row */}
            <div className={isClear ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : ""}>
              {result && (() => {
                const ct = result.cornealThickness;
                const altMethods = METHODS.filter((m) => m.value !== method).map((m) => {
                  let abl = null;
                  if (m.value === "smartsurf") abl = lookupAblationDepth(SMART_SURF_DATA, oz, seKey);else
                  if (m.value === "femto") abl = lookupAblationDepth(FEMTO_DATA, oz, seKey);else
                  if (m.value === "smartsight") abl = lookupAblationDepth(SMARTSIGHT_DATA, oz, seKey);else
                  if (m.value === "clear") {const b = lookupClearZ8Depth(oz, seKey);abl = b !== null ? Math.round(b) : null;}
                  if (abl === null) return null;
                  const flapVal = m.hasFlap ? parseFloat(flap) : 0;
                  const rsb = ct - flapVal - abl;
                  const pta = Math.round((flapVal + abl) / ct * 1000) / 10;
                  return { ...m, rsb, pta, rsbSafe: evaluateSafety(rsb), ptaSafe: evaluatePTA(pta) };
                }).filter(Boolean);

                const worstSafe = safe === false || ptaSafe === false ? false :
                safe === "caution" || ptaSafe === "caution" ? "caution" : true;
                const verdictColor = worstSafe === true ? "#10b981" : worstSafe === "caution" ? "#f59e0b" : "#ef4444";

                const showAlts = altMethods.filter((m) => {
                  const mWorst = m.rsbSafe === false || m.ptaSafe === false ? false :
                  m.rsbSafe === "caution" || m.ptaSafe === "caution" ? "caution" : true;
                  if (worstSafe === true) return mWorst === true;
                  if (worstSafe === "caution") return mWorst === true || mWorst === "caution";
                  return mWorst !== null;
                });

                return (
                  <div className="rounded-2xl p-3 sm:p-4" style={{
                  background: dark ? `linear-gradient(135deg, ${verdictColor}12, #1e293b)` : `linear-gradient(135deg, ${verdictColor}06, white)`,
                    border: `1px solid ${verdictColor}20`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                  }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${verdictColor}15`, border: `1px solid ${verdictColor}25` }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: verdictColor }} />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: dark ? "#94a3b8" : "#475569" }}>{T.recommendations}</span>
                    </div>

                    <div className="flex gap-2 flex-wrap mb-3">
                      <div className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs" style={{ background: `${safeColor}10`, border: `1px solid ${safeColor}20` }}>
                        <span className="font-bold" style={{ color: safeColor }}>RSB {result.residualStroma}μm</span>
                        <span className="text-[10px]" style={{ color: safeColor }}>{safeLabel}</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs" style={{ background: `${ptaColor}10`, border: `1px solid ${ptaColor}20` }}>
                        <span className="font-bold" style={{ color: ptaColor }}>PTA {result.pta}%</span>
                        <span className="text-[10px]" style={{ color: ptaColor }}>{ptaLabel}</span>
                      </div>
                    </div>

                    <ul className="space-y-1.5">
                      {worstSafe === true &&
                      <>
                          <li className="text-sm flex items-start gap-2" style={{ color: dark ? "#cbd5e1" : "#334155" }}><span style={{ color: verdictColor }}>✓</span> {T.safeMsg1(result.residualStroma)}</li>
                          <li className="text-sm flex items-start gap-2" style={{ color: dark ? "#94a3b8" : "#64748b" }}><span style={{ color: verdictColor }}>✓</span> {T.safeMsg2}</li>
                        </>
                      }
                      {worstSafe === "caution" &&
                      <>
                          {safe === "caution" && <li className="text-sm flex items-start gap-2" style={{ color: dark ? "#cbd5e1" : "#334155" }}><span style={{ color: verdictColor }}>⚠</span> {T.cautionMsg1(result.residualStroma)}</li>}
                          {ptaSafe === "caution" && <li className="text-sm flex items-start gap-2" style={{ color: dark ? "#cbd5e1" : "#334155" }}><span style={{ color: verdictColor }}>⚠</span> {lang === "vi" ? `PTA ${result.pta}% ở ngưỡng thận trọng (35–40%)` : `PTA ${result.pta}% in caution range (35–40%)`}</li>}
                          <li className="text-sm flex items-start gap-2" style={{ color: dark ? "#94a3b8" : "#64748b" }}><span style={{ color: verdictColor }}>→</span> {T.cautionMsg2}</li>
                          <li className="text-sm flex items-start gap-2" style={{ color: dark ? "#94a3b8" : "#64748b" }}><span style={{ color: verdictColor }}>→</span> {T.cautionMsg3}</li>
                        </>
                      }
                      {worstSafe === false &&
                      <>
                          {safe === false && <li className="text-sm flex items-start gap-2" style={{ color: verdictColor }}><span>✕</span> {T.dangerMsg1(result.residualStroma)}</li>}
                          {ptaSafe === false && <li className="text-sm flex items-start gap-2" style={{ color: verdictColor }}><span>✕</span> {lang === "vi" ? `PTA ${result.pta}% vượt ngưỡng nguy hiểm (>40%)` : `PTA ${result.pta}% exceeds danger threshold (>40%)`}</li>}
                          <li className="text-sm flex items-start gap-2" style={{ color: dark ? "#94a3b8" : "#64748b" }}><span>→</span> {T.dangerMsg3}</li>
                        </>
                      }
                    {/* ICL recommendation when RSB or PTA is in danger zone */}
                    {(safe === false || ptaSafe === false) &&
                      <li className="text-sm flex items-start gap-2 mt-1 font-semibold" style={{ color: "#a78bfa" }}>
                        <span>💎</span>
                        {lang === "vi" ? "Cân nhắc Phakic ICL / IPCL thay thế" : "Consider Phakic ICL / IPCL as alternative"}
                      </li>
                    }
                    {/* SmartSurf high refraction warning */}
                    {method === "smartsurf" && Math.abs(seRaw) > 6 &&
                      <li className="text-sm flex items-start gap-2 mt-1 font-semibold" style={{ color: "#fb923c" }}>
                        <span>⚠</span>
                        {lang === "vi" ? `Tổng độ khúc xạ ${Math.abs(seRaw).toFixed(2)}D > 6D — Cân nhắc phương pháp khác hoặc ICL` : `Total refraction ${Math.abs(seRaw).toFixed(2)}D > 6D — Consider alternative methods or ICL`}
                      </li>
                    }
                    </ul>

                    {showAlts.length > 0 &&
                    <div className="mt-3 pt-2 border-t border-slate-100">
                        <div className="text-xs font-semibold mb-2" style={{ color: worstSafe === true ? "#059669" : "#d97706" }}>
                          {worstSafe === true ?
                        lang === "vi" ? "💡 Các phương pháp khác cũng an toàn:" : "💡 Other safe methods:" :
                        T.betterMethods}
                        </div>
                        <div className="space-y-1.5">
                          {showAlts.map((m) => {
                          const mWorst = m.rsbSafe === false || m.ptaSafe === false ? false :
                          m.rsbSafe === "caution" || m.ptaSafe === "caution" ? "caution" : true;
                          const mc = mWorst === true ? "#10b981" : mWorst === "caution" ? "#f59e0b" : "#ef4444";
                          return (
                            <div key={m.value} className="flex items-center gap-2 text-xs">
                                <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
                                <span style={{ color: m.color }} className="font-semibold">{m.label}</span>
                                <span className="text-slate-400">RSB</span>
                                <span className="font-bold" style={{ color: evaluateSafety(m.rsb) === true ? "#10b981" : evaluateSafety(m.rsb) === "caution" ? "#f59e0b" : "#ef4444" }}>{m.rsb}μm</span>
                                <span className="text-slate-300">·</span>
                                <span className="text-slate-400">PTA</span>
                                <span className="font-bold" style={{ color: evaluatePTA(m.pta) === true ? "#10b981" : evaluatePTA(m.pta) === "caution" ? "#f59e0b" : "#ef4444" }}>{m.pta}%</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ background: `${mc}12`, color: mc }}>
                                  {mWorst === true ? T.safe : mWorst === "caution" ? T.caution : T.danger}
                                </span>
                              </div>);

                        })}
                        </div>
                      </div>
                    }
                  </div>);

              })()}

              {isClear &&
              <NomogramSection
                birthYear={birthYear}
                seRaw={seRaw}
                kmean={kmean}
                target={nomogramTarget}
                setTarget={setNomogramTarget}
                adj={nomogramAdj}
                setAdj={setNomogramAdj}
                lang={lang} />

              }
            </div>

            {/* No data warning */}
            {!result && noData &&
            <div className="rounded-2xl p-4 sm:p-5" style={{ background: dark ? "rgba(120,80,0,0.2)" : "rgba(254,243,199,0.6)", border: "1px solid rgba(251,191,36,0.25)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}>
                    <span className="text-base">⚠️</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-amber-700 mb-1">{T.noDataTitle}</div>
                    <p className="text-sm text-amber-700/70 mb-2">{T.noDataDesc}</p>
                    <div className="mt-2 pt-2 border-t border-amber-200/60">
                      <div className="text-xs font-semibold text-amber-700 mb-1.5">{T.altOptions}</div>
                      <ul className="space-y-1">
                        <li className="text-xs text-amber-700/70 flex items-start gap-1.5"><span className="text-amber-500 mt-0.5">→</span> {T.icl}</li>
                        <li className="text-xs text-amber-700/70 flex items-start gap-1.5"><span className="text-amber-500 mt-0.5">→</span> {T.reduceRefraction}</li>
                        <li className="text-xs text-amber-700/70 flex items-start gap-1.5"><span className="text-amber-500 mt-0.5">→</span> {T.consultRefraction}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            }

            {/* WIP state */}
            {!result && !noData && isWip &&
            <div className="rounded-2xl p-8 text-center" style={{ background: dark ? `${methodColor}08` : `${methodColor}06`, border: `1px dashed ${methodColor}40` }}>
                <div className="text-3xl mb-3">🚧</div>
                <p className="text-sm font-bold mb-1" style={{ color: methodColor }}>Đang phát triển</p>
                <p className="text-xs" style={{ color: dark ? "#64748b" : "#94a3b8" }}>{methodInfo?.label}</p>
                <p className="text-xs mt-2" style={{ color: dark ? "#475569" : "#94a3b8" }}>Phương pháp này chưa có dữ liệu tính toán. Vui lòng theo dõi cập nhật.</p>
              </div>
            }

            {/* Empty state */}
            {!result && !noData && !isWip &&
            <div className="rounded-2xl p-8 text-center" style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: dark ? "1px dashed rgba(255,255,255,0.08)" : "1px dashed rgba(0,0,0,0.08)" }}>
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)" }}>
                  <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 15V9a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400">{T.emptyState}</p>
              </div>
            }
          </div>
        </div>
      </div>

      {/* Mobile Result Bar */}
      <MobileResultBar
        result={result} safe={safe} safeColor={safeColor} safeLabel={safeLabel}
        ptaSafe={ptaSafe} ptaColor={ptaColor} ptaLabel={ptaLabel} methodColor={methodColor}
        T={T} lang={lang} method={method} oz={oz} seKey={seKey} seRaw={seRaw} flap={flap} cornea={cornea} dark={dark} noData={noData}>
        <div className="grid grid-cols-1 gap-2">
          <div className="rounded-xl overflow-hidden" style={cardStyle}>
            <MethodVideo method={method} />
          </div>
          <div className="rounded-xl overflow-hidden" style={cardStyle}>
            <OZOptimizationChart
              method={method} se={seKey} sphere={sphere} cylinder={cylinder}
              cornea={cornea} flap={hasFlap ? parseFloat(flap) : 0}
              currentOz={oz} result={result} />
          </div>
          {isClear &&
          <NomogramSection
            birthYear={birthYear}
            seRaw={seRaw}
            kmean={kmean}
            target={nomogramTarget}
            setTarget={setNomogramTarget}
            adj={nomogramAdj}
            setAdj={setNomogramAdj}
            lang={lang} />

          }
        </div>
      </MobileResultBar>

      {/* About / Footer Info */}
      <div className="max-w-6xl mx-auto px-4 pb-8 sm:pb-10 mt-2 mb-32 sm:mb-0">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch">

          {/* LEFT: Tool info — 3 parts */}
          <div className="flex-[3] rounded-2xl p-5" style={{
            background: dark ? "rgba(255,255,255,0.03)" : "rgba(248,250,252,0.8)",
            border: dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)"
          }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: dark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <svg className="w-4 h-4" fill="none" stroke="#6366f1" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: dark ? "#6366f1" : "#4f46e5" }}>Về công cụ này</div>
                <div className="text-[10px]" style={{ color: dark ? "#475569" : "#94a3b8" }}>RSB Calculator · AI Model</div>
              </div>
            </div>
            <p className="text-xs leading-relaxed mb-3 text-justify" style={{ color: dark ? "#94a3b8" : "#475569" }}>
              Đây là mô hình AI được xây dựng và phát triển bởi <span className="font-semibold" style={{ color: dark ? "#cbd5e1" : "#334155" }}>ThS.BS Lê Thái Minh Hiếu</span> với mục tiêu giúp cho các bác sĩ/nhân viên y tế có thể dễ dàng đánh giá bệnh nhân phù hợp với phương pháp phẫu thuật nào trên hệ máy cụ thể, nhất là trong các trường hợp RSB của bệnh nhân tiệm cận vùng nguy hiểm.
            </p>
            <p className="text-xs leading-relaxed mb-3 text-justify" style={{ color: dark ? "#94a3b8" : "#475569" }}>
              Dữ liệu xây dựng được dựa vào trên <span className="font-semibold" style={{ color: dark ? "#cbd5e1" : "#334155" }}>100 ca phẫu thuật lasik thực tế</span> và trên <span className="font-semibold" style={{ color: dark ? "#cbd5e1" : "#334155" }}>400 ca lasik mô phỏng</span> chủ yếu trên các hệ máy của Schwind và Ziemer. Phương pháp SmartSight trên máy Schwind Atos được sự hỗ trợ từ <span className="font-semibold" style={{ color: dark ? "#cbd5e1" : "#334155" }}>Trung tâm Mắt Hải Yến</span>.
            </p>
            <p className="text-xs leading-relaxed text-justify" style={{ color: dark ? "#94a3b8" : "#475569" }}>
              Hiện đang cập nhật thêm các tính năng như Nomogram của các hãng và thêm các phương pháp khác (SMILE, SILK). Công cụ còn nhiều thiếu sót, mong quý đồng nghiệp có ý kiến phản hồi hoặc muốn thêm các tính năng xin vui lòng liên hệ với tác giả.
            </p>
          </div>

          {/* RIGHT: Contact — 1 part */}
          <div className="flex-[1] rounded-2xl p-5 flex flex-col gap-3" style={{
            background: dark ? "rgba(99,102,241,0.05)" : "rgba(99,102,241,0.04)",
            border: dark ? "1px solid rgba(99,102,241,0.18)" : "1px solid rgba(99,102,241,0.15)"
          }}>
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: dark ? "#6366f1" : "#4f46e5" }}>Liên hệ tác giả</div>

            <a
              href="https://www.facebook.com/hieu.le.788894/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: dark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#6366f1" }}>
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>

            <a
              href="mailto:ltminhhieu1996@gmail.com"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: dark ? "rgba(234,67,53,0.15)" : "rgba(234,67,53,0.07)", border: "1px solid rgba(234,67,53,0.25)", color: "#ea4335" }}>
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.910 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>
              ltminhhieu1996@gmail.com
            </a>

            <div className="flex-1 flex flex-col items-center justify-end gap-2 pt-2" style={{ borderTop: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(99,102,241,0.1)" }}>
              <div className="text-[10px] font-semibold" style={{ color: dark ? "#64748b" : "#94a3b8" }}>Zalo QR</div>
              <img
                src="https://media.base44.com/images/public/69a99af8642f7fbd093b18fa/163273318_7fc02366-aa84-406d-ab5b-d225765003ef.jpg"
                alt="Zalo QR Code"
                className="w-28 h-28 rounded-xl object-cover"
                style={{ border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)" }}
              />
              <span className="text-[10px] text-center" style={{ color: dark ? "#475569" : "#94a3b8" }}>Quét để liên hệ Zalo</span>
            </div>
          </div>

        </div>
      </div>

      {/* PDF Modal */}
      <PDFExportModal
        isOpen={showPDF}
        onClose={() => setShowPDF(false)}
        pageRef={pageRef}
        lang={lang} />

    </div>);

}