// ─────────────────────────────────────────────────────────────
// components/Header.tsx
// AEROFLOW PULSE DX — Futuristic Command Header & Telemetry Bar
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import {
  Activity,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  BarChart3,
  TrendingUp,
  BrainCircuit,
  Database,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { fetchHealth, buildExportUrl, downloadCohortExcel } from '../api/client';
import type { AppTab, CohortResponse, FilterState } from '../types';

interface HeaderProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onUploadClick: () => void;
  onRefreshClick: () => void;
  onReportClick: () => void;
  filters: FilterState;
  cohortData: CohortResponse | null;
  loading: boolean;
}

export function Header({
  activeTab,
  onTabChange,
  onUploadClick,
  onRefreshClick,
  onReportClick,
  filters,
  cohortData,
  loading,
}: HeaderProps) {
  const [dbOnline, setDbOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    const check = async () => {
      const h = await fetchHealth();
      if (active) setDbOnline(h.database.connected);
    };
    check();
    const id = setInterval(check, 30_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const total = cohortData?.total ?? 0;
  const reversibleCount =
    cohortData?.results.filter((r) => r.reversibility_positive === true).length ?? 0;
  const severeCount =
    cohortData?.results.filter(
      (r) => r.fev1_pred_percent !== null && r.fev1_pred_percent < 60,
    ).length ?? 0;

  const handleExport = async () => {
    try {
      await downloadCohortExcel(filters);
    } catch (err: any) {
      console.error('Excel indirme hatası:', err);
    }
  };

  const navItems: { id: AppTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'telemetry',
      label: 'Kohort Telemetrisi',
      icon: <BarChart3 className="w-4 h-4" />,
      badge: total > 0 ? `${total}` : undefined,
    },
    {
      id: 'spectral_curves',
      label: 'Akış-Hacim Spektrogramı',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'clinical_ai',
      label: 'Klinik Karar Destek & AI',
      icon: <BrainCircuit className="w-4 h-4" />,
      badge: 'ATS 2019',
    },
    {
      id: 'ingestion_hub',
      label: 'Cihaz & XML Almaç',
      icon: <Cpu className="w-4 h-4" />,
    },
    {
      id: 'research_export',
      label: 'Araştırma & Excel',
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
  ];

  return (
    <header className="glass-hud flex-shrink-0 z-30 select-none">
      {/* ─── Üst Telemetri & Marka Çubuğu ─── */}
      <div className="h-13 px-4 flex items-center justify-between border-b border-slate-800/80">
        {/* Sol: Fütüristik Logo & Başlık */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-slate-950 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-base bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                AEROFLOW PULSE
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                DX 3.2
              </span>
              <span className="hidden md:inline-block text-[11px] text-slate-500 font-mono">
                / PEDIATRIC SFT INTELLIGENCE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Vyaire MasterScreen SFT Ingestion & Kohort Karar Destek Sistemi
            </p>
          </div>
        </div>

        {/* Orta: Canlı Telemetri İstatistik Rozetleri */}
        <div className="hidden lg:flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
            <span className="text-slate-400">Kohort Kaydı:</span>
            <span className="font-mono font-bold text-cyan-400">{total} hasta</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
            <span className="text-slate-400">Reversibilite:</span>
            <span className="font-mono font-bold text-amber-400">
              {total > 0 ? `${reversibleCount} Pozitif` : '—'}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
            <span className="text-slate-400">Ağır Obstrüksiyon:</span>
            <span className="font-mono font-bold text-rose-400">
              {severeCount} vaka
            </span>
          </div>
        </div>

        {/* Sağ: Veritabanı Node Durumu & Hızlı Eylemler */}
        <div className="flex items-center gap-2.5">
          {/* DB Sağlık Rozeti */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
              dbOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
            title={dbOnline ? 'PostgreSQL 18 Düğüme Bağlı' : 'Veritabanı Çevrimdışı'}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                dbOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <Database className="w-3 h-3" />
            <span className="hidden sm:inline">
              {dbOnline ? 'DB CONNECTED' : 'OFFLINE'}
            </span>
          </div>

          {/* Hızlı Eylem: Rapor */}
          <button
            onClick={onReportClick}
            className="btn-cyber btn-cyber-outline text-xs"
            title="Klinik Karar Destek Raporu"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Tıbbi Rapor</span>
          </button>

          {/* Hızlı Eylem: XML Yükle */}
          <button
            onClick={onUploadClick}
            className="btn-cyber btn-cyber-primary text-xs"
            title="Vyaire SFT XML Dosyası Yükle"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>XML Ingest</span>
          </button>

          {/* Hızlı Eylem: Yenile */}
          <button
            onClick={onRefreshClick}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-700/80 text-slate-400 hover:text-white hover:border-slate-500 transition-all disabled:opacity-50"
            title="Telemetri Verilerini Güncelle"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── Alt Navigasyon Sekmeleri (Gerçek & Fonksiyonel) ─── */}
      <div className="h-10 px-4 flex items-center gap-1 overflow-x-auto bg-slate-950/40 border-b border-slate-800/60">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isActive
                      ? 'bg-cyan-400/20 text-cyan-200'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
