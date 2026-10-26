// ─────────────────────────────────────────────────────────────
// components/CurvePanel.tsx
// AEROFLOW PULSE DX — Futuristic Flow-Volume Spectral Analyzer
// ─────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react';
import {
  Activity,
  Maximize2,
  Minimize2,
  X,
  TrendingUp,
  Printer,
  FileText,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CohortPatient, CurvesResponse } from '../types';
import {
  fev1Severity,
  formatGender,
  formatName,
  formatNum,
  severityClass,
  severityLabel,
} from '../types';

interface CurvePanelProps {
  row: CohortPatient;
  curvesData: CurvesResponse | null;
  postCurvesData: CurvesResponse | null;
  loading: boolean;
  onClose: () => void;
  onOpenReport?: (row: CohortPatient) => void;
}

// Birim dönüşümü: mL → L, mL/s → L/s
const ML_TO_L = 0.001;

interface ChartPoint {
  vol: number;
  flow: number;
}

const EmptyDot = () => <g />;

function extractFlowVolume(curves: CurvesResponse | null): {
  exData: ChartPoint[];
  inData: ChartPoint[];
  maxVol: number;
  maxFlow: number;
} {
  if (!curves) return { exData: [], inData: [], maxVol: 0, maxFlow: 0 };

  const exCurve = curves.curves.find((c) => c.curve_type === 'TYPE_FVC_EX');
  const inCurve = curves.curves.find((c) => c.curve_type === 'TYPE_FVC_IN');

  const toPoints = (pts: { x: number; y: number }[]): ChartPoint[] =>
    pts.map((p) => ({
      vol: +(p.x * ML_TO_L).toFixed(4),
      flow: +(p.y * ML_TO_L).toFixed(4),
    }));

  const exData = exCurve ? toPoints(exCurve.points) : [];
  const inData = inCurve ? toPoints(inCurve.points) : [];

  const allVols = [...exData, ...inData].map((p) => p.vol);
  const allFlows = [...exData, ...inData].map((p) => Math.abs(p.flow));

  return {
    exData,
    inData,
    maxVol: allVols.length ? Math.max(...allVols) : 5,
    maxFlow: allFlows.length ? Math.max(...allFlows) : 10,
  };
}

// ─── Özel Neon Tooltip ───
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as ChartPoint;
  return (
    <div className="glass-card px-3 py-2 rounded-lg border border-cyan-500/40 text-xs font-mono shadow-xl">
      <div className="text-cyan-400 font-bold mb-1">Koordinat Telemetrisi</div>
      <div className="text-slate-300">
        Hacim: <span className="font-bold text-white">{d?.vol?.toFixed(3)} L</span>
      </div>
      <div className="text-slate-300">
        Akış: <span className="font-bold text-cyan-300">{d?.flow?.toFixed(3)} L/s</span>
      </div>
    </div>
  );
};

