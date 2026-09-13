// ============================================================
// SERVICE FORM PAGE - Création/Modification de service
// Version V3 - Compatible React 16
// ============================================================

import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { MotionBox } from '../../../components/ui/MotionBox';
import { ImageUploader } from '../../../components/ui/ImageUploader';
import { useService, useCreateService, useUpdateService } from '../../../hooks/useServices';
import { useAttributsService } from '../../../hooks/useAttributsService';
import { useCategories } from '../../../hooks/useProduits';
import { ArrowLeft, Save, X, Plus, Check, Briefcase, Tag, DollarSign, Clock } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';

interface RouteParams {
  id?: string;
}

export const ServiceFormPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const isEdit = !!id;

  const { data: service, isLoading: serviceLoading } = useService(id);
  const { data: attributs = [] } = useAttributsService();
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    nom: '',
    disponible: true,
    descriptif: '',
    prix: 0,
    informations_requises: [] as string[],
    image_url: '',
    categorie_id: '',
    duree: '',
  });

  useEffect(() => {
    if (isEdit && service) {
      setForm({
        nom: service.nom,
        disponible: service.disponible,
        descriptif: service.descriptif || '',
        prix: service.prix,
        informations_requises: service.informations_requises || [],
        image_url: service.image_url || '',
        categorie_id: service.categorie_id || '',
        duree: service.duree || '',
      });
      if (service.image_url) setImages([service.image_url]);
    }
  }, [isEdit, service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) {
      toastError('Le nom est obligatoire');
      return;
    }
    if (form.prix < 0) {
      toastError('Le prix ne peut pas être négatif');
      return;
    }
    setLoading(true);
    try {
      const data = { ...form, image_url: images[0] || '' };
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data });
        success('Service mis à jour ✅');
      } else {
        await createMutation.mutateAsync(data);
        success('Service créé ✅');
      }
      history.push('/gestion/services');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttribut = (attributId: string) => {
    setForm(prev => ({
      ...prev,
      informations_requises: prev.informations_requises.includes(attributId)
        ? prev.informations_requises.filter(id => id !== attributId)
        : [...prev.informations_requises, attributId]
    }));
  };

  if (isEdit && serviceLoading) {
    return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.push('/gestion/services')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">
          {isEdit ? 'Modifier le service' : 'Nouveau service'}
        </h1>
        <span className="ml-auto text-sm text-[var(--color-textSecondary)]">
          {isEdit ? 'Service existant' : 'Création'}
        </span>
      </div>

      <MotionBox type="card" variant="elevated" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Nom du service *</label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="Ex: Consulting RH, Audit comptable, etc."
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                required
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Catégorie</label>
              <select
                value={form.categorie_id}
                onChange={(e) => setForm({ ...form, categorie_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              >
                <option value="">Sans catégorie</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>

            {/* Durée */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Durée estimée</label>
              <div className="relative">
                <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                <input
                  type="text"
                  value={form.duree}
                  onChange={(e) => setForm({ ...form, duree: e.target.value })}
                  placeholder="Ex: 2 jours, 1 semaine"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>
            </div>

            {/* Prix */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Prix (FCFA) *</label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                <input
                  type="number"
                  value={form.prix}
                  onChange={(e) => setForm({ ...form, prix: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step={1000}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  required
                />
              </div>
            </div>

            {/* Disponible */}
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                checked={form.disponible}
                onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
                className="accent-[var(--color-primary)]"
              />
              <label className="text-sm font-medium text-[var(--color-textPrimary)]">Service disponible</label>
            </div>

            {/* Descriptif */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Descriptif *</label>
              <textarea
                value={form.descriptif}
                onChange={(e) => setForm({ ...form, descriptif: e.target.value })}
                rows={4}
                placeholder="Description détaillée du service..."
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                required
              />
            </div>

            {/* Image */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Image du service</label>
              <ImageUploader
                images={images}
                onChange={setImages}
                max={1}
                bucket="services"
                label="Ajouter une image"
              />
            </div>

            {/* Attributs requis */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-textPrimary)] mb-2">
                📋 Informations requises
              </label>
              <p className="text-sm text-[var(--color-textSecondary)] mb-3">
                Sélectionnez les informations à demander au client lors de la demande de service.
              </p>
              {attributs.length === 0 ? (
                <div className="p-4 rounded-xl bg-[var(--color-secondary)] text-center text-[var(--color-textSecondary)]">
                  <p>Aucun attribut disponible.</p>
                  <button
                    type="button"
                    onClick={() => history.push('/gestion/services/attributs')}
                    className="mt-2 text-[var(--color-primary)] hover:underline"
                  >
                    Gérer les attributs →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attributs.map((attr) => {
                    const isSelected = form.informations_requises.includes(attr.id);
                    return (
                      <label
                        key={attr.id}
                        className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                            : 'border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleAttribut(attr.id)}
                          className="accent-[var(--color-primary)]"
                        />
                        <div>
                          <span className="font-medium text-[var(--color-textPrimary)]">{attr.nom}</span>
                          <span className="ml-2 text-xs text-[var(--color-textSecondary)]">
                            ({attr.type}) {attr.obligatoire && '• Obligatoire'}
                          </span>
                        </div>
                        {isSelected && <Check size={16} className="ml-auto text-[var(--color-primary)]" />}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-borderColor)]">
            <button
              type="button"
              onClick={() => history.push('/gestion/services')}
              className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-white flex items-center gap-2 ${
                loading
                  ? 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60'
                  : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
              }`}
            >
              {loading ? 'Enregistrement...' : <><Save size={18} /> {isEdit ? 'Mettre à jour' : 'Créer'}</>}
            </button>
          </div>
        </form>
      </MotionBox>
    </div>
  );
};

export default ServiceFormPage;
