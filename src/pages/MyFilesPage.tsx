import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderLock,
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  UploadCloud,
  Share2,
  Trash2,
  FolderSync,
  Download,
  Eye,
  FileText,
  Lock,
  ShieldCheck,
  CheckSquare,
  Square,
  MoreVertical,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { MockFile, FileCategory } from '../types/file';
import { formatBytes, formatDate } from '../utils/formatters';
import { Badge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { FileDetailsDrawer } from '../components/modals/FileDetailsDrawer';
import { ShareLinkModal } from '../components/modals/ShareLinkModal';
import { EmptyState } from '../components/common/EmptyState';

export const MyFilesPage: React.FC = () => {
  const { files, deleteFile, moveFileCategory, shareLinks } = useApp();
  const { role } = useAuth();
  const navigate = useNavigate();

  // Filters & UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'private' | 'shared'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Selection & Modals
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailFile, setDetailFile] = useState<MockFile | null>(null);
  const [shareFile, setShareFile] = useState<MockFile | undefined>(undefined);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<MockFile | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const isAuditor = role === 'security_auditor';

  // Get available file types for filter
  const fileTypes = useMemo(() => {
    const set = new Set<string>();
    files.forEach(f => set.add(f.extension.toLowerCase()));
    return Array.from(set);
  }, [files]);

  // Filtered & sorted list
  const filteredFiles = useMemo(() => {
    return files
      .filter(f => {
        if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;
        if (typeFilter !== 'all' && f.extension.toLowerCase() !== typeFilter) return false;
        if (searchQuery.trim() && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'name') diff = a.name.localeCompare(b.name);
        else if (sortBy === 'size') diff = a.size - b.size;
        else if (sortBy === 'date') {
          diff = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        }
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [files, categoryFilter, typeFilter, searchQuery, sortBy, sortOrder]);

  // Multi-select handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredFiles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFiles.map(f => f.id));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkMove = (category: FileCategory) => {
    selectedIds.forEach(id => moveFileCategory(id, category));
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    selectedIds.forEach(id => deleteFile(id));
    setSelectedIds([]);
    setBulkDeleteConfirm(false);
  };

  const getSharingStatus = (fileId: string) => {
    const links = shareLinks.filter(l => l.fileId === fileId);
    const active = links.find(l => l.status === 'active');
    if (active) return { label: 'Active Link', variant: 'emerald' as const };
    if (links.length > 0) return { label: 'Shared Previously', variant: 'slate' as const };
    return { label: 'Not Shared', variant: 'slate' as const };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            S3 Object Vault Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Encrypted storage repository segmented by Private and Shared prefixes.
          </p>
        </div>

        {!isAuditor && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard/upload')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload Files</span>
            </button>
          </div>
        )}
      </div>

      {/* Control Bar: Search, Category Tabs, Type Filter, Sort, View Toggle */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        {/* Top row: Category Pills & View Mode */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                categoryFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              All Objects ({files.length})
            </button>
            <button
              onClick={() => setCategoryFilter('private')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                categoryFilter === 'private'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Private Vault ({files.filter(f => f.category === 'private').length})
            </button>
            <button
              onClick={() => setCategoryFilter('shared')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                categoryFilter === 'shared'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Shared Prefix ({files.filter(f => f.category === 'shared').length})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1 dark:border-slate-800">
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg p-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-slate-100 text-brand-600 dark:bg-slate-800 dark:text-brand-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-slate-100 text-brand-600 dark:bg-slate-800 dark:text-brand-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bottom row: Search input, Type filter, Sort selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search filename or extension..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="all">All File Formats</option>
              {fileTypes.map(ext => (
                <option key={ext} value={ext}>
                  .{ext.toUpperCase()} Files
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
            </select>
          </div>

          {/* Sort Order Toggle */}
          <div>
            <button
              onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Selection Action Bar (Shown when items selected) */}
      {selectedIds.length > 0 && !isAuditor && (
        <div className="flex items-center justify-between rounded-2xl border border-brand-500/30 bg-brand-50/80 px-4 py-2.5 dark:border-brand-500/40 dark:bg-brand-950/40 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-900 dark:text-brand-200">
            <CheckSquare className="h-4 w-4 text-brand-600" />
            <span>{selectedIds.length} object(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkMove('shared')}
              className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50 dark:border-brand-800 dark:bg-slate-900 dark:text-brand-300"
            >
              <FolderSync className="h-3.5 w-3.5" />
              <span>Move to Shared</span>
            </button>
            <button
              onClick={() => handleBulkMove('private')}
              className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-300"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Move to Private</span>
            </button>
            <button
              onClick={() => setBulkDeleteConfirm(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:bg-slate-900 dark:text-rose-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Files Display: List View vs Grid View */}
      {filteredFiles.length > 0 ? (
        viewMode === 'list' ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                  <tr>
                    {!isAuditor && (
                      <th className="py-3 pl-4 pr-2 w-8">
                        <button onClick={handleSelectAll} className="text-slate-400 hover:text-slate-600">
                          {selectedIds.length === filteredFiles.length && filteredFiles.length > 0 ? (
                            <CheckSquare className="h-4 w-4 text-brand-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </th>
                    )}
                    <th className="py-3 px-3">File Name</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Size</th>
                    <th className="py-3 px-3">Uploaded Date</th>
                    <th className="py-3 px-3">Storage Prefix</th>
                    <th className="py-3 px-3">Encryption</th>
                    <th className="py-3 px-3">Sharing Status</th>
                    <th className="py-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredFiles.map(file => {
                    const isSelected = selectedIds.includes(file.id);
                    const sharing = getSharingStatus(file.id);

                    return (
                      <tr
                        key={file.id}
                        onClick={() => setDetailFile(file)}
                        className={`group cursor-pointer transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${
                          isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        {!isAuditor && (
                          <td className="py-3 pl-4 pr-2" onClick={e => handleToggleSelect(file.id, e)}>
                            <button className="text-slate-400 hover:text-slate-600">
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-brand-600" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        )}

                        {/* File Name */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5 max-w-xs sm:max-w-md">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand-600 dark:bg-blue-950/60 dark:text-brand-400">
                              <FileText className="h-3.5 w-3.5" />
                            </div>
                            <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
                              {file.name}
                            </span>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="py-3 px-3 font-mono text-[11px] uppercase text-slate-500">
                          {file.extension}
                        </td>

                        {/* Size */}
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                          {formatBytes(file.size)}
                        </td>

                        {/* Upload Date */}
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          {formatDate(file.uploadedAt)}
                        </td>

                        {/* Storage Prefix */}
                        <td className="py-3 px-3">
                          <Badge
                            variant={file.category === 'shared' ? 'blue' : 'amber'}
                            size="sm"
                          >
                            {file.category.toUpperCase()}
                          </Badge>
                        </td>

                        {/* Encryption Status */}
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>SSE-KMS</span>
                          </span>
                        </td>

                        {/* Sharing Status */}
                        <td className="py-3 px-3">
                          <Badge variant={sharing.variant} size="sm">
                            {sharing.label}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="py-3 pr-4 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {file.category === 'shared' && !isAuditor && (
                              <button
                                onClick={() => {
                                  setShareFile(file);
                                  setShareModalOpen(true);
                                }}
                                className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Generate Share Link"
                              >
                                <Share2 className="h-3.5 w-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => setDetailFile(file)}
                              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                              title="Inspect Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            {!isAuditor && (
                              <button
                                onClick={() => setFileToDelete(file)}
                                className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Delete File"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles.map(file => {
              const isSelected = selectedIds.includes(file.id);
              const sharing = getSharingStatus(file.id);

              return (
                <div
                  key={file.id}
                  onClick={() => setDetailFile(file)}
                  className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-4 shadow-sm transition-all hover:border-brand-500/50 hover:shadow-md cursor-pointer dark:bg-slate-900 ${
                    isSelected
                      ? 'border-brand-500 ring-2 ring-brand-500/20'
                      : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-600 dark:bg-blue-950/60 dark:text-brand-400 border border-blue-500/20">
                        <FileText className="h-5 w-5" />
                      </div>

                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <Badge
                          variant={file.category === 'shared' ? 'blue' : 'amber'}
                          size="sm"
                        >
                          {file.category}
                        </Badge>
                        {!isAuditor && (
                          <button
                            onClick={e => handleToggleSelect(file.id, e)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-brand-600" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="mt-3 text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                      {file.name}
                    </h3>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{formatBytes(file.size)}</span>
                      <span className="uppercase font-mono">.{file.extension}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> KMS SSE
                    </span>

                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      {file.category === 'shared' && !isAuditor && (
                        <button
                          onClick={() => {
                            setShareFile(file);
                            setShareModalOpen(true);
                          }}
                          className="rounded-lg p-1 text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Share"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setDetailFile(file)}
                        className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <EmptyState
          icon={FolderLock}
          title="No Matching S3 Objects Found"
          description={
            searchQuery
              ? `No objects match "${searchQuery}". Clear filters to view all records.`
              : 'Upload a file or switch storage category filters.'
          }
          action={
            searchQuery
              ? {
                  label: 'Clear Filters',
                  onClick: () => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setTypeFilter('all');
                  },
                }
              : undefined
          }
        />
      )}

      {/* Share Modal */}
      <ShareLinkModal
        isOpen={shareModalOpen}
        file={shareFile}
        onClose={() => setShareModalOpen(false)}
      />

      {/* File Details Drawer */}
      <FileDetailsDrawer
        file={detailFile}
        isOpen={!!detailFile}
        onClose={() => setDetailFile(null)}
        onOpenShareModal={f => {
          setShareFile(f);
          setShareModalOpen(true);
        }}
      />

      {/* Single Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!fileToDelete}
        title="Delete Mock S3 Object"
        message={`Delete "${fileToDelete?.name}" from mock S3 vault? Any associated share links will be invalidated.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (fileToDelete) deleteFile(fileToDelete.id);
          setFileToDelete(null);
        }}
        onCancel={() => setFileToDelete(null)}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        isOpen={bulkDeleteConfirm}
        title={`Delete ${selectedIds.length} S3 Objects`}
        message="Are you sure you want to delete all selected mock files from the S3 vault?"
        confirmLabel="Delete Selected"
        variant="danger"
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </div>
  );
};
