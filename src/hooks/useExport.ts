import { useCallback } from 'react';
import { useToast } from './useToast';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

type ExportFormat = 'csv' | 'excel' | 'pdf';

interface UseExportOptions {
  fileName?: string;
  headers?: Record<string, string>;
  title?: string;
}

export const useExport = () => {
  const { success, error: toastError } = useToast();

  const exportCSV = useCallback((data: any[], options: UseExportOptions = {}) => {
    try {
      const fileName = options.fileName || `export_${Date.now()}`;
      const headers = options.headers || {};

      const rows: string[] = [];
      if (data.length > 0) {
        const keys = Object.keys(data[0]);
        const headerRow = keys.map(k => headers[k] || k).join(';');
        rows.push(headerRow);

        data.forEach(row => {
          const rowValues = keys.map(k => {
            const val = row[k];
            if (val === null || val === undefined) return '';
            if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
            return String(val);
          });
          rows.push(rowValues.join(';'));
        });
      }

      const csvContent = rows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      success(`Export CSV réussi ✅`);
    } catch (err: any) {
      toastError(err.message || 'Erreur d\'export CSV');
    }
  }, [success, toastError]);

  const exportExcel = useCallback((data: any[], options: UseExportOptions = {}) => {
    try {
      const fileName = options.fileName || `export_${Date.now()}`;
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Données');
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      success(`Export Excel réussi ✅`);
    } catch (err: any) {
      toastError(err.message || 'Erreur d\'export Excel');
    }
  }, [success, toastError]);

  const exportPDF = useCallback((data: any[], options: UseExportOptions = {}) => {
    try {
      const fileName = options.fileName || `export_${Date.now()}`;
      const title = options.title || 'Export APP PME';
      const headers = options.headers || {};

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      const maxWidth = pageWidth - 2 * margin;

      doc.setFontSize(18);
      doc.text(title, margin, 20);

      doc.setFontSize(10);
      doc.text(`Exporté le ${new Date().toLocaleString()}`, margin, 28);

      if (data.length === 0) {
        doc.text('Aucune donnée à exporter.', margin, 40);
        doc.save(`${fileName}.pdf`);
        success(`Export PDF réussi ✅`);
        return;
      }

      const keys = Object.keys(data[0]);
      const columnLabels = keys.map(k => headers[k] || k);
      const columnWidths = keys.map(k => Math.max(
        (headers[k] || k).length * 1.5,
        Math.max(...data.map(row => String(row[k] || '').length * 1.2))
      ));
      const totalWidth = columnWidths.reduce((a, b) => a + b, 0);
      const scale = Math.min(1, maxWidth / totalWidth);

      let y = 36;
      const rowHeight = 8;

      let x = margin;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      columnLabels.forEach((label, i) => {
        const w = columnWidths[i] * scale;
        doc.text(label, x, y, { maxWidth: w });
        x += w + 2;
      });
      y += rowHeight;

      doc.setFont('helvetica', 'normal');
      data.forEach(row => {
        x = margin;
        keys.forEach((k, i) => {
          const w = columnWidths[i] * scale;
          const val = row[k] !== undefined && row[k] !== null ? String(row[k]) : '';
          doc.text(val, x, y, { maxWidth: w });
          x += w + 2;
        });
        y += rowHeight;

        if (y > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          y = 20;
          x = margin;
          doc.setFont('helvetica', 'bold');
          columnLabels.forEach((label, i) => {
            const w = columnWidths[i] * scale;
            doc.text(label, x, y, { maxWidth: w });
            x += w + 2;
          });
          y += rowHeight;
          doc.setFont('helvetica', 'normal');
        }
      });

      doc.save(`${fileName}.pdf`);
      success(`Export PDF réussi ✅`);
    } catch (err: any) {
      toastError(err.message || 'Erreur d\'export PDF');
    }
  }, [success, toastError]);

  return { exportCSV, exportExcel, exportPDF };
};

export default useExport;
