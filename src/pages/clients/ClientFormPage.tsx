import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { useClient, useCreateClient, useUpdateClient } from '../../hooks/useClients';
import { TypeClient, SegmentClient } from '../../types/clients';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Building, Tag } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface RouteParams {
  id?: string;
}

export const ClientFormPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const isEdit = !!id;
  const { data: client, isLoading: clientLoading } = useClient(id);
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    pays: 'Sénégal',
    type: 'particulier' as TypeClient,
    segment: 'C' as SegmentClient,
    notes: '',
  });

  useEffect(() => {
    if (isEdit && client) {
      setForm({
        nom: client.nom,
        prenom: client.prenom || '',
        email: client.email || '',
        telephone: client.telephone || '',
        adresse: client.adresse || '',
        ville: client.ville || '',
        pays: client.pays || 'Sénégal',
        type: client.type,
        segment: client.segment,
        notes: client.notes || '',
      });
    }
  }, [isEdit, client]);

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
        success('Client mis à jour ✅');
      } else {
        await createMutation.mutateAsync(form);
        success('Client créé ✅');
      }
      history.push('/gestion/clients/liste');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isEdit && clientLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.push('/gestion/clients/liste')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">
          {isEdit ? 'Modifier le client' : 'Nouveau client'}
        </h1>
      </div>

      <MotionBox type="card" variant="elevated" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Nom *</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  placeholder="Nom du client"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Prénom</label>
              <input
                type="text"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                placeholder="Prénom"
                className="w-full px-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@exemple.com"
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
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Ville</label>
              <input
                type="text"
                value={form.ville}
                onChange={(e) => setForm({ ...form, ville: e.target.value })}
                placeholder="Ville"
                className="w-full px-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Pays</label>
              <input
                type="text"
                value={form.pays}
                onChange={(e) => setForm({ ...form, pays: e.target.value })}
                placeholder="Pays"
                className="w-full px-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Type</label>
              <div className="relative">
                <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as TypeClient })}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                >
                  <option value="particulier">Particulier</option>
                  <option value="entreprise">Entreprise</option>
                  <option value="association">Association</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Segment</label>
              <div className="relative">
                <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                <select
                  value={form.segment}
                  onChange={(e) => setForm({ ...form, segment: e.target.value as SegmentClient })}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                >
                  <option value="A">A – VIP</option>
                  <option value="B">B – Actif</option>
                  <option value="C">C – Occasionnel</option>
                  <option value="D">D – Inactif</option>
                </select>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Informations complémentaires..."
                className="w-full px-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-borderColor)]">
            <button
              type="button"
              onClick={() => history.push('/gestion/clients/liste')}
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

export default ClientFormPage;
