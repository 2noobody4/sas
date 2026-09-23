// ============================================================
// COMMANDER SERVICE PAGE
// Version V3 — Choix mode paiement si "les_deux"
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useService } from '../hooks/useServices';
import { useAttributsService } from '../hooks/useAttributsService';
import { useClients } from '../hooks/useClients';
import { useCreateDemandeService } from '../hooks/useDemandesService';
import { useAuth } from '../hooks/useAuth';
import {
  ArrowLeft, Send, Briefcase, Clock, DollarSign,
  User, FileText, Calendar, Mail, Phone, Hash, CheckCircle,
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import {
  TypeFacturationDemande, ModePaiementDemande,
  MODES_PAIEMENT_DEMANDE,
} from '../types/demandesService';

interface RouteParams {
  id: string;
}

export const CommanderServicePage: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  const { user } = useAuth();
  const { data: service, isLoading } = useService(id);
  const { data: attributs = [] } = useAttributsService();
  const { data: clients = [] } = useClients();
  const createMutation = useCreateDemandeService();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [dateSouhaitee, setDateSouhaitee] = useState('');
  const [typeFacturation, setTypeFacturation] = useState<TypeFacturationDemande>('forfait');
  const [modePaiement, setModePaiement] = useState<ModePaiementDemande>('total');
  const [montantAcompte, setMontantAcompte] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const clientLie = clients.find((c: any) => c.user_id === user?.id);

  // ✅ Déterminer les types de facturation disponibles selon le service
  const typesFacturationDisponibles = useMemo<{ value: TypeFacturationDemande; label: string }[]>(() => {
    if (!service) return [];

    const mode = service.mode_paiement || 'forfait';

    if (mode === 'forfait') {
      return [{ value: 'forfait', label: '💰 Forfait' }];
    }
    if (mode === 'horaire') {
      return [{ value: 'horaire', label: '⏱️ À l\'heure' }];
    }
    // les_deux : proposer le choix
    return [
      { value: 'forfait', label: '💰 Forfait' },
      { value: 'horaire', label: '⏱️ À l\'heure' },
    ];
  }, [service]);

  // ✅ Initialiser le mode par défaut
  useEffect(() => {
    if (!service) return;
    const mode = service.mode_paiement || 'forfait';
    if (mode === 'horaire') setTypeFacturation('horaire');
    else setTypeFacturation('forfait');
  }, [service]);

  if (isLoading) {
    return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  }
  if (!service) {
    return (
      <div className="p-6 text-center text-[var(--color-danger)]">
        <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
        <p>Service introuvable</p>
        <button
          onClick={() => history.push('/services')}
          className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white"
        >
          Retour aux services
        </button>
      </div>
    );
  }

  const attributsRequis = attributs.filter((a) =>
    service.informations_requises?.includes(a.id) && a.type !== 'date'
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail size={16} className="text-[var(--color-textSecondary)]" />;
      case 'tel': return <Phone size={16} className="text-[var(--color-textSecondary)]" />;
      case 'textarea': return <FileText size={16} className="text-[var(--color-textSecondary)]" />;
      case 'date': return <Calendar size={16} className="text-[var(--color-textSecondary)]" />;
      case 'number': return <Hash size={16} className="text-[var(--color-textSecondary)]" />;
      default: return <User size={16} className="text-[var(--color-textSecondary)]" />;
    }
  };

  const handleChange = (attrId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [attrId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (const attr of attributsRequis) {
      if (attr.obligatoire && !formData[attr.id]?.trim()) {
        toastError(`Le champ "${attr.nom}" est obligatoire`);
        return;
      }
    }

    if (modePaiement === 'acompte' && (!montantAcompte || montantAcompte <= 0)) {
      toastError('Merci d\'indiquer le montant de l\'acompte');
      return;
    }
    if (modePaiement === 'acompte' && montantAcompte >= service.prix) {
      toastError('L\'acompte doit être inférieur au prix du service');
      return;
    }

    setLoading(true);
    try {
      await createMutation.mutateAsync({
        service_id: service.id,
        client_id: clientLie?.id,
        informations: formData,
        date_souhaitee: dateSouhaitee || undefined,
        notes: notes || undefined,
        type_facturation: typeFacturation,
        mode_paiement: modePaiement,
        montant_acompte: modePaiement === 'acompte' ? montantAcompte : undefined,
      });
      success('Demande envoyée ! Nous vous contacterons bientôt.');
      history.push('/mes-demandes-service');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showFacturationSelector = typesFacturationDisponibles.length > 1;
  const facturationLabel = typeFacturation === 'horaire' ? '⏱️ À l\'heure' : '💰 Forfait';

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <button
        onClick={() => history.push(`/services/${id}`)}
        className="flex items-center gap-2 text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)] mb-4"
      >
        <ArrowLeft size={20} /> Retour au service
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MotionBox type="card" variant="elevated" className="p-6">
          <h2 className="text-xl font-bold text-[var(--color-textPrimary)] mb-4 flex items-center gap-2">
            <Briefcase size={22} className="text-[var(--color-primary)]" />
            {service.nom}
          </h2>

          {service.image_url && (
            <img
              src={service.image_url}
              alt={service.nom}
              className="w-full aspect-video object-cover rounded-xl mb-4"
            />
          )}

          <p className="text-sm text-[var(--color-textSecondary)] mb-4">
            {service.description}
          </p>

          <div className="space-y-2 pt-4 border-t border-[var(--color-borderColor)]">
            {(service.mode_paiement === 'forfait' || service.mode_paiement === 'les_deux' || !service.mode_paiement) && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-textSecondary)] flex items-center gap-1">
                  <DollarSign size={14} /> Forfait
                </span>
                <span className="font-bold text-[var(--color-primary)]">
                  {service.prix.toLocaleString()} FCFA
                </span>
              </div>
            )}
            {(service.mode_paiement === 'horaire' || service.mode_paiement === 'les_deux') && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-textSecondary)] flex items-center gap-1">
                  <Clock size={14} /> À l'heure
                </span>
                <span className="font-bold text-[var(--color-primary)]">
                  {(service.prix_horaire || 0).toLocaleString()} FCFA/h
                </span>
              </div>
            )}
            {service.duree_estimee_heures && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-textSecondary)]">Durée estimée</span>
                <span className="text-[var(--color-textPrimary)]">
                  {service.duree_estimee_heures}h
                </span>
              </div>
            )}
          </div>
        </MotionBox>

        <MotionBox type="card" variant="elevated" className="p-6">
          <h2 className="text-xl font-bold text-[var(--color-textPrimary)] mb-4 flex items-center gap-2">
            <Send size={20} className="text-[var(--color-primary)]" />
            Commander ce service
          </h2>

          {!service.disponible ? (
            <div className="p-4 rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)] text-center">
              Ce service est actuellement indisponible.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {attributsRequis.map((attr) => (
                <div key={attr.id}>
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)]">
                    {attr.nom}
                    {attr.obligatoire && <span className="text-[var(--color-danger)]"> *</span>}
                  </label>
                  <div className="relative mt-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      {getIcon(attr.type)}
                    </div>
                    {attr.type === 'textarea' ? (
                      <textarea
                        value={formData[attr.id] || ''}
                        onChange={(e) => handleChange(attr.id, e.target.value)}
                        rows={3}
                        required={attr.obligatoire}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition"
                      />
                    ) : (
                      <input
                        type={attr.type === 'number' ? 'number' : attr.type}
                        value={formData[attr.id] || ''}
                        onChange={(e) => handleChange(attr.id, e.target.value)}
                        required={attr.obligatoire}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition"
                      />
                    )}
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">
                  Date souhaitée
                </label>
                <input
                  type="date"
                  value={dateSouhaitee}
                  onChange={(e) => setDateSouhaitee(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>

              {/* ✅ Choix du type de facturation si "les_deux" */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">
                  Type de facturation
                </label>
                {showFacturationSelector ? (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {typesFacturationDisponibles.map((m) => {
                      const isSelected = typeFacturation === m.value;
                      return (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setTypeFacturation(m.value)}
                          className={`p-3 rounded-xl border-2 text-center transition ${
                            isSelected
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                              : 'border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:border-[var(--color-primary)]'
                          }`}
                        >
                          <span className="text-sm font-medium">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-1 p-3 rounded-xl bg-[var(--color-secondary)] text-[var(--color-textPrimary)] text-sm">
                    {facturationLabel}
                  </div>
                )}
                {showFacturationSelector && (
                  <p className="text-xs text-[var(--color-textSecondary)] mt-1">
                    Ce service propose plusieurs modes de facturation. Choisissez celui qui vous convient.
                  </p>
                )}
              </div>

              {/* ✅ Mode de paiement (indépendant de la facturation) */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">
                  Mode de paiement
                </label>
                <select
                  value={modePaiement}
                  onChange={(e) => setModePaiement(e.target.value as ModePaiementDemande)}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                >
                  {MODES_PAIEMENT_DEMANDE.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              {modePaiement === 'acompte' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)]">
                    Montant de l'acompte (FCFA)
                    <span className="text-[var(--color-danger)]"> *</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={service.prix - 1}
                    value={montantAcompte || ''}
                    onChange={(e) => setMontantAcompte(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  />
                  <p className="text-xs text-[var(--color-textSecondary)] mt-1">
                    Sur un prix de {service.prix.toLocaleString()} FCFA.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">
                  Notes / Précisions
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Détails supplémentaires..."
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full px-6 py-3 rounded-xl text-white flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60'
                    : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
                } transition`}
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Envoyer la demande
                  </>
                )}
              </button>
            </form>
          )}
        </MotionBox>
      </div>
    </div>
  );
};

export default CommanderServicePage;
