import React from 'react';
import { MotionBox } from '../../components/ui/MotionBox';

interface StockIndicatorProps {
  quantite: number;
  seuil: number;
}

const StockIndicator: React.FC<StockIndicatorProps> = ({ quantite, seuil }) => {
  const isLow = quantite <= seuil;
  const isOut = quantite === 0;

  let bgColor = 'var(--color-success)';
  let label = `${quantite}`;

  if (isOut) {
    bgColor = 'var(--color-danger)';
    label = 'Rupture';
  } else if (isLow) {
    bgColor = 'var(--color-warning)';
    label = `${quantite} ⚠️`;
  }

  return (
    <MotionBox
      as="span"
      type="indicator"
      variant={isOut ? 'out' : isLow ? 'low' : 'available'}
      usageId={isOut ? 'stocks-stock-indicator-out' : isLow ? 'stocks-stock-indicator-low' : 'stocks-stock-indicator'}
      page="StocksPage"
      parentLevel={2}
      isChildren
      className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium min-w-[60px]"
      style={{ backgroundColor: bgColor, color: '#FFFFFF' }}
    >
      {label}
    </MotionBox>
  );
};
export default StockIndicator;
