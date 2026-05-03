import React from 'react';
import { CheckCircle } from 'lucide-react';

function getRecommendation(reductionPct, lang) {
  const L = lang;
  if (reductionPct <= 20) {
    return {
      text: L === 'vi'
        ? 'Mục tiêu giảm nhãn áp nhẹ (≤20%) – có thể đạt được với đơn trị liệu bằng 1 thuốc nhỏ mắt.'
        : 'Mild IOP reduction target (≤20%) – achievable with monotherapy (1 eye drop).',
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-800',
    };
  }
  if (reductionPct <= 35) {
    return {
      text: L === 'vi'
        ? `Mục tiêu giảm nhãn áp vừa phải (${Math.round(reductionPct)}%) – có thể đạt được với đơn trị liệu hoặc 2 thuốc.`
        : `Moderate IOP reduction target (${Math.round(reductionPct)}%) – achievable with monotherapy or 2 medications.`,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-800',
    };
  }
  return {
    text: L === 'vi'
      ? `Mục tiêu giảm nhãn áp lớn (${Math.round(reductionPct)}%) – cần phối hợp ≥2 thuốc hoặc xem xét laser/phẫu thuật.`
      : `Large IOP reduction target (${Math.round(reductionPct)}%) – requires ≥2 medications or laser/surgery.`,
    color: 'text-yellow-700 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-200 dark:border-yellow-800',
  };
}

export default function ClinicalRecommendation({ reductionPct, lang = 'vi' }) {
  const rec = getRecommendation(reductionPct, lang);

  return (
    <div className={`rounded-2xl p-5 border shadow-sm ${rec.bg} ${rec.border}`}>
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className={`w-5 h-5 ${rec.color}`} />
        <span className="text-sm font-semibold">
          {lang === 'vi' ? 'Khuyến nghị Lâm sàng' : 'Clinical Recommendation'}
        </span>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-primary mt-0.5">↳</span>
        <p className="text-sm text-foreground/80 leading-relaxed">{rec.text}</p>
      </div>
    </div>
  );
}