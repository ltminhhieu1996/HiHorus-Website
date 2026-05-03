import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity } from 'lucide-react';

const stages = {
  vi: [
    { id: 'suspect', label: 'Nghi ngờ / OHT', study: 'Damji', reduction: '20%', range: '< 24 mmHg', desc: 'Nhãn áp cao, đĩa thị/thị trường bình thường.' },
    { id: 'mild', label: 'Nhẹ (Mild)', study: 'CIGTS', reduction: '20-30%', range: '15 - 17 mmHg', desc: 'Tổn thương đĩa thị khu trú, chưa ảnh hưởng thị trường trung tâm.' },
    { id: 'moderate', label: 'Trung bình (Moderate)', study: 'AGIS', reduction: '30-40%', range: '12 - 15 mmHg', desc: 'Khuyết thị trường rõ, nhưng cách điểm định thị > 5-10 độ.' },
    { id: 'severe', label: 'Nặng (Severe)', study: 'AGIS', reduction: '>40%', range: '10 - 12 mmHg', desc: 'Tổn thương đĩa thị lan tỏa, khuyết thị trường sát điểm định thị.' },
    { id: 'ntg', label: 'NTG', study: 'Damji', reduction: '30%', range: '8 - 10 mmHg', desc: 'Nhãn áp nền < 21 mmHg nhưng vẫn có tổn thương.' },
  ],
  en: [
    { id: 'suspect', label: 'Suspect / OHT', study: 'Damji', reduction: '20%', range: '< 24 mmHg', desc: 'High IOP, normal disc/visual field.' },
    { id: 'mild', label: 'Mild', study: 'CIGTS', reduction: '20-30%', range: '15 - 17 mmHg', desc: 'Focal disc damage, no central VF involvement.' },
    { id: 'moderate', label: 'Moderate', study: 'AGIS', reduction: '30-40%', range: '12 - 15 mmHg', desc: 'Definite VF defect, >5-10° from fixation.' },
    { id: 'severe', label: 'Severe', study: 'AGIS', reduction: '>40%', range: '10 - 12 mmHg', desc: 'Diffuse disc damage, VF defect near fixation.' },
    { id: 'ntg', label: 'NTG', study: 'Damji', reduction: '30%', range: '8 - 10 mmHg', desc: 'Baseline IOP < 21 mmHg with damage present.' },
  ],
};

export default function ClinicalStudiesForm({ stage, onStageChange, lang = 'vi' }) {
  const stageList = stages[lang];
  const selected = stageList.find(s => s.id === stage) || stageList[0];

  return (
    <div>
      <p className="text-sm font-medium mb-1">
        {lang === 'vi' ? 'Chọn giai đoạn bệnh' : 'Select Disease Stage'}
      </p>
      <p className="text-xs text-muted-foreground mb-3">
        {lang === 'vi' ? 'Theo Damji, CIGTS, AGIS' : 'Based on Damji, CIGTS, AGIS'}
      </p>
      <Select value={stage} onValueChange={onStageChange}>
        <SelectTrigger className="w-full bg-muted border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {stageList.map(s => (
            <SelectItem key={s.id} value={s.id}>
              {s.label} — {s.study}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="mt-3 bg-muted rounded-lg p-3 space-y-1">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">
            {lang === 'vi'
              ? `Giảm ${selected.reduction} · Mục tiêu ${selected.range}`
              : `Reduce ${selected.reduction} · Target ${selected.range}`}
          </p>
        </div>
        <p className="text-xs text-muted-foreground pl-6">{selected.desc}</p>
      </div>
    </div>
  );
}