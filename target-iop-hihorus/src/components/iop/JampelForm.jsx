import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const zOptions = {
  vi: [
    { value: 0, label: 'Z = 0 — Đĩa thị bình thường, thị trường bình thường', desc: 'Không có dấu hiệu glôcôm. RNFL, GCC, C/D ratio trong giới hạn. MD thị trường trong khoảng bình thường.' },
    { value: 1, label: 'Z = 1 — Đĩa thị bất thường, thị trường bình thường', desc: 'Có dấu hiệu nghi ngờ glôcôm: C/D lớn, notch nhẹ, RNFL mỏng khu trú – nhưng thị trường chưa giảm.' },
    { value: 2, label: 'Z = 2 — Mất thị trường chưa đe dọa điểm định thị', desc: 'Tổn thương VF mức độ nhẹ–trung bình: arcuate scotoma, nasal step, paracentral scotoma nhưng cách điểm định thị >5°.' },
    { value: 3, label: 'Z = 3 — Mất thị trường đe dọa điểm định thị', desc: 'Tổn thương VF nặng: paracentral sâu, defect sát hoặc vào 5° quanh điểm định thị. Có nguy cơ giảm thị lực trung tâm.' },
  ],
  en: [
    { value: 0, label: 'Z = 0 — Normal disc, normal visual field', desc: 'No glaucoma signs. RNFL, GCC, C/D ratio within normal limits. MD within normal range.' },
    { value: 1, label: 'Z = 1 — Abnormal disc, normal visual field', desc: 'Suspicious glaucoma signs: large C/D, mild notch, focal RNFL thinning – but no VF loss yet.' },
    { value: 2, label: 'Z = 2 — VF loss not threatening fixation', desc: 'Mild-moderate VF damage: arcuate scotoma, nasal step, paracentral scotoma >5° from điểm định thị.' },
    { value: 3, label: 'Z = 3 — VF loss threatening fixation', desc: 'Severe VF damage: deep paracentral defect at or within 5° of điểm định thị. Risk of central vision loss.' },
  ],
};

const yOptions = {
  vi: [
    { value: 0, label: 'Y = 0', title: 'Không ảnh hưởng chất lượng sống', desc: 'Chưa dùng thuốc hoặc chỉ cần theo dõi. Không có tác dụng phụ, không tốn kém, không phiền toái.' },
    { value: 1, label: 'Y = 1', title: 'Ảnh hưởng nhẹ', desc: 'Dùng 1 thuốc có tác dụng phụ nhẹ, chi phí nhẹ, tuân thủ tốt. Ảnh hưởng QOL không đáng kể.' },
    { value: 2, label: 'Y = 2', title: 'Ảnh hưởng trung bình', desc: 'Dùng ≥2 thuốc, tác dụng phụ rõ hơn (cộm, đỏ), phải đi khám nhiều lần, ảnh hưởng công việc.' },
    { value: 3, label: 'Y = 3', title: 'Ảnh hưởng nặng', desc: 'Dùng ≥3 thuốc, tác dụng phụ đáng kể, chi phí lớn, tuân thủ kém, hoặc cần phẫu thuật. QOL giảm rõ rệt.' },
  ],
  en: [
    { value: 0, label: 'Y = 0', title: 'No QOL impact', desc: 'No medications or observation only. No side effects, no cost, no inconvenience.' },
    { value: 1, label: 'Y = 1', title: 'Mild impact', desc: '1 medication with mild side effects, low cost, good compliance. Minimal QOL impact.' },
    { value: 2, label: 'Y = 2', title: 'Moderate impact', desc: '≥2 medications, more noticeable side effects (irritation, redness), frequent visits, affects work.' },
    { value: 3, label: 'Y = 3', title: 'Severe impact', desc: '≥3 medications, significant side effects, high cost, poor compliance, or surgery needed. Marked QOL reduction.' },
  ],
};

function YOption({ opt, selected, onSelect }) {
  const [showDesc, setShowDesc] = React.useState(false);

  return (
    <div className="relative flex flex-col">
      <button
        onClick={onSelect}
        className={cn(
          "w-full h-full text-left p-3 rounded-xl border-2 transition-all duration-200 flex flex-col",
          selected ? "border-primary bg-accent shadow-sm" : "border-border bg-card hover:border-primary/40"
        )}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", selected ? "border-primary" : "border-muted-foreground/40")}>
            {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
          </div>
          <span className={cn("text-sm font-semibold", selected ? "text-primary" : "text-foreground")}>{opt.label}</span>

        </div>
        <p className="text-xs font-medium text-muted-foreground">{opt.title}</p>
      </button>
      {showDesc && (
        <div className="mt-1 px-3 py-2 bg-muted rounded-lg text-xs text-muted-foreground leading-relaxed border border-border">
          {opt.desc}
        </div>
      )}
    </div>
  );
}

export default function JampelForm({ z, y, onZChange, onYChange, lang = 'vi' }) {
  const [showYDesc, setShowYDesc] = React.useState(false);
  const zOpts = zOptions[lang];
  const yOpts = yOptions[lang];

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-sm font-medium">
            {lang === 'vi' ? 'Hệ số Z - Mức độ Tổn thương Thị trường' : 'Z Factor - Visual Field Damage'}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
              <TooltipContent><p className="text-xs max-w-[250px]">
                {lang === 'vi' ? 'Z đánh giá mức độ tổn thương thị trường theo Jampel 1999' : 'Z assesses visual field damage level per Jampel 1999'}
              </p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select value={String(z)} onValueChange={v => onZChange(Number(v))}>
          <SelectTrigger className="w-full bg-muted border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {zOpts.map(opt => (
              <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1.5 flex items-start gap-1">
          <Info className="w-3 h-3 mt-0.5 shrink-0" />
          {zOpts.find(o => o.value === z)?.desc}
        </p>
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-sm font-medium">
            {lang === 'vi' ? 'Hệ số Y - Ảnh hưởng Chất lượng Sống' : 'Y Factor - Quality of Life Impact'}
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-4 h-4 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30 transition-colors">
                <Info className="w-2.5 h-2.5 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent side="right" className="w-72 p-3">
              <div className="space-y-3">
                {yOpts.map(opt => (
                  <div key={opt.value}>
                    <p className="font-semibold text-xs text-foreground">{opt.label} — {opt.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="mb-3 px-3 py-2 bg-muted rounded-lg text-xs text-muted-foreground leading-relaxed border border-border">
          {yOpts.find(o => o.value === y)?.desc}
        </div>
        <div className="grid grid-cols-2 gap-3 items-stretch">
          {yOpts.map(opt => (
            <YOption key={opt.value} opt={opt} selected={y === opt.value} onSelect={() => onYChange(opt.value)} />
          ))}
        </div>
      </div>
    </div>
  );
}