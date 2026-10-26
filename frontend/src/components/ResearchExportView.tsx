// ─────────────────────────────────────────────────────────────
// components/ResearchExportView.tsx
// AEROFLOW PULSE DX — Research Cohort & Multi-Sheet Excel Exporter
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Database,
  CheckCircle2,
  Table,
  Layers,
  Sparkles,
  Filter,
} from 'lucide-react';
import type { CohortResponse, FilterState } from '../types';
import { buildExportUrl, downloadCohortExcel } from '../api/client';

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

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto space-y-4">
      {/* ─── Başlık Kartı ─── */}
      <div className="glass-card p-4 rounded-xl border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/30 border border-emerald-500/40 text-emerald-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">
              Klinik Araştırma & Excel Dışa Aktarımı
            </h2>
            <p className="text-xs text-slate-400">
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
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">
            Aktif Kohort Boyutu
          </span>
          <div className="font-mono text-2xl font-extrabold text-cyan-400">
            {total} hasta
          </div>
          <p className="text-[10px] text-slate-500">Mevcut filtrelere uyan kayıtlar</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">
            Ortalama FEV₁ %pred
          </span>
          <div className="font-mono text-2xl font-extrabold text-white">
            %{avgFev1}
          </div>
          <p className="text-[10px] text-slate-500">GLI-2012 referans ortalaması</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">
            Reversibilite Pozitif
          </span>
          <div className="font-mono text-2xl font-extrabold text-amber-400">
            {reversibleCount} vaka
          </div>
          <p className="text-[10px] text-slate-500">
            {total > 0 ? `%${((reversibleCount / total) * 100).toFixed(0)} prevalans` : '—'}
          </p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">
            Cinsiyet Dağılımı
          </span>
          <div className="font-mono text-lg font-bold text-slate-200">
            {maleCount} Erkek / {femaleCount} Kız
          </div>
          <p className="text-[10px] text-slate-500">Biyolojik cinsiyet ayrımı</p>
        </div>
      </div>

      {/* ─── Excel Şablon ve Yapı Detayı ─── */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
          <Table className="w-4 h-4 text-cyan-400" />
          <span>Excel Dosya Mimarisi (openpyxl Çok Sekmeli Format)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <strong className="text-white font-mono">1. Kohort_Ozet Sekmesi</strong>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Hasta demografikleri (Protokol, Ad Soyad, Yaş, Cinsiyet, Boy, Kilo), ziyaret tarihleri, en iyi deneme FEV₁, FVC, PEF değerleri ve ATS/ERS 2019 reversibilite etiketleri.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <strong className="text-white font-mono">2. Parametre_Sozlugu Sekmesi</strong>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Klinik değişkenlerin ve kısaltmaların (FEV₁, FVC, PEF, GLI-2012 Z-Score) uluslararası ATS/ERS standartlarındaki bilimsel tanımları ve birim kütüphanesi.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs flex items-center justify-between">
          <span>
            Veriler doğrudan üniversite ve klinik etik kurul araştırmaları için SPSS ve R uyumludur.
          </span>
          <button
            onClick={handleDownloadExcel}
            className="btn-cyber btn-cyber-primary text-xs"
          >
            Dışa Aktarımı Başlat
          </button>
        </div>
      </div>
    </div>
  );
}
