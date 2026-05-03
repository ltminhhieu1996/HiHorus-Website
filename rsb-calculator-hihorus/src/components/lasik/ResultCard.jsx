import React from "react";

export default function ResultCard({ result }) {
  if (!result) return null;

  const { ablationDepth, residualStroma, cornealThickness, method, safe } = result;

  const statusConfig = safe === null
    ? { label: "Không có dữ liệu", color: "bg-gray-100 text-gray-600", border: "border-gray-200", dot: "bg-gray-400" }
    : safe === true
    ? { label: "An toàn", color: "bg-emerald-50 text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" }
    : safe === "caution"
    ? { label: "Cần thận trọng (250–270 μm)", color: "bg-amber-50 text-amber-700", border: "border-amber-200", dot: "bg-amber-500" }
    : { label: "Nguy hiểm (< 250 μm)", color: "bg-red-50 text-red-700", border: "border-red-200", dot: "bg-red-500" };

  return (
    <div className={`rounded-2xl border-2 ${statusConfig.border} overflow-hidden`}>
      {/* Header */}
      <div className={`px-6 py-4 ${statusConfig.color} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${statusConfig.dot}`} />
          <span className="font-semibold text-lg">{statusConfig.label}</span>
        </div>
        <span className="text-sm font-medium opacity-70">{method}</span>
      </div>

      {/* Values */}
      <div className="bg-white p-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-800">
              {ablationDepth !== null ? ablationDepth : "—"}
            </div>
            <div className="text-xs text-slate-500 mt-1">Mô mất đi (μm)</div>
          </div>
          <div className="text-center border-x border-slate-100">
            <div className={`text-3xl font-bold ${
              safe === false ? "text-red-600" : safe === "caution" ? "text-amber-600" : "text-emerald-600"
            }`}>
              {residualStroma !== null ? residualStroma : "—"}
            </div>
            <div className="text-xs text-slate-500 mt-1">Mô tồn dư (μm)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-800">
              {cornealThickness}
            </div>
            <div className="text-xs text-slate-500 mt-1">Giác mạc ban đầu (μm)</div>
          </div>
        </div>

        {/* Threshold bar */}
        {residualStroma !== null && (
          <div className="mt-5">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>0 μm</span>
              <span className="text-red-400">Nguy hiểm &lt;250</span>
              <span className="text-amber-400">Thận trọng &lt;270</span>
              <span className="text-emerald-400">An toàn ≥270</span>
              <span>{Math.max(500, residualStroma + 50)} μm</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  safe === false ? "bg-red-500" : safe === "caution" ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, (residualStroma / 500) * 100)}%` }}
              />
            </div>
            <div className="text-right text-xs text-slate-400 mt-1">{residualStroma} μm tồn dư</div>
          </div>
        )}
      </div>
    </div>
  );
}