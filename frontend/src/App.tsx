// ─────────────────────────────────────────────────────────────
// App.tsx
// Gazi SFT Klinik Platform — Ana Uygulama
// ─────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchCohort, fetchPairedCurves } from './api/client';
import { CohortTable } from './components/CohortTable';
import { CurvePanel } from './components/CurvePanel';
import { FilterPanel } from './components/FilterPanel';
import { Header } from './components/Header';
import { PatientBanner } from './components/PatientBanner';
import { ClinicalAIView } from './components/ClinicalAIView';
import { IngestionHubView } from './components/IngestionHubView';
import { ResearchExportView } from './components/ResearchExportView';
import { UploadModal } from './components/UploadModal';
import { ReportModal } from './components/ReportModal';
import type {
  AppTab,
  CohortPatient,
  CohortResponse,
  CurvesResponse,
  FilterState,
} from './types';
import { DEFAULT_FILTERS } from './types';
import { TrendingUp } from 'lucide-react';

export default function App() {
  // ─── Tema Durumu ────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [darkMode]);

  // ─── Aktif Navigasyon Sekmesi ────────────────────────────────
  const [activeTab, setActiveTab] = useState<AppTab>('telemetry');

  // ─── Filtre Durumu ──────────────────────────────────────────
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [searchTerm, setSearchTerm] = useState('');

  // ─── Kohort Durumu ──────────────────────────────────────────
  const [cohortData, setCohortData] = useState<CohortResponse | null>(null);
  const [cohortLoading, setCohortLoading] = useState(false);
  const [cohortError, setCohortError] = useState<string | null>(null);

  // ─── Seçili Hasta & Eğri ────────────────────────────────────
  const [selectedRow, setSelectedRow] = useState<CohortPatient | null>(null);
  const [curvesData, setCurvesData] = useState<CurvesResponse | null>(null);
  const [postCurvesData, setPostCurvesData] = useState<CurvesResponse | null>(null);
  const [curvesLoading, setCurvesLoading] = useState(false);

  // ─── Modal Durumları ────────────────────────────────────────
  const [showUpload, setShowUpload] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // İstek ID referansı (stale response önleme)
  const fetchIdRef = useRef(0);

  // ─── Kohort Sorgulama ────────────────────────────────────────
  const runCohortQuery = useCallback(
    async (f: FilterState) => {
      const id = ++fetchIdRef.current;
      setCohortLoading(true);
      setCohortError(null);

      try {
        const res = await fetchCohort(f, 500);
        if (fetchIdRef.current !== id) return;
        setCohortData(res);

        // İlk hasta otomatik olarak künye bandında gösterilsin
        if (res.results.length > 0 && !selectedRow) {
          const first = res.results[0];
          setSelectedRow(first);
          loadCurvesForPatient(first);
        }
      } catch (e: any) {
        if (fetchIdRef.current !== id) return;
        setCohortError(e?.message ?? 'Sunucu bağlantısı kurulamadı.');
        setCohortData(null);
      } finally {
        if (fetchIdRef.current === id) setCohortLoading(false);
      }
    },
    [selectedRow],
  );

  // İlk açılışta sorgula
  useEffect(() => {
    runCohortQuery(DEFAULT_FILTERS);
  }, [runCohortQuery]);

  const handleFilter = useCallback(() => runCohortQuery(filters), [filters, runCohortQuery]);
  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchTerm('');
    runCohortQuery(DEFAULT_FILTERS);
  }, [runCohortQuery]);

  // ─── Eğri Yükleme Yardımcısı (Pre + Post İkili) ──────────────
  const loadCurvesForPatient = async (row: CohortPatient) => {
    setCurvesLoading(true);
    try {
      const paired = await fetchPairedCurves(row.visit_id);
      setCurvesData(paired.pre);
      setPostCurvesData(paired.post);
    } catch (err: any) {
      console.warn('Eğri yükleme hatası:', err?.message);
      setCurvesData(null);
      setPostCurvesData(null);
    } finally {
      setCurvesLoading(false);
    }
  };

  // ─── Hasta Satırı Seçimi ────────────────────────────────────
  const handleSelectRow = useCallback(
    async (row: CohortPatient) => {
      setSelectedRow(row);
      loadCurvesForPatient(row);
    },
    [],
  );

  return (
    <div className={`flex flex-col h-screen overflow-hidden font-sans select-none bg-slate-100 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100`}>
      {/* ─── 1. Header & Navigasyon ─── */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onUploadClick={() => setShowUpload(true)}
        onRefreshClick={() => runCohortQuery(filters)}
        onReportClick={() => setShowReport(true)}
        filters={filters}
        cohortData={cohortData}
        loading={cohortLoading}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
      />

      {/* ─── 2. Ana Çalışma Alanı ─── */}
      <main className="flex-1 min-h-0 overflow-hidden relative">
        {/* SEKME 1: Kohort Telemetrisi */}
        {activeTab === 'telemetry' && (
          <div className="h-full flex min-h-0 overflow-hidden">
            {/* Sol: Filtre Paneli */}
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              onFilter={handleFilter}
              onReset={handleReset}
              loading={cohortLoading}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
            />

            {/* Sağ: Kohort Tablosu */}
            <div className="flex-1 flex flex-col p-3 gap-3 min-w-0 overflow-hidden">
              {/* Seçili Hasta Bandı */}
              <PatientBanner
                patient={selectedRow}
                onShowCurves={() => setActiveTab('spectral_curves')}
                onOpenReport={() => setShowReport(true)}
              />

              {/* Kohort Tablosu */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <CohortTable
                  data={cohortData}
                  loading={cohortLoading}
                  error={cohortError}
                  selectedRow={selectedRow}
                  onSelectRow={handleSelectRow}
                  searchTerm={searchTerm}
                  onOpenReport={() => setShowReport(true)}
                  onShowCurves={() => setActiveTab('spectral_curves')}
                />
              </div>
            </div>
          </div>
        )}

        {/* SEKME 2: Akış-Hacim Spektrogramı */}
        {activeTab === 'spectral_curves' && (
          <div className="h-full p-3 flex flex-col min-h-0">
            {selectedRow ? (
              <CurvePanel
                row={selectedRow}
                curvesData={curvesData}
                postCurvesData={postCurvesData}
                loading={curvesLoading}
                onClose={() => setActiveTab('telemetry')}
                onOpenReport={() => setShowReport(true)}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center card rounded-xl">
                <TrendingUp className="w-10 h-10 text-blue-500 mb-3" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                  Spektrogram İçin Hasta Seçiniz
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mb-4">
                  Akış-hacim döngüsünü incelemek için lütfen kohort listesinden bir kayıt seçiniz.
                </p>
                <button
                  onClick={() => setActiveTab('telemetry')}
                  className="btn-cyber btn-cyber-primary text-xs"
                >
                  Kohort Listesine Git
                </button>
              </div>
            )}
          </div>
        )}

        {/* SEKME 3: Klinik Karar Destek & AI */}
        {activeTab === 'clinical_ai' && (
          <ClinicalAIView
            patient={selectedRow}
            onOpenReport={() => setShowReport(true)}
            onShowCurves={() => setActiveTab('spectral_curves')}
          />
        )}

        {/* SEKME 4: XML İçe Aktar & Cihaz Entegrasyonu */}
        {activeTab === 'ingestion_hub' && (
          <IngestionHubView
            onIngestSuccess={() => {
              runCohortQuery(filters);
            }}
          />
        )}

        {/* SEKME 5: Araştırma & Excel */}
        {activeTab === 'research_export' && (
          <ResearchExportView filters={filters} cohortData={cohortData} />
        )}
      </main>

      {/* ─── 3. Modallar ─── */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            runCohortQuery(filters);
          }}
        />
      )}

      {showReport && selectedRow && (
        <ReportModal
          patient={selectedRow}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
