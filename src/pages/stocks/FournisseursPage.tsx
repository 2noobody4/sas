import { CachedImage } from "../../components/ui/CachedImage";
import React, { useState } from 'react';
import { MotionBox } from '../../components/ui/MotionBox';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { UploadDocument } from '../../components/ui/UploadDocument';
import { useFournisseurs, useCreateFournisseur, useUpdateFournisseur, useDeleteFournisseur } from '../../hooks/useFournisseurs';
import { Fournisseur } from '../../types/stock';
import { Plus, Edit, Trash2, Building, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export const FournisseursPage: React.FC = () => {
  const { data: fournisseurs = [], isLoading, refetch } = useFournisseurs();
  const createMutation = useCreateFournisseur();
  const updateMutation = useUpdateFournisseur();
  const deleteMutation = useDeleteFournisseur();
  const { success, error: toastError } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Fournisseur | null>(null);
  const [form, setForm] = useState({
    nom: '',
    contact: '',
    email: '',
    adresse: '',
    image_url: '',
    contrats: [] as string[],
    actif: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: form });
      } else {
        await createMutation.mutateAsync(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ nom: '', contact: '', email: '', adresse: '', image_url: '', contrats: [], actif: true });
      refetch();
      success(editing ? 'Fournisseur mis à jour ✅' : 'Fournisseur créé ✅');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleEdit = (f: Fournisseur) => {
    setEditing(f);
    setForm({
      nom: f.nom,
      contact: f.contact || '',
      email: f.email || '',
      adresse: f.adresse || '',
      image_url: f.image_url || '',
      contrats: f.contrats || [],
      actif: f.actif,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce fournisseur ?')) {
      await deleteMutation.mutateAsync(id);
      refetch();
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  }

  return (
    <MotionBox as="div" type="page" variant="default" className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)] flex items-center gap-2">
            🏢 Fournisseurs
          </h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Gestion des fournisseurs</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm({ nom: '', contact: '', email: '', adresse: '', image_url: '', contrats: [], actif: true }); setShowForm(true); }}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
        >
          <Plus size={18} /> Nouveau fournisseur
        </button>
      </div>

      {fournisseurs.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Aucun fournisseur.
        </MotionBox>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fournisseurs.map((f: Fournisseur) => (
            <MotionBox key={f.id} type="card" variant="default" className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {f.image_url ? (
                    <img
                      src={f.image_url}
                      alt={f.nom}
                      className="w-12 h-12 rounded object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="p-2 rounded-lg bg-[var(--color-secondary)]">
                      <Building size={24} className="text-[var(--color-primary)]" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-[var(--color-textPrimary)]">{f.nom}</p>
                    {f.contact && <p className="text-sm text-[var(--color-textSecondary)]">Contact: {f.contact}</p>}
                    {f.email && <p className="text-sm text-[var(--color-textSecondary)]">{f.email}</p>}
                    {f.adresse && <p className="text-sm text-[var(--color-textSecondary)]">{f.adresse}</p>}
                    {f.contrats && f.contrats.length > 0 && (
                      <p className="text-xs text-[var(--color-textSecondary)] mt-1">
                        📄 {f.contrats.length} contrat{f.contrats.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(f)}
                    className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </MotionBox>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <MotionBox
          as="div"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          animation={{ animationInitiale: 'fadeIn' }}
        >
          <MotionBox
            as="div"
            type="card"
            variant="elevated"
            className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
            animation={{ animationInitiale: 'slideUp' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--color-textPrimary)]">
                {editing ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
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
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Contact</label>
                <input
                  type="text"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Adresse</label>
                <textarea
                  value={form.adresse}
                  onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Image (optionnelle)</label>
                <ImageUploader
                  images={form.image_url ? [form.image_url] : []}
                  onChange={(urls) => setForm({ ...form, image_url: urls[0] || '' })}
                  max={1}
                  bucket="logos"
                  label="Ajouter un logo (optionnel)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Contrats</label>
                <UploadDocument
                  files={form.contrats}
                  onChange={(urls) => setForm({ ...form, contrats: urls })}
                  max={10}
                  bucket="fournisseurs_contrats"
                  label="Ajouter des contrats (PDF, Word, etc.)"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white"
                >
                  {editing ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </MotionBox>
        </MotionBox>
      )}
    </MotionBox>
  );
};
export default FournisseursPage;
