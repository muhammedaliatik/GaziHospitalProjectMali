// ─────────────────────────────────────────────────────────────
// components/ClinicalAIView.tsx
// AEROFLOW PULSE DX — Clinical Decision Support & AI Engine
// ATS/ERS 2019 Pediatrik Solunum Karar Algoritması
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Stethoscope,
  Info,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import type { CohortPatient } from '../types';
import {
  fev1Severity,
  formatGender,
  formatName,
  formatNum,
  severityClass,
  severityLabel,
} from '../types';

interface ClinicalAIViewProps {
  patient: CohortPatient | null;
  onOpenReport: () => void;
  onShowCurves: () => void;
}

export function ClinicalAIView({
  patient,
  onOpenReport,
  onShowCurves,
}: ClinicalAIViewProps) {
  const [docNotes, setDocNotes] = useState('');

  if (!patient) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center glass-card rounded-xl border border-slate-800">
        <BrainCircuit className="w-14 h-14 text-cyan-500/40 mb-3 animate-pulse" />
        <h3 className="text-base font-bold text-white mb-1">
          Klinik Karar Destek İçin Hasta Seçiniz
        </h3>
        <p className="text-xs text-slate-400 max-w-md">
          ATS/ERS 2019 kılavuzuna göre otomatik obstrüksiyon derecelendirmesi ve bronkodilatör reversibilite analizi için kohort tablosundan bir hasta seçiniz.
        </p>
      </div>
    );
  }

  const fev1Pct = patient.fev1_pred_percent ?? 0;
  const tiff = (patient.fev1_fvc_ratio ?? 0) * 100;
  const isObstructive = tiff > 0 && tiff < 75;
  const isReversible = patient.reversibility_positive === true;
  const sev = fev1Severity(patient.fev1_pred_percent);

  // Otomatik Klinik Teşhis Çıkarımı
  const getDiagnosticSummary = () => {
    if (isObstructive && isReversible) {
      return {
        title: 'Reversibilite Pozitif Obstrüktif Patern (Astım Uyumlu)',
        description:
          'FEV₁/FVC oranında azalma ve bronkodilatör sonrası anlamlı düzelme izlendi. ATS/ERS kriterlerine göre astım tanısı ile yüksek uyumluluk gösterir.',
        severity: 'high',
        color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
      };
    } else if (isObstructive) {
      return {
        title: 'Obstrüktif Ventilatuar Defekt (Reversibilite Negatif)',
        description:
          'Hava yolu obstrüksiyonu mevcut fakat test dozunda salbutamol ile anlamlı reversibilite izlenmedi. Kontrol testi veya alternatif teşhisler değerlendirilebilir.',
        severity: 'medium',
        color: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
      };
    } else if (fev1Pct >= 80) {
      return {
        title: 'Normal Spirometrik Kapasite',
        description:
          'Tüm ölçülen dinamik akciğer hacimleri GLI-2012 pediatrik referans sınırları içerisinde normaldir.',
        severity: 'normal',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
      };
    } else {
      return {
        title: 'Hafif Havayolu Kısıtlılığı',
        description:
          'Sınırda spirometri bulguları tespit edildi. Klinik bulgular ile birlikte takip önerilir.',
        severity: 'low',
        color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
      };
    }
  };

  const diag = getDiagnosticSummary();

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto space-y-4">
      {/* ─── Başlık & Özet Kartı ─── */}
      <div className="glass-card p-4 rounded-xl border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">
                Klinik Karar Destek & AI İçgörü
              </h2>
              <span className="badge-cyber bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                ATS/ERS 2019
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Seçili Hasta: <strong className="text-white">{formatName(patient)}</strong> ({patient.external_id})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onShowCurves}
            className="btn-cyber btn-cyber-outline text-xs"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Eğriyi İncele</span>
          </button>
          <button
            onClick={onOpenReport}
            className="btn-cyber btn-cyber-solid text-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tıbbi Rapor Yazdır</span>
          </button>
        </div>
      </div>

      {/* ─── Otomatik Teşhis Sentezi Kartı ─── */}
      <div className={`p-4 rounded-xl border ${diag.color} space-y-2`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 flex-shrink-0" />
          <h3 className="font-extrabold text-sm tracking-wide">{diag.title}</h3>
        </div>
        <p className="text-xs leading-relaxed opacity-90">{diag.description}</p>
      </div>

      {/* ─── 3 Sütunlu Analitik Paneller ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Panel 1: Havayolu Obstrüksiyon Kriteri */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tiffeneau Oranı</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">FEV₁/FVC</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-extrabold text-white">
              %{tiff.toFixed(1)}
            </span>
            <span
              className={`badge-cyber ${
                isObstructive
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {isObstructive ? 'Obstrüksiyon Var (<%75)' : 'Normal Aralık'}
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Pediatrik olgularda FEV₁/FVC oranının %75-80 altına inmesi hava akımı kısıtlanmasını gösterir.
          </p>
        </div>

        {/* Panel 2: FEV1 Ciddiyet Sınıflandırması */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-amber-400" />
              <span>Ciddiyet Derecesi</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">FEV₁ %pred</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-extrabold text-white">
              %{fev1Pct.toFixed(0)}
            </span>
            <span className={severityClass(sev)}>
              {severityLabel(sev)}
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            ATS/ERS derecelendirmesi: &ge;%80 Normal, %70-79 Hafif, %60-69 Orta, &lt;%60 Ağır.
          </p>
        </div>

        {/* Panel 3: Bronkodilatör Reversibilite */}
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Bronkodilatör Yanıtı</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">&Delta;FEV₁</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="font-mono text-lg font-bold text-white">
              {isReversible ? 'Reversibilite (+)' : 'Reversibilite (-)'}
            </span>
            {isReversible ? (
              <span className="badge-cyber bg-amber-500/20 text-amber-300 border-amber-500/40">
                POZİTİF
              </span>
            ) : (
              <span className="badge-cyber bg-slate-800 text-slate-400 border-slate-700">
                NEGATİF
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            Salbutamol inhalasyonu sonrası FEV₁'de &ge;%12 ve &ge;200 mL artış pozitif olarak kabul edilir.
          </p>
        </div>
      </div>

      {/* ─── Hekim Klinik Değerlendirme Notu ─── */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Hekim Klinik İnceleme ve Rapor Notları</span>
          </h3>
          <span className="text-[11px] text-slate-500">Otomatik şablon eklendi</span>
        </div>

        <textarea
          rows={3}
          defaultValue={`Hasta ${formatName(patient)} (${patient.external_id}) için yapılan spirometrik analizde FEV1 %pred değeri %${fev1Pct.toFixed(0)} (${severityLabel(sev)}) ve FEV1/FVC oranı %${tiff.toFixed(1)} olarak kaydedilmiştir. ${isReversible ? 'Bronkodilatör yanıtı pozitif olup astım ile uyumludur.' : 'Anlamlı reversibilite izlenmemiştir.'} İnhaler tedavi yanıtı takibi önerilir.`}
          onChange={(e) => setDocNotes(e.target.value)}
          className="input-cyber w-full font-sans text-xs leading-relaxed"
          placeholder="Hekim muayene ve izlem notunu buraya ekleyebilirsiniz..."
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-500">
            Bu notlar hazırlanacak tıbbi raporda hekim görüşü kısmında yer alır.
          </span>
          <button
            onClick={onOpenReport}
            className="btn-cyber btn-cyber-primary text-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Raporu Önizle & Yazdır</span>
          </button>
        </div>
      </div>
    </div>
  );
}
