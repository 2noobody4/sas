import React, { useState } from 'react';
import { MotionBox } from '../../components/ui/MotionBox';
import { useComptes } from '../../hooks/useComptabilite';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';

export const PlanComptablePage: React.FC = () => {
  const { data: comptes = [], isLoading } = useComptes();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredComptes = comptes.filter(c =>
    c.numero.includes(search) || c.nom.toLowerCase().includes(search.toLowerCase())
  );

  // Grouper par classe
  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const grouped = classes.map(classe => ({
    classe,
    comptes: filteredComptes.filter(c => c.numero.startsWith(classe))
  })).filter(g => g.comptes.length > 0);

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">🗂️ Plan comptable OHADA</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Liste des comptes normalisés</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
        <input
          type="text"
          placeholder="Rechercher par numéro ou nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
        />
      </div>

      <div className="space-y-4">
        {grouped.map(({ classe, comptes }) => (
          <MotionBox key={classe} type="card" variant="default" className="overflow-hidden">
            <div
              className="flex items-center gap-2 p-3 cursor-pointer hover:bg-[var(--color-secondary)] transition"
              onClick={() => toggleExpand(classe)}
            >
              {expanded[classe] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              <span className="font-bold text-[var(--color-textPrimary)]">Classe {classe}</span>
              <span className="text-sm text-[var(--color-textSecondary)]">({comptes.length} comptes)</span>
            </div>
            {expanded[classe] && (
              <div className="border-t border-[var(--color-borderColor)]">
                {comptes.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2 pl-6 border-b border-[var(--color-borderColor)] last:border-0 hover:bg-[var(--color-secondary)]/50 transition">
                    <span className="text-sm font-mono text-[var(--color-textPrimary)]">{c.numero}</span>
                    <span className="text-sm text-[var(--color-textSecondary)] flex-1 ml-4">{c.nom}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-secondary)] text-[var(--color-textSecondary)]">{c.type}</span>
                  </div>
                ))}
              </div>
            )}
          </MotionBox>
        ))}
      </div>
    </div>
  );
};

export default PlanComptablePage;
