import React from 'react';
import { MotionBox } from '../../ui/MotionBox';
import { HomeBlock } from '../../../types/homeConfig';

const defaultFeatures = [
  { icon: '📦', title: 'Gestion de stock', description: 'Suivez vos produits en temps réel' },
  { icon: '💰', title: 'Caisse', description: 'Enregistrez vos ventes facilement' },
  { icon: '📊', title: 'Comptabilité', description: 'Suivez vos finances' },
  { icon: '👥', title: 'RH', description: 'Gérez vos employés' },
];

const WidgetFeatures: React.FC<{ block: HomeBlock }> = ({ block }) => {
  const features = (block.config?.features as any[]) || defaultFeatures;
  return (
    <div className="py-4">
      {block.title && <h2 className="text-2xl font-bold text-[var(--color-textPrimary)] text-center mb-2">{block.title}</h2>}
      {block.subtitle && <p className="text-center text-[var(--color-textSecondary)] mb-6">{block.subtitle}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f: any, idx: number) => (
          <MotionBox key={idx} type="card" variant="default" className="p-6 text-center hover:shadow-lg transition">
            <div className="text-4xl mb-3">{f.icon || '📌'}</div>
            <h3 className="font-semibold text-[var(--color-textPrimary)]">{f.title}</h3>
            <p className="text-sm text-[var(--color-textSecondary)] mt-1">{f.description}</p>
          </MotionBox>
        ))}
      </div>
    </div>
  );
};

export default WidgetFeatures;
