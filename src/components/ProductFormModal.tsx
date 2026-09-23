import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { ImageUploader } from './ImageUploader';
import { CategoryQuickAdd } from './CategoryQuickAdd';
import { BarcodeScanner } from './BarcodeScanner';
import { useCreateProduit } from '../hooks/useProduits';
import { useCategories } from '../hooks/useProduits';
import { useMagasins } from '../hooks/useMagasins';
import { useEntrepots } from '../hooks/useEntrepots';
import { useEmplacementsEntrepot } from '../hooks/useEmplacementsEntrepot';
import { ProduitFormData } from '../types/stock';
import { Package, DollarSign, AlertTriangle, RefreshCw, Scan, Plus } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const createMutation = useCreateProduit();
  const { data: categories = [] } = useCategories();
  const { data: magasins = [] } = useMagasins();
  const { data: entrepots = [], refetch: refetchEntrepots } = useEntrepots();
  const { data: emplacements = [], refetch: refetchEmplacements } = useEmplacementsEntrepot();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMagasinId, setSelectedMagasinId] = useState<string>('');
  const [selectedEntrepotId, setSelectedEntrepotId] = useState<string>('');

  const [nom, setNom] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categorieId, setCategorieId] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [prixAchat, setPrixAchat] = useState<string>('0');
  const [prixVente, setPrixVente] = useState<string>('0');
  const [marge, setMarge] = useState<string>('');
  const [benefice, setBenefice] = useState<string>('');
  const [quantite, setQuantite] = useState<string>('0');
  const [seuilAlerte, setSeuilAlerte] = useState<string>('5');
  const [unite, setUnite] = useState<string>('unité');
  const [images, setImages] = useState<string[]>([]);
  const [magasinId, setMagasinId] = useState<string>('');
  const [entrepotId, setEntrepotId] = useState<string>('');
  const [emplacementId, setEmplacementId] = useState<string>('');

  useEffect(() => {
    if (selectedMagasinId) refetchEntrepots();
  }, [selectedMagasinId, refetchEntrepots]);

  useEffect(() => {
    if (selectedEntrepotId) refetchEmplacements();
  }, [selectedEntrepotId, refetchEmplacements]);

  const prixAchatNum = parseFloat(prixAchat) || 0;
  const prixVenteNum = parseFloat(prixVente) || 0;
  const quantiteNum = parseInt(quantite, 10) || 0;
  const seuilAlerteNum = parseInt(seuilAlerte, 10) || 0;
  const valeurStock = prixAchatNum * quantiteNum;
  const montantResiduel = prixAchatNum * seuilAlerteNum;

  useEffect(() => {
    if (prixAchatNum > 0 && prixVenteNum > 0) {
      const benef = prixVenteNum - prixAchatNum;
      setBenefice(benef.toString());
      setMarge(Math.round((benef / prixAchatNum) * 100).toString());
    } else if (prixAchatNum > 0 && prixVenteNum === 0) {
      setBenefice('');
      setMarge('');
    }
  }, [prixAchat, prixVente]);

  const handlePrixVenteChange = (value: string) => {
    setPrixVente(value);
    const val = parseFloat(value) || 0;
    if (prixAchatNum > 0 && val > 0) {
      const benef = val - prixAchatNum;
      setBenefice(benef.toString());
      setMarge(Math.round((benef / prixAchatNum) * 100).toString());
    } else {
      setBenefice('');
      setMarge('');
    }
  };

  const handleMargeChange = (value: string) => {
    setMarge(value);
    const val = parseFloat(value) || 0;
    if (prixAchatNum > 0 && val > 0) {
      const benef = (prixAchatNum * val) / 100;
      setBenefice(benef.toString());
      setPrixVente((prixAchatNum + benef).toString());
    } else {
      setBenefice('');
      setPrixVente(prixAchatNum.toString());
    }
  };

  const handleBeneficeChange = (value: string) => {
    setBenefice(value);
    const val = parseFloat(value) || 0;
    if (prixAchatNum > 0 && val > 0) {
      setPrixVente((prixAchatNum + val).toString());
      setMarge(Math.round((val / prixAchatNum) * 100).toString());
    } else {
      setPrixVente(prixAchatNum.toString());
      setMarge('');
    }
  };

  const generateReference = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setReference(result);
  };

  const handleScan = (code: string) => {
    setReference(code);
    setShowScanner(false);
  };

  const handleCategoryCreated = (categoryId: string) => {
    setCategorieId(categoryId);
  };

  const validate = (): boolean => {
    if (!nom.trim()) {
      setError('Le nom du produit est obligatoire');
      return false;
    }
    if (quantiteNum < 0) {
      setError('La quantité ne peut pas être négative');
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
    if (seuilAlerteNum > quantiteNum + 1) {
      setError(`Le seuil d'alerte (${seuilAlerteNum}) ne peut pas dépasser la quantité (${quantiteNum})`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploading) {
      toastError('Veuillez attendre la fin du téléchargement des images.');
      return;
    }

    if (!validate()) return;

    const formData: ProduitFormData = {
      nom: nom.trim(),
      description: description.trim() || undefined,
      categorie_id: categorieId || undefined,
      reference: reference.trim() || undefined,
      prix_achat: prixAchatNum,
      prix_vente: prixVenteNum,
      quantite: quantiteNum,
      seuil_alerte: seuilAlerteNum,
      unite: unite.trim() || 'unité',
      image_url: images[0] || '',
      actif: true,
      magasin_id: magasinId || undefined,
      entrepot_id: entrepotId || undefined,
      emplacement_id: emplacementId || undefined,
    };

    setLoading(true);
    try {
      await createMutation.mutateAsync(formData);
      success('Produit créé avec succès ✅');
      setNom('');
      setDescription('');
      setCategorieId('');
      setReference('');
      setPrixAchat('0');
      setPrixVente('0');
      setMarge('');
      setBenefice('');
      setQuantite('0');
      setSeuilAlerte('5');
      setUnite('unité');
      setImages([]);
      setMagasinId('');
      setEntrepotId('');
      setEmplacementId('');
      setSelectedMagasinId('');
      setSelectedEntrepotId('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toastError(err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const entrepotsFiltres = entrepots.filter((e: any) => e.magasin_id === selectedMagasinId);
  const emplacementsFiltres = emplacements.filter((e: any) => e.entrepot_id === selectedEntrepotId);

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
        disabled={loading || uploading}
        className={`px-4 py-2 rounded-xl text-white flex items-center gap-2 ${
          loading || uploading
            ? 'bg-gray-300 cursor-not-allowed opacity-60'
            : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
        } transition`}
      >
        {loading ? 'En cours...' : uploading ? 'Upload en cours...' : (
          <>
            <Plus size={18} /> Créer le produit
          </>
        )}
      </button>
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Nouveau produit"
        subtitle="Ajouter un produit au catalogue"
        icon={<Package size={24} />}
        maxWidth="2xl"
        maxHeight="70vh"
        showFooter={true}
        footer={footer}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nom du produit *</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="ex: Pantalon Jean Bleu"
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
              />
            </div>

            {/* Catégorie */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Catégorie</label>
              <div className="flex gap-2">
                <select
                  value={categorieId}
                  onChange={(e) => setCategorieId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
                >
                  <option value="">Aucune catégorie</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="px-3 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition flex items-center gap-1"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Référence */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Référence</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Code-barres ou référence"
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
                />
                <button
                  type="button"
                  onClick={generateReference}
                  className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center gap-1"
                >
                  <RefreshCw size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center gap-1"
                >
                  <Scan size={18} />
                </button>
              </div>
            </div>

            {/* Prix et marge */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} className="text-[var(--color-primary)]" />
                <span className="font-medium text-gray-700">Prix et marge</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500">Prix achat (FCFA)</label>
                  <input
                    type="number"
                    value={prixAchat}
                    onChange={(e) => {
                      setPrixAchat(e.target.value);
                      if (parseFloat(e.target.value) === 0) {
                        setMarge('');
                        setBenefice('');
                      }
                    }}
                    min={0}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Prix vente (FCFA)</label>
                  <input
                    type="number"
                    value={prixVente}
                    onChange={(e) => handlePrixVenteChange(e.target.value)}
                    min={0}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Marge (%)</label>
                  <input
                    type="number"
                    value={marge}
                    onChange={(e) => handleMargeChange(e.target.value)}
                    min={0}
                    placeholder="Auto"
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Bénéfice net (FCFA)</label>
                  <input
                    type="number"
                    value={benefice}
                    onChange={(e) => handleBeneficeChange(e.target.value)}
                    min={0}
                    placeholder="Auto"
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
            {/* Stock */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={18} className="text-[var(--color-primary)]" />
                <span className="font-medium text-gray-700">Stock</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500">Quantité</label>
                  <input
                    type="number"
                    value={quantite}
                    onChange={(e) => setQuantite(e.target.value)}
                    min={0}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Seuil d'alerte</label>
                  <input
                    type="number"
                    value={seuilAlerte}
                    onChange={(e) => setSeuilAlerte(e.target.value)}
                    min={0}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-gray-900"
                  />
                  <span className="text-[10px] text-gray-400">≤ {quantiteNum + 1}</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Valeur du stock</label>
                  <input
                    type="text"
                    value={valeurStock.toLocaleString()}
                    disabled
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed opacity-70"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Montant résiduel</label>
                  <input
                    type="text"
                    value={montantResiduel.toLocaleString()}
                    disabled
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed opacity-70"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Unité</label>
                  <input
                    type="text"
                    value={unite}
                    onChange={(e) => setUnite(e.target.value)}
                    placeholder="unité, kg, litre..."
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Magasin */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Magasin</label>
              <select
                value={selectedMagasinId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedMagasinId(id);
                  setMagasinId(id);
                  setEntrepotId('');
                  setEmplacementId('');
                  setSelectedEntrepotId('');
                }}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900"
              >
                <option value="">Sélectionner</option>
                {magasins.filter((m: any) => m.actif).map((m: any) => (
                  <option key={m.id} value={m.id}>{m.nom}</option>
                ))}
              </select>
            </div>

            {/* Entrepôt */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Entrepôt</label>
              <select
                value={selectedEntrepotId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedEntrepotId(id);
                  setEntrepotId(id);
                  setEmplacementId('');
                }}
                disabled={!selectedMagasinId}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Sélectionner</option>
                {entrepotsFiltres.map((e: any) => (
                  <option key={e.id} value={e.id}>{e.nom}</option>
                ))}
              </select>
            </div>

            {/* Emplacement */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Emplacement</label>
              <select
                value={emplacementId}
                onChange={(e) => setEmplacementId(e.target.value)}
                disabled={!selectedEntrepotId}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Sélectionner</option>
                {emplacementsFiltres.map((e: any) => (
                  <option key={e.id} value={e.id}>{e.nom}</option>
                ))}
              </select>
            </div>

            {/* Images */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
              <ImageUploader
                images={images}
                onChange={setImages}
                max={5}
                onUploadingChange={setUploading}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du produit (optionnel)"
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
              />
            </div>

            {error && (
              <div className="p-2 rounded-xl bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}
          </div>
        </form>
      </Modal>

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

export default ProductFormModal;
