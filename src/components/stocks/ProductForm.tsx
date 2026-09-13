import React, { useState, useEffect } from 'react';
import { MotionBox } from '../ui/MotionBox';
import { ImageUploader } from '../ui/ImageUploader';
import { CategoryQuickAdd } from './CategoryQuickAdd';
import { BarcodeScanner } from '../stock/BarcodeScanner';
import { useCreateProduit, useUpdateProduit } from '../../hooks/useProduits';
import { useCategories } from '../../hooks/useProduits';
import { useMagasins } from '../../hooks/useMagasins';
import { useEntrepots } from '../../hooks/useEntrepots';
import { useEmplacementsEntrepot } from '../../hooks/useEmplacementsEntrepot';
import { Produit, ProduitFormData } from '../../types/stock';
import { X, Plus, Scan, RefreshCw } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface ProductFormProps {
  produit?: Produit | null;
  categories: any[];
  onClose: () => void;
  onSuccess?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ produit, categories, onClose, onSuccess }) => {
  const createMutation = useCreateProduit();
  const updateMutation = useUpdateProduit();
  const { data: magasins = [] } = useMagasins();
  const { data: entrepots = [], refetch: refetchEntrepots } = useEntrepots();
  const { data: emplacements = [], refetch: refetchEmplacements } = useEmplacementsEntrepot();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedMagasinId, setSelectedMagasinId] = useState<string>('');
  const [selectedEntrepotId, setSelectedEntrepotId] = useState<string>('');

  const [form, setForm] = useState<ProduitFormData>({
    nom: '',
    description: '',
    categorie_id: '',
    prix_achat: 0,
    prix_vente: 0,
    quantite: 0,
    seuil_alerte: 5,
    unite: 'unité',
    image_url: '',
    reference: '',
    actif: true,
    magasin_id: '',
    entrepot_id: '',
    emplacement_id: '',
  });

  const [images, setImages] = useState<string[]>([]);
  const [marge, setMarge] = useState<number | string>('');
  const [benefice, setBenefice] = useState<number | string>('');

  // Rafraîchir entrepôts quand magasin change
  useEffect(() => {
    if (selectedMagasinId) refetchEntrepots();
  }, [selectedMagasinId, refetchEntrepots]);

  // Rafraîchir emplacements quand entrepôt change
  useEffect(() => {
    if (selectedEntrepotId) refetchEmplacements();
  }, [selectedEntrepotId, refetchEmplacements]);

  // Préremplir si édition
  useEffect(() => {
    if (produit) {
      setForm({
        nom: produit.nom,
        description: produit.description || '',
        categorie_id: produit.categorie_id || '',
        prix_achat: produit.prix_achat,
        prix_vente: produit.prix_vente,
        quantite: produit.quantite,
        seuil_alerte: produit.seuil_alerte,
        unite: produit.unite,
        image_url: produit.image_url || '',
        reference: produit.reference || '',
        actif: produit.actif,
        magasin_id: produit.magasin_id || '',
        entrepot_id: produit.entrepot_id || '',
        emplacement_id: produit.emplacement_id || '',
      });
      if (produit.magasin_id) setSelectedMagasinId(produit.magasin_id);
      if (produit.entrepot_id) setSelectedEntrepotId(produit.entrepot_id);
      if (produit.image_url) setImages([produit.image_url]);
      if (produit.prix_achat > 0 && produit.prix_vente > 0) {
        const benef = produit.prix_vente - produit.prix_achat;
        setBenefice(benef);
        setMarge(Math.round((benef / produit.prix_achat) * 100));
      }
    }
  }, [produit]);

  const handlePrixVenteChange = (value: number) => {
    const prixAchat = form.prix_achat;
    setForm(prev => ({ ...prev, prix_vente: value }));
    if (prixAchat > 0 && value >= 0) {
      const benef = value - prixAchat;
      setBenefice(benef);
      setMarge(Math.round((benef / prixAchat) * 100));
    } else {
      setBenefice('');
      setMarge('');
    }
  };

  const handleMargeChange = (value: number) => {
    const prixAchat = form.prix_achat;
    if (prixAchat > 0 && value >= 0) {
      const benef = (prixAchat * value) / 100;
      setBenefice(benef);
      setForm(prev => ({ ...prev, prix_vente: prixAchat + benef }));
      setMarge(value);
    } else {
      setBenefice('');
      setMarge('');
      setForm(prev => ({ ...prev, prix_vente: 0 }));
    }
  };

  const handleBeneficeChange = (value: number) => {
    const prixAchat = form.prix_achat;
    if (prixAchat > 0 && value >= 0) {
      setBenefice(value);
      const prixVente = prixAchat + value;
      setForm(prev => ({ ...prev, prix_vente: prixVente }));
      setMarge(Math.round((value / prixAchat) * 100));
    } else {
      setBenefice('');
      setMarge('');
      setForm(prev => ({ ...prev, prix_vente: 0 }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) {
      toastError('Veuillez attendre la fin du téléchargement des images.');
      return;
    }
    const prixVente = form.prix_vente;
    const margeValue = typeof marge === 'number' && marge > 0;
    const beneficeValue = typeof benefice === 'number' && benefice > 0;
    if (!prixVente && !margeValue && !beneficeValue) {
      toastError('Veuillez renseigner au moins un champ : Prix de vente, Marge ou Bénéfice net.');
      return;
    }
    setLoading(true);
    try {
      const data = { ...form, image_url: images[0] || '' };
      if (produit) {
        await updateMutation.mutateAsync({ id: produit.id, data });
        success('Produit mis à jour ✅');
      } else {
        await createMutation.mutateAsync(data);
        success('Produit créé ✅');
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toastError(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryCreated = (categoryId: string) => {
    setForm({ ...form, categorie_id: categoryId });
  };

  const handleScan = (code: string) => {
    setForm({ ...form, reference: code });
    setShowScanner(false);
  };

  const generateReference = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, reference: result });
  };

  const entrepotsFiltres = entrepots.filter((e: any) => e.magasin_id === selectedMagasinId);
  const emplacementsFiltres = emplacements.filter((e: any) => e.entrepot_id === selectedEntrepotId);

  const isSubmitting = loading || uploading;

  return (
    <>
      <MotionBox
        as="div"
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        animation={{ animationInitiale: 'fadeIn' }}
      >
        <MotionBox
          as="div"
          type="card"
          variant="elevated"
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
          animation={{ animationInitiale: 'slideUp' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[var(--color-textPrimary)]">
              {produit ? 'Modifier le produit' : 'Nouveau produit'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nom */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Nom *</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>

              {/* Catégorie */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Catégorie</label>
                <div className="flex gap-2">
                  <select
                    value={form.categorie_id}
                    onChange={(e) => setForm({ ...form, categorie_id: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  >
                    <option value="">Aucune</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="px-3 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Référence */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Référence</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.reference}
                    onChange={(e) => setForm({ ...form, reference: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                    placeholder="Code-barres ou référence"
                  />
                  <button
                    type="button"
                    onClick={generateReference}
                    className="px-3 py-2 rounded-xl bg-[var(--color-secondary)] text-[var(--color-textPrimary)]"
                  >
                    <RefreshCw size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="px-3 py-2 rounded-xl bg-[var(--color-secondary)] text-[var(--color-textPrimary)]"
                  >
                    <Scan size={18} />
                  </button>
                </div>
              </div>

              {/* Prix */}
              <div>
                <label className="block text-sm font-medium">Prix achat (FCFA)</label>
                <input
                  type="number"
                  value={form.prix_achat}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setForm({ ...form, prix_achat: val });
                    if (val === 0) { setMarge(''); setBenefice(''); }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)]"
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Prix vente (FCFA)</label>
                <input
                  type="number"
                  value={form.prix_vente}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    handlePrixVenteChange(val);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)]"
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Marge (%)</label>
                <input
                  type="number"
                  value={marge}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    handleMargeChange(val);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)]"
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Bénéfice net (FCFA)</label>
                <input
                  type="number"
                  value={benefice}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    handleBeneficeChange(val);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)]"
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Quantité</label>
                <input
                  type="number"
                  value={form.quantite}
                  onChange={(e) => setForm({ ...form, quantite: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)]"
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Seuil d'alerte</label>
                <input
                  type="number"
                  value={form.seuil_alerte}
                  onChange={(e) => setForm({ ...form, seuil_alerte: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)]"
                  min={1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Unité</label>
                <input
                  type="text"
                  value={form.unite}
                  onChange={(e) => setForm({ ...form, unite: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)]"
                  placeholder="unité, kg, litre..."
                />
              </div>

              {/* Magasin */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Magasin</label>
                <select
                  value={selectedMagasinId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedMagasinId(id);
                    setForm({ ...form, magasin_id: id, entrepot_id: '', emplacement_id: '' });
                    setSelectedEntrepotId('');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                >
                  <option value="">Sélectionner</option>
                  {magasins.filter((m: any) => m.actif).map((m: any) => (
                    <option key={m.id} value={m.id}>{m.nom}</option>
                  ))}
                </select>
              </div>

              {/* Entrepôt */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Entrepôt</label>
                <select
                  value={selectedEntrepotId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedEntrepotId(id);
                    setForm({ ...form, entrepot_id: id, emplacement_id: '' });
                  }}
                  disabled={!selectedMagasinId}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                >
                  <option value="">Sélectionner</option>
                  {entrepotsFiltres.map((e: any) => (
                    <option key={e.id} value={e.id}>{e.nom}</option>
                  ))}
                </select>
              </div>

              {/* Emplacement */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Emplacement</label>
                <select
                  value={form.emplacement_id}
                  onChange={(e) => setForm({ ...form, emplacement_id: e.target.value })}
                  disabled={!selectedEntrepotId}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                >
                  <option value="">Sélectionner</option>
                  {emplacementsFiltres.map((e: any) => (
                    <option key={e.id} value={e.id}>{e.nom}</option>
                  ))}
                </select>
              </div>

              {/* Images */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Images</label>
                <ImageUploader
                  images={images}
                  onChange={setImages}
                  max={5}
                  onUploadingChange={setUploading}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-borderColor)]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-xl text-white ${
                  isSubmitting
                    ? 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60'
                    : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
                } transition`}
              >
                {isSubmitting ? (uploading ? 'Upload...' : 'Enregistrement...') : (produit ? 'Mettre à jour' : 'Créer')}
              </button>
            </div>
          </form>
        </MotionBox>
      </MotionBox>

      <CategoryQuickAdd
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={handleCategoryCreated}
      />

      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
};

export default ProductForm;
