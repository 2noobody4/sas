import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { useProduits } from '../../hooks/useProduits';
import { useCreateMouvement } from '../../hooks/useMouvements';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../../hooks/useToast';
import { ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';

export const PertesPage: React.FC = () => {
  const history = useHistory();
  const { data: produits = [], isLoading: produitsLoading, refetch } = useProduits();
  const createMouvement = useCreateMouvement();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(false);
  const [produitId, setProduitId] = useState<string>('');
  const [quantite, setQuantite] = useState<number>(1);
  const [motif, setMotif] = useState<string>('vol');
  const [description, setDescription] = useState<string>('');

  const selectedProduit = produits.find((p: any) => p.id === produitId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!produitId) {
      toastError('Veuillez sélectionner un produit');
      return;
    }
    
    if (quantite <= 0) {
      toastError('La quantité doit être supérieure à 0');
      return;
    }
    
    if (!selectedProduit) {
      toastError('Produit non trouvé');
      return;
    }
    
    if (quantite > selectedProduit.quantite) {
      toastError(`Stock insuffisant. Disponible : ${selectedProduit.quantite}`);
      return;
    }

    setLoading(true);
    try {
      // 1. Créer le mouvement de stock
      await createMouvement.mutateAsync({
        produit_id: produitId,
        type: 'perte',
        quantite: quantite,
        ancienne_quantite: selectedProduit.quantite,
        nouvelle_quantite: selectedProduit.quantite - quantite,
        motif: `${motif} - ${description || 'Sans description'}`,
        magasin_id: selectedProduit.magasin_id || undefined,
        entrepot_id: selectedProduit.entrepot_id || undefined,
      });

      // 2. Mettre à jour la quantité du produit
      const { error: updateError } = await supabase
        .from('produits')
        .update({ quantite: selectedProduit.quantite - quantite })
        .eq('id', produitId);

      if (updateError) throw updateError;

      success(`Perte de ${quantite} ${selectedProduit.unite} enregistrée ✅`);
      
      // Réinitialiser le formulaire
      setProduitId('');
      setQuantite(1);
      setMotif('vol');
      setDescription('');
      
      // Rafraîchir la liste
      refetch();
      
    } catch (err: any) {
      toastError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  // Si les produits chargent
  if (produitsLoading) {
    return (
      <div className="p-6 text-center text-[var(--color-textSecondary)]">
        Chargement des produits...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* En-tête avec bouton retour */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => history.push('/gestion/stocks')} 
          className="p-2 rounded hover:bg-[var(--color-secondary)] transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)] flex items-center gap-2">
          <AlertTriangle size={24} className="text-[var(--color-danger)]" />
          Déclaration de perte
        </h1>
      </div>

      <MotionBox type="card" variant="elevated" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection du produit */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-textPrimary)] mb-1">
              Produit *
            </label>
            <select
              value={produitId}
              onChange={(e) => setProduitId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
            >
              <option value="">Sélectionner un produit</option>
              {produits
                .filter((p: any) => p.actif)
                .map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.nom} - Stock: {p.quantite} {p.unite}
                  </option>
                ))}
            </select>
            {selectedProduit && (
              <p className="text-sm text-[var(--color-textSecondary)] mt-1">
                Stock disponible : <strong>{selectedProduit.quantite}</strong> {selectedProduit.unite}
              </p>
            )}
          </div>

          {/* Quantité */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-textPrimary)] mb-1">
              Quantité perdue *
            </label>
            <input
              type="number"
              value={quantite}
              onChange={(e) => setQuantite(parseInt(e.target.value) || 0)}
              min={1}
              max={selectedProduit?.quantite || 1}
              required
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
            />
          </div>

          {/* Motif */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-textPrimary)] mb-1">
              Motif *
            </label>
            <select
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
            >
              <option value="vol">Vol</option>
              <option value="destruction">Destruction</option>
              <option value="peremption">Péremption</option>
              <option value="casse">Casse</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-textPrimary)] mb-1">
              Description (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Détails supplémentaires..."
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
            />
          </div>

          {/* Avertissement */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-warning)]/10 text-[var(--color-warning)] text-sm">
            <AlertTriangle size={18} />
            <span>Cette action est irréversible et diminuera le stock.</span>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-borderColor)]">
            <button
              type="button"
              onClick={() => history.push('/gestion/stocks')}
              className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-white flex items-center gap-2 transition ${
                loading 
                  ? 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60' 
                  : 'bg-[var(--color-danger)] hover:bg-[var(--color-danger-dark)]'
              }`}
            >
              <Trash2 size={18} />
              {loading ? 'En cours...' : 'Enregistrer la perte'}
            </button>
          </div>
        </form>
      </MotionBox>
    </div>
  );
};

export default PertesPage;
