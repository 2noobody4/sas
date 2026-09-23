// ============================================================
// USE FORMAT — Formate currency, dates, nombres selon la config
// Version V3 — Compatible React 16
// ============================================================

import { useMemo } from 'react';
import { useConfig } from '../contexts/ConfigContext';

export const useFormat = () => {
  const config = useConfig();

  const locale = config.locale || 'fr';
  const currency = config.currency || 'XOF';
  const timezone = config.timezone || 'Africa/Dakar';
  const dateFormat = config.dateFormat || 'DD/MM/YYYY';

  return useMemo(() => {
    const formatCurrency = (amount: number): string => {
      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount);
      } catch {
        return `${amount.toLocaleString()} ${currency}`;
      }
    };

    const formatNumber = (n: number, decimals = 0): string => {
      try {
        return new Intl.NumberFormat(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(n);
      } catch {
        return n.toLocaleString();
      }
    };

    const formatDate = (date: Date | string): string => {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return '-';

      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear());

      switch (dateFormat) {
        case 'MM/DD/YYYY': return `${month}/${day}/${year}`;
        case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
        case 'DD/MM/YYYY':
        default: return `${day}/${month}/${year}`;
      }
    };

    const formatDateTime = (date: Date | string): string => {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return '-';
      const datePart = formatDate(d);
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${datePart} ${hours}:${minutes}`;
    };

    const formatTime = (date: Date | string): string => {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return '-';
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    return { formatCurrency, formatNumber, formatDate, formatDateTime, formatTime, locale, currency, timezone };
  }, [locale, currency, timezone, dateFormat]);
};

export default useFormat;
