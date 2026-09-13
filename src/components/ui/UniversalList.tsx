// ============================================================
// UNIVERSAL LIST — Composant de listage réutilisable
// ============================================================

import React, { useState, useMemo } from 'react';
import { MotionBox } from './MotionBox';
import { Search, X, ChevronLeft, ChevronRight, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useExport } from '../../hooks/useExport';
import { PreviewModal } from './PreviewModal';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface Action<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  color?: 'primary' | 'danger' | 'success' | 'warning' | 'info';
  condition?: (item: T) => boolean;
}

export interface UniversalListProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  filterable?: boolean;
  filters?: { key: string; label: string; options: { value: string; label: string }[] }[];
  pageSize?: number;
  className?: string;
  previewType?: 'image' | 'video' | 'audio' | 'document' | 'custom';
  previewRender?: (item: T) => React.ReactNode;
  getPreviewUrl?: (item: T) => string;
  getPreviewFileName?: (item: T) => string;
  rowClassName?: string;
  emptyMessage?: string;
  showStatus?: boolean;
  statusKey?: string;
  statusLabel?: string;
}

export function UniversalList<T extends { id: string | number }>({
  data,
  columns,
  actions = [],
  onEdit,
  onDelete,
  onView,
  searchable = true,
  searchPlaceholder = 'Rechercher...',
  filterable = false,
  filters = [],
  pageSize = 0,
  className = '',
  previewType = 'custom',
  previewRender,
  getPreviewUrl,
  getPreviewFileName,
  rowClassName = '',
  emptyMessage = 'Aucune donnée',
  showStatus = false,
  statusKey = 'actif',
  statusLabel = 'Statut',
}: UniversalListProps<T>) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { exportExcel, exportPDF } = useExport();
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  // ============================================================
  // FILTRAGE ET RECHERCHE
  // ============================================================

  const filteredData = useMemo(() => {
    let result = data;

    if (searchable && search) {
      const q = search.toLowerCase();
      result = result.filter((item) => {
        return columns.some((col) => {
          if (col.searchable === false) return false;
          const value = item[col.key as keyof T];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(q);
          }
          return false;
        });
      });
    }

    if (filterable) {
      filters.forEach((filter) => {
        const value = filterValues[filter.key];
        if (value) {
          result = result.filter((item) => {
            const itemValue = item[filter.key as keyof T];
            return String(itemValue) === value;
          });
        }
      });
    }

    if (showStatus) {
      const statusValue = filterValues[statusKey];
      if (statusValue && statusValue !== 'all') {
        const boolValue = statusValue === 'true';
        result = result.filter((item) => {
          const val = item[statusKey as keyof T];
          return Boolean(val) === boolValue;
        });
      }
    }

    return result;
  }, [data, search, columns, filterable, filters, filterValues, searchable, showStatus, statusKey]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const paginatedData = useMemo(() => {
    if (pageSize <= 0) return filteredData;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = pageSize > 0 ? Math.ceil(filteredData.length / pageSize) : 1;

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleView = (item: T) => {
    if (onView) {
      onView(item);
    } else {
      setSelectedItem(item);
      setIsPreviewOpen(true);
    }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setSelectedItem(null);
  };

  // ============================================================
  // RENDU — Indicateur de statut
  // ============================================================

  const renderStatusBadge = (item: T) => {
    const isActive = Boolean(item[statusKey as keyof T]);
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          isActive
            ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
            : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
        }`}
      >
        {isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
        {isActive ? 'Actif' : 'Inactif'}
      </span>
    );
  };

  // ============================================================
  // RENDU
  // ============================================================

  const allColumns = useMemo(() => {
    if (!showStatus) return columns;
    const hasStatusColumn = columns.some(c => c.label === statusLabel || c.key === statusKey);
    if (hasStatusColumn) return columns;
    return [
      ...columns,
      {
        key: statusKey,
        label: statusLabel,
        render: renderStatusBadge,
        align: 'center' as const,
        width: '120px',
      },
    ];
  }, [columns, showStatus, statusKey, statusLabel]);

  const allFilters = useMemo(() => {
    if (!showStatus) return filters;
    const hasStatusFilter = filters.some(f => f.key === statusKey);
    if (hasStatusFilter) return filters;
    return [
      ...filters,
      {
        key: statusKey,
        label: statusLabel,
        options: [
          { value: 'all', label: 'Tous' },
          { value: 'true', label: 'Actif' },
          { value: 'false', label: 'Inactif' },
        ],
      },
    ];
  }, [filters, showStatus, statusKey, statusLabel]);

  return (
    <MotionBox
      as="div"
      type="card"
      variant="default"
      className={`overflow-hidden w-full ${className}`}
    >
      {/* Barre de recherche et filtres */}
      {(searchable || allFilters.length > 0) && (
        <div className="p-4 border-b border-[var(--color-borderColor)] bg-[var(--color-secondary)]">
          <div className="flex flex-wrap gap-3">
            {searchable && (
              <div className="flex-1 min-w-[200px] relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition"
                />
              </div>
            )}
            {allFilters.map((filter) => (
              <select
                key={filter.key}
                value={filterValues[filter.key] || ''}
                onChange={(e) => setFilterValues({ ...filterValues, [filter.key]: e.target.value })}
                className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] text-sm"
              >
                <option value="">{filter.label}</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ))}
            {Object.values(filterValues).some(v => v) && (
              <button
                onClick={() => setFilterValues({})}
                className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition flex items-center gap-1"
              >
                <X size={16} /> Réinitialiser
              </button>
            )}
            {/* Boutons d'export */}
            <button
              onClick={() => exportExcel(filteredData)}
              className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition text-sm flex items-center gap-1"
            >
              <span className="text-[var(--color-success)]">📊</span> Excel
            </button>
            <button
              onClick={() => exportPDF(filteredData)}
              className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition text-sm flex items-center gap-1"
            >
              <span className="text-[var(--color-danger)]">📄</span> PDF
            </button>
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
            <tr>
              {allColumns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)] ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
              {(actions.length > 0 || onEdit || onDelete || onView) && (
                <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={allColumns.length + 1} className="px-4 py-8 text-center text-[var(--color-textSecondary)]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => {
                const rowActions = [
                  ...actions,
                  ...(onView ? [{ label: 'Voir', icon: <Eye size={16} />, onClick: () => handleView(item), color: 'info' as const }] : []),
                  ...(onEdit ? [{ label: 'Modifier', icon: <Edit size={16} />, onClick: () => onEdit(item), color: 'primary' as const }] : []),
                  ...(onDelete ? [{ label: 'Supprimer', icon: <Trash2 size={16} />, onClick: () => onDelete(item), color: 'danger' as const }] : []),
                ].filter(a => !a.condition || a.condition(item));

                return (
                  <tr
                    key={item.id}
                    className={`border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition ${rowClassName}`}
                  >
                    {allColumns.map((col) => (
                      <td
                        key={String(col.key)}
                        className={`px-4 py-3 text-sm text-[var(--color-textPrimary)] ${
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}
                      </td>
                    ))}
                    {(rowActions.length > 0) && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {rowActions.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() => action.onClick(item)}
                              className={`p-1.5 rounded hover:bg-[var(--color-secondary)] transition text-[var(--color-textSecondary)] ${
                                action.color === 'danger' ? 'hover:text-[var(--color-danger)]' : ''
                              }`}
                              title={action.label}
                            >
                              {action.icon || action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageSize > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-borderColor)] bg-[var(--color-secondary)]">
          <span className="text-sm text-[var(--color-textSecondary)]">
            {filteredData.length} élément{filteredData.length > 1 ? 's' : ''}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-[var(--color-cardBg)] transition disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-3 py-1 text-sm text-[var(--color-textPrimary)]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded hover:bg-[var(--color-cardBg)] transition disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Aperçu en modal */}
      {isPreviewOpen && selectedItem && getPreviewUrl && (
        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
          url={getPreviewUrl(selectedItem)}
          type={previewType === 'custom' ? 'image' : previewType}
          fileName={getPreviewFileName ? getPreviewFileName(selectedItem) : 'Fichier'}
        />
      )}
      {isPreviewOpen && previewRender && selectedItem && (
        <MotionBox
          as="div"
          className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && handleClosePreview()}
          animation={{ animationInitiale: 'fadeIn' }}
        >
          <MotionBox
            as="div"
            className="relative bg-[var(--color-cardBg)] rounded-xl max-w-5xl w-full max-h-[90vh] overflow-auto p-4"
            animation={{ animationInitiale: 'slideUp' }}
          >
            <button
              onClick={handleClosePreview}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)] transition z-10"
            >
              <X size={20} />
            </button>
            <div className="w-full min-h-[200px]">
              {previewRender(selectedItem)}
            </div>
          </MotionBox>
        </MotionBox>
      )}
    </MotionBox>
  );
}

export default UniversalList;
