/**
 * MagasinSelector – Sélecteur de magasin actif dans le header
 * Compatible React 16.14
 */

import React, { useState } from 'react';
import { useMagasinActif } from '../../contexts/MagasinActifContext';
import { useMagasins } from '../../hooks/useMagasins';
import { MotionBox } from './MotionBox';
import { Store, Check, ChevronDown } from 'lucide-react';

export const MagasinSelector: React.FC = () => {
  const { magasinActif, setMagasinActif, loading: magasinLoading } = useMagasinActif();
  const { data: magasins = [], isLoading: magasinsLoading } = useMagasins();
  const [isOpen, setIsOpen] = useState(false);
  const [changing, setChanging] = useState(false);

  const handleSelect = async (magasinId: string) => {
    if (changing) return;
    setChanging(true);
    try {
      await setMagasinActif(magasinId);
      setIsOpen(false);
    } catch (err) {
      console.error('Erreur changement magasin:', err);
    } finally {
      setChanging(false);
    }
  };

  if (magasinLoading || magasinsLoading) {
    return (
      <button className="p-1.5 rounded-lg hover:bg-[var(--color-secondary)] transition text-[var(--color-textSecondary)] opacity-50">
        <Store size={18} />
      </button>
    );
  }

  if (!magasinActif) {
    return null;
  }

  const magasinsActifs = magasins.filter((m: any) => m.actif);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[var(--color-secondary)] transition text-[var(--color-textSecondary)] text-sm"
        disabled={changing}
      >
        <Store size={16} />
        <span className="max-w-[100px] truncate font-medium text-[var(--color-textPrimary)]">
          {magasinActif.nom}
        </span>
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <MotionBox
          as="div"
          className="absolute right-0 top-full mt-1 p-1 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] shadow-lg z-50 min-w-[200px] max-h-60 overflow-y-auto"
          animation={{ animationInitiale: 'fadeIn' }}
        >
          {magasinsActifs.length === 0 ? (
            <div className="p-3 text-sm text-[var(--color-textSecondary)]">Aucun magasin actif</div>
          ) : (
            magasinsActifs.map((magasin: any) => {
              const isActive = magasinActif.id === magasin.id;
              return (
                <button
                  key={magasin.id}
                  onClick={() => handleSelect(magasin.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                    isActive
                      ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                      : 'hover:bg-[var(--color-secondary)] text-[var(--color-textPrimary)]'
                  }`}
                  disabled={changing}
                >
                  <span className="truncate">{magasin.nom}</span>
                  {isActive && <Check size={16} className="text-[var(--color-primary)]" />}
                </button>
              );
            })
          )}
        </MotionBox>
      )}
    </div>
  );
};

export default MagasinSelector;
