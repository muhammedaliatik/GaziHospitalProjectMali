// ─────────────────────────────────────────────────────────────
// components/ResearchExportView.tsx
// Gazi SFT Klinik Platform — Araştırma & Excel Dışa Aktarımı
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Table,
} from 'lucide-react';
import type { CohortResponse, FilterState } from '../types';
import { downloadCohortExcel } from '../api/client';

interface ResearchExportViewProps {
  filters: FilterState;
  cohortData: CohortResponse | null;
}

export function ResearchExportView({
  filters,
  cohortData,
}: ResearchExportViewProps) {
  const [downloading, setDownloading] = useState(false);

  const total = cohortData?.total ?? 0;
  const results = cohortData?.results ?? [];

  const reversibleCount = results.filter((r) => r.reversibility_positive === true).length;
  const avgFev1 =
    results.length > 0
      ? (
          results.reduce((acc, r) => acc + (r.fev1_pred_percent ?? 0), 0) /
          results.length
        ).toFixed(1)
      : '—';

  const maleCount = results.filter(
    (r) => r.biological_gender?.toLowerCase().startsWith('m'),
  ).length;
  const femaleCount = results.length - maleCount;

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      await downloadCohortExcel(filters);
    } catch (err: any) {
      console.error('Excel indirme hatası:', err);
    } finally {
      setDownloading(false);
    }
  };

  const metricCard = 'card p-5 rounded-xl space-y-1.5';
  const metricLabel = 'text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300';

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto space-y-4">
      {/* ─── Başlık Kartı ─── */}
      <div className="card p-5 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Klinik Araştırma & Excel Dışa Aktarımı
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Parametrik filtrelerle daraltılmış kohortu çok sekmeli formatlı Excel (.xlsx) dosyası olarak dışa aktarır.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadExcel}
          disabled={downloading || total === 0}
          className="btn-cyber btn-cyber-solid text-xs py-2 px-4 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Hazırlanıyor...' : 'Excel (.xlsx) İndir'}</span>
        </button>
      </div>

      {/* ─── İstatistik Metrik Kartları ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className={metricCard}>
          <span className={metricLabel}>Aktif Kohort Boyutu</span>
          <div className="font-mono text-3xl font-extrabold text-blue-700 dark:text-blue-400">
            {total} hasta
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">Mevcut filtrelere uyan kayıtlar</p>
        </div>

        <div className={metricCard}>
          <span className={metricLabel}>Ortalama FEV₁ %pred</span>
          <div className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white">
            %{avgFev1}
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">GLI-2012 referans ortalaması</p>
        </div>

        <div className={metricCard}>
          <span className={metricLabel}>Reversibilite Pozitif</span>
          <div className="font-mono text-3xl font-extrabold text-amber-700 dark:text-amber-400">
            {reversibleCount} vaka
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
            {total > 0 ? `%${((reversibleCount / total) * 100).toFixed(0)} prevalans` : '—'}
          </p>
        </div>

        <div className={metricCard}>
          <span className={metricLabel}>Cinsiyet Dağılımı</span>
          <div className="font-mono text-2xl font-extrabold text-slate-900 dark:text-slate-200">
            {maleCount} Erkek / {femaleCount} Kız
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">Biyolojik cinsiyet ayrımı</p>
        </div>
      </div>

      {/* ─── Excel Şablon Detayı ─── */}
      <div className="card p-5 rounded-xl space-y-3">
        <h3 className="text-xs font-bold uppercase text-slate-800 dark:text-slate-200 tracking-wider flex items-center gap-2">
          <Table className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Excel Dosya Mimarisi (openpyxl Çok Sekmeli Format)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              <strong className="text-slate-900 dark:text-white font-bold text-xs">1. Kohort_Ozet Sekmesi</strong>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Hasta demografikleri (Protokol, Ad Soyad, Yaş, Cinsiyet, Boy, Kilo), ziyaret tarihleri, en iyi deneme FEV₁, FVC, PEF değerleri ve ATS/ERS 2019 reversibilite etiketleri.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              <strong className="text-slate-900 dark:text-white font-bold text-xs">2. Parametre_Sozlugu Sekmesi</strong>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Klinik değişkenlerin ve kısaltmaların (FEV₁, FVC, PEF, GLI-2012 Z-Score) uluslararası ATS/ERS standartlarındaki bilimsel tanımları ve birim kütüphanesi.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-800/30 text-blue-900 dark:text-blue-300 text-xs flex items-center justify-between gap-3 font-medium">
          <span>
            Veriler doğrudan üniversite ve klinik etik kurul araştırmaları için SPSS ve R uyumludur.
          </span>
          <button
            onClick={handleDownloadExcel}
            className="btn-cyber btn-cyber-primary text-xs flex-shrink-0"
          >
            Dışa Aktarımı Başlat
          </button>
        </div>
      </div>
    </div>
  );
}
