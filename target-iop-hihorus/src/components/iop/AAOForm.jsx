import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity } from 'lucide-react';

export const aaoLevels = [
  { level: 1, reduction: [20, 30], label: 'Glôcôm tổn thương nhẹ (cupping đĩa thị, chưa mất VF)', labelEn: 'Mild Glaucoma (optic disc cupping, no VF loss)' },
  { level: 2, reduction: [30, 40], label: 'Glôcôm tổn thương nặng', labelEn: 'Severe Glaucoma' },
  { level: 3, reduction: [30, 40], label: 'Glôcôm nhãn áp thường (NTG)', labelEn: 'Normal Tension Glaucoma (NTG)' },
  { level: 4, reduction: [20, 25], label: 'Tăng nhãn áp đơn thuần', labelEn: 'Ocular Hypertension (OHT)' },
  { level: 5, reduction: [25, 35], label: 'Glôcôm góc mở với IOP giữa đến cao 20s', labelEn: 'POAG with IOP in mid-to-high 20s' },
  { level: 6, reduction: [30, 40], label: 'Glôcôm tiến triển', labelEn: 'Progressive Glaucoma' },
  { level: 7, reduction: [40, 50], label: 'OHT với IOP > 30 mmHg, không tổn thương thần kinh thị', labelEn: 'OHT with IOP > 30 mmHg, no nerve damage' },
];

export default function AAOForm({ level, onLevelChange, lang }) {
  const selected = aaoLevels.find(l => l.level === level) || aaoLevels[0];

  return (
    <div>
      <p className="text-sm font-medium mb-3">
        {lang === 'vi' ? 'Tình trạng Lâm sàng (AAO)' : 'Clinical Condition (AAO)'}
      </p>
      <Select value={String(level)} onValueChange={v => onLevelChange(Number(v))}>
        <SelectTrigger className="w-full bg-muted border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {aaoLevels.map(item => (
            <SelectItem key={item.level} value={String(item.level)}>
              {lang === 'vi' ? item.label : item.labelEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="mt-3 bg-muted rounded-lg p-3 flex items-start gap-2">
        <Activity className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          {lang === 'vi'
            ? `Giảm ${selected.reduction[0]}-${selected.reduction[1]}% so với nền`
            : `Reduce ${selected.reduction[0]}-${selected.reduction[1]}% from baseline`}
        </p>
      </div>
    </div>
  );
}