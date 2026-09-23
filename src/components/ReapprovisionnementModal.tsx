/**
 * ReapprovisionnementModal – Pop-up pour réapprovisionner un produit
 * Utilise le composant Modal réutilisable
 * Compatible React 16.14.
 */

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Package, AlertTriangle, Save, X } from 'lucide-react';
import { Produit } from '../types/stock';
import { useReapprovisionnement } from '../hooks/useReapprovisionnement';
import { useToast } from '../hooks/useToast';

interface ReapprovisionnementModalProps {
  produit: Produit | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReapprovisionnementModal: React.FC<ReapprovisionnementModalProps> = ({
  produit,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const reapproMutation = useReapprovisionnement();
  const { error: toastError } = useToast();
  const [loading, setLoading] = useState(false);

  const [quantite, setQuantite] = useState<string>('1');
  const [prixAchat, setPrixAchat] = useState<string>('0');
  const [prixVente, setPrixVente] = useState<string>('0');
  const [seuilAlerte, setSeuilAlerte] = useState<string>('5');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (produit) {
      setPrixAchat(String(produit.prix_achat || 0));
      setPrixVente(String(produit.prix_vente || 0));
      setSeuilAlerte(String(produit.seuil_alerte || 5));
      setQuantite('1');
      setError(null);
    }
  }, [produit]);

  if (!isOpen || !produit) return null;

  const quantiteNum = parseInt(quantite, 10) || 0;
  const prixAchatNum = parseFloat(prixAchat) || 0;
  const prixVenteNum = parseFloat(prixVente) || 0;
  const seuilAlerteNum = parseInt(seuilAlerte, 10) || 0;
  const nouvelleQuantiteTotale = produit.quantite + quantiteNum;

  const validate = (): boolean => {
    if (quantiteNum <= 0) {
      setError('La quantité doit être supérieure à 0');
      return false;
    }
    if (prixAchatNum < 0) {
      setError('Le prix d\'achat ne peut pas être négatif');
      return false;
    }
    if (prixVenteNum < 0) {
      setError('Le prix de vente ne peut pas être négatif');
      return false;
    }
    if (seuilAlerteNum > nouvelleQuantiteTotale) {
      setError(`Le seuil d'alerte (${seuilAlerteNum}) ne peut pas dépasser la quantité totale (${nouvelleQuantiteTotale})`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleSeuilChange = (value: string) => {
    setSeuilAlerte(value);
    const val = parseInt(value, 10) || 0;
    if (val > nouvelleQuantiteTotale) {
      setError(`Le seuil d'alerte (${val}) ne peut pas dépasser la quantité totale (${nouvelleQuantiteTotale})`);
    } else {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await reapproMutation.mutateAsync({
        produitId: produit.id,
        quantite: quantiteNum,
        prixAchat: prixAchatNum,
        prixVente: prixVenteNum,
        seuilAlerte: seuilAlerteNum,
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      // L'erreur est déjà gérée par le hook via toastError
    } finally {
      setLoading(false);
    }
  };

  // Footer avec les boutons
  const footer = (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
      >
        Annuler
      </button>
      <button
        type="submit"
        onClick={handleSubmit}
        disabled={loading || !!error}
        className={`px-4 py-2 rounded-xl text-white flex items-center gap-2 ${
          loading || error
            ? 'bg-gray-300 cursor-not-allowed opacity-60'
            : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
        } transition`}
      >
        {loading ? 'En cours...' : <><Save size={16} /> Réapprovisionner</>}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Réapprovisionner"
      subtitle={produit.nom}
      icon={<Package size={24} />}
      maxWidth="md"
      maxHeight="80vh"
      showFooter={true}
      footer={footer}
    >
      {/* Informations actuelles */}
      <div className="grid grid-cols-2 gap-3 p-3 mb-4 rounded-xl bg-gray-50">
        <div>
          <p className="text-xs text-gray-500">Stock actuel</p>
          <p className="font-semibold text-gray-900">{produit.quantite} {produit.unite}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Seuil général</p>
          <p className="font-semibold text-gray-900">{produit.seuil_alerte || 'Non défini'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Prix achat</p>
          <p className="font-semibold text-gray-900">{produit.prix_achat.toLocaleString()} FCFA</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Prix vente</p>
          <p className="font-semibold text-gray-900">{produit.prix_vente.toLocaleString()} FCFA</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quantité */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Quantité à ajouter *
          </label>
          <input
            type="number"
            value={quantite}
            onChange={(e) => {
              setQuantite(e.target.value);
              const q = parseInt(e.target.value, 10) || 0;
              const s = parseInt(seuilAlerte, 10) || 0;
              if (s > produit.quantite + q) {
                setError(`Le seuil d'alerte (${s}) ne peut pas dépasser la quantité totale (${produit.quantite + q})`);
              } else {
                setError(null);
              }
            }}
            min={1}
            required
            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
          />
          <p className="text-xs text-gray-400 mt-1">
            Nouveau stock : <strong>{nouvelleQuantiteTotale}</strong> {produit.unite}
          </p>
        </div>

        {/* Prix achat */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Prix d'achat (FCFA) *
          </label>
          <input
            type="number"
            value={prixAchat}
            onChange={(e) => setPrixAchat(e.target.value)}
            min={0}
            required
            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
          />
        </div>

        {/* Prix vente */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Prix de vente (FCFA) *
          </label>
          <input
            type="number"
            value={prixVente}
            onChange={(e) => setPrixVente(e.target.value)}
            min={0}
            required
            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
          />
        </div>

        {/* Seuil d'alerte */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Seuil d'alerte *
            <span className="ml-2 text-xs text-gray-400">
              (≤ {nouvelleQuantiteTotale})
            </span>
          </label>
          <input
            type="number"
            value={seuilAlerte}
            onChange={(e) => handleSeuilChange(e.target.value)}
            min={0}
            max={nouvelleQuantiteTotale}
            required
            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
          />
          <div className="flex items-center gap-2 mt-1">
            <AlertTriangle size={14} className="text-yellow-500" />
            <span className="text-xs text-gray-400">
              Seuil général actuel : {produit.seuil_alerte || 'Non défini'}
            </span>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
};

export default ReapprovisionnementModal;
