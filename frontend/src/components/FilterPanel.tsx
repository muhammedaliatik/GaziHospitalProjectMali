// ─────────────────────────────────────────────────────────────
// components/FilterPanel.tsx
// AEROFLOW PULSE DX — Futuristic Parametric Filter Matrix
// ─────────────────────────────────────────────────────────────

import {
  Filter,
  RefreshCw,
  Search,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
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

  // Hızlı önayar filtreleri (Quick Filter Chips)
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

  return (
    <aside
      className="w-72 flex-shrink-0 flex flex-col glass-card border-r border-slate-800/80 overflow-y-auto select-none p-3 space-y-4"
      onKeyDown={handleKey}
    >
      {/* ─── Başlık & Durum ─── */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide">
              Parametrik Filtre
            </h2>
            <p className="text-[10px] text-slate-400">Kohort kriter matrisi</p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="text-[11px] font-mono text-slate-400 hover:text-cyan-400 transition-colors"
          title="Filtreleri Sıfırla"
        >
          Sıfırla
        </button>
      </div>

      {/* ─── Canlı Arama Çubuğu ─── */}
      <div className="space-y-1">
        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Protokol / Hasta Arama
        </label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Protokol, İsim, TC No..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="input-cyber w-full pl-8 font-sans"
          />
        </div>
      </div>

      {/* ─── Hızlı Filtre Çipleri ─── */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Klinik Önayarlar</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => applyPreset('reversibility')}
            className={`p-1.5 rounded-lg text-[11px] font-medium border text-left flex items-center gap-1.5 transition-all ${
              filters.reversibility_positive === true
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-slate-900/50 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Reversibilite (+)</span>
          </button>

          <button
            onClick={() => applyPreset('severe')}
            className={`p-1.5 rounded-lg text-[11px] font-medium border text-left flex items-center gap-1.5 transition-all ${
              filters.max_fev1_pred === 60
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                : 'bg-slate-900/50 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Ağır (&lt;%60)</span>
          </button>

          <button
            onClick={() => applyPreset('children')}
            className={`p-1.5 rounded-lg text-[11px] font-medium border text-left flex items-center gap-1.5 transition-all ${
              filters.max_age === 12
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900/50 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span>👶 &le; 12 Yaş</span>
          </button>

          <button
            onClick={() => applyPreset('all')}
            className="p-1.5 rounded-lg text-[11px] font-medium border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white hover:border-slate-700 transition-all text-left"
          >
            <span>Tüm Kohort</span>
          </button>
        </div>
      </div>

      {/* ─── Yaş Aralığı ─── */}
      <div className="space-y-1">
        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Yaş Aralığı (Yıl)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            max="120"
            placeholder="Min (örn. 6)"
            value={filters.min_age}
            onChange={(e) => set('min_age', numOrEmpty(e.target.value))}
            className="input-cyber font-mono"
          />
          <input
            type="number"
            min="0"
            max="120"
            placeholder="Max (örn. 18)"
            value={filters.max_age}
            onChange={(e) => set('max_age', numOrEmpty(e.target.value))}
            className="input-cyber font-mono"
          />
        </div>
      </div>

      {/* ─── Biyolojik Cinsiyet ─── */}
      <div className="space-y-1">
        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Biyolojik Cinsiyet
        </label>
        <div className="grid grid-cols-3 gap-1">
          {(['', 'Male', 'Female'] as const).map((g) => (
            <button
              key={g}
              onClick={() => set('gender', g)}
              className={`py-1 text-center rounded-lg text-xs font-medium border transition-all ${
                filters.gender === g
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-semibold'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {g === '' ? 'Tümü' : g === 'Male' ? 'Erkek' : 'Kız'}
            </button>
          ))}
        </div>
      </div>

      {/* ─── FEV1 % Pred Aralığı ─── */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            FEV₁ Beklenen (%pred)
          </label>
          <span className="text-[9px] font-mono text-cyan-400">GLI-2012</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            max="200"
            placeholder="Min %"
            value={filters.min_fev1_pred}
            onChange={(e) => set('min_fev1_pred', numOrEmpty(e.target.value))}
            className="input-cyber font-mono"
          />
          <input
            type="number"
            min="0"
            max="200"
            placeholder="Max %"
            value={filters.max_fev1_pred}
            onChange={(e) => set('max_fev1_pred', numOrEmpty(e.target.value))}
            className="input-cyber font-mono"
          />
        </div>
      </div>

      {/* ─── FVC % Pred Aralığı ─── */}
      <div className="space-y-1">
        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
          FVC Beklenen (%pred)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            max="200"
            placeholder="Min %"
            value={filters.min_fvc_pred}
            onChange={(e) => set('min_fvc_pred', numOrEmpty(e.target.value))}
            className="input-cyber font-mono"
          />
          <input
            type="number"
            min="0"
            max="200"
            placeholder="Max %"
            value={filters.max_fvc_pred}
            onChange={(e) => set('max_fvc_pred', numOrEmpty(e.target.value))}
            className="input-cyber font-mono"
          />
        </div>
      </div>

      {/* ─── Ölçüm Seviyesi (Pre / Post) ─── */}
      <div className="space-y-1">
        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Ölçüm Fazı (Level Type)
        </label>
        <div className="grid grid-cols-3 gap-1">
          {(['Pre', 'Post', ''] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => set('level_type', lvl)}
              className={`py-1 text-center rounded-lg text-xs font-medium border transition-all ${
                filters.level_type === lvl
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-semibold'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {lvl === 'Pre' ? 'Bazal (Pre)' : lvl === 'Post' ? 'Post-BD' : 'Hepsi'}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Sorgula Butonu ─── */}
      <div className="pt-2">
        <button
          onClick={onFilter}
          disabled={loading}
          className="btn-cyber btn-cyber-solid w-full py-2 flex items-center justify-center gap-2"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Filter className="w-4 h-4" />
          )}
          <span>Kohortu Filtrele</span>
        </button>
      </div>
    </aside>
  );
}
