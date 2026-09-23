import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useEntrepot, useCreateEntrepot, useUpdateEntrepot } from '../hooks/useEntrepots';
import { ArrowLeft, Save, Building, MapPin, Phone, Mail, User, Layers } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface RouteParams {
  id?: string;
}

export const EntrepotFormPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const isEdit = !!id;
  const { data: entrepot, isLoading: entrepotLoading } = useEntrepot(id);
  const createMutation = useCreateEntrepot();
  const updateMutation = useUpdateEntrepot();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    responsable: '',
    magasin_id: '',
    salle: '',
    etage: '',
    etagere: '',
    emplacement: '',
    actif: true,
  });

  useEffect(() => {
    if (isEdit && entrepot) {
      setForm({
        nom: entrepot.nom,
        adresse: entrepot.adresse || '',
        telephone: entrepot.telephone || '',
        email: entrepot.email || '',
        responsable: entrepot.responsable || '',
        magasin_id: entrepot.magasin_id || '',
        salle: entrepot.salle || '',
        etage: entrepot.etage || '',
        etagere: entrepot.etagere || '',
        emplacement: entrepot.emplacement || '',
        actif: entrepot.actif,
      });
    }
  }, [isEdit, entrepot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) {
      toastError('Le nom est obligatoire');
      return;
    }
    setLoading(true);
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data: form });
        success('Entrepôt mis à jour ✅');
      } else {
        await createMutation.mutateAsync(form);
        success('Entrepôt créé ✅');
      }
      history.push('/gestion/entrepots');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isEdit && entrepotLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.push('/gestion/entrepots')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">
          {isEdit ? 'Modifier l\'entrepôt' : 'Nouvel entrepôt'}
        </h1>
      </div>

      <MotionBox type="card" variant="elevated" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Nom *</label>
              <div className="relative">
                <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  placeholder="Entrepôt principal"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  required
                />
              </div>
            </div>

            {/* Adresse */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Adresse</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-3 text-[var(--color-textSecondary)]" />
                <textarea
                  value={form.adresse}
                  onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                  rows={2}
                  placeholder="Adresse complète"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Téléphone</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                <input
                  type="text"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  placeholder="77 123 45 67"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@entrepot.com"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Responsable</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                <input
                  type="text"
                  value={form.responsable}
                  onChange={(e) => setForm({ ...form, responsable: e.target.value })}
                  placeholder="Nom du responsable"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>
            </div>

            {/* Emplacement */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <Layers size={18} className="text-[var(--color-primary)]" />
                <span className="font-medium text-[var(--color-textPrimary)]">Emplacement physique</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Salle</label>
                  <input
                    type="text"
                    value={form.salle}
                    onChange={(e) => setForm({ ...form, salle: e.target.value })}
                    placeholder="A1"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Étage</label>
                  <input
                    type="text"
                    value={form.etage}
                    onChange={(e) => setForm({ ...form, etage: e.target.value })}
                    placeholder="1"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Étagère</label>
                  <input
                    type="text"
                    value={form.etagere}
                    onChange={(e) => setForm({ ...form, etagere: e.target.value })}
                    placeholder="B3"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Emplacement</label>
                  <input
                    type="text"
                    value={form.emplacement}
                    onChange={(e) => setForm({ ...form, emplacement: e.target.value })}
                    placeholder="Zone 4"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  />
                </div>
              </div>
              <p className="text-[10px] text-[var(--color-textSecondary)] mt-1">
                Renseignez les informations pour localiser précisément l'entrepôt.
              </p>
            </div>

            {/* Actif */}
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.actif}
                onChange={(e) => setForm({ ...form, actif: e.target.checked })}
                className="accent-[var(--color-primary)]"
              />
              <label className="text-sm text-[var(--color-textPrimary)]">Entrepôt actif</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-borderColor)]">
            <button
              type="button"
              onClick={() => history.push('/gestion/entrepots')}
              className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-white ${
                loading ? 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
              } flex items-center gap-2`}
            >
              {loading ? 'Enregistrement...' : <><Save size={18} /> {isEdit ? 'Mettre à jour' : 'Créer'}</>}
            </button>
          </div>
        </form>
      </MotionBox>
    </div>
  );
};

export default EntrepotFormPage;
