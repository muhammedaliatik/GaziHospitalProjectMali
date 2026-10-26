// ─────────────────────────────────────────────────────────────
// components/CohortTable.tsx
// AEROFLOW PULSE DX — Futuristic Cybernetic Cohort Data Grid
// ─────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Activity,
  FileText,
  Zap,
  TrendingUp,
  AlertTriangle,
  User,
  ArrowRight,
} from 'lucide-react';
import type { CohortPatient, CohortResponse } from '../types';
import {
  fev1Severity,
  severityLabel,
  severityClass,
  formatName,
  formatGender,
  formatNum,
} from '../types';

interface CohortTableProps {
  data: CohortResponse | null;
  loading: boolean;
  error: string | null;
  selectedRow: CohortPatient | null;
  onSelectRow: (row: CohortPatient) => void;
  searchTerm?: string;
  onOpenReport?: (row: CohortPatient) => void;
  onShowCurves?: (row: CohortPatient) => void;
}

type SortKey = keyof CohortPatient | null;
type SortDir = 'asc' | 'desc';

export function CohortTable({
  data,
  loading,
  error,
  selectedRow,
  onSelectRow,
  searchTerm = '',
  onOpenReport,
  onShowCurves,
}: CohortTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('visit_datetime');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    let rows = data?.results ?? [];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      rows = rows.filter((r) => {
        const name = `${r.first_name ?? ''} ${r.last_name ?? ''}`.toLowerCase();
        const ext = (r.external_id ?? '').toLowerCase();
        const gender = (r.biological_gender ?? '').toLowerCase();
        return name.includes(q) || ext.includes(q) || gender.includes(q);
      });
    }

    if (!sortKey) return rows;

    return [...rows].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, searchTerm]);

  const SortHeader = ({
    colKey,
    label,
    className = '',
  }: {
    colKey: SortKey;
    label: string;
    className?: string;
  }) => {
    const isSorted = sortKey === colKey;
    return (
      <th
        onClick={() => handleSort(colKey)}
        className={`th-cyber cursor-pointer hover:text-white transition-colors ${className}`}
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          {isSorted ? (
            sortDir === 'asc' ? (
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
            )
          ) : (
            <ChevronsUpDown className="w-3 h-3 text-slate-600" />
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="h-full flex flex-col glass-card rounded-xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* ─── Grid Kontrol & Durum Çubuğu ─── */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white tracking-wide">
            Klinik Kohort Matrisi
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {filteredAndSorted.length} kayıt listelendi
          </span>
        </div>

        {selectedRow && (
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-slate-400">Aktif Telemetri:</span>
            <span className="font-bold text-cyan-300 font-mono">
              {formatName(selectedRow)} ({selectedRow.external_id})
            </span>
          </div>
        )}
      </div>

      {/* ─── Tablo Alanı ─── */}
      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="h-48 flex flex-col items-center justify-center gap-2 text-slate-400">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <span className="text-xs font-mono">Telemetri verileri yükleniyor...</span>
          </div>
        )}

        {error && (
          <div className="h-48 flex flex-col items-center justify-center gap-2 text-rose-400 p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-rose-400" />
            <span className="text-xs font-bold">{error}</span>
          </div>
        )}

        {!loading && !error && filteredAndSorted.length === 0 && (
          <div className="h-48 flex flex-col items-center justify-center gap-2 text-slate-500 p-6 text-center">
            <Activity className="w-10 h-10 text-slate-700 mb-1" />
            <p className="text-sm font-semibold text-slate-300">
              Kriterlere Uygun Kayıt Bulunamadı
            </p>
            <p className="text-xs text-slate-500 max-w-sm">
              Sol paneldeki filtreleri gevşetebilir veya yeni Vyaire SFT XML dosyaları yükleyebilirsiniz.
            </p>
          </div>
        )}

        {!loading && !error && filteredAndSorted.length > 0 && (
          <table className="table-cyber">
            <thead>
              <tr>
                <SortHeader colKey="external_id" label="Protokol / ID" />
                <SortHeader colKey="first_name" label="Hasta Adı Soyadı" />
                <SortHeader colKey="age" label="Yaş / Cinsiyet" />
                <SortHeader colKey="visit_datetime" label="Test Tarihi" />
                <SortHeader colKey="fev1_pred_percent" label="FEV₁ (%pred)" />
                <SortHeader colKey="fvc_pred_percent" label="FVC (%pred)" />
                <SortHeader colKey="fev1_fvc_ratio" label="FEV₁/FVC" />
                <SortHeader colKey="pef_val" label="PEF (L/s)" />
                <th className="th-cyber">Reversibilite</th>
                <th className="th-cyber text-right">Eylem</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((row) => {
                const isSelected = selectedRow?.trial_id === row.trial_id;
                const sev = fev1Severity(row.fev1_pred_percent);
                const hasReversibility = row.reversibility_positive;

                return (
                  <tr
                    key={`${row.trial_id}-${row.level_type}`}
                    onClick={() => onSelectRow(row)}
                    className={`tr-cyber ${isSelected ? 'tr-cyber-selected' : ''}`}
                  >
                    {/* Protokol / ID */}
                    <td className="td-cyber font-mono font-bold text-cyan-400">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{row.external_id}</span>
                      </div>
                    </td>

                    {/* Hasta Adı */}
                    <td className="td-cyber font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-300 font-bold">
                          {row.first_name ? row.first_name[0] : 'P'}
                        </div>
                        <span>{formatName(row)}</span>
                      </div>
                    </td>

                    {/* Yaş / Cinsiyet */}
                    <td className="td-cyber">
                      <span className="font-mono text-slate-300">
                        {row.age ? `${row.age} yaş` : '—'}
                      </span>{' '}
                      <span className="text-slate-500 font-normal">
                        ({formatGender(row.biological_gender)})
                      </span>
                    </td>

                    {/* Test Tarihi */}
                    <td className="td-cyber text-slate-400 font-mono text-[11px]">
                      {row.visit_datetime
                        ? new Date(row.visit_datetime).toLocaleDateString('tr-TR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>

                    {/* FEV1 %pred & Ciddiyet Rozeti */}
                    <td className="td-cyber font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">
                          {row.fev1_pred_percent ? `%${row.fev1_pred_percent.toFixed(0)}` : '—'}
                        </span>
                        <span className={severityClass(sev)}>
                          {severityLabel(sev)}
                        </span>
                      </div>
                    </td>

                    {/* FVC %pred */}
                    <td className="td-cyber font-mono text-slate-300">
                      {row.fvc_pred_percent ? `%${row.fvc_pred_percent.toFixed(0)}` : '—'}
                    </td>

                    {/* FEV1/FVC Oranı */}
                    <td className="td-cyber font-mono text-slate-300">
                      {row.fev1_fvc_ratio ? `%${(row.fev1_fvc_ratio * 100).toFixed(1)}` : '—'}
                    </td>

                    {/* PEF */}
                    <td className="td-cyber font-mono text-slate-300">
                      {row.pef_val ? `${row.pef_val.toFixed(2)}` : '—'}
                    </td>

                    {/* Reversibilite Rozeti */}
                    <td className="td-cyber">
                      {hasReversibility === true && (
                        <span className="badge-cyber bg-amber-500/20 text-amber-300 border-amber-500/40">
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>POZİTİF</span>
                        </span>
                      )}
                      {hasReversibility === false && (
                        <span className="badge-cyber bg-slate-800/60 text-slate-400 border-slate-700/60">
                          Negatif
                        </span>
                      )}
                      {hasReversibility === null && (
                        <span className="text-slate-600 font-mono text-[10px]">
                          Post Test Yok
                        </span>
                      )}
                    </td>

                    {/* Hızlı Eylemler */}
                    <td className="td-cyber text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onShowCurves?.(row);
                          }}
                          className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 transition-all"
                          title="Akış-Hacim Spektrogramını İncele"
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenReport?.(row);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                          title="Klinik Rapor Modalı"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
