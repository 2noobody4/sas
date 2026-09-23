import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useEmplacementsEntrepot, useCreateEmplacementEntrepot, useUpdateEmplacementEntrepot, useDeleteEmplacementEntrepot } from '../hooks/useEmplacementsEntrepot';
import { useEntrepot } from '../hooks/useEntrepots';
import { ArrowLeft, Plus, Edit, Trash2, Layers, X, Save, MapPin, Hash, Package } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface RouteParams {
  id: string;
}

export const EmplacementsPage: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  const { data: entrepot, isLoading: entrepotLoading } = useEntrepot(id);
  const { data: emplacements = [], isLoading, refetch } = useEmplacementsEntrepot(id);
  const createMutation = useCreateEmplacementEntrepot();
  const updateMutation = useUpdateEmplacementEntrepot();
  const deleteMutation = useDeleteEmplacementEntrepot();
  const { success, error: toastError } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    nom: '',
    code: '',
    salle: '',
    etage: '',
    etagere: '',
    description: '',
    capacite: '',
    actif: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) {
      toastError('Le nom est obligatoire');
      return;
    }
    try {
      const data = {
        entrepot_id: id,
        nom: form.nom,
        code: form.code || undefined,
        salle: form.salle || undefined,
        etage: form.etage || undefined,
        etagere: form.etagere || undefined,
        description: form.description || undefined,
        capacite: form.capacite ? parseInt(form.capacite) : undefined,
        actif: form.actif,
      };
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data });
        success('Emplacement mis à jour ✅');
      } else {
        await createMutation.mutateAsync(data);
        success('Emplacement créé ✅');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ nom: '', code: '', salle: '', etage: '', etagere: '', description: '', capacite: '', actif: true });
      refetch();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer cet emplacement ?')) {
      await deleteMutation.mutateAsync(id);
      refetch();
    }
  };

  const handleEdit = (emplacement: any) => {
    setEditing(emplacement);
    setForm({
      nom: emplacement.nom,
      code: emplacement.code || '',
      salle: emplacement.salle || '',
      etage: emplacement.etage || '',
      etagere: emplacement.etagere || '',
      description: emplacement.description || '',
      capacite: emplacement.capacite || '',
      actif: emplacement.actif,
    });
    setShowForm(true);
  };

  if (entrepotLoading || isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  if (!entrepot) return <div className="p-6 text-center text-[var(--color-danger)]">Entrepôt introuvable</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => history.push(`/gestion/entrepots/${id}`)} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[var(--color-textPrimary)] flex items-center gap-2 truncate">
            <Layers size={24} className="text-[var(--color-primary)] flex-shrink-0" />
            <span className="truncate">Emplacements – {entrepot.nom}</span>
          </h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Gestion des emplacements de l'entrepôt</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm({ nom: '', code: '', salle: '', etage: '', etagere: '', description: '', capacite: '', actif: true }); setShowForm(true); }}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2 hover:bg-[var(--color-primary-dark)] transition flex-shrink-0"
        >
          <Plus size={18} /> Ajouter
        </button>
      </div>

      {/* Liste des emplacements */}
      {emplacements.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Aucun emplacement. Ajoutez votre premier emplacement !
        </MotionBox>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {emplacements.map((e: any) => (
            <MotionBox key={e.id} type="card" variant="default" className="p-3 hover:shadow-lg transition overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <MapPin size={16} className="text-[var(--color-primary)] flex-shrink-0" />
                    <h3 className="font-semibold text-[var(--color-textPrimary)] truncate">{e.nom}</h3>
                  </div>
                  {e.code && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-secondary)] text-[var(--color-textSecondary)] inline-block mt-1">
                      <Hash size={10} className="inline mr-1" /> {e.code}
                    </span>
                  )}
                  <div className="mt-1 space-y-0.5 text-sm text-[var(--color-textSecondary)]">
                    {e.salle && <div className="truncate">Salle: {e.salle}</div>}
                    {e.etage && <div className="truncate">Étage: {e.etage}</div>}
                    {e.etagere && <div className="truncate">Étagère: {e.etagere}</div>}
                    {e.capacite && (
                      <div className="flex items-center gap-1">
                        <Package size={14} className="flex-shrink-0" /> Capacité: {e.capacite}
                      </div>
                    )}
                    {e.description && <div className="text-xs opacity-70 truncate">{e.description}</div>}
                  </div>
                  <div className="mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      e.actif ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' :
                      'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
                    }`}>
                      {e.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0 ml-2">
                  <button onClick={() => handleEdit(e)} className="p-1 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(e.id)} className="p-1 rounded hover:bg-red-50 text-[var(--color-danger)]">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </MotionBox>
          ))}
        </div>
      )}

      {/* Modal formulaire */}
      {showForm && (
        <MotionBox
          as="div"
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] modal-overlay-safe"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          animation={{ animationInitiale: 'fadeIn' }}
        >
          <MotionBox
            as="div"
            type="card"
            variant="xlarge"
            className="w-full max-w-md p-6 bg-[var(--color-cardBg)] rounded-2xl shadow-2xl modal-content-safe overflow-y-auto"
            animation={{ animationInitiale: 'slideUp' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--color-textPrimary)]">
                {editing ? 'Modifier l\'emplacement' : 'Nouvel emplacement'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-[var(--color-textSecondary)]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Nom *</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  placeholder="Zone A, Allée 3, etc."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Code</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="Z-A-3"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Salle</label>
                  <input
                    type="text"
                    value={form.salle}
                    onChange={(e) => setForm({ ...form, salle: e.target.value })}
                    placeholder="A1"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Étage</label>
                  <input
                    type="text"
                    value={form.etage}
                    onChange={(e) => setForm({ ...form, etage: e.target.value })}
                    placeholder="1"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Étagère</label>
                <input
                  type="text"
                  value={form.etagere}
                  onChange={(e) => setForm({ ...form, etagere: e.target.value })}
                  placeholder="B3"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Capacité</label>
                <input
                  type="number"
                  value={form.capacite}
                  onChange={(e) => setForm({ ...form, capacite: e.target.value })}
                  placeholder="100"
                  min="0"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Informations supplémentaires..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.actif}
                  onChange={(e) => setForm({ ...form, actif: e.target.checked })}
                  className="accent-[var(--color-primary)]"
                />
                <label className="text-sm text-[var(--color-textPrimary)]">Emplacement actif</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-borderColor)]">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
                >
                  <Save size={18} /> {editing ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </MotionBox>
        </MotionBox>
      )}
    </div>
  );
};

export default EmplacementsPage;
