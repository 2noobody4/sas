import React, { useState } from 'react';
import { useComptes } from '../../hooks/useComptabilite';
import { Search } from 'lucide-react';

interface CompteSearchSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  typeFilter?: 'actif' | 'passif' | 'produit' | 'charge' | 'all';
  className?: string;
}

export const CompteSearchSelect: React.FC<CompteSearchSelectProps> = ({
  value,
  onChange,
  placeholder = 'Rechercher un compte...',
  typeFilter = 'all',
  className = '',
}) => {
  const { data: comptes = [] } = useComptes();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = comptes.filter(c => {
    const matchType = typeFilter === 'all' || c.type === typeFilter;
    const matchSearch = c.numero.includes(searchTerm) || c.nom.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  }).slice(0, 20);

  const selected = comptes.find(c => c.id === value);

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer bg-[var(--color-cardBg)]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Search size={16} className="text-[var(--color-textSecondary)]" />
        <span className="flex-1 text-[var(--color-textPrimary)]">
          {selected ? `${selected.numero} - ${selected.nom}` : placeholder}
        </span>
      </div>
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 p-1 border rounded-xl shadow-lg bg-[var(--color-cardBg)] max-h-48 overflow-y-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrer..."
            className="w-full px-3 py-1 border rounded mb-1 text-sm"
            autoFocus
          />
          {filtered.length === 0 && (
            <div className="p-2 text-sm text-[var(--color-textSecondary)]">Aucun compte trouvé</div>
          )}
          {filtered.map(c => (
            <div
              key={c.id}
              className="px-3 py-1 rounded hover:bg-[var(--color-secondary)] cursor-pointer text-sm"
              onClick={() => {
                onChange(c.id);
                setIsOpen(false);
                setSearchTerm('');
              }}
            >
              {c.numero} - {c.nom}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
