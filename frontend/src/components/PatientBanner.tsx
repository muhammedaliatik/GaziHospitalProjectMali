// ─────────────────────────────────────────────────────────────
// components/PatientBanner.tsx
// AEROFLOW PULSE DX — Futuristic Patient Biometric & SFT HUD
// ─────────────────────────────────────────────────────────────

import {
  User,
  Activity,
  Zap,
  TrendingUp,
  FileText,
  ShieldCheck,
  Calendar,
  Ruler,
  Weight,
  Cpu,
} from 'lucide-react';
import type { CohortPatient } from '../types';
import {
  fev1Severity,
  formatGender,
  formatName,
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
      <div className="glass-card px-4 py-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-slate-500 text-xs">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-600" />
          <span>Telemetri incelemesi için tablodan bir hasta kaydı seçiniz.</span>
        </div>
        <span className="font-mono text-[10px] text-slate-600">
          GLI-2012 PEDİATRİK REFERANS AKTİF
        </span>
      </div>
    );
  }

  const sev = fev1Severity(patient.fev1_pred_percent);
  const isReversible = patient.reversibility_positive;

  // Mosteller Body Surface Area: sqrt((height_cm * weight_kg) / 3600)
  const heightCm = patient.height_m ? patient.height_m * 100 : null;
  const bsa =
    heightCm && patient.weight_kg
      ? Math.sqrt((heightCm * patient.weight_kg) / 3600).toFixed(2)
      : null;

  return (
    <div className="glass-card px-4 py-2.5 rounded-xl border border-cyan-500/25 shadow-[0_4px_25px_-5px_rgba(6,182,212,0.15)] flex flex-wrap items-center justify-between gap-3">
      {/* Sol: Hasta Kimlik & Rozet */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-300 font-bold font-mono text-sm shadow-[0_0_12px_rgba(6,182,212,0.25)]">
          {patient.first_name ? patient.first_name[0] : 'P'}
          <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-slate-950 flex items-center justify-center border border-cyan-500/50">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-white tracking-wide">
              {formatName(patient)}
            </h3>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {patient.external_id}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              ({formatGender(patient.biological_gender)})
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>{patient.age ? `${patient.age} Yaş` : '—'}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Ruler className="w-3 h-3 text-slate-500" />
              <span>{heightCm ? `${heightCm.toFixed(0)} cm` : '—'}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Weight className="w-3 h-3 text-slate-500" />
              <span>{patient.weight_kg ? `${patient.weight_kg} kg` : '—'}</span>
            </span>
            {bsa && (
              <>
                <span>•</span>
                <span className="text-cyan-400">BSA: {bsa} m²</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Orta: FEV1 & ATS/ERS Reversibilite Durumu */}
      <div className="flex items-center gap-4">
        {/* FEV1 %pred */}
        <div className="flex flex-col items-center px-3 py-1 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono uppercase">
            FEV₁ (%pred)
          </span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-extrabold text-sm text-white">
              {patient.fev1_pred_percent
                ? `%${patient.fev1_pred_percent.toFixed(0)}`
                : '—'}
            </span>
            <span className={severityClass(sev)}>
              {severityLabel(sev)}
            </span>
          </div>
        </div>

        {/* FEV1/FVC Oranı */}
        <div className="flex flex-col items-center px-3 py-1 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono uppercase">
            Tiffeneau (FEV₁/FVC)
          </span>
          <span className="font-mono font-extrabold text-sm text-cyan-300">
            {patient.fev1_fvc_ratio
              ? `%${(patient.fev1_fvc_ratio * 100).toFixed(1)}`
              : '—'}
          </span>
        </div>

        {/* Reversibilite Rozeti */}
        <div className="flex flex-col items-center px-3 py-1 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono uppercase">
            Reversibilite
          </span>
          {isReversible === true ? (
            <span className="badge-cyber bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>POZİTİF (Astım)</span>
            </span>
          ) : isReversible === false ? (
            <span className="badge-cyber bg-slate-800 text-slate-400 border-slate-700">
              Negatif
            </span>
          ) : (
            <span className="font-mono text-xs text-slate-500">Ölçülmedi</span>
          )}
        </div>
      </div>

      {/* Sağ: Hızlı Eylem Butonları */}
      <div className="flex items-center gap-2">
        <button
          onClick={onShowCurves}
          className="btn-cyber btn-cyber-primary text-xs"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Eğri Spektrogramı</span>
        </button>
        <button
          onClick={onOpenReport}
          className="btn-cyber btn-cyber-outline text-xs"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Klinik Rapor</span>
        </button>
      </div>
    </div>
  );
}
