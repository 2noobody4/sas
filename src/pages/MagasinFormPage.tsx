import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useMagasin, useCreateMagasin, useUpdateMagasin } from '../hooks/useMagasins';
import { ArrowLeft, Save, Building, MapPin, Phone, Mail, User } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface RouteParams {
  id?: string;
}

export const MagasinFormPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const isEdit = !!id;
  const { data: magasin, isLoading: magasinLoading } = useMagasin(id);
  const createMutation = useCreateMagasin();
  const updateMutation = useUpdateMagasin();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    code: '',
    logo_url: '',
    ip_address: '',
    ip_range: '',
    ip_range_end: '',
    actif: true,
  });

  useEffect(() => {
    if (isEdit && magasin) {
      setForm({
        nom: magasin.nom,
        adresse: magasin.adresse || '',
        telephone: magasin.telephone || '',
        email: magasin.email || '',
        code: magasin.code || '',
        logo_url: magasin.logo_url || '',
        ip_address: magasin.ip_address || '',
        ip_range: magasin.ip_range || '',
        ip_range_end: magasin.ip_range_end || '',
        actif: magasin.actif,
      });
    }
  }, [isEdit, magasin]);

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
        success('Magasin mis à jour ✅');
      } else {
        await createMutation.mutateAsync(form);
        success('Magasin créé ✅');
      }
      history.push('/gestion/magasins');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isEdit && magasinLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.push('/gestion/magasins')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">
          {isEdit ? 'Modifier le magasin' : 'Nouveau magasin'}
        </h1>
      </div>

      <MotionBox type="card" variant="elevated" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Nom *</label>
              <div className="relative">
                <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  placeholder="Magasin Principal"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Code (unique)</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="M001"
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              />
            </div>
            <div>
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
                  placeholder="contact@magasin.com"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.actif}
                onChange={(e) => setForm({ ...form, actif: e.target.checked })}
                className="accent-[var(--color-primary)]"
              />
              <label className="text-sm text-[var(--color-textPrimary)]">Magasin actif</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-borderColor)]">
            <button
              type="button"
              onClick={() => history.push('/gestion/magasins')}
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

export default MagasinFormPage;
