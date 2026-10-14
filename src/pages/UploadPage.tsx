import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  File,
  X,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Share2,
  ShieldCheck,
  RotateCcw,
  Layers,
  ArrowRight,
  Server,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FileCategory } from '../types/file';
import { formatBytes } from '../utils/formatters';
import { Badge } from '../components/common/Badge';

interface PendingUpload {
  id: string;
  file: File;
  category: FileCategory;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'cancelled' | 'error';
  errorMessage?: string;
}

export const UploadPage: React.FC = () => {
  const { uploadFile, files } = useApp();
  const navigate = useNavigate();

  const [targetCategory, setTargetCategory] = useState<FileCategory>('shared');
  const [queue, setQueue] = useState<PendingUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingFileNames = files.map(f => f.name.toLowerCase());

  const handleFilesSelected = (selectedFiles: FileList | null) => {
    if (!selectedFiles || !selectedFiles.length) return;

    const newItems: PendingUpload[] = [];

    Array.from(selectedFiles).forEach(file => {
      // 50 MB size validation
      if (file.size > 50 * 1024 * 1024) {
        newItems.push({
          id: `up-${Date.now()}-${Math.random()}`,
          file,
          category: targetCategory,
          progress: 0,
          status: 'error',
          errorMessage: 'File exceeds 50 MB simulated S3 limit.',
        });
        return;
      }

      newItems.push({
        id: `up-${Date.now()}-${Math.random()}`,
        file,
        category: targetCategory,
        progress: 0,
        status: 'pending',
      });
    });

    setQueue(prev => [...prev, ...newItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Start simulated upload for an item
  const startUpload = async (item: PendingUpload) => {
    setQueue(prev =>
      prev.map(q => (q.id === item.id ? { ...q, status: 'uploading', progress: 5 } : q))
    );

    // Read content preview if text
    let textContent: string | undefined;
    if (item.file.type.startsWith('text/') || item.file.name.endsWith('.json') || item.file.name.endsWith('.env') || item.file.name.endsWith('.csv')) {
      try {
        textContent = await item.file.text();
      } catch {
        // ignore
      }
    }

    // Simulate upload chunks over 1.5 seconds
    const steps = [25, 55, 80, 100];
    for (const p of steps) {
      await new Promise(res => setTimeout(res, 350));
      // Check if cancelled
      const current = queue.find(q => q.id === item.id);
      if (current && current.status === 'cancelled') return;

      setQueue(prev =>
        prev.map(q => (q.id === item.id ? { ...q, progress: p } : q))
      );
    }

    // Add to mock library
    const ext = item.file.name.split('.').pop() || 'bin';
    await uploadFile({
      name: item.file.name,
      size: item.file.size,
      type: item.file.type || 'application/octet-stream',
      extension: ext,
      category: item.category,
      textContent: textContent?.slice(0, 5000),
    });

    setQueue(prev =>
      prev.map(q => (q.id === item.id ? { ...q, status: 'completed', progress: 100 } : q))
    );
  };

  const startAllPending = async () => {
    const pending = queue.filter(q => q.status === 'pending');
    for (const item of pending) {
      await startUpload(item);
    }
  };

  const cancelUpload = (id: string) => {
    setQueue(prev =>
      prev.map(q => (q.id === id ? { ...q, status: 'cancelled' } : q))
    );
  };

  const removeItem = (id: string) => {
    setQueue(prev => prev.filter(q => q.id !== id));
  };

  const retryUpload = (item: PendingUpload) => {
    startUpload(item);
  };

  const pendingCount = queue.filter(q => q.status === 'pending').length;
  const completedCount = queue.filter(q => q.status === 'completed').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Simulated S3 Upload Ingestion
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload objects to the private S3 bucket. All uploads are simulated with KMS SSE envelope encryption and TLS transfer.
        </p>
      </div>

      {/* Target Storage Category Selector */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          1. Choose Destination Storage Prefix
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Shared Option */}
          <div
            onClick={() => setTargetCategory('shared')}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              targetCategory === 'shared'
                ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20 dark:bg-brand-950/30'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-brand-600 dark:text-brand-400">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Shared/ Prefix (Presign Eligible)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Objects eligible for time-bounded 15-minute temporary download links.
                </p>
              </div>
            </div>
          </div>

          {/* Private Option */}
          <div
            onClick={() => setTargetCategory('private')}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              targetCategory === 'private'
                ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 dark:bg-amber-950/30'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Private/ Vault (Strictly Isolated)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Confidential internal files. Cannot be shared via presigned links.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 text-center transition-all ${
          isDragging
            ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-brand-400 dark:border-slate-800 dark:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={e => handleFilesSelected(e.target.files)}
          className="hidden"
        />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/70 dark:text-brand-400 shadow-inner">
          <UploadCloud className="h-8 w-8" />
        </div>

        <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
          Drag and drop your files here
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          Simulates local file ingestion into <code className="font-mono text-brand-600 dark:text-brand-400">s3://secureshare-vault/{targetCategory}/</code>
        </p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
        >
          <span>Browse Files on Computer</span>
        </button>

        <p className="mt-3 text-[11px] text-slate-400">
          Max file size: 50 MB &bull; Multi-file batch supported &bull; Browser File API
        </p>
      </div>

      {/* Upload Queue List */}
      {queue.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Selected Upload Queue ({queue.length})
              </h3>
              <p className="text-[11px] text-slate-400">
                {completedCount} uploaded, {pendingCount} awaiting ingestion
              </p>
            </div>

            {pendingCount > 0 && (
              <button
                onClick={startAllPending}
                className="rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm"
              >
                Start Ingestion
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {queue.map(item => {
              const isDuplicate = existingFileNames.includes(item.file.name.toLowerCase());

              return (
                <div key={item.id} className="py-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand-600 dark:bg-blue-950/60 dark:text-brand-400">
                        <File className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {item.file.name}
                          </p>
                          {isDuplicate && (
                            <span className="text-[10px] text-amber-600 font-medium bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                              Duplicate Name (New S3 Version will be created)
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {formatBytes(item.file.size)} &bull; Destination:{' '}
                          <span className="uppercase font-semibold">{item.category}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === 'pending' && (
                        <button
                          onClick={() => startUpload(item)}
                          className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-300"
                        >
                          Upload
                        </button>
                      )}

                      {item.status === 'uploading' && (
                        <button
                          onClick={() => cancelUpload(item.id)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                        >
                          Cancel
                        </button>
                      )}

                      {item.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Uploaded</span>
                        </span>
                      )}

                      {item.status === 'cancelled' && (
                        <button
                          onClick={() => retryUpload(item)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Retry</span>
                        </button>
                      )}

                      <button
                        onClick={() => removeItem(item.id)}
                        className="rounded-lg p-1 text-slate-400 hover:text-rose-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {item.status === 'uploading' && (
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}

                  {item.errorMessage && (
                    <p className="text-[11px] text-rose-500 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {item.errorMessage}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {completedCount > 0 && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => navigate('/dashboard/my-files')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                <span>Browse Uploaded Objects in S3 Vault</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Security Architecture Specifications Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/60 text-xs space-y-2">
        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          Simulated Ingestion Security Controls:
        </h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-500 dark:text-slate-400">
          <li className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            <span><strong>Private S3 Storage:</strong> Bucket denies all unauthenticated direct HTTP GET/PUT.</span>
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            <span><strong>AWS KMS SSE:</strong> Objects encrypted with Customer Managed Key (CMK).</span>
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            <span><strong>Enforce TLS 1.3:</strong> Insecure non-HTTPS requests are rejected with 403.</span>
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            <span><strong>S3 Versioning:</strong> Overwritten files assign immutable version IDs.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
