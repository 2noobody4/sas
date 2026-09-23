import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../contexts/ConfigContext';
import { Mail, Lock, User, ArrowRight, UserPlus } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export const RegisterPage: React.FC = () => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const config = useConfig();
  const { success, error: toastError } = useToast();
  const history = useHistory();

  const appName = config?.storeName || 'App PME';
  const logoUrl = config?.logo_url;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    const result = await register(email, password, nom, prenom);
    setLoading(false);

    if (result.success) {
      success('Compte créé avec succès ! ✅');
      history.push('/');
    } else {
      setError(result.error || 'Erreur lors de l\'inscription');
      toastError(result.error || 'Erreur lors de l\'inscription');
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
        <div className="text-center mb-8">
          {logoUrl && (
            <img src={logoUrl} alt={appName} className="h-16 w-auto mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">{appName}</h1>
          <p className="text-sm text-[var(--color-textSecondary)] mt-1">Créez votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Nom</label>
              <div className="relative mt-1">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
                  placeholder="Dupont"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Prénom</label>
              <div className="relative mt-1">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
                  placeholder="Jean"
                />
              </div>
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Mot de passe</label>
            <div className="relative mt-1">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
                placeholder="••••••••"
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
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)] text-sm border border-[var(--color-danger)]/20">
              {error}
              {error.includes('déjà utilisé') && (
                <div className="mt-2">
                  <Link to="/login" className="text-[var(--color-primary)] hover:underline font-medium">
                    Se connecter
                  </Link>
                </div>
              )}
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
                <UserPlus size={18} /> S'inscrire
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--color-textSecondary)]">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-[var(--color-primary)] hover:underline font-medium inline-flex items-center gap-1">
            Connexion <ArrowRight size={14} />
          </Link>
        </div>
      </MotionBox>
    </div>
  );
};

export default RegisterPage;
