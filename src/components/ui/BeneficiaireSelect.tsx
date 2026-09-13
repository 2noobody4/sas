import React, { useState, useEffect } from 'react';
import { MotionBox } from './MotionBox';
import { Search, Plus, X, User, Building, Users } from 'lucide-react';
import { useFournisseurs } from '../../hooks/useFournisseurs';
import { useAuth } from '../../hooks/useAuth';
import { Fournisseur } from '../../types/stock';

interface BeneficiaireSelectProps {
  value: string;
  onChange: (nom: string, id?: string) => void;
  placeholder?: string;
  type?: 'fournisseur' | 'employe' | 'client' | 'all';
  className?: string;
  onAddNew?: () => void;
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
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<{ nom: string; id?: string } | null>(null);

  // Construire la liste des bénéficiaires
  const beneficiaires: { nom: string; id?: string; type: string }[] = [];

  // Fournisseurs
  if (type === 'all' || type === 'fournisseur') {
    fournisseurs.forEach((f: Fournisseur) => {
      beneficiaires.push({ nom: f.nom, id: f.id, type: 'fournisseur' });
    });
  }

  // Employés (depuis users avec rôle 'employe' ou 'admin')
  // Pour l'instant, on utilise l'utilisateur connecté comme exemple
  if (type === 'all' || type === 'employe') {
    if (user && (user.role?.nom === 'employe' || user.role?.nom === 'admin')) {
      beneficiaires.push({ 
        nom: `${user.prenom || ''} ${user.nom || ''}`.trim() || user.email, 
        id: user.id, 
        type: 'employe' 
      });
    }
  }

  // Clients (pour l'instant, on n'a pas de table clients, on utilise une saisie libre)

  // Filtrer
  const filtered = searchTerm 
    ? beneficiaires.filter(b => b.nom.toLowerCase().includes(searchTerm.toLowerCase()))
    : beneficiaires;

  // Mettre à jour le selected quand value change
  useEffect(() => {
    if (value) {
      const found = beneficiaires.find(b => b.nom === value || b.id === value);
      if (found) setSelected({ nom: found.nom, id: found.id });
      else setSelected({ nom: value });
    } else {
      setSelected(null);
    }
  }, [value, beneficiaires]);

  const handleSelect = (beneficiaire: { nom: string; id?: string }) => {
    setSelected(beneficiaire);
    onChange(beneficiaire.nom, beneficiaire.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    // Si l'utilisateur saisit un nom qui n'existe pas, on le stocke comme saisie libre
    const exists = beneficiaires.some(b => b.nom.toLowerCase() === val.toLowerCase());
    if (!exists && val.length > 2) {
      setSelected({ nom: val });
      onChange(val);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
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
                  // Si on n'a pas de callback, on ajoute directement la saisie
                  handleSelect({ nom: searchTerm });
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
