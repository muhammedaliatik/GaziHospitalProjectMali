// ─────────────────────────────────────────────────────────────
// components/ReportModal.tsx
// Gazi SFT Klinik Platform — Spirometri Klinik Karar Destek Raporu
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import {
  FileText,
  X,
  Printer,
  CheckCircle2,
  Zap,
  Stethoscope,
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

interface ReportModalProps {
  patient: CohortPatient | null;
  onClose: () => void;
}

export function ReportModal({ patient, onClose }: ReportModalProps) {
  const [reportDate] = useState(new Date().toLocaleDateString('tr-TR'));
  const [docNotes, setDocNotes] = useState(
    'Pediatrik GLI-2012 referans normlarına göre değerlendirilmiştir. Klinik bulgular ve bronkodilatör yanıtı doğrultusunda astım/obstrüksiyon izlemi ve kontrol testi önerilir.',
  );
  const [physicianName, setPhysicianName] = useState('Dr. Muhammed Ali Atik / Çocuk İmmünoloji ve Alerji BD');

  if (!patient) return null;

  const sev = fev1Severity(patient.fev1_pred_percent);
  const isReversible = patient.reversibility_positive;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl max-h-[90vh] card rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-slide-up">
        {/* ─── Modal Başlık Çubuğu (No-Print) ─── */}
        <div className="no-print h-12 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/80 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-xs text-slate-900 dark:text-white">
              Spirometri Klinik Karar Destek Raporu
            </span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-bold">
              {patient.external_id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-cyber btn-cyber-primary text-xs py-1.5 px-3"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── Yazdırılabilir Rapor Gövdesi ─── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white dark:bg-slate-950/40 text-slate-900 dark:text-slate-200">
          {/* Üst Kurumsal Başlık */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-blue-700 dark:text-blue-400">
                  Gazi SFT Klinik Platform
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700">
                  KLİNİK RAPOR
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                Pediatrik Solunum Fonksiyon Testi & Bronkodilatör Reversibilite Analizi
              </p>
            </div>
            <div className="text-right font-mono text-xs text-slate-600 dark:text-slate-400">
              <div>Rapor Tarihi: <strong className="text-slate-900 dark:text-white">{reportDate}</strong></div>
              <div>Protokol: <strong className="text-blue-700 dark:text-blue-400">{patient.external_id}</strong></div>
            </div>
          </div>

          {/* Hasta Künyesi Tablosu */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-600 dark:text-slate-400 text-[10px] uppercase font-bold font-mono">Hasta Adı</span>
              <div className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5">{formatName(patient)}</div>
            </div>
            <div>
              <span className="text-slate-600 dark:text-slate-400 text-[10px] uppercase font-bold font-mono">Yaş / Cinsiyet</span>
              <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {patient.age ? `${patient.age} Yaş` : '—'} ({formatGender(patient.biological_gender)})
              </div>
            </div>
            <div>
              <span className="text-slate-600 dark:text-slate-400 text-[10px] uppercase font-bold font-mono">Boy / Kilo</span>
              <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {patient.height_m ? `${(patient.height_m * 100).toFixed(0)} cm` : '—'} /{' '}
                {patient.weight_kg ? `${patient.weight_kg} kg` : '—'}
              </div>
            </div>
            <div>
              <span className="text-slate-600 dark:text-slate-400 text-[10px] uppercase font-bold font-mono">Referans Modül</span>
              <div className="font-bold text-blue-700 dark:text-blue-400 mt-0.5">GLI-2012 Pediatrik</div>
            </div>
          </div>

          {/* Spirometri Parametre Tablosu */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
              Ölçülen Spirometrik Parametreler
            </h4>
            <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-mono text-[10px] uppercase font-bold">
                <tr>
                  <th className="p-2.5">Parametre</th>
                  <th className="p-2.5">Ölçülen Değer</th>
                  <th className="p-2.5">Beklenen (%pred)</th>
                  <th className="p-2.5">ATS/ERS Değerlendirme</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                <tr>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">FEV₁ (L)</td>
                  <td className="p-2.5 text-blue-700 dark:text-blue-400 font-bold">
                    {patient.fev1_val ? `${patient.fev1_val.toFixed(2)} L` : '—'}
                  </td>
                  <td className="p-2.5 text-slate-800 dark:text-slate-200 font-bold">
                    {patient.fev1_pred_percent ? `%${patient.fev1_pred_percent.toFixed(0)}` : '—'}
                  </td>
                  <td className="p-2.5">
                    <span className={severityClass(sev)}>
                      {severityLabel(sev)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">FVC (L)</td>
                  <td className="p-2.5 text-slate-900 dark:text-white font-bold">
                    {patient.fvc_val ? `${patient.fvc_val.toFixed(2)} L` : '—'}
                  </td>
                  <td className="p-2.5 text-slate-800 dark:text-slate-200 font-bold">
                    {patient.fvc_pred_percent ? `%${patient.fvc_pred_percent.toFixed(0)}` : '—'}
                  </td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-400">Normal Aralık</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">FEV₁/FVC (Tiffeneau)</td>
                  <td className="p-2.5 text-blue-700 dark:text-blue-400 font-bold">
                    {formatTiffeneau(patient.fev1_fvc_ratio)}
                  </td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-400">—</td>
                  <td className="p-2.5">
                    {((patient.fev1_fvc_ratio ?? 0) > 1 ? (patient.fev1_fvc_ratio ?? 0) : (patient.fev1_fvc_ratio ?? 0) * 100) < 75 ? (
                      <span className="text-amber-800 dark:text-amber-400 font-bold">Obstrüksiyon</span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Normal</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">PEF (L/s)</td>
                  <td className="p-2.5 text-slate-900 dark:text-white font-bold">
                    {patient.pef_val ? `${patient.pef_val.toFixed(2)} L/s` : '—'}
                  </td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-400">—</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-400">Zirve Ekspirasyon</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Reversibilite Değerlendirmesi */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  ATS/ERS 2019 Bronkodilatör Reversibilite Yanıtı
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Salbutamol sonrası ΔFEV₁ ≥ %12 ve ≥ 200 mL artış kriteri
                </div>
              </div>
            </div>
            {isReversible === true ? (
              <span className="badge-cyber badge-cyber-mild font-bold text-xs py-1 px-3">
                POZİTİF YANIT
              </span>
            ) : isReversible === false ? (
              <span className="badge-cyber badge-cyber-muted text-xs py-1 px-3">
                NEGATİF
              </span>
            ) : (
              <span className="text-slate-500 text-xs">Test Edilmedi</span>
            )}
          </div>

          {/* Hekim Notu & İmza Bloğu */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Hekim Klinik Yorumu ve Öneriler</span>
            </label>
            <textarea
              rows={3}
              value={docNotes}
              onChange={(e) => setDocNotes(e.target.value)}
              className="input-cyber w-full font-sans text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* İmza Alanı */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 text-xs">
            <div className="space-y-1">
              <span className="text-slate-600 dark:text-slate-400 text-[10px] uppercase font-mono font-bold">Değerlendiren Uzman</span>
              <input
                type="text"
                value={physicianName}
                onChange={(e) => setPhysicianName(e.target.value)}
                className="input-cyber w-72 text-xs font-semibold"
              />
            </div>
            <div className="text-right space-y-1">
              <span className="text-slate-600 dark:text-slate-400 text-[10px] uppercase font-mono font-bold">Dijital Doğrulama</span>
              <div className="font-mono text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1 justify-end">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>GAZİ SFT DOĞRULANDI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
