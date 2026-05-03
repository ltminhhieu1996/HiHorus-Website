import React from 'react';
import { Info, Facebook, Mail } from 'lucide-react';

export default function AboutSection({ lang }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Info className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
            {lang === 'vi' ? 'Về Công cụ Này' : 'About This Tool'}
          </h3>
          <p className="text-[10px] text-muted-foreground">IOP Calculator · AI Model</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Description */}
        <div className="lg:col-span-2 space-y-3 text-sm text-foreground/80 leading-relaxed">
          <p>
            {lang === 'vi' ? (
              <>Đây là mô hình AI được xây dựng và phát triển bởi <span className="font-semibold text-foreground">ThS.BS Lê Thái Minh Hiếu</span> với mục tiêu giúp cho các bác sĩ/nhân viên y tế có thể dễ dàng đánh giá và tính toán nhãn áp đích tối ưu trong điều trị Glôcôm.</>
            ) : (
              <>This AI model was built and developed by <span className="font-semibold text-foreground">MSc. Dr. Le Thai Minh Hieu</span> with the goal of helping doctors and medical staff easily calculate the optimal target IOP for Glaucoma treatment.</>
            )}
          </p>
          <p>
            {lang === 'vi'
              ? 'Công cụ tích hợp ba phương pháp tính toán chuẩn: Jampel 1999, Hướng dẫn AAO, và các nghiên cứu lâm sàng (Damji, CIGTS, AGIS) để hỗ trợ quyết định lâm sàng chính xác hơn.'
              : 'The tool integrates three standard calculation methods: Jampel 1999, AAO Guidelines, and clinical studies (Damji, CIGTS, AGIS) to support more accurate clinical decision-making.'}
          </p>
          <p className="text-xs text-muted-foreground italic">
            {lang === 'vi'
              ? 'Công cụ còn nhiều thiếu sót, mong quý đồng nghiệp có ý kiến phản hồi hoặc muốn thêm các tính năng xin vui lòng liên hệ với tác giả.'
              : 'The tool still has many shortcomings. Colleagues with feedback or feature requests are welcome to contact the author.'}
          </p>
        </div>

        {/* Contact */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-full">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3 text-center">
              {lang === 'vi' ? 'Liên hệ Tác giả' : 'Contact Author'}
            </p>
            <div className="space-y-2">
              <a
                href="https://www.facebook.com/hieu.le.788894/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors w-full"
              >
                <Facebook className="w-4 h-4 shrink-0" />
                Facebook
              </a>
              <a
                href="mailto:ltminhhieu1996@gmail.com"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors w-full"
              >
                <Mail className="w-4 h-4 shrink-0" />
                Gmail
              </a>
            </div>
          </div>

          {/* Zalo QR */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] text-muted-foreground">Zalo QR</p>
            <img
              src="https://media.base44.com/images/public/69bfc421327421351a41df6c/f01cab91b_7fc02366-aa84-406d-ab5b-d225765003ef.jpg"
              alt="Zalo QR"
              className="w-28 h-28 rounded-xl border border-border object-cover"
            />
            <p className="text-[10px] text-muted-foreground">
              {lang === 'vi' ? 'Quét để liên hệ Zalo' : 'Scan to contact via Zalo'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}