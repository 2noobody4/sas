import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { useAuth } from '../../hooks/useAuth';
import { useConfig } from '../../contexts/ConfigContext';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const config = useConfig();
  const history = useHistory();

  const appName = config?.storeName || 'App PME';
  const logoUrl = config?.logo_url;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      history.push('/');
    } else {
      setError(result.error || 'Erreur de connexion');
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
          <p className="text-sm text-[var(--color-textSecondary)] mt-1">Connectez-vous à votre compte</p>
        </div>

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

          <div>
            <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Mot de passe</label>
            <div className="relative mt-1">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
                placeholder="••••••••"
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
                <LogIn size={18} /> Se connecter
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--color-textSecondary)]">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-[var(--color-primary)] hover:underline font-medium inline-flex items-center gap-1">
            Inscription <ArrowRight size={14} />
          </Link>
        </div>
      </MotionBox>
    </div>
  );
};

export default LoginPage;
