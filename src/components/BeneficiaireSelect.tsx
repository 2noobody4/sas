import React, { useState, useEffect, useMemo } from 'react';
import { MotionBox } from './MotionBox';
import { Search, Plus, X, User, Building, Users } from 'lucide-react';
import { useFournisseurs } from '../hooks/useFournisseurs';
import { useClients } from '../hooks/useClients';
import { useAuth } from '../hooks/useAuth';
import { Fournisseur } from '../types/stock';
import { Client } from '../types/clients';

interface BeneficiaireSelectProps {
  value: string;
  onChange: (nom: string, id?: string) => void;
  placeholder?: string;
  type?: 'fournisseur' | 'employe' | 'client' | 'all';
  className?: string;
  onAddNew?: () => void;
}

interface BeneficiaireItem {
  nom: string;
  id?: string;
  type: string;
}

export const BeneficiaireSelect: React.FC<BeneficiaireSelectProps> = ({
  value,
  onChange,
  placeholder = 'Sélectionner ou saisir un bénéficiaire',
  type = 'all',
  className = '',
  onAddNew,
}) => {
  const { data: fournisseurs = [] } = useFournisseurs();
  const { data: clients = [] } = useClients(); // 🔧 comptes auxiliaires par tiers : une facture émise doit pouvoir référencer un vrai client
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<{ nom: string; id?: string } | null>(null);

  // ✅ Memoization : ne change que si fournisseurs, user ou type changent
  const beneficiaires = useMemo<BeneficiaireItem[]>(() => {
    const list: BeneficiaireItem[] = [];

    if (type === 'all' || type === 'fournisseur') {
      fournisseurs.forEach((f: Fournisseur) => {
        list.push({ nom: f.nom, id: f.id, type: 'fournisseur' });
      });
    }

    // 🔧 Comptes auxiliaires par tiers : sans ce bloc, une facture "émise"
    // ne pouvait jamais être rattachée à un vrai client, donc jamais à
    // son sous-compte 411xxx.
    if (type === 'all' || type === 'client') {
      clients.forEach((c: Client) => {
        list.push({ nom: `${c.prenom || ''} ${c.nom}`.trim(), id: c.id, type: 'client' });
      });
    }

    if (type === 'all' || type === 'employe') {
      if (user && (user.role?.nom === 'employe' || user.role?.nom === 'admin')) {
        list.push({
          nom: `${user.prenom || ''} ${user.nom || ''}`.trim() || user.email,
          id: user.id,
          type: 'employe',
        });
      }
    }

    return list;
  }, [fournisseurs, clients, user, type]);

  const filtered = useMemo(() => {
    if (!searchTerm) return beneficiaires;
    const term = searchTerm.toLowerCase();
    return beneficiaires.filter((b) => b.nom.toLowerCase().includes(term));
  }, [beneficiaires, searchTerm]);

  // ✅ Deps stables : beneficiaires ne change plus à chaque render
  useEffect(() => {
    if (value) {
      const found = beneficiaires.find((b) => b.nom === value || b.id === value);
      if (found) {
        setSelected((prev) =>
          prev && prev.nom === found.nom && prev.id === found.id ? prev : { nom: found.nom, id: found.id }
        );
      } else {
        setSelected((prev) => (prev && prev.nom === value && !prev.id ? prev : { nom: value }));
      }
    } else {
      setSelected((prev) => (prev === null ? prev : null));
    }
  }, [value, beneficiaires]);

  const handleSelect = (beneficiaire: BeneficiaireItem) => {
    setSelected(beneficiaire);
    onChange(beneficiaire.nom, beneficiaire.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    const exists = beneficiaires.some((b) => b.nom.toLowerCase() === val.toLowerCase());
    if (!exists && val.length > 2) {
      setSelected({ nom: val });
      onChange(val);
    }
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'fournisseur': return <Building size={14} className="text-[var(--color-primary)]" />;
      case 'employe': return <User size={14} className="text-[var(--color-success)]" />;
      case 'client': return <Users size={14} className="text-[var(--color-warning)]" />;
      default: return <User size={14} className="text-[var(--color-textSecondary)]" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer bg-[var(--color-cardBg)] border-[var(--color-borderColor)]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <User size={16} className="text-[var(--color-textSecondary)]" />
        <span className="flex-1 text-[var(--color-textPrimary)] truncate">
          {selected ? selected.nom : placeholder}
        </span>
        {selected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelected(null);
              onChange('');
              setSearchTerm('');
            }}
            className="text-[var(--color-textSecondary)] hover:text-[var(--color-danger)]"
          >
            <X size={16} />
          </button>
        )}
        <div className="text-[var(--color-textSecondary)]">
          <Search size={16} />
        </div>
      </div>

      {isOpen && (
        <MotionBox
          as="div"
          className="absolute z-20 w-full mt-1 border rounded-xl shadow-lg bg-[var(--color-cardBg)] border-[var(--color-borderColor)] max-h-48 overflow-y-auto"
          animation={{ animationInitiale: 'fadeIn' }}
        >
          <div className="p-2 border-b border-[var(--color-borderColor)]">
            <input
              type="text"
              value={searchTerm}
              onChange={handleCustomInput}
              placeholder="Rechercher ou saisir un nom..."
              className="w-full px-3 py-1.5 rounded-lg border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] text-sm"
              autoFocus
            />
          </div>

          {filtered.length === 0 && searchTerm.length > 2 && (
            <div
              className="px-3 py-2 text-sm cursor-pointer hover:bg-[var(--color-secondary)] flex items-center gap-2 text-[var(--color-primary)]"
              onClick={() => {
                if (onAddNew) {
                  onAddNew();
                  setIsOpen(false);
                } else {
                  handleSelect({ nom: searchTerm, type: 'autre' });
                }
              }}
            >
              <Plus size={16} />
              Ajouter "{searchTerm}"
            </div>
          )}

          {filtered.length === 0 && searchTerm.length <= 2 && (
            <div className="p-3 text-sm text-[var(--color-textSecondary)]">
              Saisissez au moins 3 caractères
            </div>
          )}

          {filtered.map((b, index) => (
            <div
              key={b.id || index}
              className={`px-3 py-1.5 cursor-pointer hover:bg-[var(--color-secondary)] flex items-center gap-2 text-sm ${
                selected?.id === b.id ? 'bg-[var(--color-primary)]/10' : ''
              }`}
              onClick={() => handleSelect(b)}
            >
              {getTypeIcon(b.type)}
              <span className="text-[var(--color-textPrimary)]">{b.nom}</span>
              <span className="text-xs text-[var(--color-textSecondary)] ml-auto">{b.type}</span>
            </div>
          ))}

          {onAddNew && (
            <div
              className="px-3 py-2 border-t border-[var(--color-borderColor)] cursor-pointer hover:bg-[var(--color-secondary)] flex items-center gap-2 text-sm text-[var(--color-primary)]"
              onClick={() => {
                onAddNew();
                setIsOpen(false);
              }}
            >
              <Plus size={16} />
              Ajouter un nouveau bénéficiaire
            </div>
          )}
        </MotionBox>
      )}
    </div>
  );
};

export default BeneficiaireSelect;
