import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { MotionBox } from '../../../components/ui/MotionBox';
import { useSessionInventaire, useLignesInventaire, useCreateLigneInventaire, useUpdateLigneInventaire, useProduitsNonInventories } from '../../../hooks/useInventaire';
import { useProduits } from '../../../hooks/useProduits';
import { ArrowLeft, Package, Search, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';

interface RouteParams {
  id: string;
}

export const ControleInventairePage: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  const { data: session, isLoading: sessionLoading } = useSessionInventaire(id);
  const { data: lignes = [], refetch: refetchLignes } = useLignesInventaire(id);
  const { data: produitsNonInventories = [], isLoading: produitsLoading } = useProduitsNonInventories(id);
  const createLigne = useCreateLigneInventaire();
  const updateLigne = useUpdateLigneInventaire();
  const { success, error: toastError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduitId, setSelectedProduitId] = useState<string>('');
  const [quantiteReelle, setQuantiteReelle] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredProduits, setFilteredProduits] = useState<any[]>([]);

  useEffect(() => {
    if (produitsNonInventories.length > 0) {
      const term = searchTerm.toLowerCase();
      const filtered = produitsNonInventories.filter((p: any) =>
        p.nom.toLowerCase().includes(term) ||
        p.reference?.toLowerCase().includes(term) ||
        p.categorie?.nom?.toLowerCase().includes(term)
      );
      setFilteredProduits(filtered);
    } else {
      setFilteredProduits([]);
    }
  }, [searchTerm, produitsNonInventories]);

  // Vérifier si la session est encore ouverte
  if (session && session.statut === 'validee') {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => history.push('/gestion/stocks/inventaire')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📋 Session validée</h1>
        </div>
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          <CheckCircle size={48} className="mx-auto text-[var(--color-success)] mb-4" />
          <p className="text-lg font-medium">Cette session a été validée</p>
          <p className="text-sm">Vous ne pouvez plus modifier les quantités.</p>
          <button
            onClick={() => history.push(`/gestion/stocks/inventaire/rapport/${id}`)}
            className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white"
          >
            Voir le rapport
          </button>
        </MotionBox>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduitId) {
      toastError('Veuillez sélectionner un produit');
      return;
    }
    if (quantiteReelle < 0) {
      toastError('La quantité ne peut pas être négative');
      return;
    }

    setIsSubmitting(true);
    try {
      // Vérifier si une ligne existe déjà pour ce produit
      const existing = lignes.find(l => l.produit_id === selectedProduitId);
      
      if (existing) {
        await updateLigne.mutateAsync({
          ligneId: existing.id,
          quantiteReelle: quantiteReelle,
        });
      } else {
        // Créer une nouvelle ligne
        const produit = produitsNonInventories.find((p: any) => p.id === selectedProduitId);
        await createLigne.mutateAsync({
          sessionId: id,
          produitId: selectedProduitId,
          quantiteTheorique: produit?.quantite || 0,
        });
        // Mettre à jour avec la quantité réelle
        const newLigne = lignes.find(l => l.produit_id === selectedProduitId);
        if (newLigne) {
          await updateLigne.mutateAsync({
            ligneId: newLigne.id,
            quantiteReelle: quantiteReelle,
          });
        }
      }
      
      success('Produit compté ✅');
      setSelectedProduitId('');
      setQuantiteReelle(1);
      setSearchTerm('');
      refetchLignes();
    } catch (err: any) {
      toastError(err.message || 'Erreur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEcartDisplay = (ecart: number | null | undefined) => {
    if (ecart === null || ecart === undefined) return null;
    if (ecart === 0) {
      return <span className="text-[var(--color-success)] flex items-center gap-1"><CheckCircle size={14} /> 0</span>;
    }
    if (ecart > 0) {
      return <span className="text-[var(--color-success)] flex items-center gap-1"><TrendingUp size={14} /> +{ecart}</span>;
    }
    return <span className="text-[var(--color-danger)] flex items-center gap-1"><TrendingDown size={14} /> {ecart}</span>;
  };

  if (sessionLoading || produitsLoading) {
    return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  }

  if (!session) {
    return <div className="p-6 text-center text-[var(--color-danger)]">Session introuvable</div>;
  }

  const totalProduits = lignes.length + produitsNonInventories.length;
  const comptes = lignes.filter(l => l.quantite_reelle !== null && l.quantite_reelle !== undefined).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.push('/gestion/stocks/inventaire')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📋 Contrôle inventaire</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">
            Session: {session.nom || 'Sans nom'} · {comptes}/{totalProduits} produits comptés
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-[var(--color-textSecondary)]">
            {produitsNonInventories.length} produits restants
          </span>
          <button
            onClick={() => refetchLignes()}
            className="p-2 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-[var(--color-textSecondary)] mb-1">
          <span>Progression</span>
          <span>{totalProduits > 0 ? Math.round((comptes / totalProduits) * 100) : 0}%</span>
        </div>
        <div className="w-full h-2 bg-[var(--color-borderColor)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] transition-all duration-300"
            style={{ width: `${totalProduits > 0 ? (comptes / totalProduits) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire de contrôle */}
        <div className="lg:col-span-1">
          <MotionBox type="card" variant="elevated" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 flex items-center gap-2">
              <Package size={18} /> Contrôler un produit
            </h3>

            {produitsNonInventories.length === 0 ? (
              <div className="p-4 text-center text-[var(--color-success)]">
                <CheckCircle size={32} className="mx-auto mb-2" />
                <p className="font-medium">✅ Tous les produits sont contrôlés !</p>
                <p className="text-sm text-[var(--color-textSecondary)]">Vous pouvez valider la session.</p>
                <button
                  onClick={() => history.push(`/gestion/stocks/inventaire`)}
                  className="mt-3 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white"
                >
                  Retour aux sessions
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)] mb-1">
                    Rechercher un produit
                  </label>
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Nom, référence, catégorie..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)] mb-1">
                    Produit à contrôler *
                  </label>
                  <select
                    value={selectedProduitId}
                    onChange={(e) => setSelectedProduitId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                    required
                  >
                    <option value="">Sélectionner un produit</option>
                    {filteredProduits.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.nom} {p.reference ? `(Réf: ${p.reference})` : ''} - Stock: {p.quantite}
                      </option>
                    ))}
                  </select>
                  {searchTerm && filteredProduits.length === 0 && (
                    <p className="text-xs text-[var(--color-warning)] mt-1">Aucun produit trouvé</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)] mb-1">
                    Quantité réelle *
                  </label>
                  <input
                    type="number"
                    value={quantiteReelle}
                    onChange={(e) => setQuantiteReelle(parseInt(e.target.value) || 0)}
                    min={0}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedProduitId}
                  className={`w-full px-4 py-2 rounded-xl text-white ${
                    isSubmitting || !selectedProduitId
                      ? 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60'
                      : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
                  } transition`}
                >
                  {isSubmitting ? 'Enregistrement...' : '✅ Enregistrer le comptage'}
                </button>
              </form>
            )}
          </MotionBox>

          {/* Statistiques */}
          <MotionBox type="card" variant="default" className="p-4 mt-4">
            <h4 className="font-medium text-[var(--color-textPrimary)] text-sm mb-2">📊 Avancement</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 rounded bg-[var(--color-secondary)] text-center">
                <p className="text-[var(--color-textSecondary)]">Total</p>
                <p className="font-bold text-[var(--color-textPrimary)]">{totalProduits}</p>
              </div>
              <div className="p-2 rounded bg-[var(--color-success)]/10 text-center">
                <p className="text-[var(--color-textSecondary)]">Comptés</p>
                <p className="font-bold text-[var(--color-success)]">{comptes}</p>
              </div>
              <div className="p-2 rounded bg-[var(--color-warning)]/10 text-center">
                <p className="text-[var(--color-textSecondary)]">Restants</p>
                <p className="font-bold text-[var(--color-warning)]">{produitsNonInventories.length}</p>
              </div>
              <div className="p-2 rounded bg-[var(--color-danger)]/10 text-center">
                <p className="text-[var(--color-textSecondary)]">Écarts</p>
                <p className="font-bold text-[var(--color-danger)]">
                  {lignes.filter(l => l.ecart !== null && l.ecart !== undefined && l.ecart !== 0).length}
                </p>
              </div>
            </div>
          </MotionBox>
        </div>

        {/* Liste des produits contrôlés */}
        <div className="lg:col-span-2">
          <MotionBox type="card" variant="elevated" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 flex items-center gap-2">
              <Package size={18} /> Produits contrôlés
            </h3>

            {lignes.length === 0 ? (
              <p className="text-center text-[var(--color-textSecondary)] py-8">
                Aucun produit contrôlé. Commencez le comptage !
              </p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {lignes.map((ligne) => {
                  const produit = ligne.produit;
                  return (
                    <div
                      key={ligne.id}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        ligne.ecart === 0
                          ? 'border-[var(--color-success)] bg-[var(--color-success)]/5'
                          : ligne.ecart !== null && ligne.ecart !== undefined
                          ? 'border-[var(--color-danger)] bg-[var(--color-danger)]/5'
                          : 'border-[var(--color-borderColor)]'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[var(--color-textPrimary)]">
                            {produit?.nom || 'Produit inconnu'}
                          </span>
                          {produit?.reference && (
                            <span className="text-xs text-[var(--color-textSecondary)] font-mono">
                              #{produit.reference}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[var(--color-textSecondary)]">
                          <span>Théorique: {ligne.quantite_theorique}</span>
                          <span>Réel: {ligne.quantite_reelle ?? 'Non compté'}</span>
                          {ligne.ecart !== null && ligne.ecart !== undefined && (
                            <span className="font-medium">
                              Écart: {getEcartDisplay(ligne.ecart)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {ligne.ecart === 0 && (
                          <span className="text-[var(--color-success)]"><CheckCircle size={16} /></span>
                        )}
                        {ligne.ecart !== null && ligne.ecart !== undefined && ligne.ecart !== 0 && (
                          <span className="text-[var(--color-warning)]"><AlertTriangle size={16} /></span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </MotionBox>
        </div>
      </div>
    </div>
  );
};

export default ControleInventairePage;
