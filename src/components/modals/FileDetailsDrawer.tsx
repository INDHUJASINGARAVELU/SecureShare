import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  File,
  Lock,
  Shield,
  Download,
  Share2,
  Trash2,
  Edit2,
  Check,
  FolderSync,
  Layers,
  Hash,
  Clock,
  Eye,
} from 'lucide-react';
import { MockFile } from '../../types/file';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatBytes, formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface FileDetailsDrawerProps {
  file: MockFile | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenShareModal: (file: MockFile) => void;
}

export const FileDetailsDrawer: React.FC<FileDetailsDrawerProps> = ({
  file,
  isOpen,
  onClose,
  onOpenShareModal,
}) => {
  const { renameFile, deleteFile, moveFileCategory } = useApp();
  const { role } = useAuth();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);

  if (!isOpen || !file) return null;

  const isAuditor = role === 'security_auditor';

  const handleStartRename = () => {
    setEditedName(file.name);
    setIsEditingName(true);
  };

  const handleSaveRename = () => {
    if (editedName.trim() && editedName !== file.name) {
      renameFile(file.id, editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleToggleCategory = () => {
    const nextCategory = file.category === 'private' ? 'shared' : 'private';
    moveFileCategory(file.id, nextCategory);
  };

  const handleSimulatedDownload = () => {
    const content = file.textContent || `SecureShare Mock S3 File\nObject: ${file.name}\nPrefix: ${file.category}/\nKMS Key: ${file.kmsKeyArn}\nSHA-256: ${file.sha256Checksum}`;
    const blob = new Blob([content], { type: file.type || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Drawer Panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-white p-6 shadow-2xl dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto"
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 border border-brand-500/20">
                    <File className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      S3 Object Metadata
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      s3://secureshare-vault/{file.category}/
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* File Title & Rename */}
              <div className="mt-5">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={e => setEditedName(e.target.value)}
                      className="flex-1 rounded-xl border border-brand-500 px-3 py-1.5 text-xs text-slate-900 dark:bg-slate-950 dark:text-white"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveRename}
                      className="rounded-lg bg-brand-600 p-2 text-white hover:bg-brand-700"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="rounded-lg border border-slate-200 p-2 text-slate-500 dark:border-slate-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white break-all">
                        {file.name}
                      </h2>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          variant={file.category === 'shared' ? 'blue' : 'amber'}
                          size="sm"
                        >
                          {file.category.toUpperCase()} PREFIX
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {formatBytes(file.size)}
                        </span>
                      </div>
                    </div>
                    {!isAuditor && (
                      <button
                        onClick={handleStartRename}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                        title="Rename file"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Security Attributes */}
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Cloud Security Specifications
                </h4>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/70 space-y-2.5 text-xs">
                  <div className="flex items-start justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-brand-500" /> Encryption:
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      AWS KMS SSE (CMK)
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-brand-500" /> KMS Key ARN:
                    </span>
                    <p className="font-mono text-[10px] text-slate-700 dark:text-slate-300 break-all bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800">
                      {file.kmsKeyArn}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-brand-500" /> S3 Version ID:
                    </span>
                    <p className="font-mono text-[10px] text-slate-700 dark:text-slate-300 break-all bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800">
                      {file.versionId}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5 text-brand-500" /> SHA-256 Checksum:
                    </span>
                    <p className="font-mono text-[10px] text-slate-700 dark:text-slate-300 break-all bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800">
                      {file.sha256Checksum}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-brand-500" /> Upload Date:
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 text-[11px]">
                      {formatDate(file.uploadedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div className="mt-5">
                <button
                  onClick={() => setPreviewActive(prev => !prev)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-brand-500" />
                    {previewActive ? 'Hide Content Preview' : 'Show Content Preview'}
                  </span>
                  <span className="text-[10px] text-slate-400">Local Sandbox</span>
                </button>

                {previewActive && (
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-900 p-3 text-[11px] font-mono text-emerald-400 dark:border-slate-800">
                    <pre className="whitespace-pre-wrap">
                      {file.textContent || 'Demo binary payload. Encrypted with KMS.'}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleSimulatedDownload}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Demo</span>
                </button>

                {!isAuditor && (
                  <button
                    onClick={handleToggleCategory}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <FolderSync className="h-3.5 w-3.5 text-brand-500" />
                    <span>Move to {file.category === 'private' ? 'Shared' : 'Private'}</span>
                  </button>
                )}
              </div>

              {!isAuditor && file.category === 'shared' && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenShareModal(file);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Create Secure Share Link</span>
                </button>
              )}

              {!isAuditor && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Mock S3 Object</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Mock S3 Object"
          message={`Are you sure you want to delete "${file.name}"? Any active presigned share links associated with this object will be immediately revoked.`}
          confirmLabel="Delete Object"
          variant="danger"
          onConfirm={() => {
            deleteFile(file.id);
            setShowDeleteConfirm(false);
            onClose();
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </AnimatePresence>
  );
};
