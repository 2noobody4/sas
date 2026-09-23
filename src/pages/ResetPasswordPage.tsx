import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../contexts/ConfigContext';
import { Lock, CheckCircle, AlertCircle, Shield } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const history = useHistory();
  const { updatePassword, user } = useAuth();
  const config = useConfig();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  const appName = config?.storeName || 'App PME';

  useEffect(() => {
    const hash = window.location.hash;
    const isRecovery = hash.includes('type=recovery') || hash.includes('access_token');
    setHasSession(isRecovery || !!user);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres');
      return;
    }

    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        history.push('/login');
      }, 3000);
    } else {
      setError(result.error || 'Erreur lors de la mise a jour');
    }
  };

  if (hasSession === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
        <MotionBox type="card" variant="xlarge" className="w-full max-w-md p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-[var(--color-danger)] mb-4" />
          <h1 className="text-xl font-bold text-[var(--color-textPrimary)]">Lien invalide</h1>
          <p className="text-sm text-[var(--color-textSecondary)] mt-2">
            Ce lien de recuperation est invalide ou a expire.
          </p>
          <button
            onClick={() => history.push('/forgot-password')}
            className="mt-4 px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-white"
          >
            Demander un nouveau lien
          </button>
        </MotionBox>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
      <MotionBox
        type="card"
        variant="xlarge"
        className="w-full max-w-md p-8 bg-[var(--color-cardBg)] rounded-2xl shadow-xl border border-[var(--color-borderColor)]"
        animation={{ animationInitiale: 'slideUp' }}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
            <Shield size={32} className="text-[var(--color-primary)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">Nouveau mot de passe</h1>
          <p className="text-sm text-[var(--color-textSecondary)] mt-1">
            {appName} — Choisissez un nouveau mot de passe securise
          </p>
        </div>

        {success ? (
          <div className="p-4 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 text-center">
            <CheckCircle size={40} className="mx-auto text-[var(--color-success)] mb-2" />
            <p className="font-medium text-[var(--color-textPrimary)]">Mot de passe mis a jour !</p>
            <p className="text-sm text-[var(--color-textSecondary)] mt-1">
              Redirection vers la connexion...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Nouveau mot de passe</label>
              <div className="relative mt-1">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
                  placeholder="********"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Confirmer le mot de passe</label>
              <div className="relative mt-1">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
                  placeholder="********"
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
              disabled={loading || hasSession === null}
              className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle size={18} /> Enregistrer le mot de passe
                </>
              )}
            </button>
          </form>
        )}
      </MotionBox>
    </div>
  );
};

export default ResetPasswordPage;

