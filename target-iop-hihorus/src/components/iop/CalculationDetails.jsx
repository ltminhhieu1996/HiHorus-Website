import React from 'react';
import { Activity } from 'lucide-react';
import { aaoLevels } from './AAOForm';

const zLabels = {
  vi: [
    'Đĩa thị bình thường, thị trường bình thường',
    'Đĩa thị bất thường, thị trường bình thường',
    'Mất thị trường chưa đe dọa fixation',
    'Mất thị trường đe dọa fixation',
  ],
  en: [
    'Normal disc, normal visual field',
    'Abnormal disc, normal visual field',
    'VF loss not threatening fixation',
    'VF loss threatening fixation',
  ],
};

const yLabels = {
  vi: ['Không ảnh hưởng chất lượng sống', 'Ảnh hưởng nhẹ', 'Ảnh hưởng trung bình', 'Ảnh hưởng nặng'],
  en: ['No QOL impact', 'Mild QOL impact', 'Moderate QOL impact', 'Severe QOL impact'],
};

const clinicalLabels = {
  vi: { suspect: 'Nghi ngờ / OHT', mild: 'Nhẹ', moderate: 'Trung bình', severe: 'Nặng', ntg: 'NTG' },
  en: { suspect: 'Suspect / OHT', mild: 'Mild', moderate: 'Moderate', severe: 'Severe', ntg: 'NTG' },
};

export default function CalculationDetails({ method, correctedIOP, targetIOP, z, y, aaoLevel, clinicalStage, lang = 'vi' }) {
  const L = lang;
  const methodLabels = {
    jampel: L === 'vi' ? 'Công thức Jampel 1999' : 'Jampel 1999 Formula',
    aao: L === 'vi' ? 'Hướng dẫn AAO' : 'AAO Guidelines',
    clinical: L === 'vi' ? 'Nghiên cứu Lâm sàng' : 'Clinical Studies',
  };

  const getDescription = () => {
    if (method === 'aao') {
      const found = aaoLevels.find(l => l.level === aaoLevel);
      return found ? (L === 'vi' ? found.label : found.labelEn) : '';
    }
    if (method === 'clinical') {
      return clinicalLabels[L][clinicalStage] || '';
    }
    return '';
  };

  const getReductionText = () => {
    if (method === 'aao') {
      const found = aaoLevels.find(l => l.level === aaoLevel);
      if (found) return L === 'vi'
        ? `Giảm ${found.reduction[0]}-${found.reduction[1]}% so với nền`
        : `Reduce ${found.reduction[0]}-${found.reduction[1]}% from baseline`;
    }
    if (method === 'clinical') {
      const r = { suspect: '20', mild: '20-30', moderate: '30-40', severe: '>40', ntg: '30' };
      const v = r[clinicalStage] || '25';
      return L === 'vi' ? `Giảm ${v}% so với nền` : `Reduce ${v}% from baseline`;
    }
    return '';
  };

  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-muted-foreground">⊙</span>
        <span className="text-sm font-semibold">
          {L === 'vi' ? 'Chi tiết Tính toán' : 'Calculation Details'}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            {L === 'vi' ? 'Phương pháp sử dụng' : 'Method used'}
          </p>
          <p className="text-sm font-medium text-primary">{methodLabels[method]}</p>
          {getDescription() && (
            <p className="text-xs text-muted-foreground mt-0.5">{getDescription()}</p>
          )}
        </div>

        {(method === 'aao' || method === 'clinical') && (
          <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
            <Activity className="w-3.5 h-3.5 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground">{getReductionText()}</p>
          </div>
        )}

        {method === 'jampel' && (
          <>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs font-mono text-foreground/80 break-all">
                Target = {correctedIOP.toFixed(1)} × (1 - {correctedIOP.toFixed(1)}/100) - {z} + {y} ± 1
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">Z</span>
                <p className="text-xs text-muted-foreground">{zLabels[L][z]}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">Y</span>
                <p className="text-xs text-muted-foreground">{yLabels[L][y]}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}