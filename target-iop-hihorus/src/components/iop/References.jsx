import React from 'react';
import { BookOpen } from 'lucide-react';

const references = [
  {
    num: 1,
    text: 'Jampel HD. Glaucoma Care Update Target Pressure in Glaucoma Therapy: Journal of Glaucoma. 1997;6(2):133–139.',
    doi: 'doi:10.1097/00061198-199704000-00010',
  },
  {
    num: 2,
    text: 'Abdelrahman AM. Noninvasive Glaucoma Procedures: Current Options and Future Innovations. Middle East Afr J Ophthalmol. 2015;22(1):2-9.',
    doi: 'doi:10.4103/0974-9233.148342',
  },
  {
    num: 3,
    text: 'Damji KF, Shah KC, Rock WJ, Bains HS, Hodge WG. Selective laser trabeculoplasty vargon laser trabeculoplasty: a prospective randomised clinical trial. British Journal of Ophthalmology. 1999;83(6):718-722.',
    doi: 'doi:10.1136/bjo.83.6.718',
  },
  {
    num: 4,
    text: 'Sihota R, Angmo D, Ramaswamy D, Dada T. Simplifying "target" intraocular pressure for different stages of primary open-angle glaucoma and primary angle-closure glaucoma. Indian J Ophthalmol. 2018;66(4):495-505.',
    doi: 'doi:10.4103/ijo.IJO_1130_17',
  },
  {
    num: 5,
    text: 'The Advanced Glaucoma Intervention Study (AGIS): 7. The relationship between control of intraocular pressure and visual field deterioration. The AGIS Investigators. Am J Ophthalmol. 2000;130(4):429-440.',
    doi: 'doi:10.1016/s0002-9394(00)00538-9',
  },
  {
    num: 6,
    text: 'Musch DC, Gillespie BW, Lichter PR, Niziol LM, Janz NK, CIGTS Study Investigators. Visual field progression in the Collaborative Initial Glaucoma Treatment Study the impact of treatment and other baseline factors. Ophthalmology. 2009;116(2):200-207.',
    doi: 'doi:10.1016/j.ophtha.2008.08.051',
  },
  {
    num: 7,
    text: 'Gedde SJ, Vinod K, Wright MM, et al. Primary Open-Angle Glaucoma Preferred Practice Pattern®. Ophthalmology. 2021;128(1):P71-P150.',
    doi: 'doi:10.1016/j.ophtha.2020.10.022',
  },
];

export default function References({ lang }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">
          {lang === 'vi' ? 'Tài liệu Tham khảo' : 'References'}
        </span>
      </div>
      <ol className="space-y-3">
        {references.map(ref => (
          <li key={ref.num} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
            <span className="text-primary font-semibold shrink-0">{ref.num}.</span>
            <span>
              {ref.text}{' '}
              <span className="text-primary/70">{ref.doi}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="text-[11px] text-muted-foreground/60 italic mt-4 pt-3 border-t border-border">
        {lang === 'vi'
          ? 'Các tài liệu tham khảo này hỗ trợ các hướng dẫn lâm sàng và phương pháp tính toán được sử dụng trong công cụ Nhãn áp đích này.'
          : 'These references support the clinical guidelines and calculation methods used in this Target IOP tool.'}
      </p>
    </div>
  );
}