// ─────────────────────────────────────────────────────────────
// components/IngestionHubView.tsx
// Gazi SFT Klinik Platform — Vyaire SFT XML İçe Aktarım Merkezi
// ─────────────────────────────────────────────────────────────

import { useState, useRef } from 'react';
import {
  Upload,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCode,
  SkipForward,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { uploadXmlFiles } from '../api/client';
import type { UploadResponse } from '../types';

interface IngestionHubViewProps {
  onIngestSuccess: () => void;
}

export function IngestionHubView({ onIngestSuccess }: IngestionHubViewProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const xmls = Array.from(incoming).filter((f) =>
      f.name.toLowerCase().endsWith('.xml'),
    );
    if (xmls.length === 0) return;
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...xmls.filter((f) => !existing.has(f.name))];
    });
  };

  const handleStartIngest = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setErrorMsg(null);
    setResponse(null);

    try {
      const res = await uploadXmlFiles(files);
      setResponse(res);
      setFiles([]);
      if (res.success > 0) {
        onIngestSuccess();
      }
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Yükleme sırasında hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto space-y-4">
      {/* ─── Başlık Kartı ─── */}
      <div className="card p-5 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              XML İçe Aktarım ve Cihaz Entegrasyonu
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Vyaire Medical (MasterScreen/JAEGER) XML dosyalarını ayrıştırıp PostgreSQL veritabanına aktarır.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge-cyber bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800 font-bold px-3 py-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>SHA-256 Deduplication Aktif</span>
          </span>
        </div>
      </div>

      {/* ─── Mimari Pipeline Görselleştirici ─── */}
      <div className="card p-5 rounded-xl space-y-3">
        <h3 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
          XML İçe Aktarma Boru Hattı
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black font-mono">
              1
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Vyaire XML</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400">Cihaz çıktısı NIOSH formatı</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black font-mono">
              2
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">SHA-256 Doğrulama</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400">Mükerrer dosya kontrolü</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-black font-mono">
              3
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">lxml Ayrıştırma</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400">Hasta, Deneme, Eğri Real[]</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black font-mono">
              4
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">PostgreSQL & MV</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400">Materialized view yenileme</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Sürükle Bırak Yükleme Alanı ─── */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`card p-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 text-center ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/20'
            : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 dark:border-slate-700 dark:hover:bg-slate-900/40'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xml"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Upload className="w-7 h-7" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            Vyaire SFT XML Dosyalarını Buraya Sürükleyin
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            veya bilgisayarınızdan seçmek için tıklayın (.xml formatında tekil veya çoklu)
          </p>
        </div>
      </div>

      {/* ─── Seçili Dosyalar Listesi & Yükle Butonu ─── */}
      {files.length > 0 && (
        <div className="card p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Yüklenmeye Hazır Dosyalar ({files.length} dosya)
            </span>
            <button
              onClick={() => setFiles([])}
              className="text-xs font-bold text-rose-600 hover:text-rose-800"
            >
              Listeyi Temizle
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5">
            {files.map((f, i) => (
              <div
                key={i}
                className="px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-slate-900 dark:text-white font-medium">{f.name}</span>
                </div>
                <span className="text-slate-600 dark:text-slate-400 font-semibold">
                  {(f.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={handleStartIngest}
            disabled={uploading}
            className="btn-cyber btn-cyber-solid w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Veriler Ayrıştırılıyor ve Kaydediliyor...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>{files.length} Dosyayı Veritabanına Aktar</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ─── Hata Mesajı ─── */}
      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-rose-500/10 border border-red-300 dark:border-rose-500/30 text-red-800 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ─── Son Yükleme Sonuçları ─── */}
      {response && (
        <div className="card p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>İşlem Raporu</span>
            </span>
            <div className="flex items-center gap-3 text-xs font-mono font-bold">
              <span className="text-emerald-700 dark:text-emerald-400">✓ {response.success} Başarılı</span>
              <span className="text-amber-700 dark:text-amber-400">↷ {response.skipped_duplicates} Mükerrer</span>
              <span className="text-red-700 dark:text-rose-400">✗ {response.failed} Hata</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {response.results.map((r, i) => (
              <div
                key={i}
                className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  {r.status === 'SUCCESS' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                  {r.status === 'SKIPPED_DUPLICATE' && (
                    <SkipForward className="w-4 h-4 text-amber-600" />
                  )}
                  {r.status === 'FAILED_QUARANTINE' && (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="font-mono text-slate-900 dark:text-white font-semibold">{r.filename}</span>
                </div>

                <div className="flex items-center gap-3">
                  {r.patient_external_id && (
                    <span className="font-mono text-[11px] text-blue-700 dark:text-blue-300 font-bold">
                      ID: {r.patient_external_id}
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 font-medium">
                    {r.duration_ms} ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
