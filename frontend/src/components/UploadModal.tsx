// ─────────────────────────────────────────────────────────────
// components/UploadModal.tsx
// Gazi SFT Klinik Platform — XML İçe Aktarma Modal Konsolu
// ─────────────────────────────────────────────────────────────

import { useCallback, useRef, useState } from 'react';
import {
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { uploadXmlFiles } from '../api/client';
import type { UploadResponse } from '../types';

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm select-none p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg card rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-slide-up">
        {/* ─── Başlık ─── */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-xs text-slate-800 dark:text-white">
              XML İçe Aktarma Konsolu
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─── Gövde ─── */}
        <div className="p-5 space-y-4 bg-white dark:bg-transparent">
          {/* Dropzone */}
          {uiStatus !== 'done' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              onClick={() => inputRef.current?.click()}
              className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center ${
                isDragOver
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
                  : 'border-slate-300 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500/60 hover:bg-blue-50/50 dark:hover:bg-slate-900/40'
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
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">
                XML Dosyalarını Sürükleyin veya Seçin
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                SHA-256 bütünlük kontrolü ile otomatik aktarılır
              </p>
            </div>
          )}

          {/* Dosya Listesi */}
          {files.length > 0 && uiStatus !== 'done' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Seçilen Dosyalar ({files.length})</span>
                <button
                  onClick={() => setFiles([])}
                  className="text-[11px] text-red-500 hover:underline"
                >
                  Temizle
                </button>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-slate-800 dark:text-white truncate max-w-xs">{f.name}</span>
                    <span className="text-slate-400 dark:text-slate-500">{(f.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sonuç Raporu */}
          {uiStatus === 'done' && response && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <div>
                  <div className="font-bold">Aktarım Tamamlandı</div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-300 font-mono">
                    {response.success} başarılı, {response.skipped_duplicates} mükerrer atlandı.
                  </div>
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1">
                {response.results.map((r, i) => (
                  <div
                    key={i}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-slate-700 dark:text-white truncate max-w-[200px]">{r.filename}</span>
                    <span
                      className={`text-[10px] ${
                        r.status === 'SUCCESS'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : r.status === 'SKIPPED_DUPLICATE'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
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
            <div className="p-3 rounded-lg bg-red-50 dark:bg-rose-500/10 border border-red-200 dark:border-rose-500/30 text-red-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Alt Butonlar */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
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
