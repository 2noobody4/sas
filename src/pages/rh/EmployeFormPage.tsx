import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { UploadDocument } from '../../components/ui/UploadDocument';
import { useEmploye, useCreateEmploye, useUpdateEmploye } from '../../hooks/useRH';
import { useUsersByRole } from '../../hooks/useUsersByRole';
import { ArrowLeft, Save, FileText, User, Calendar, DollarSign, Briefcase, Users } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { StatutEmploye, TypeContrat, POSTES, Poste } from '../../types/rh';

interface RouteParams {
  id?: string;
}

export const EmployeFormPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const isEdit = !!id;
  const { data: employe, isLoading: employeLoading } = useEmploye(id);
  const { data: users = [] } = useUsersByRole(['admin', 'gestionnaire', 'employe', 'comptable', 'cashier', 'magasinier']);
  const createMutation = useCreateEmploye();
  const updateMutation = useUpdateEmploye();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(false);
  const [contratFiles, setContratFiles] = useState<string[]>([]);
  const [form, setForm] = useState<{
    user_id: string;
    poste: Poste;
    date_embauche: string;
    salaire_base: number;
    statut: StatutEmploye;
    type_contrat: TypeContrat;
    contrat_url?: string;
  }>({
    user_id: '',
    poste: 'Commercial',
    date_embauche: new Date().toISOString().split('T')[0],
    salaire_base: 0,
    statut: 'actif',
    type_contrat: 'cdi',
    contrat_url: undefined,
  });

  useEffect(() => {
    if (isEdit && employe) {
      setForm({
        user_id: employe.user_id,
        poste: (employe.poste as Poste) || 'Commercial',
        date_embauche: employe.date_embauche,
        salaire_base: employe.salaire_base,
        statut: employe.statut,
        type_contrat: 'cdi',
        contrat_url: (employe as any).contrat_url || undefined,
      });
      if ((employe as any).contrat_url) {
        setContratFiles([(employe as any).contrat_url]);
      }
    }
  }, [isEdit, employe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.user_id) {
      toastError('Veuillez sélectionner un utilisateur');
      return;
    }
    setLoading(true);
    try {
      const data = {
        ...form,
        contrat_url: contratFiles.length > 0 ? contratFiles[0] : undefined,
      };
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data });
        success('Employé mis à jour ✅');
      } else {
        await createMutation.mutateAsync(data);
        success('Employé créé ✅');
      }
      history.push('/gestion/rh/employes');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isEdit && employeLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.push('/gestion/rh/employes')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">
          {isEdit ? 'Modifier l\'employé' : 'Nouvel employé'}
        </h1>
        <span className="ml-auto text-sm text-[var(--color-textSecondary)]">Formulaire RH</span>
      </div>

      <MotionBox type="card" variant="elevated" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section : Identité */}
          <div className="p-4 rounded-xl bg-[var(--color-secondary)]">
            <div className="flex items-center gap-2 mb-3">
              <User size={18} className="text-[var(--color-primary)]" />
              <span className="font-medium text-[var(--color-textPrimary)]">Identité</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Utilisateur *</label>
                <select
                  value={form.user_id}
                  onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  required
                  disabled={isEdit}
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.prenom} {u.nom} ({u.email}) - {u.role?.nom}
                    </option>
                  ))}
                </select>
                {isEdit && <p className="text-xs text-[var(--color-textSecondary)] mt-1">Le lien utilisateur ne peut pas être modifié.</p>}
              </div>
            </div>
          </div>

          {/* Section : Poste et salaire */}
          <div className="p-4 rounded-xl bg-[var(--color-secondary)]">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase size={18} className="text-[var(--color-primary)]" />
              <span className="font-medium text-[var(--color-textPrimary)]">Poste et salaire</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Poste *</label>
                <select
                  value={form.poste}
                  onChange={(e) => setForm({ ...form, poste: e.target.value as Poste })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  required
                >
                  <optgroup label="Direction">
                    <option value="Directeur Général">Directeur Général</option>
                    <option value="Directeur Administratif et Financier">Directeur Administratif et Financier</option>
                    <option value="Directeur Commercial">Directeur Commercial</option>
                    <option value="Directeur des Opérations">Directeur des Opérations</option>
                  </optgroup>
                  <optgroup label="Comptabilité / Finance">
                    <option value="Comptable">Comptable</option>
                    <option value="Gestionnaire de paie">Gestionnaire de paie</option>
                    <option value="Trésorier">Trésorier</option>
                    <option value="Analyste financier">Analyste financier</option>
                    <option value="Contrôleur de gestion">Contrôleur de gestion</option>
                  </optgroup>
                  <optgroup label="Ressources Humaines">
                    <option value="Responsable RH">Responsable RH</option>
                    <option value="Assistant RH">Assistant RH</option>
                    <option value="Chargé de recrutement">Chargé de recrutement</option>
                  </optgroup>
                  <optgroup label="Commercial / Clientèle">
                    <option value="Commercial">Commercial</option>
                    <option value="Responsable des ventes">Responsable des ventes</option>
                    <option value="Chargé de clientèle">Chargé de clientèle</option>
                    <option value="Téléconseiller">Téléconseiller</option>
                    <option value="Agent commercial">Agent commercial</option>
                    <option value="Conseiller clientèle">Conseiller clientèle</option>
                    <option value="Support technique">Support technique</option>
                    <option value="Responsable relation client">Responsable relation client</option>
                  </optgroup>
                  <optgroup label="Stock / Logistique">
                    <option value="Responsable Stock">Responsable Stock</option>
                    <option value="Magasinier">Magasinier</option>
                    <option value="Gestionnaire de stock">Gestionnaire de stock</option>
                    <option value="Responsable approvisionnement">Responsable approvisionnement</option>
                    <option value="Préparateur de commandes">Préparateur de commandes</option>
                    <option value="Cariste">Cariste</option>
                    <option value="Livreur">Livreur</option>
                    <option value="Chauffeur-livreur">Chauffeur-livreur</option>
                  </optgroup>
                  <optgroup label="Entretien / Sécurité">
                    <option value="Responsable Logistique">Responsable Logistique</option>
                    <option value="Agent de sécurité">Agent de sécurité</option>
                    <option value="Gardien">Gardien</option>
                    <option value="Technicien de surface">Technicien de surface</option>
                    <option value="Agent d'entretien">Agent d'entretien</option>
                    <option value="Maintenance">Maintenance</option>
                  </optgroup>
                  <optgroup label="Autres">
                    <option value="Stagiaire">Stagiaire</option>
                    <option value="Apprenti">Apprenti</option>
                    <option value="Consultant">Consultant</option>
                    <option value="Prestataire">Prestataire</option>
                    <option value="Autre">Autre</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Salaire de base (FCFA) *</label>
                <input
                  type="number"
                  value={form.salaire_base}
                  onChange={(e) => setForm({ ...form, salaire_base: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step={1000}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Date d'embauche *</label>
                <input
                  type="date"
                  value={form.date_embauche}
                  onChange={(e) => setForm({ ...form, date_embauche: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Statut</label>
                <select
                  value={form.statut}
                  onChange={(e) => setForm({ ...form, statut: e.target.value as StatutEmploye })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                >
                  <option value="actif">Actif</option>
                  <option value="conge">En congé</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section : Contrat (optionnel) */}
          <div className="p-4 rounded-xl bg-[var(--color-secondary)]">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={18} className="text-[var(--color-primary)]" />
              <span className="font-medium text-[var(--color-textPrimary)]">Contrat de travail</span>
              <span className="text-xs text-[var(--color-textSecondary)]">(Optionnel)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Type de contrat *</label>
                <select
                  value={form.type_contrat}
                  onChange={(e) => setForm({ ...form, type_contrat: e.target.value as TypeContrat })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  required
                >
                  <option value="cdi">CDI – Contrat à durée indéterminée</option>
                  <option value="cdd">CDD – Contrat à durée déterminée</option>
                  <option value="stage">Stage</option>
                  <option value="prestataire">Prestataire / Freelance</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Contrat de travail (PDF) - Optionnel</label>
                <UploadDocument
                  files={contratFiles}
                  onChange={setContratFiles}
                  max={1}
                  bucket="documents"
                  label="Télécharger le contrat (PDF, image...)"
                />
                <p className="text-xs text-[var(--color-textSecondary)] mt-1">
                  ⚠️ Le fichier est optionnel. Vous pouvez enregistrer l'employé sans contrat.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-borderColor)]">
            <button
              type="button"
              onClick={() => history.push('/gestion/rh/employes')}
              className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-white flex items-center gap-2 ${
                loading ? 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
              } transition`}
            >
              {loading ? 'Enregistrement...' : <><Save size={18} /> {isEdit ? 'Mettre à jour' : 'Créer'}</>}
            </button>
          </div>
        </form>
      </MotionBox>
    </div>
  );
};

export default EmployeFormPage;
