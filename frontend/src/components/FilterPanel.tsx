// ─────────────────────────────────────────────────────────────
// components/FilterPanel.tsx
// Gazi SFT Klinik Platform — Parametrik Filtre Paneli
// ─────────────────────────────────────────────────────────────

import {
  Search,
  Sparkles,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';
import type { FilterState } from '../types';
import { DEFAULT_FILTERS } from '../types';

interface FilterPanelProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onFilter: () => void;
  onReset: () => void;
  loading: boolean;
  searchTerm: string;
  onSearchTermChange: (s: string) => void;
}

export function FilterPanel({
  filters,
  onChange,
  onFilter,
  onReset,
  loading,
  searchTerm,
  onSearchTermChange,
}: FilterPanelProps) {
  const set = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    onChange({ ...filters, [key]: val });

  const numOrEmpty = (v: string): number | '' =>
    v === '' ? '' : isNaN(Number(v)) ? '' : Number(v);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onFilter();
  };

  // Hızlı önayar filtreleri
  const applyPreset = (preset: 'all' | 'reversibility' | 'severe' | 'children') => {
    if (preset === 'all') {
      onReset();
    } else if (preset === 'reversibility') {
      onChange({ ...DEFAULT_FILTERS, reversibility_positive: true });
    } else if (preset === 'severe') {
      onChange({ ...DEFAULT_FILTERS, max_fev1_pred: 60 });
    } else if (preset === 'children') {
      onChange({ ...DEFAULT_FILTERS, max_age: 12 });
    }
  };

  const labelClass = 'text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300';

  return (
    <aside
      className="w-72 flex-shrink-0 flex flex-col bg-white dark:bg-[#0F1A2E] border-r border-slate-200 dark:border-slate-800 overflow-y-auto select-none p-4 space-y-4 shadow-xs"
      onKeyDown={handleKey}
    >
      {/* ─── Başlık ─── */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-wide">
              Parametrik Filtre
            </h2>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Kohort kriter matrisi</p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          title="Filtreleri Sıfırla"
        >
          Sıfırla
        </button>
      </div>

      {/* ─── Canlı Arama ─── */}
      <div className="space-y-1.5">
        <label className={labelClass}>Protokol / Hasta Arama</label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Protokol, İsim, TC No..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="input-cyber w-full pl-8 font-sans font-medium text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* ─── Hızlı Filtre Çipleri ─── */}
      <div className="space-y-2">
        <label className={`${labelClass} flex items-center gap-1.5`}>
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Klinik Önayarlar</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => applyPreset('reversibility')}
            className={`p-2 rounded-lg text-xs font-bold border text-left flex items-center gap-1.5 transition-all ${
              filters.reversibility_positive === true
                ? 'bg-amber-100 text-amber-950 border-amber-400 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/60 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-900/50 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:bg-slate-200/70'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Reversibilite (+)</span>
          </button>

          <button
            onClick={() => applyPreset('severe')}
            className={`p-2 rounded-lg text-xs font-bold border text-left flex items-center gap-1.5 transition-all ${
              filters.max_fev1_pred === 60
                ? 'bg-red-100 text-red-950 border-red-400 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/60 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-900/50 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:bg-slate-200/70'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400" />
            <span>Ağır (&lt;%60)</span>
          </button>

          <button
            onClick={() => applyPreset('children')}
            className={`p-2 rounded-lg text-xs font-bold border text-left flex items-center gap-1.5 transition-all ${
              filters.max_age === 12
                ? 'bg-blue-100 text-blue-950 border-blue-400 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/60 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-900/50 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:bg-slate-200/70'
            }`}
          >
            <span>👶 ≤ 12 Yaş</span>
          </button>

          <button
            onClick={() => applyPreset('all')}
            className="p-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 text-slate-800 dark:text-slate-300 hover:bg-slate-200/70 transition-all text-left"
          >
            <span>Tüm Kohort</span>
          </button>
        </div>
      </div>

      {/* ─── Yaş Aralığı ─── */}
      <div className="space-y-1.5">
        <label className={labelClass}>Yaş Aralığı (Yıl)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min (Örn. 6)"
            value={filters.min_age}
            onChange={(e) => set('min_age', numOrEmpty(e.target.value))}
            className="input-cyber font-mono font-bold text-slate-900 dark:text-white"
            min={0}
            max={120}
          />
          <input
            type="number"
            placeholder="Max (Örn. 18)"
            value={filters.max_age}
            onChange={(e) => set('max_age', numOrEmpty(e.target.value))}
            className="input-cyber font-mono font-bold text-slate-900 dark:text-white"
            min={0}
            max={120}
          />
        </div>
      </div>

      {/* ─── Biyolojik Cinsiyet ─── */}
      <div className="space-y-1.5">
        <label className={labelClass}>Biyolojik Cinsiyet</label>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              ['', 'Tümü'],
              ['Male', 'Erkek'],
              ['Female', 'Kız'],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              onClick={() => set('gender', val)}
              className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                filters.gender === val
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-900/60 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:bg-slate-200/70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── FEV1 %pred Aralığı ─── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={labelClass}>FEV₁ Beklenen (%pred)</label>
          <span className="text-[10px] text-blue-700 dark:text-blue-400 font-mono font-bold">GLI-2012</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min %"
            value={filters.min_fev1_pred}
            onChange={(e) => set('min_fev1_pred', numOrEmpty(e.target.value))}
            className="input-cyber font-mono font-bold text-slate-900 dark:text-white"
            min={0}
            max={200}
          />
          <input
            type="number"
            placeholder="Max %"
            value={filters.max_fev1_pred}
            onChange={(e) => set('max_fev1_pred', numOrEmpty(e.target.value))}
            className="input-cyber font-mono font-bold text-slate-900 dark:text-white"
            min={0}
            max={200}
          />
        </div>
      </div>

      {/* ─── FVC %pred Aralığı ─── */}
      <div className="space-y-1.5">
        <label className={labelClass}>FVC Beklenen (%pred)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min %"
            value={filters.min_fvc_pred}
            onChange={(e) => set('min_fvc_pred', numOrEmpty(e.target.value))}
            className="input-cyber font-mono font-bold text-slate-900 dark:text-white"
            min={0}
            max={200}
          />
          <input
            type="number"
            placeholder="Max %"
            value={filters.max_fvc_pred}
            onChange={(e) => set('max_fvc_pred', numOrEmpty(e.target.value))}
            className="input-cyber font-mono font-bold text-slate-900 dark:text-white"
            min={0}
            max={200}
          />
        </div>
      </div>

      {/* ─── Ölçüm Fazı (Level Type) ─── */}
      <div className="space-y-1.5">
        <label className={labelClass}>Ölçüm Fazı (Level Type)</label>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              ['Pre', 'Bazal (Pre)'],
              ['Post', 'Post-BD'],
              ['', 'Hepsi'],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              onClick={() => set('level_type', val)}
              className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                filters.level_type === val
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-900/60 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:bg-slate-200/70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Filtrele Butonu ─── */}
      <div className="pt-2">
        <button
          onClick={onFilter}
          disabled={loading}
          className="btn-cyber btn-cyber-solid w-full py-2.5 text-xs font-bold tracking-wide"
        >
          {loading ? 'Sorgulanıyor...' : 'Kohortu Filtrele'}
        </button>
      </div>
    </aside>
  );
}
