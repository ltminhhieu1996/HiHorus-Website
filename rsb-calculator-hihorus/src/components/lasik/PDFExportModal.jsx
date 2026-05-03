import React, { useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function PDFExportModal({ isOpen, onClose, pageRef, lang }) {
  const [hospitalName, setHospitalName] = useState("");
  const [loading, setLoading] = useState(false);
  const isVi = lang === "vi";

  if (!isOpen) return null;

  const generatePDF = async () => {
    setLoading(true);
    try {
      const canvas = await html2canvas(pageRef.current, {
        backgroundColor: "#0a0f1e",
        scale: 1.5,
        useCORS: true,
        logging: false,
        ignoreElements: (el) => el.classList?.contains("pdf-modal-overlay"),
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll("style").forEach((el) => {
            if (el.textContent.includes("oklch")) {
              el.textContent = el.textContent.replace(/oklch\([^)]+\)/g, "transparent");
            }
          });
        },
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const headerH = 44;
      const totalH = imgHeight + headerH;

      const doc = new jsPDF({
        orientation: imgWidth > imgHeight ? "l" : "p",
        unit: "px",
        format: [imgWidth, totalH],
        hotfixes: ["px_scaling"],
      });

      const pw = doc.internal.pageSize.getWidth();

      // Header band
      doc.setFillColor(10, 15, 30);
      doc.rect(0, 0, pw, headerH, "F");
      doc.setFillColor(20, 184, 166);
      doc.rect(0, headerH - 2, pw, 2, "F");

      // Hospital name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      const name = hospitalName.trim() || (isVi ? "Benh vien / Phong kham" : "Hospital / Clinic");
      doc.text(name, pw / 2, headerH / 2 + 5, { align: "center" });

      // Screenshot
      doc.addImage(imgData, "JPEG", 0, headerH, imgWidth, imgHeight);

      const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
      doc.save(`RSB_Report_${today}.pdf`);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="pdf-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "#0f172a", border: "1px solid rgba(20,184,166,0.4)" }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2 h-6 rounded-full bg-teal-400" />
          <h3 className="text-sm font-bold text-white">{isVi ? "Xuất báo cáo PDF" : "Export PDF Report"}</h3>
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-slate-300 text-lg">✕</button>
        </div>

        <div className="mb-4">
          <label className="text-xs text-slate-400 mb-1.5 block">
            {isVi ? "Tên bệnh viện / phòng khám" : "Hospital / Clinic Name"}
          </label>
          <input
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-teal-500 transition-colors"
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            placeholder={isVi ? "VD: BV Mắt TP.HCM" : "e.g. Eye Hospital HCMC"}
            autoFocus
          />
        </div>

        <p className="text-xs text-slate-500 mb-5">
          {isVi ? "PDF sẽ chụp toàn bộ giao diện hiện tại kèm tên bệnh viện." : "PDF will capture the full current interface with the hospital name."}
        </p>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm text-slate-400 border border-slate-700 hover:bg-slate-800 transition-all">
            {isVi ? "Hủy" : "Cancel"}
          </button>
          <button
            onClick={generatePDF}
            disabled={loading}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}>
            {loading
              ? (isVi ? "⏳ Đang xuất..." : "⏳ Exporting...")
              : (isVi ? "📄 Xuất PDF" : "📄 Export PDF")}
          </button>
        </div>
      </div>
    </div>
  );
}