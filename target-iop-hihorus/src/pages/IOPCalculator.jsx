import React, { useState, useMemo, useEffect } from 'react';
import { Eye, Moon, Sun, Languages } from 'lucide-react';
import MethodSelector from '../components/iop/MethodSelector';
import IOPInput from '../components/iop/IOPInput';
import JampelForm from '../components/iop/JampelForm';
import AAOForm from '../components/iop/AAOForm';
import ClinicalStudiesForm from '../components/iop/ClinicalStudiesForm';
import ResultCards from '../components/iop/ResultCards';
import IOPGauge from '../components/iop/IOPGauge';
import CalculationDetails from '../components/iop/CalculationDetails';
import ClinicalRecommendation from '../components/iop/ClinicalRecommendation';
import References from '../components/iop/References';
import AboutSection from '../components/iop/AboutSection';
import MobileResultBar from '../components/iop/MobileResultBar';

export default function IOPCalculator() {
  const [ip, setIp] = useState(22);
  const [cct, setCct] = useState(545);
  const [method, setMethod] = useState('jampel');
  const [z, setZ] = useState(0);
  const [y, setY] = useState(0);
  const [aaoLevel, setAaoLevel] = useState(1);
  const [clinicalStage, setClinicalStage] = useState('mild');
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState('vi');

  // Apply dark mode to html element
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  const correctedIOP = useMemo(() => {
    return ip - ((cct - 555) / 10) * 0.3;
  }, [ip, cct]);

  const targetIOP = useMemo(() => {
    const cIOP = correctedIOP;
    if (method === 'jampel') {
      return cIOP * (1 - cIOP / 100) - z + y;
    }
    if (method === 'aao') {
      const reductions = { 1: 0.25, 2: 0.35, 3: 0.35, 4: 0.225, 5: 0.30, 6: 0.35, 7: 0.45 };
      return cIOP * (1 - (reductions[aaoLevel] || 0.25));
    }
    const reductions = { suspect: 0.20, mild: 0.25, moderate: 0.35, severe: 0.45, ntg: 0.30 };
    return cIOP * (1 - (reductions[clinicalStage] || 0.25));
  }, [correctedIOP, method, z, y, aaoLevel, clinicalStage]);

  const reductionPct = useMemo(() => {
    if (correctedIOP <= 0) return 0;
    return ((correctedIOP - targetIOP) / correctedIOP) * 100;
  }, [correctedIOP, targetIOP]);

  const safeTarget = Math.max(0, targetIOP);
  const safePct = Math.max(0, reductionPct);

  const ipLabel = lang === 'vi' ? 'Nhãn áp Ban đầu (IP)' : 'Initial IOP (IP)';
  const cctLabel = lang === 'vi' ? 'Độ dày Giác mạc Trung tâm (CCT)' : 'Central Corneal Thickness (CCT)';
  const ipTooltip = lang === 'vi' ? 'Nhãn áp đo được ban đầu' : 'Initially measured intraocular pressure';
  const cctTooltip = lang === 'vi' ? 'Độ dày giác mạc trung tâm đo bằng pachymetry' : 'Central corneal thickness measured by pachymetry';

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {lang === 'vi' ? 'Nhãn áp đích' : 'Target IOP'}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground ml-[52px]">
              {lang === 'vi'
                ? 'Tính toán nhãn áp đích tối ưu cho điều trị Glôcôm'
                : 'Calculate optimal target IOP for Glaucoma treatment'}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(l => l === 'vi' ? 'en' : 'vi')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-sm font-medium"
            >
              <Languages className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{lang === 'vi' ? 'EN' : 'VI'}</span>
            </button>
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDark(d => !d)}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-card hover:bg-muted transition-colors"
            >
              {dark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-5">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6">
              <MethodSelector selected={method} onChange={setMethod} lang={lang} />
              <IOPInput label={ipLabel} value={ip} onChange={setIp} unit="mmHg" step={0.5} min={5} max={60} tooltip={ipTooltip} />
              <IOPInput label={cctLabel} value={cct} onChange={setCct} unit="μm" step={5} min={400} max={700} tooltip={cctTooltip} />
              <div className="border-t border-border pt-5 mt-2">
                {method === 'jampel' && <JampelForm z={z} y={y} onZChange={setZ} onYChange={setY} lang={lang} />}
                {method === 'aao' && <AAOForm level={aaoLevel} onLevelChange={setAaoLevel} lang={lang} />}
                {method === 'clinical' && <ClinicalStudiesForm stage={clinicalStage} onStageChange={setClinicalStage} lang={lang} />}
              </div>
            </div>
          </div>

          {/* Right Panel - hidden on mobile (shown in bottom drawer) */}
          <div className="hidden lg:block lg:col-span-7 space-y-4">
            <ResultCards correctedIOP={correctedIOP} targetIOP={safeTarget} reductionPct={safePct} lang={lang} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <IOPGauge correctedIOP={correctedIOP} targetIOP={safeTarget} />
              <CalculationDetails method={method} correctedIOP={correctedIOP} targetIOP={safeTarget} z={z} y={y} aaoLevel={aaoLevel} clinicalStage={clinicalStage} lang={lang} />
            </div>
            <ClinicalRecommendation reductionPct={safePct} lang={lang} />
          </div>
        </div>

        {/* References */}
        <div className="mt-6">
          <References lang={lang} />
        </div>

        {/* About */}
        <div className="mt-6">
          <AboutSection lang={lang} />
        </div>
      </div>

      {/* Mobile sticky result bar */}
      <MobileResultBar
        correctedIOP={correctedIOP}
        targetIOP={safeTarget}
        reductionPct={safePct}
        lang={lang}
        method={method}
        z={z}
        y={y}
        aaoLevel={aaoLevel}
        clinicalStage={clinicalStage}
      />
    </div>
  );
}