export function CurvePanel({
  row,
  curvesData,
  postCurvesData,
  loading,
  onClose,
  onOpenReport,
}: CurvePanelProps) {
  const [fullscreen, setFullscreen] = useState(false);

  // Pre ve Post eğri noktalarını ayrıştır
  const pre = useMemo(() => extractFlowVolume(curvesData), [curvesData]);
  const post = useMemo(() => extractFlowVolume(postCurvesData), [postCurvesData]);

  // Eksen sınırları
  const maxVol = Math.max(pre.maxVol, post.maxVol, 3.5);
  const maxFlow = Math.max(pre.maxFlow, post.maxFlow, 8);
  const xDomain = [0, Math.ceil(maxVol * 1.15 * 10) / 10];
  const yDomain = [-Math.ceil((maxFlow * 0.6) * 10) / 10, Math.ceil(maxFlow * 1.15 * 10) / 10];

  const hasPost = post.exData.length > 0;
  const sev = fev1Severity(row.fev1_pred_percent);

  // Reversibilite hesaplama (Varsa)
  const isReversible = row.reversibility_positive;

  return (
    <div
      className={`glass-card rounded-xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${
        fullscreen ? 'fixed inset-4 z-50 bg-slate-950/95' : 'h-full'
      }`}
    >
      {/* ─── Başlık Çubuğu ─── */}
      <div className="h-11 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/70 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">
                Akış-Hacim Spektrogramı (Flow-Volume Loop)
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                {row.external_id}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Vyaire MasterScreen JAEGER Koordinat Haritası (200 Örnek Noktası)
            </p>
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex items-center gap-1.5">
          {onOpenReport && (
            <button
              onClick={() => onOpenReport(row)}
              className="btn-cyber btn-cyber-outline text-xs py-1"
              title="Klinik Rapor Modalı"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Rapor Oluştur</span>
            </button>
          )}

          <button
            onClick={() => setFullscreen((f) => !f)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title={fullscreen ? 'Küçült' : 'Tam Ekran'}
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── Ana İçerik: Grafik + Yan Metrik Paneli ─── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Sol Alan: Fütüristik Neon Grafik */}
        <div className="flex-1 min-h-[300px] flex flex-col p-3 relative bg-slate-950/40">
          {/* Grafik İçi Legend */}
          <div className="absolute top-4 left-6 z-10 flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/80 border border-cyan-500/30 text-cyan-300">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <span>PRE-BD (Bazal)</span>
            </div>

            {hasPost ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/80 border border-amber-500/30 text-amber-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                <span>POST-BD (Bronkodilatör)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/60 border border-slate-800 text-slate-500 text-[11px]">
                <span>Post-BD Testi Bulunmuyor</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <span className="text-xs font-mono">Spektrogram çizdiriliyor...</span>
            </div>
          ) : pre.exData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-500 text-center p-6">
              <Activity className="w-10 h-10 text-slate-700" />
              <p className="text-xs font-bold text-slate-300">
                Eğri Koordinat Verisi Bulunamadı
              </p>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Bu teste ait sayısal eğri dizisi Vyaire XML dosyasında raporlanmamış olabilir.
              </p>
            </div>
          ) : (
            <div className="flex-1 w-full min-h-0 pt-8">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 25, bottom: 25, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />

                  <XAxis
                    type="number"
                    dataKey="vol"
                    name="Hacim"
                    unit=" L"
                    domain={xDomain}
                    stroke="#64748B"
                    tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
                    label={{
                      value: 'Hacim — Volume (L)',
                      position: 'insideBottom',
                      offset: -12,
                      fill: '#94A3B8',
                      fontSize: 11,
                      fontFamily: 'monospace',
                    }}
                  />

                  <YAxis
                    type="number"
                    dataKey="flow"
                    name="Akış"
                    unit=" L/s"
                    domain={yDomain}
                    stroke="#64748B"
                    tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
                    label={{
                      value: 'Akış — Flow (L/s)',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 10,
                      fill: '#94A3B8',
                      fontSize: 11,
                      fontFamily: 'monospace',
                    }}
                  />

                  <ReferenceLine y={0} stroke="#334155" strokeWidth={1.5} />

                  <Tooltip content={<CustomTooltip />} />

                  {/* PRE: Ekspirasyon (Neon Cyan) */}
                  <Scatter
                    name="Pre Ekspirasyon"
                    data={pre.exData}
                    line={{ stroke: '#06B6D4', strokeWidth: 2.5 }}
                    shape={<EmptyDot />}
                  />

                  {/* PRE: İnspirasyon (Cyan Kesikli) */}
                  <Scatter
                    name="Pre İnspirasyon"
                    data={pre.inData}
                    line={{ stroke: '#06B6D4', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                    shape={<EmptyDot />}
                  />

                  {/* POST: Ekspirasyon (Neon Amber) */}
                  {hasPost && (
                    <Scatter
                      name="Post Ekspirasyon"
                      data={post.exData}
                      line={{ stroke: '#F59E0B', strokeWidth: 2.5 }}
                      shape={<EmptyDot />}
                    />
                  )}

                  {/* POST: İnspirasyon (Amber Kesikli) */}
                  {hasPost && (
                    <Scatter
                      name="Post İnspirasyon"
                      data={post.inData}
                      line={{ stroke: '#F59E0B', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                      shape={<EmptyDot />}
                    />
                  )}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Sağ Alan: Parametre Karşılaştırma & Reversibilite Telemetrisi */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800/80 bg-slate-950/60 p-3 flex flex-col space-y-3 overflow-y-auto">
          {/* Parametre Matrisi */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-mono uppercase text-slate-400 tracking-wider flex items-center justify-between">
              <span>Spirometri Parametreleri</span>
              <span className="text-cyan-400">GLI-2012</span>
            </h4>

            <div className="space-y-1 text-xs">
              {/* FEV1 */}
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">FEV₁</span>
                  <span className="text-[10px] text-slate-400 ml-1">1. Saniye</span>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-cyan-300">
                    {row.fev1_val ? `${row.fev1_val.toFixed(2)} L` : '—'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    %{row.fev1_pred_percent?.toFixed(0) ?? '—'} pred
                  </div>
                </div>
              </div>

              {/* FVC */}
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">FVC</span>
                  <span className="text-[10px] text-slate-400 ml-1">Vital Kap.</span>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-slate-200">
                    {row.fvc_val ? `${row.fvc_val.toFixed(2)} L` : '—'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    %{row.fvc_pred_percent?.toFixed(0) ?? '—'} pred
                  </div>
                </div>
              </div>

              {/* FEV1/FVC */}
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">FEV₁/FVC</span>
                  <span className="text-[10px] text-slate-400 ml-1">Tiffeneau</span>
                </div>
                <div className="text-right font-mono font-bold text-cyan-400">
                  {row.fev1_fvc_ratio
                    ? `%${(row.fev1_fvc_ratio * 100).toFixed(1)}`
                    : '—'}
                </div>
              </div>

              {/* PEF */}
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">PEF</span>
                  <span className="text-[10px] text-slate-400 ml-1">Zirve Hızı</span>
                </div>
                <div className="text-right font-mono font-bold text-amber-300">
                  {row.pef_val ? `${row.pef_val.toFixed(2)} L/s` : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* ATS/ERS Reversibilite Kriteri Kartı */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Pediatrik Reversibilite</span>
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                ATS/ERS 2019
              </span>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              Kriter: Salbutamol sonrası &Delta;FEV₁ &ge; %12 ve &ge; 200 mL mutlak artış.
            </p>

            {isReversible === true ? (
              <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="font-bold">Bronkodilatör Yanıtı Pozitif</div>
                  <div className="text-[10px] text-amber-200/80">
                    Astım tanısı ile yüksek oranda uyumlu
                  </div>
                </div>
              </div>
            ) : isReversible === false ? (
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <div className="font-bold">Reversibilite Negatif</div>
                  <div className="text-[10px] text-slate-400">
                    Anlamlı bronkodilatör yanıtı izlenmedi
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-500 text-[11px]">
                Post-bronkodilatör testi yapılmamış.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
