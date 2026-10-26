// ─────────────────────────────────────────────────────────────
// components/ClinicalAIView.tsx
// Gazi SFT Klinik Platform — Klinik Karar Destek & AI İçgörü
// ATS/ERS 2019 Pediatrik Solunum Karar Algoritması
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Zap,
  Activity,
  FileText,
  Printer,
  Stethoscope,
} from 'lucide-react';
import type { CohortPatient } from '../types';
import {
  fev1Severity,
  formatName,
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
      <div className="h-full flex flex-col items-center justify-center p-8 text-center card rounded-xl m-4">
        <BrainCircuit className="w-14 h-14 text-blue-500 mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Klinik Karar Destek İçin Hasta Seçiniz
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md font-medium">
          ATS/ERS 2019 kılavuzuna göre otomatik obstrüksiyon derecelendirmesi ve bronkodilatör reversibilite analizi için kohort tablosundan bir hasta seçiniz.
        </p>
      </div>
    );
  }

  const fev1Pct = patient.fev1_pred_percent ?? 0;
  const rawTiff = patient.fev1_fvc_ratio ?? 0;
  const tiff = rawTiff > 1 ? rawTiff : rawTiff * 100;
  const isObstructive = tiff > 0 && tiff < 75;
  const isReversible = patient.reversibility_positive === true;
  const sev = fev1Severity(patient.fev1_pred_percent);

  const getDiagnosticSummary = () => {
    if (isObstructive && isReversible) {
      return {
        title: 'Reversibilite Pozitif Obstrüktif Patern (Astım Uyumlu)',
        description:
          'FEV₁/FVC oranında azalma ve bronkodilatör sonrası anlamlı düzelme izlendi. ATS/ERS kriterlerine göre astım tanısı ile yüksek uyumluluk gösterir.',
        lightColor: 'text-amber-950 border-amber-300 bg-amber-50',
        darkColor: 'dark:text-amber-300 dark:border-amber-700/50 dark:bg-amber-900/20',
      };
    } else if (isObstructive) {
      return {
        title: 'Obstrüktif Ventilatuar Defekt (Reversibilite Negatif)',
        description:
          'Hava yolu obstrüksiyonu mevcut fakat test dozunda salbutamol ile anlamlı reversibilite izlenmedi. Kontrol testi veya alternatif teşhisler değerlendirilebilir.',
        lightColor: 'text-orange-950 border-orange-300 bg-orange-50',
        darkColor: 'dark:text-orange-300 dark:border-orange-700/50 dark:bg-orange-900/20',
      };
    } else if (fev1Pct >= 80) {
      return {
        title: 'Normal Spirometrik Kapasite',
        description:
          'Tüm ölçülen dinamik akciğer hacimleri GLI-2012 pediatrik referans sınırları içerisinde normaldir.',
        lightColor: 'text-emerald-950 border-emerald-300 bg-emerald-50',
        darkColor: 'dark:text-emerald-300 dark:border-emerald-700/50 dark:bg-emerald-900/20',
      };
    } else {
      return {
        title: 'Hafif Havayolu Kısıtlılığı',
        description:
          'Sınırda spirometri bulguları tespit edildi. Klinik bulgular ile birlikte takip önerilir.',
        lightColor: 'text-blue-950 border-blue-300 bg-blue-50',
        darkColor: 'dark:text-blue-300 dark:border-blue-700/50 dark:bg-blue-900/20',
      };
    }
  };

  const diag = getDiagnosticSummary();
  const sectionLabel = 'text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5';
  const statBox = 'card p-5 rounded-xl space-y-3';
  const divider = 'flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2';

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto space-y-4">
      {/* ─── Başlık Kartı ─── */}
      <div className="card p-5 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 text-blue-600 dark:text-blue-400">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Klinik Karar Destek & AI İçgörü
              </h2>
              <span className="badge-cyber badge-cyber-cyan font-bold">ATS/ERS 2019</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Seçili Hasta: <strong className="text-slate-900 dark:text-white">{formatName(patient)}</strong> ({patient.external_id})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onShowCurves} className="btn-cyber btn-cyber-outline text-xs py-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>Eğriyi İncele</span>
          </button>
          <button onClick={onOpenReport} className="btn-cyber btn-cyber-solid text-xs py-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>Tıbbi Rapor Yazdır</span>
          </button>
        </div>
      </div>

      {/* ─── Teşhis Özet Kartı ─── */}
      <div className={`p-4 rounded-xl border space-y-2 font-medium ${diag.lightColor} ${diag.darkColor}`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 flex-shrink-0" />
          <h3 className="font-extrabold text-sm">{diag.title}</h3>
        </div>
        <p className="text-xs leading-relaxed">{diag.description}</p>
      </div>

      {/* ─── 3 Panel ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Panel 1: Tiffeneau */}
        <div className={statBox}>
          <div className={divider}>
            <span className={sectionLabel}>
              <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Tiffeneau Oranı</span>
            </span>
            <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400">FEV₁/FVC</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white">
              %{tiff.toFixed(1)}
            </span>
            <span className={`badge-cyber ${isObstructive ? 'badge-cyber-severe' : 'badge-cyber-normal'}`}>
              {isObstructive ? 'Obstrüksiyon Var (<75%)' : 'Normal Aralık'}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Pediatrik olgularda FEV₁/FVC oranının %75-80 altına inmesi hava akımı kısıtlanmasını gösterir.
          </p>
        </div>

        {/* Panel 2: FEV1 Ciddiyet */}
        <div className={statBox}>
          <div className={divider}>
            <span className={sectionLabel}>
              <Stethoscope className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Ciddiyet Derecesi</span>
            </span>
            <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400">FEV₁ %pred</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white">
              %{fev1Pct.toFixed(0)}
            </span>
            <span className={severityClass(sev)}>{severityLabel(sev)}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            ATS/ERS derecelendirmesi: ≥%80 Normal, %70-79 Hafif, %60-69 Orta, &lt;%60 Ağır.
          </p>
        </div>

        {/* Panel 3: Reversibilite */}
        <div className={statBox}>
          <div className={divider}>
            <span className={sectionLabel}>
              <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Bronkodilatör Yanıtı</span>
            </span>
            <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400">ΔFEV₁</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-lg font-extrabold text-slate-900 dark:text-white">
              {isReversible ? 'Reversibilite (+)' : 'Reversibilite (-)'}
            </span>
            {isReversible ? (
              <span className="badge-cyber badge-cyber-mild font-bold">POZİTİF</span>
            ) : (
              <span className="badge-cyber badge-cyber-muted font-medium">NEGATİF</span>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Salbutamol inhalasyonu sonrası FEV₁'de ≥%12 ve ≥200 mL artış pozitif olarak kabul edilir.
          </p>
        </div>
      </div>

      {/* ─── Hekim Notu ─── */}
      <div className="card p-5 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Hekim Klinik İnceleme ve Rapor Notları</span>
          </h3>
          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">Otomatik şablon eklendi</span>
        </div>

        <textarea
          rows={3}
          defaultValue={`Hasta ${formatName(patient)} (${patient.external_id}) için yapılan spirometrik analizde FEV1 %pred değeri %${fev1Pct.toFixed(0)} (${severityLabel(sev)}) ve FEV1/FVC oranı %${tiff.toFixed(1)} olarak kaydedilmiştir. ${isReversible ? 'Bronkodilatör yanıtı pozitif olup astım ile uyumludur.' : 'Anlamlı reversibilite izlenmemiştir.'} İnhaler tedavi yanıtı takibi önerilir.`}
          onChange={(e) => setDocNotes(e.target.value)}
          className="input-cyber w-full font-sans text-xs leading-relaxed text-slate-900 dark:text-white"
          placeholder="Hekim muayene ve izlem notunu buraya ekleyebilirsiniz..."
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Bu notlar hazırlanacak tıbbi raporda hekim görüşü kısmında yer alır.
          </span>
          <button onClick={onOpenReport} className="btn-cyber btn-cyber-primary text-xs py-1.5">
            <Printer className="w-3.5 h-3.5" />
            <span>Raporu Önizle & Yazdır</span>
          </button>
        </div>
      </div>
    </div>
  );
}
