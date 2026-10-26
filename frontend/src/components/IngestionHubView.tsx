// ─────────────────────────────────────────────────────────────
// components/IngestionHubView.tsx
// AEROFLOW PULSE DX — Vyaire SFT XML Ingestion & Integration Hub
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
  FolderOpen,
  ArrowRight,
  Database,
  Layers,
} from 'lucide-react';
import { uploadXmlFiles } from '../api/client';
import type { UploadResponse, UploadResult } from '../types';

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
      <div className="glass-card p-4 rounded-xl border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">
              Cihaz Entegrasyon & XML Almaç Hub
            </h2>
            <p className="text-xs text-slate-400">
              Vyaire Medical (MasterScreen/JAEGER) XML formatlarını ayrıştırıp PostgreSQL veritabanına aktarır.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge-cyber bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SHA-256 Deduplication Aktif</span>
          </span>
        </div>
      </div>

      {/* ─── Mimari Pipeline Görselleştirici ─── */}
      <div className="glass-card p-4 rounded-xl border border-slate-800">
        <h3 className="text-xs font-mono uppercase text-slate-400 mb-3 tracking-wider">
          Otomatik Ingestion Boru Hattı (Pipeline)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold font-mono">
              1
            </div>
            <div>
              <div className="font-bold text-white">Vyaire XML</div>
              <div className="text-[10px] text-slate-400">Cihaz çıktısı NIOSH formatı</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono">
              2
            </div>
            <div>
              <div className="font-bold text-white">SHA-256 Doğrulama</div>
              <div className="text-[10px] text-slate-400">Mükerrer dosya kontrolü</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold font-mono">
              3
            </div>
            <div>
              <div className="font-bold text-white">lxml Ayrıştırma</div>
              <div className="text-[10px] text-slate-400">Hasta, Deneme, Eğri Real[]</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono">
              4
            </div>
            <div>
              <div className="font-bold text-white">PostgreSQL & MV</div>
              <div className="text-[10px] text-slate-400">Materialized view yenileme</div>
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
        className={`glass-card p-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 text-center ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_25px_rgba(6,182,212,0.3)]'
            : 'border-slate-700/80 hover:border-cyan-500/60 hover:bg-slate-900/40'
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
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Upload className="w-7 h-7" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">
            Vyaire SFT XML Dosyalarını Buraya Sürükleyin
          </p>
          <p className="text-xs text-slate-400 mt-1">
            veya bilgisayarınızdan seçmek için tıklayın (.xml formatında tekil veya çoklu)
          </p>
        </div>
      </div>

      {/* ─── Seçili Dosyalar Listesi & Yükle Butonu ─── */}
      {files.length > 0 && (
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">
              Yüklenmeye Hazır Dosyalar ({files.length} dosya)
            </span>
            <button
              onClick={() => setFiles([])}
              className="text-[11px] text-slate-400 hover:text-rose-400"
            >
              Listeyi Temizle
            </button>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-1">
            {files.map((f, i) => (
              <div
                key={i}
                className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-white">{f.name}</span>
                </div>
                <span className="text-slate-500">
                  {(f.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={handleStartIngest}
            disabled={uploading}
            className="btn-cyber btn-cyber-solid w-full py-2.5 flex items-center justify-center gap-2"
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
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ─── Son Yükleme Sonuçları ─── */}
      {response && (
        <div className="glass-card p-4 rounded-xl border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>İşlem Raporu</span>
            </span>
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-emerald-400">✓ {response.success} Başarılı</span>
              <span className="text-amber-400">↷ {response.skipped_duplicates} Mükerrer</span>
              <span className="text-rose-400">✗ {response.failed} Hata</span>
            </div>
          </div>

          <div className="space-y-1">
            {response.results.map((r, i) => (
              <div
                key={i}
                className="px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  {r.status === 'SUCCESS' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  {r.status === 'SKIPPED_DUPLICATE' && (
                    <SkipForward className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  {r.status === 'FAILED_QUARANTINE' && (
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  <span className="font-mono text-white">{r.filename}</span>
                </div>

                <div className="flex items-center gap-3">
                  {r.patient_external_id && (
                    <span className="font-mono text-[11px] text-cyan-300">
                      ID: {r.patient_external_id}
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-slate-500">
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
