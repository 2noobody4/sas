import React, { useState, useEffect } from 'react';
import { MotionBox } from '../../components/ui/MotionBox';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { CategoryQuickAdd } from '../../components/stocks/CategoryQuickAdd';
import { BarcodeScanner } from '../../components/stock/BarcodeScanner';
import { useCreateProduit, useUpdateProduit } from '../../hooks/useProduits';
import { Produit, ProduitFormData } from '../../types/stock';
import { X, Plus, Scan, RefreshCw } from 'lucide-react';

interface ProductFormProps {
  produit?: Produit | null;
  categories: any[];
  onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ produit, categories, onClose }) => {
  const createMutation = useCreateProduit();
  const updateMutation = useUpdateProduit();
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

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
  });

  const [images, setImages] = useState<string[]>([]);

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
      });
      if (produit.image_url) {
        setImages([produit.image_url]);
      }
    }
  }, [produit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, image_url: images[0] || '' };
      if (produit) {
        await updateMutation.mutateAsync({ id: produit.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (err) {}
    finally { setLoading(false); }
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
            <button onClick={onClose} className="p-1 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]">
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

              {/* Catégorie avec bouton + rapide */}
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
                    className="px-3 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition flex items-center gap-1"
                    title="Ajouter une catégorie"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Référence avec scanner + générateur */}
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
                    className="px-3 py-2 rounded-xl bg-[var(--color-secondary)] text-[var(--color-textPrimary)] hover:bg-[var(--color-borderColor)] transition flex items-center gap-1"
                    title="Générer une référence automatique"
                  >
                    <RefreshCw size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="px-3 py-2 rounded-xl bg-[var(--color-secondary)] text-[var(--color-textPrimary)] hover:bg-[var(--color-borderColor)] transition flex items-center gap-1"
                    title="Scanner un code-barres / QR code"
                  >
                    <Scan size={18} />
                  </button>
                </div>
              </div>

              {/* Prix */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Prix achat (FCFA)</label>
                <input
                  type="number"
                  value={form.prix_achat}
                  onChange={(e) => setForm({ ...form, prix_achat: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Prix vente (FCFA)</label>
                <input
                  type="number"
                  value={form.prix_vente}
                  onChange={(e) => setForm({ ...form, prix_vente: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  min={0}
                  required
                />
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Quantité</label>
                <input
                  type="number"
                  value={form.quantite}
                  onChange={(e) => setForm({ ...form, quantite: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Seuil d'alerte</label>
                <input
                  type="number"
                  value={form.seuil_alerte}
                  onChange={(e) => setForm({ ...form, seuil_alerte: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  min={1}
                />
              </div>

              {/* Unité */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Unité</label>
                <input
                  type="text"
                  value={form.unite}
                  onChange={(e) => setForm({ ...form, unite: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  placeholder="unité, kg, litre..."
                />
              </div>

              {/* Images */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--color-textPrimary)] mb-2">Images</label>
                <ImageUploader
                  images={images}
                  onChange={setImages}
                  max={5}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
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
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white"
              >
                {loading ? 'Enregistrement...' : (produit ? 'Mettre à jour' : 'Créer')}
              </button>
            </div>
          </form>
        </MotionBox>
      </MotionBox>

      {/* Pop-up catégorie */}
      <CategoryQuickAdd
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={handleCategoryCreated}
      />

      {/* Scanner */}
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
