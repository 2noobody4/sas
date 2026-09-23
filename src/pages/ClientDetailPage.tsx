import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useClient, useInteractions, useTransactionsClient, useCreateInteraction } from '../hooks/useClients';
import { ArrowLeft, Mail, Phone, MapPin, Building, Edit, Star, Calendar, MessageSquare, Plus, X } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { TypeInteraction } from '../types/clients';

interface RouteParams {
  id: string;
}

export const ClientDetailPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const { data: client, isLoading: clientLoading } = useClient(id);
  const { data: interactions = [], refetch: refetchInteractions } = useInteractions(id);
  const { data: transactions = [] } = useTransactionsClient(id);
  const createInteraction = useCreateInteraction();
  const { success, error: toastError } = useToast();

  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const [interactionForm, setInteractionForm] = useState({
    type: 'note' as TypeInteraction,
    sujet: '',
    description: '',
    date_interaction: new Date().toISOString().split('T')[0],
  });

  if (clientLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  if (!client) return <div className="p-6 text-center text-[var(--color-danger)]">Client introuvable</div>;

  const totalDepenses = transactions.reduce((acc, t) => acc + t.montant, 0);

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createInteraction.mutateAsync({
        client_id: id,
        ...interactionForm,
      });
      success('Interaction enregistrée ✅');
      setShowInteractionForm(false);
      setInteractionForm({ type: 'note', sujet: '', description: '', date_interaction: new Date().toISOString().split('T')[0] });
      refetchInteractions();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      appel: '📞 Appel',
      email: '✉️ Email',
      rendez_vous: '📅 Rendez-vous',
      relance: '🔄 Relance',
      note: '📝 Note',
      autre: '📄 Autre',
    };
    return map[type] || type;
  };

  const getNiveauColor = (niveau: string) => {
    const colors: Record<string, string> = {
      bronze: 'bg-amber-700',
      argent: 'bg-gray-400',
      or: 'bg-yellow-500',
      platine: 'bg-blue-400',
      diamant: 'bg-purple-600',
    };
    return colors[niveau] || 'bg-gray-400';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.push('/gestion/clients/liste')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">👤 Fiche client</h1>
        <button
          onClick={() => history.push(`/gestion/clients/${id}/edit`)}
          className="ml-auto px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
        >
          <Edit size={18} /> Modifier
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <MotionBox type="card" variant="elevated" className="p-6 lg:col-span-1">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-[var(--color-secondary)] flex items-center justify-center mx-auto text-4xl font-bold text-[var(--color-textPrimary)]">
              {client.nom.charAt(0)}{client.prenom?.charAt(0) || ''}
            </div>
            <h2 className="text-xl font-bold mt-3 text-[var(--color-textPrimary)]">{client.nom} {client.prenom || ''}</h2>
            <p className="text-sm text-[var(--color-textSecondary)]">{client.type}</p>
            <div className="mt-3 flex justify-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getNiveauColor(client.niveau_fidelite)}`}>
                ⭐ {client.niveau_fidelite}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium text-white bg-[var(--color-primary)]">
                Segment {client.segment}
              </span>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-[var(--color-secondary)]">
              <p className="text-sm text-[var(--color-textSecondary)]">Points de fidélité</p>
              <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{client.points_fidelite}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2 border-t border-[var(--color-borderColor)] pt-4">
            <p className="flex items-center gap-2 text-sm text-[var(--color-textSecondary)]">
              <Mail size={16} /> {client.email || 'Non renseigné'}
            </p>
            <p className="flex items-center gap-2 text-sm text-[var(--color-textSecondary)]">
              <Phone size={16} /> {client.telephone || 'Non renseigné'}
            </p>
            <p className="flex items-center gap-2 text-sm text-[var(--color-textSecondary)]">
              <MapPin size={16} /> {client.adresse || 'Non renseignée'}
            </p>
            <p className="flex items-center gap-2 text-sm text-[var(--color-textSecondary)]">
              <Building size={16} /> {client.ville || ''} {client.pays}
            </p>
          </div>
        </MotionBox>

        {/* Interactions et historique */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statistiques */}
          <MotionBox type="card" variant="default" className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-[var(--color-textSecondary)]">Total dépensé</p>
                <p className="text-xl font-bold text-[var(--color-textPrimary)]">{totalDepenses.toLocaleString()} FCFA</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-textSecondary)]">Nombre d'achats</p>
                <p className="text-xl font-bold text-[var(--color-textPrimary)]">{transactions.length}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-textSecondary)]">Interactions</p>
                <p className="text-xl font-bold text-[var(--color-textPrimary)]">{interactions.length}</p>
              </div>
            </div>
          </MotionBox>

          {/* Interactions */}
          <MotionBox type="card" variant="elevated" className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--color-textPrimary)]">📞 Interactions</h3>
              <button
                onClick={() => setShowInteractionForm(!showInteractionForm)}
                className="px-3 py-1 rounded-lg bg-[var(--color-primary)] text-white text-sm flex items-center gap-1"
              >
                <Plus size={16} /> Ajouter
              </button>
            </div>

            {showInteractionForm && (
              <form onSubmit={handleAddInteraction} className="mb-4 p-3 rounded-xl bg-[var(--color-secondary)]">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Type</label>
                    <select
                      value={interactionForm.type}
                      onChange={(e) => setInteractionForm({ ...interactionForm, type: e.target.value as TypeInteraction })}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                    >
                      <option value="appel">📞 Appel</option>
                      <option value="email">✉️ Email</option>
                      <option value="rendez_vous">📅 Rendez-vous</option>
                      <option value="relance">🔄 Relance</option>
                      <option value="note">📝 Note</option>
                      <option value="autre">📄 Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Sujet</label>
                    <input
                      type="text"
                      value={interactionForm.sujet}
                      onChange={(e) => setInteractionForm({ ...interactionForm, sujet: e.target.value })}
                      placeholder="Sujet de l'interaction"
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Description</label>
                    <textarea
                      value={interactionForm.description}
                      onChange={(e) => setInteractionForm({ ...interactionForm, description: e.target.value })}
                      rows={2}
                      placeholder="Détails..."
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Date</label>
                    <input
                      type="date"
                      value={interactionForm.date_interaction}
                      onChange={(e) => setInteractionForm({ ...interactionForm, date_interaction: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowInteractionForm(false)}
                      className="px-3 py-1 rounded border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] text-sm"
                    >
                      Annuler
                    </button>
                    <button type="submit" className="px-3 py-1 rounded bg-[var(--color-primary)] text-white text-sm">
                      Enregistrer
                    </button>
                  </div>
                </div>
              </form>
            )}

            {interactions.length === 0 ? (
              <p className="text-sm text-[var(--color-textSecondary)]">Aucune interaction enregistrée.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {interactions.map((i) => (
                  <div key={i.id} className="p-2 rounded border border-[var(--color-borderColor)] text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[var(--color-textPrimary)]">{getTypeLabel(i.type)}</span>
                      <span className="text-xs text-[var(--color-textSecondary)]">{new Date(i.date_interaction).toLocaleDateString()}</span>
                    </div>
                    {i.sujet && <p className="font-medium text-[var(--color-textPrimary)]">{i.sujet}</p>}
                    {i.description && <p className="text-[var(--color-textSecondary)]">{i.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </MotionBox>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailPage;
