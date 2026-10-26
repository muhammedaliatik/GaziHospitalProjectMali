// ─────────────────────────────────────────────────────────────
// components/UploadModal.tsx
// AEROFLOW PULSE DX — Futuristic XML Ingestion Modal Console
// ─────────────────────────────────────────────────────────────

import { useCallback, useRef, useState } from 'react';
import {
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  SkipForward,
  XCircle,
  FileCode,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { uploadXmlFiles } from '../api/client';
import type { UploadResponse, UploadResult } from '../types';

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type UIStatus = 'idle' | 'uploading' | 'done' | 'error';

export function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uiStatus, setUiStatus] = useState<UIStatus>('idle');
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const xmls = Array.from(incoming).filter((f) =>
      f.name.toLowerCase().endsWith('.xml'),
    );
    if (xmls.length === 0) return;
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...xmls.filter((f) => !existing.has(f.name))];
    });
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUiStatus('uploading');
    setErrorMsg(null);

    try {
      const res = await uploadXmlFiles(files);
      setResponse(res);
      setUiStatus('done');
      if (res.success > 0) {
        onSuccess();
      }
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Yükleme başarısız oldu.');
      setUiStatus('error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm select-none p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg glass-card rounded-2xl border border-cyan-500/30 flex flex-col overflow-hidden shadow-2xl animate-slide-up">
        {/* ─── Başlık ─── */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-xs text-white">
              Vyaire SFT XML Ingestion Konsolu
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─── Gövde ─── */}
        <div className="p-5 space-y-4">
          {/* Dropzone */}
          {uiStatus !== 'done' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addFiles(e.dataTransfer.files);
              }}
              onClick={() => inputRef.current?.click()}
              className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center ${
                isDragOver
                  ? 'border-cyan-400 bg-cyan-950/20'
                  : 'border-slate-700/80 hover:border-cyan-500/60 hover:bg-slate-900/40'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xml"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">
                XML Dosyalarını Sürükleyin veya Seçin
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                SHA-256 bütünlük kontrolü ile otomatik aktarılır
              </p>
            </div>
          )}

          {/* Dosya Listesi */}
          {files.length > 0 && uiStatus !== 'done' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Seçilen Dosyalar ({files.length})</span>
                <button
                  onClick={() => setFiles([])}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  Temizle
                </button>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-white truncate max-w-xs">{f.name}</span>
                    <span className="text-slate-500">{(f.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sonuç Raporu */}
          {uiStatus === 'done' && response && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <div>
                  <div className="font-bold">Ingestion Tamamlandı</div>
                  <div className="text-[11px] text-emerald-300 font-mono">
                    {response.success} başarılı, {response.skipped_duplicates} mükerrer atlandı.
                  </div>
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1">
                {response.results.map((r, i) => (
                  <div
                    key={i}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-white truncate max-w-[200px]">{r.filename}</span>
                    <span
                      className={`text-[10px] ${
                        r.status === 'SUCCESS'
                          ? 'text-emerald-400'
                          : r.status === 'SKIPPED_DUPLICATE'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hata */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Alt Butonlar */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button onClick={onClose} className="btn-cyber btn-cyber-outline text-xs">
              {uiStatus === 'done' ? 'Kapat' : 'İptal'}
            </button>
            {uiStatus !== 'done' && (
              <button
                onClick={handleUpload}
                disabled={files.length === 0 || uiStatus === 'uploading'}
                className="btn-cyber btn-cyber-solid text-xs py-1.5 px-4"
              >
                {uiStatus === 'uploading' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Yükleniyor...</span>
                  </>
                ) : (
                  <span>Yüklemeyi Başlat</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
