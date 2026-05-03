import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Area, AreaChart, Legend } from "recharts";
import { SMART_SURF_DATA, FEMTO_DATA, SMARTSIGHT_DATA, CLEARZ8_DATA, lookupAblationDepth } from "./lasikData";

export default function OZOptimizationChart({ method, se, sphere, cylinder, cornea, flap, currentOz, result }) {
  if (!cornea || !result) return null;

  const ozList = [6.0, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 7.0, 7.1, 7.2, 7.3, 7.4, 7.5];
  const ct = parseFloat(cornea);

  const data = ozList.map(oz => {
    let ablation = null;
    if (method === "smartsurf") ablation = lookupAblationDepth(SMART_SURF_DATA, oz.toFixed(1), se);
    else if (method === "femto") ablation = lookupAblationDepth(FEMTO_DATA, oz.toFixed(1), se);
    else if (method === "smartsight") ablation = lookupAblationDepth(SMARTSIGHT_DATA, oz.toFixed(1), se);
    else if (method === "clear") ablation = lookupAblationDepth(CLEARZ8_DATA, oz.toFixed(1), se);

    const rsb = ablation !== null ? ct - flap - ablation : null;
    return { oz: oz.toFixed(1), rsb };
  }).filter(d => d.rsb !== null);

  // Find safest OZ
  const safeOZ = data.find(d => d.rsb >= 300);
  const currentRSB = result.residualStroma;

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.oz === String(parseFloat(currentOz).toFixed(1))) {
      return <circle cx={cx} cy={cy} r={6} fill="#3b82f6" stroke="white" strokeWidth={2} />;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-800 text-sm">Tối ưu hóa Vùng Quang học</h3>
        <div className="text-xs text-slate-500 space-x-3">
          <span className="text-blue-500 font-medium">● Hiện tại: {parseFloat(currentOz).toFixed(1)}mm</span>
          {safeOZ && <span className="text-emerald-600 font-medium">◯ OZ An toàn tối đa: {safeOZ.oz}mm</span>}
          <span className="text-emerald-600 font-medium">RSB: {currentRSB}μm</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="rsbGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="oz" tick={{ fontSize: 10, fill: "#94a3b8" }} label={{ value: "Vùng Quang học (mm)", position: "insideBottom", offset: -2, fontSize: 10, fill: "#94a3b8" }} />
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} domain={[150, 450]} />
          <Tooltip
            formatter={(val) => [`${val} μm`, "RSB"]}
            labelFormatter={(l) => `OZ: ${l}mm`}
            contentStyle={{ fontSize: 11, borderRadius: 8 }}
          />
          <ReferenceLine y={300} stroke="#10b981" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: "300", position: "right", fontSize: 10, fill: "#10b981" }} />
          <ReferenceLine y={280} stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: "280", position: "right", fontSize: 10, fill: "#f59e0b" }} />
          <ReferenceLine y={250} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1.5} />
          <Area type="monotone" dataKey="rsb" stroke="#10b981" strokeWidth={2} fill="url(#rsbGradient)" dot={<CustomDot />} />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex gap-4 mt-2 justify-center">
        <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="w-3 h-2 rounded-sm bg-emerald-100 inline-block" /> An toàn</span>
        <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="w-3 h-2 rounded-sm bg-amber-100 inline-block" /> Cảnh báo</span>
        <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="w-3 h-2 rounded-sm bg-red-100 inline-block" /> Nguy hiểm</span>
      </div>
    </div>
  );
}