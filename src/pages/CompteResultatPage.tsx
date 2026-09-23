import React, { useState } from 'react';
import { MotionBox } from '../components/MotionBox';
import { useCompteResultat } from '../hooks/useComptabilite';
import { Calendar } from 'lucide-react';

export const CompteResultatPage: React.FC = () => {
  const [dateDebut, setDateDebut] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [dateFin, setDateFin] = useState(new Date().toISOString().split('T')[0]);
  const { data: resultat, isLoading, error } = useCompteResultat(dateDebut, dateFin);

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  if (!resultat) return (
    <div className="p-6 text-center text-[var(--color-danger)]">
      Erreur de chargement{error instanceof Error ? ` : ${error.message}` : ''}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📊 Compte de résultat</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">
            Du {new Date(dateDebut).toLocaleDateString()} au {new Date(dateFin).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[var(--color-textSecondary)]" />
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
          <span className="text-[var(--color-textSecondary)]">à</span>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MotionBox type="card" variant="elevated" className="p-4">
          <h3 className="text-lg font-semibold text-[var(--color-textPrimary)] mb-4">📈 Produits</h3>
          <div className="space-y-3">
            <div className="flex justify-between p-2 border-b border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textSecondary)]">Ventes</span>
              <span className="font-medium text-[var(--color-textPrimary)]">{resultat.produits.ventes.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between p-2 border-b border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textSecondary)]">Subventions d'exploitation</span>
              <span className="font-medium text-[var(--color-textPrimary)]">{resultat.produits.subventions.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between p-2 border-b border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textSecondary)]">Production immobilisée</span>
              <span className="font-medium text-[var(--color-textPrimary)]">{resultat.produits.production_immobilisee.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between p-2 border-b border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textSecondary)]">Autres produits</span>
              <span className="font-medium text-[var(--color-textPrimary)]">{resultat.produits.autres_produits.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between p-2 bg-[var(--color-secondary)] rounded font-bold">
              <span className="text-[var(--color-textPrimary)]">Total Produits</span>
              <span className="text-[var(--color-success)]">{resultat.produits.total.toLocaleString()} FCFA</span>
            </div>
          </div>
        </MotionBox>

        <MotionBox type="card" variant="elevated" className="p-4">
          <h3 className="text-lg font-semibold text-[var(--color-textPrimary)] mb-4">📉 Charges</h3>
          <div className="space-y-3">
            <div className="flex justify-between p-2 border-b border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textSecondary)]">Achats</span>
              <span className="font-medium text-[var(--color-textPrimary)]">{resultat.charges.achats.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between p-2 border-b border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textSecondary)]">Services extérieurs</span>
              <span className="font-medium text-[var(--color-textPrimary)]">{resultat.charges.services.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between p-2 border-b border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textSecondary)]">Impôts et taxes</span>
              <span className="font-medium text-[var(--color-textPrimary)]">{resultat.charges.impots.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between p-2 border-b border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textSecondary)]">Charges de personnel</span>
              <span className="font-medium text-[var(--color-textPrimary)]">{resultat.charges.personnel.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between p-2 border-b border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textSecondary)]">Frais financiers</span>
              <span className="font-medium text-[var(--color-textPrimary)]">{resultat.charges.frais_financiers.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between p-2 border-b border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textSecondary)]">Dotations aux amortissements</span>
              <span className="font-medium text-[var(--color-textPrimary)]">{resultat.charges.dotations.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between p-2 border-b border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textSecondary)]">Autres charges</span>
              <span className="font-medium text-[var(--color-textPrimary)]">{resultat.charges.autres_charges.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between p-2 bg-[var(--color-secondary)] rounded font-bold">
              <span className="text-[var(--color-textPrimary)]">Total Charges</span>
              <span className="text-[var(--color-danger)]">{resultat.charges.total.toLocaleString()} FCFA</span>
            </div>
          </div>
        </MotionBox>
      </div>

      <MotionBox type="card" variant="default" className="mt-6 p-4 text-center">
        <h3 className="text-lg font-semibold text-[var(--color-textPrimary)]">Résultat net</h3>
        <p className={`text-2xl font-bold ${resultat.resultat >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
          {resultat.resultat.toLocaleString()} FCFA
        </p>
        <p className="text-sm text-[var(--color-textSecondary)]">{resultat.resultat >= 0 ? 'Bénéfice' : 'Perte'}</p>
      </MotionBox>
    </div>
  );
};

export default CompteResultatPage;
