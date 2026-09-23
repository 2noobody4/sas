import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../contexts/ConfigContext';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { sendPasswordReset } = useAuth();
  const config = useConfig();

  const appName = config?.storeName || 'App PME';
  const logoUrl = config?.logo_url;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await sendPasswordReset(email);

    setLoading(false);
    if (result.success) {
      setSent(true);
    } else {
      setError(result.error || 'Erreur lors de l envoi');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
      <MotionBox
        type="card"
        variant="xlarge"
        className="w-full max-w-md p-8 bg-[var(--color-cardBg)] rounded-2xl shadow-xl border border-[var(--color-borderColor)]"
        animation={{ animationInitiale: 'slideUp' }}
      >
        <div className="text-center mb-6">
          {logoUrl && (
            <img src={logoUrl} alt={appName} className="h-16 w-auto mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">Mot de passe oublie</h1>
          <p className="text-sm text-[var(--color-textSecondary)] mt-1">
            Recevez un lien pour reinitialiser votre mot de passe
          </p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 text-center">
              <CheckCircle size={40} className="mx-auto text-[var(--color-success)] mb-2" />
              <p className="font-medium text-[var(--color-textPrimary)]">Email envoye !</p>
              <p className="text-sm text-[var(--color-textSecondary)] mt-1">
                Verifiez votre boite de reception a <b>{email}</b>
              </p>
              <p className="text-xs text-[var(--color-textSecondary)] mt-2">
                Pensez a verifier les spams si vous ne le voyez pas.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition"
            >
              <ArrowLeft size={18} /> Retour a la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Adresse email</label>
              <div className="relative mt-1">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
                  placeholder="exemple@email.com"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)] text-sm border border-[var(--color-danger)]/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} /> Envoyer le lien
                </>
              )}
            </button>

            <div className="text-center text-sm text-[var(--color-textSecondary)]">
              <Link to="/login" className="text-[var(--color-primary)] hover:underline font-medium inline-flex items-center gap-1">
                <ArrowLeft size={14} /> Retour a la connexion
              </Link>
            </div>
          </form>
        )}
      </MotionBox>
    </div>
  );
};

export default ForgotPasswordPage;
