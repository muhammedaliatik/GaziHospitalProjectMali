// ─────────────────────────────────────────────────────────────
// components/CurvePanel.tsx
// Gazi SFT Klinik Platform — Akış-Hacim Spektrogramı (Pre & Post)
// ─────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react';
import {
  Activity,
  Maximize2,
  Minimize2,
  X,
  TrendingUp,
  FileText,
  Zap,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  CartesianGrid,
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
  formatTiffeneau,
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

// ─── Özel Tooltip (Light / Dark Uyumlu) ───
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as ChartPoint;
  return (
    <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono shadow-lg text-slate-800 dark:text-slate-100">
      <div className="text-blue-600 dark:text-blue-400 font-bold mb-1">Koordinat Değeri</div>
      <div className="text-slate-600 dark:text-slate-300">
        Hacim: <span className="font-bold text-slate-900 dark:text-white">{d?.vol?.toFixed(3)} L</span>
      </div>
      <div className="text-slate-600 dark:text-slate-300">
        Akış: <span className="font-bold text-blue-600 dark:text-blue-400">{d?.flow?.toFixed(3)} L/s</span>
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
  const isReversible = row.reversibility_positive;

  return (
    <div
      className={`card rounded-xl overflow-hidden flex flex-col transition-all duration-200 ${
        fullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'h-full'
      }`}
    >
      {/* ─── Başlık Çubuğu ─── */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 text-blue-600 dark:text-blue-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                Akış-Hacim Spektrogramı (Flow-Volume Loop)
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                {row.external_id}
              </span>
              <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                — {formatName(row)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Rapor Oluştur</span>
            </button>
          )}

          <button
            onClick={() => setFullscreen((f) => !f)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
            title={fullscreen ? 'Küçült' : 'Tam Ekran'}
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── Ana İçerik: Grafik + Yan Metrik Paneli ─── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Sol Alan: Temiz Grafik */}
        <div className="flex-1 h-full min-w-0 min-h-0 flex flex-col p-4 relative bg-slate-50/50 dark:bg-slate-950/40">
          {/* Grafik İçi Legend */}
          <div className="absolute top-4 left-6 z-10 flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 shadow-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              <span>PRE-BD (Bazal)</span>
            </div>

            {hasPost ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 shadow-xs font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                <span>POST-BD (Bronkodilatör)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-500 text-[11px]">
                <span>Post-BD Testi Bulunmuyor</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-500">
              <div className="w-8 h-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
              <span className="text-xs font-mono">Spektrogram çizdiriliyor...</span>
            </div>
          ) : pre.exData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-500 text-center p-6">
              <Activity className="w-10 h-10 text-slate-400" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Eğri Koordinat Verisi Bulunamadı
              </p>
              <p className="text-xs text-slate-500 max-w-xs">
                Bu teste ait sayısal eğri dizisi Vyaire XML dosyasında raporlanmamış olabilir.
              </p>
            </div>
          ) : (
            <div className="flex-1 w-full min-h-0 pt-10">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" strokeOpacity={0.6} />

                  <XAxis
                    type="number"
                    dataKey="vol"
                    name="Hacim"
                    unit=" L"
                    domain={xDomain}
                    stroke="#475569"
                    tick={{ fill: '#334155', fontSize: 11, fontFamily: 'monospace', fontWeight: 600 }}
                    label={{
                      value: 'Hacim — Volume (L)',
                      position: 'insideBottom',
                      offset: -16,
                      fill: '#1E293B',
                      fontSize: 12,
                      fontWeight: 700,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  />

                  <YAxis
                    type="number"
                    dataKey="flow"
                    name="Akış"
                    unit=" L/s"
                    domain={yDomain}
                    stroke="#475569"
                    tick={{ fill: '#334155', fontSize: 11, fontFamily: 'monospace', fontWeight: 600 }}
                    label={{
                      value: 'Akış — Flow (L/s)',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 5,
                      fill: '#1E293B',
                      fontSize: 12,
                      fontWeight: 700,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  />

                  <ReferenceLine y={0} stroke="#64748B" strokeWidth={1.5} />

                  <Tooltip content={<CustomTooltip />} />

                  {/* PRE: Ekspirasyon (Mavi Çizgi) */}
                  <Scatter
                    name="Pre Ekspirasyon"
                    data={pre.exData}
                    line={{ stroke: '#2563EB', strokeWidth: 2.5 }}
                    shape={<EmptyDot />}
                  />

                  {/* PRE: İnspirasyon (Mavi Kesikli) */}
                  <Scatter
                    name="Pre İnspirasyon"
                    data={pre.inData}
                    line={{ stroke: '#2563EB', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                    shape={<EmptyDot />}
                  />

                  {/* POST: Ekspirasyon (Amber Çizgi) */}
                  {hasPost && (
                    <Scatter
                      name="Post Ekspirasyon"
                      data={post.exData}
                      line={{ stroke: '#D97706', strokeWidth: 2.5 }}
                      shape={<EmptyDot />}
                    />
                  )}

                  {/* POST: İnspirasyon (Amber Kesikli) */}
                  {hasPost && (
                    <Scatter
                      name="Post İnspirasyon"
                      data={post.inData}
                      line={{ stroke: '#D97706', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                      shape={<EmptyDot />}
                    />
                  )}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Sağ Alan: Parametre Karşılaştırma & Reversibilite */}
        <div className="w-full lg:w-80 flex-shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-4 flex flex-col space-y-4 overflow-y-auto">
          {/* Parametre Matrisi */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
              <span>Spirometri Parametreleri</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono text-[10px]">GLI-2012</span>
            </h4>

            <div className="space-y-1.5 text-xs">
              {/* FEV1 */}
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">FEV₁</span>
                  <span className="text-[10px] text-slate-500 ml-1">1. Saniye</span>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {row.fev1_val ? `${row.fev1_val.toFixed(2)} L` : '—'}
                  </div>
                  <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    %{row.fev1_pred_percent?.toFixed(0) ?? '—'} pred
                  </div>
                </div>
              </div>

              {/* FVC */}
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">FVC</span>
                  <span className="text-[10px] text-slate-500 ml-1">Vital Kap.</span>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {row.fvc_val ? `${row.fvc_val.toFixed(2)} L` : '—'}
                  </div>
                  <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    %{row.fvc_pred_percent?.toFixed(0) ?? '—'} pred
                  </div>
                </div>
              </div>

              {/* FEV1/FVC */}
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">FEV₁/FVC</span>
                  <span className="text-[10px] text-slate-500 ml-1">Tiffeneau</span>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                    {formatTiffeneau(row.fev1_fvc_ratio)}
                  </div>
                  <div className="text-[10px] text-slate-500">oran</div>
                </div>
              </div>

              {/* PEF */}
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">PEF</span>
                  <span className="text-[10px] text-slate-500 ml-1">Zirve Hızı</span>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {row.pef_val ? `${row.pef_val.toFixed(2)}` : '—'}
                  </div>
                  <div className="text-[10px] text-slate-500">L/s</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pediatrik Reversibilite Değerlendirmesi */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Pediatrik Reversibilite</span>
              </h5>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                ATS/ERS 2019
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Kriter: Salbutamol sonrası ΔFEV₁ ≥ %12 ve ≥ 200 mL mutlak artış.
            </p>

            {isReversible === true ? (
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700/50 flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
                    Bronkodilatör Yanıtı Pozitif
                  </div>
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                    Astım tanısı ile yüksek oranda uyumlu.
                  </div>
                </div>
              </div>
            ) : isReversible === false ? (
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Reversibilite Negatif
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Belirgin bronkodilatör yanıtı izlenmedi.
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Post-BD Ölçümü Yok
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Yalnızca bazal (Pre) spirometri kaydedilmiş.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
