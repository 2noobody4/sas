import React from 'react';
import { MotionBox } from './MotionBox';
import { HomeBlock } from '../types/homeConfig';

const defaultTestimonials = [
  { name: 'Mamadou Diop', role: 'Gérant', content: 'App PME a transformé la gestion de mon entreprise.' },
  { name: 'Aïssatou Diallo', role: 'Comptable', content: 'Les fonctionnalités comptables sont complètes.' },
  { name: 'Ibrahima Ndiaye', role: 'Magasinier', content: 'Le suivi des stocks est fluide et efficace.' },
];

const WidgetTestimonials: React.FC<{ block: HomeBlock }> = ({ block }) => {
  const testimonials = (block.config?.testimonials as any[]) || defaultTestimonials;
  return (
    <div className="py-4 bg-[var(--color-secondary)] rounded-2xl px-4">
      {block.title && <h2 className="text-2xl font-bold text-[var(--color-textPrimary)] text-center mb-2">{block.title}</h2>}
      {block.subtitle && <p className="text-center text-[var(--color-textSecondary)] mb-6">{block.subtitle}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t: any, idx: number) => (
          <MotionBox key={idx} type="card" variant="default" className="p-6 text-center">
            <div className="text-4xl mb-3">“</div>
            <p className="text-[var(--color-textSecondary)] italic">{t.content}</p>
            <p className="font-semibold text-[var(--color-textPrimary)] mt-4">{t.name}</p>
            <p className="text-sm text-[var(--color-textSecondary)]">{t.role}</p>
          </MotionBox>
        ))}
      </div>
    </div>
  );
};

export default WidgetTestimonials;
