// ─────────────────────────────────────────────────────────────
// components/PatientBanner.tsx
// Gazi SFT Klinik Platform — Hasta Kimlik & SFT Özet Bandı
// ─────────────────────────────────────────────────────────────

import {
  User,
  Zap,
  Calendar,
  Ruler,
  Weight,
} from 'lucide-react';
import type { CohortPatient } from '../types';
import {
  fev1Severity,
  formatGender,
  formatName,
  formatTiffeneau,
  severityClass,
  severityLabel,
} from '../types';

interface PatientBannerProps {
  patient: CohortPatient | null;
  onShowCurves?: () => void;
  onOpenReport?: () => void;
}

export function PatientBanner({
  patient,
  onShowCurves,
  onOpenReport,
}: PatientBannerProps) {
  if (!patient) {
    return (
      <div className="card px-4 py-2.5 rounded-xl flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-500" />
          <span className="font-medium">
            Telemetri incelemesi için tablodan bir hasta kaydı seçiniz.
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400 font-bold">
          GLI-2012 PEDİATRİK REFERANS AKTİF
        </span>
      </div>
    );
  }

  const sev = fev1Severity(patient.fev1_pred_percent);
  const isReversible = patient.reversibility_positive;

  const heightCm = patient.height_m ? patient.height_m * 100 : null;
  const bsa =
    heightCm && patient.weight_kg
      ? Math.sqrt((heightCm * patient.weight_kg) / 3600).toFixed(2)
      : null;

  return (
    <div className="card px-4 py-3 rounded-xl border-l-4 border-l-blue-600 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      {/* Sol: Hasta Kimlik */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 font-black text-base">
          {patient.first_name ? patient.first_name[0] : 'P'}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {formatName(patient)}
            </h3>
            <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-slate-300 dark:border-slate-700">
              {patient.external_id}
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
              ({formatGender(patient.biological_gender)})
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 font-mono mt-1 font-semibold">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{patient.age ? `${patient.age} Yaş` : '—'}</span>
            </span>
            <span className="text-slate-400">•</span>
            <span className="flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-slate-500" />
              <span>{heightCm ? `${heightCm.toFixed(0)} cm` : '—'}</span>
            </span>
            <span className="text-slate-400">•</span>
            <span className="flex items-center gap-1">
              <Weight className="w-3.5 h-3.5 text-slate-500" />
              <span>{patient.weight_kg ? `${patient.weight_kg} kg` : '—'}</span>
            </span>
            {bsa && (
              <>
                <span className="text-slate-400">•</span>
                <span className="text-blue-700 dark:text-blue-400 font-bold">BSA: {bsa} m²</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Orta: FEV1 & Reversibilite */}
      <div className="flex items-center gap-3">
        {/* FEV1 %pred */}
        <div className="flex flex-col items-center px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wide">
            FEV₁ (%pred)
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
              {patient.fev1_pred_percent
                ? `%${patient.fev1_pred_percent.toFixed(0)}`
                : '—'}
            </span>
            <span className={severityClass(sev)}>
              {severityLabel(sev)}
            </span>
          </div>
        </div>

        {/* FEV1/FVC */}
        <div className="flex flex-col items-center px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wide">
            Tiffeneau (FEV₁/FVC)
          </span>
          <span className="font-mono font-black text-sm text-blue-700 dark:text-blue-300 mt-0.5">
            {formatTiffeneau(patient.fev1_fvc_ratio)}
          </span>
        </div>

        {/* Reversibilite */}
        <div className="flex flex-col items-center px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wide">
            Reversibilite
          </span>
          <div className="mt-0.5">
            {isReversible === true ? (
              <span className="badge-cyber badge-cyber-mild font-bold">
                <Zap className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>POZİTİF (Astım)</span>
              </span>
            ) : isReversible === false ? (
              <span className="badge-cyber badge-cyber-muted font-medium">Negatif</span>
            ) : (
              <span className="font-mono text-xs text-slate-500 font-medium">Ölçülmedi</span>
            )}
          </div>
        </div>
      </div>

      {/* Sağ: Eylemler */}
      <div className="flex items-center gap-2">
        <button
          onClick={onShowCurves}
          className="btn-cyber btn-cyber-primary text-xs py-1.5"
        >
          Eğri Spektrogramı
        </button>
        <button
          onClick={onOpenReport}
          className="btn-cyber btn-cyber-outline text-xs py-1.5"
        >
          Klinik Rapor
        </button>
      </div>
    </div>
  );
}
