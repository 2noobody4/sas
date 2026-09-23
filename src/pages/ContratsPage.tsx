import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { Modal } from '../components/Modal';
import { useContrats, useCreateContrat, useUpdateContrat, useDeleteContrat } from '../hooks/useRH';
import { useEmployes } from '../hooks/useRH';
import { UploadDocument } from '../components/UploadDocument';
import { Search, Plus, Edit, Trash2, Eye, FileText, X, Save } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { TypeContrat, StatutContrat } from '../types/rh';

export const ContratsPage: React.FC = () => {
  const history = useHistory();
  const { data: contrats = [], isLoading, refetch } = useContrats();
  const { data: employes = [] } = useEmployes();
  const createMutation = useCreateContrat();
  const updateMutation = useUpdateContrat();
  const deleteMutation = useDeleteContrat();
  const { success, error: toastError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    employe_id: '',
    type: 'cdi' as TypeContrat,
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: '',
    salaire_base: 0,
    statut: 'actif' as StatutContrat,
    fichier_url: '',
  });
  const [files, setFiles] = useState<string[]>([]);

  const filtered = contrats.filter(c => {
    const nom = c.employe?.user?.nom || '';
    return nom.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, fichier_url: files[0] || '' };
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data });
        success('Contrat mis à jour ✅');
      } else {
        await createMutation.mutateAsync(data);
        success('Contrat créé ✅');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ employe_id: '', type: 'cdi', date_debut: new Date().toISOString().split('T')[0], date_fin: '', salaire_base: 0, statut: 'actif', fichier_url: '' });
      setFiles([]);
      refetch();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer ce contrat ?')) {
      await deleteMutation.mutateAsync(id);
      refetch();
    }
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = { cdi: 'CDI', cdd: 'CDD', stage: 'Stage', prestataire: 'Prestataire' };
    return map[type] || type;
  };

  const modalFooter = (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={() => { setShowForm(false); setEditing(null); }}
        className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
      >
        Annuler
      </button>
      <button
        type="submit"
        form="contrat-form"
        className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition flex items-center gap-2"
      >
        <Save size={16} /> {editing ? 'Mettre à jour' : 'Créer'}
      </button>
    </div>
  );

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📄 Contrats</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Gestion des contrats de travail</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm({ employe_id: '', type: 'cdi', date_debut: new Date().toISOString().split('T')[0], date_fin: '', salaire_base: 0, statut: 'actif', fichier_url: '' }); setFiles([]); setShowForm(true); }}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
        >
          <Plus size={18} /> Nouveau contrat
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
          <input
            type="text"
            placeholder="Rechercher un employé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">Aucun contrat trouvé.</MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Employé</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Début</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)] hidden md:table-cell">Fin</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Statut</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                    <td className="px-4 py-3 font-medium text-[var(--color-textPrimary)]">{c.employe?.user?.nom} {c.employe?.user?.prenom}</td>
                    <td className="px-4 py-3 text-sm"><span className="px-2 py-1 rounded-full text-xs font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)]">{getTypeLabel(c.type)}</span></td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">{new Date(c.date_debut).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)] hidden md:table-cell">{c.date_fin ? new Date(c.date_fin).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${c.statut === 'actif' ? 'bg-[var(--color-success)]' : c.statut === 'termine' ? 'bg-[var(--color-secondary)]' : 'bg-[var(--color-danger)]'}`}>
                        {c.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => { setEditing(c); setForm({ employe_id: c.employe_id, type: c.type, date_debut: c.date_debut, date_fin: c.date_fin || '', salaire_base: c.salaire_base, statut: c.statut, fichier_url: c.fichier_url || '' }); setFiles(c.fichier_url ? [c.fichier_url] : []); setShowForm(true); }}
                          className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MotionBox>
      )}

      {/* Modal avec le composant Modal réutilisable */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? 'Modifier le contrat' : 'Nouveau contrat'}
        subtitle={editing ? 'Modifiez les informations du contrat' : 'Saisissez les informations du contrat'}
        icon={<FileText size={24} />}
        maxWidth="md"
        maxHeight="80vh"
        showFooter={true}
        footer={modalFooter}
      >
        <form id="contrat-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Employé *</label>
            <select
              value={form.employe_id}
              onChange={(e) => setForm({ ...form, employe_id: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
            >
              <option value="">Sélectionner</option>
              {employes.map((e: any) => (
                <option key={e.id} value={e.id}>{e.user?.nom} {e.user?.prenom} - {e.poste}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type *</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as TypeContrat })}
              required
              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
            >
              <option value="cdi">CDI</option>
              <option value="cdd">CDD</option>
              <option value="stage">Stage</option>
              <option value="prestataire">Prestataire</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Début *</label>
              <input
                type="date"
                value={form.date_debut}
                onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fin</label>
              <input
                type="date"
                value={form.date_fin}
                onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Salaire de base (FCFA) *</label>
            <input
              type="number"
              value={form.salaire_base}
              onChange={(e) => setForm({ ...form, salaire_base: parseFloat(e.target.value) || 0 })}
              min={0}
              step={1000}
              required
              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select
              value={form.statut}
              onChange={(e) => setForm({ ...form, statut: e.target.value as StatutContrat })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
            >
              <option value="actif">Actif</option>
              <option value="termine">Terminé</option>
              <option value="resilie">Résilié</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fichier (optionnel)</label>
            <UploadDocument
              files={files}
              onChange={setFiles}
              max={1}
              bucket="documents"
              label="Télécharger le contrat"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ContratsPage;
