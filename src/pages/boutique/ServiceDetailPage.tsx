// ============================================================
// SERVICE DETAIL PAGE - Page publique d'un service
// Version V3 - Compatible React 16
// ============================================================

import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { useService } from '../../hooks/useServices';
import { useAttributsService } from '../../hooks/useAttributsService';
import { ArrowLeft, Briefcase, DollarSign, Clock, CheckCircle, XCircle, Send, Mail, Phone, User, FileText, Calendar } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface RouteParams {
  id: string;
}

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  const { data: service, isLoading } = useService(id);
  const { data: attributs = [] } = useAttributsService();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center text-[var(--color-textSecondary)]">
        <div className="animate-pulse">Chargement du service...</div>
      </div>
    );
  }
  if (!service) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center text-[var(--color-danger)]">
        <Briefcase size={48} className="mx-auto opacity-30 mb-4" />
        <p className="text-lg font-medium">Service introuvable</p>
        <button
          onClick={() => history.push('/services')}
          className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition"
        >
          Retour aux services
        </button>
      </div>
    );
  }

  const attributsRequis = attributs.filter(a => service.informations_requises?.includes(a.id));
  const categorieNom = service.categorie?.nom || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      console.log('Demande de service:', { serviceId: service.id, ...formData });
      await new Promise(resolve => setTimeout(resolve, 1500));
      success('✅ Votre demande a été envoyée avec succès !');
      history.push('/services');
    } catch (err: any) {
      toastError(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (attributId: string, value: string) => {
    setFormData(prev => ({ ...prev, [attributId]: value }));
  };

  const getAttributIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail size={16} className="text-[var(--color-textSecondary)]" />;
      case 'tel': return <Phone size={16} className="text-[var(--color-textSecondary)]" />;
      case 'textarea': return <FileText size={16} className="text-[var(--color-textSecondary)]" />;
      case 'date': return <Calendar size={16} className="text-[var(--color-textSecondary)]" />;
      default: return <User size={16} className="text-[var(--color-textSecondary)]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-6">
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <button
          onClick={() => history.push('/services')}
          className="flex items-center gap-2 text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)] transition mb-4"
        >
          <ArrowLeft size={20} /> Retour aux services
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <MotionBox type="card" variant="elevated" className="p-6">
            <div className="w-full aspect-[4/3] rounded-xl bg-[var(--color-secondary)] flex items-center justify-center overflow-hidden">
              {service.image_url ? (
                <img
                  src={service.image_url}
                  alt={service.nom}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Briefcase size={80} className="text-[var(--color-textSecondary)] opacity-30" />
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">{service.nom}</h1>
                  {categorieNom && (
                    <p className="text-sm text-[var(--color-textSecondary)] mt-1">{categorieNom}</p>
                  )}
                </div>
                {service.disponible ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white bg-[var(--color-success)] flex-shrink-0">
                    <CheckCircle size={16} /> Disponible
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white bg-[var(--color-danger)] flex-shrink-0">
                    <XCircle size={16} /> Indisponible
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <DollarSign size={20} className="text-[var(--color-primary)]" />
                  <span className="text-2xl font-bold text-[var(--color-primary)]">
                    {service.prix.toLocaleString()} FCFA
                  </span>
                </div>
                {service.duree && (
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-[var(--color-textSecondary)]" />
                    <span className="text-[var(--color-textPrimary)]">{service.duree}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--color-borderColor)]">
                <h3 className="font-semibold text-[var(--color-textPrimary)] mb-2">Description</h3>
                <p className="text-[var(--color-textSecondary)] leading-relaxed whitespace-pre-wrap">
                  {service.descriptif}
                </p>
              </div>
            </div>
          </MotionBox>

          <MotionBox type="card" variant="elevated" className="p-6">
            <h2 className="text-xl font-bold text-[var(--color-textPrimary)] mb-4 flex items-center gap-2">
              <Send size={20} className="text-[var(--color-primary)]" />
              Demander ce service
            </h2>

            {!service.disponible ? (
              <div className="p-4 rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)] text-center">
                <XCircle size={32} className="mx-auto mb-2" />
                <p className="font-medium">Ce service est actuellement indisponible.</p>
                <p className="text-sm">Veuillez revenir plus tard ou contactez-nous.</p>
              </div>
            ) : attributsRequis.length === 0 ? (
              <div className="p-4 rounded-xl bg-[var(--color-secondary)] text-[var(--color-textSecondary)] text-center">
                <p>Aucune information requise.</p>
                <button
                  onClick={() => {
                    success('✅ Demande de service envoyée avec succès !');
                    history.push('/services');
                  }}
                  className="mt-4 px-6 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition flex items-center gap-2 mx-auto"
                >
                  <Send size={18} /> Demander le service
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-[var(--color-textSecondary)]">
                  Remplissez les informations ci-dessous pour demander ce service.
                </p>

                {attributsRequis.map((attr) => (
                  <div key={attr.id}>
                    <label className="block text-sm font-medium text-[var(--color-textPrimary)]">
                      {attr.nom} {attr.obligatoire && <span className="text-[var(--color-danger)]">*</span>}
                    </label>
                    <div className="relative mt-1">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        {getAttributIcon(attr.type)}
                      </div>
                      {attr.type === 'textarea' ? (
                        <textarea
                          value={formData[attr.id] || ''}
                          onChange={(e) => handleChange(attr.id, e.target.value)}
                          rows={3}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition"
                          placeholder={`Votre ${attr.nom.toLowerCase()}`}
                          required={attr.obligatoire}
                        />
                      ) : attr.type === 'email' ? (
                        <input
                          type="email"
                          value={formData[attr.id] || ''}
                          onChange={(e) => handleChange(attr.id, e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition"
                          placeholder={`Votre ${attr.nom.toLowerCase()}`}
                          required={attr.obligatoire}
                        />
                      ) : attr.type === 'tel' ? (
                        <input
                          type="tel"
                          value={formData[attr.id] || ''}
                          onChange={(e) => handleChange(attr.id, e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition"
                          placeholder={`Votre ${attr.nom.toLowerCase()}`}
                          required={attr.obligatoire}
                        />
                      ) : attr.type === 'number' ? (
                        <input
                          type="number"
                          value={formData[attr.id] || ''}
                          onChange={(e) => handleChange(attr.id, e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition"
                          placeholder={`Votre ${attr.nom.toLowerCase()}`}
                          required={attr.obligatoire}
                        />
                      ) : attr.type === 'date' ? (
                        <input
                          type="date"
                          value={formData[attr.id] || ''}
                          onChange={(e) => handleChange(attr.id, e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition"
                          required={attr.obligatoire}
                        />
                      ) : (
                        <input
                          type="text"
                          value={formData[attr.id] || ''}
                          onChange={(e) => handleChange(attr.id, e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition"
                          placeholder={`Votre ${attr.nom.toLowerCase()}`}
                          required={attr.obligatoire}
                        />
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {submitting ? (
                    <>
                      <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Envoi en cours...
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
    </div>
  );
};

export default ServiceDetailPage;
