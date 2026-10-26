// ─────────────────────────────────────────────────────────────
// components/Header.tsx
// Gazi SFT Klinik Platform — Komut Başlığı & Telemetri Çubuğu
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
  Sun,
  Moon,
  Cpu,
} from 'lucide-react';
import { fetchHealth, downloadCohortExcel } from '../api/client';
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
  darkMode: boolean;
  onToggleDark: () => void;
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
  darkMode,
  onToggleDark,
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
      label: 'XML İçe Aktar',
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
      {/* ─── Üst Marka & Eylem Çubuğu ─── */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        {/* Sol: Logo & Başlık */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-base text-slate-900 dark:text-white">
                Gazi SFT Klinik Platform
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                v3.2
              </span>
              <span className="hidden md:inline-block text-xs text-slate-600 dark:text-slate-400 font-medium">
                — Pediatrik Solunum Fonksiyon Testi
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
              Vyaire MasterScreen SFT · Kohort Analizi & Klinik Karar Desteği
            </p>
          </div>
        </div>

        {/* Orta: Canlı İstatistik Rozetleri */}
        <div className="hidden lg:flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Kohort Kaydı:</span>
            <span className="font-mono font-bold text-blue-700 dark:text-blue-400">{total} hasta</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Reversibilite:</span>
            <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
              {total > 0 ? `${reversibleCount} Pozitif` : '—'}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Ağır Obstrüksiyon:</span>
            <span className="font-mono font-bold text-red-700 dark:text-red-400">
              {severeCount} vaka
            </span>
          </div>
        </div>

        {/* Sağ: Durum & Eylemler */}
        <div className="flex items-center gap-2">
          {/* DB Durumu */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold border ${
              dbOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                : 'bg-red-50 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
            }`}
            title={dbOnline ? 'PostgreSQL 18 Bağlı' : 'Veritabanı Çevrimdışı'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                dbOnline ? 'bg-emerald-600 dark:bg-emerald-400 animate-pulse' : 'bg-red-600'
              }`}
            />
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {dbOnline === null ? 'Kontrol...' : dbOnline ? 'Bağlı' : 'Çevrimdışı'}
            </span>
          </div>

          {/* Tıbbi Rapor */}
          <button
            onClick={onReportClick}
            className="btn-cyber btn-cyber-outline text-xs py-1.5"
            title="Klinik Karar Destek Raporu"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-slate-400" />
            <span className="hidden sm:inline">Tıbbi Rapor</span>
          </button>

          {/* XML İçe Aktar */}
          <button
            onClick={onUploadClick}
            className="btn-cyber btn-cyber-primary text-xs py-1.5"
            title="Vyaire SFT XML Dosyası Yükle"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>XML İçe Aktar</span>
          </button>

          {/* Yenile */}
          <button
            onClick={onRefreshClick}
            disabled={loading}
            className="p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
            title="Telemetri Verilerini Güncelle"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
          </button>

          {/* Tema Toggle */}
          <button
            onClick={onToggleDark}
            className="p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title={darkMode ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* ─── Alt Navigasyon Sekmeleri (Yüksek Kontrastlı) ─── */}
      <div className="h-11 px-4 flex items-center gap-1.5 overflow-x-auto bg-slate-100 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-all duration-150 whitespace-nowrap ${
                isActive
                  ? 'bg-white dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-slate-300 dark:border-blue-700/60 font-bold shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 font-semibold hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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
