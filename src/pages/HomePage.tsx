import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { HomeFooter } from '../components/HomeFooter';
import { useHomeConfig } from '../hooks/useHomeConfig';
import { useConfig } from '../contexts/ConfigContext';
import { usePageLoading } from '../contexts/PageLoadingContext';
import { HomeBlock } from '../types/homeConfig';
import {
  WidgetHero,
  WidgetBanner,
  WidgetProducts,
  WidgetFeaturedProducts,
  WidgetFeatures,
  WidgetTestimonials,
  WidgetCta,
} from '../components/homeWidgets';

const widgetMap: Record<string, React.FC<{ block: HomeBlock }>> = {
  hero: WidgetHero,
  banner: WidgetBanner,
  products: WidgetProducts,
  featured: WidgetFeaturedProducts,
  features: WidgetFeatures,
  testimonials: WidgetTestimonials,
  cta: WidgetCta,
};

export const HomePage: React.FC = () => {
  const { data: config, isLoading, error } = useHomeConfig();
  const appConfig = useConfig();
  const { setLoading, setProgress } = usePageLoading();

  useEffect(() => {
    if (isLoading) {
      setLoading(true, 'Chargement de la page d\'accueil...');
      setProgress(0);
    } else {
      setLoading(false);
    }
  }, [isLoading, setLoading, setProgress]);

  if (isLoading) return null;

  if (error) {
    return (
      <>
        <div className="p-6 text-center text-[var(--color-danger)]">
          <p>Erreur lors du chargement de la page d'accueil</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white"
          >
            Réessayer
          </button>
        </div>
        <HomeFooter />
      </>
    );
  }

  const blocks = config?.blocks || [];

  // ---- Cas 1 : blocs en base ----
  if (blocks.length > 0) {
    return (
      <>
        <div className="p-4 max-w-7xl mx-auto space-y-6">
          {blocks
            .filter((b) => b.enabled !== false)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((block) => {
              const Widget = widgetMap[block.type];
              if (!Widget) return null;
              return <Widget key={block.id} block={block} />;
            })}
          <div className="h-8" />
        </div>
        <HomeFooter />
      </>
    );
  }

  // ---- Cas 2 : Home par défaut ----
  const appName = appConfig.storeName || 'App PME';
  const logoUrl = appConfig.logo_url;

  const socials = [
    { url: appConfig.facebook_url, label: 'Facebook' },
    { url: appConfig.instagram_url, label: 'Instagram' },
    { url: appConfig.twitter_url, label: 'Twitter' },
  ].filter((s) => s.url && s.url.trim() !== '');

  return (
    <>
      <div className="p-4 max-w-5xl mx-auto space-y-6">
        <MotionBox type="card" variant="xlarge" className="p-8 text-center">
          {logoUrl && (
            <img
              src={logoUrl}
              alt={appName}
              className="h-24 w-auto mx-auto mb-6 object-contain"
            />
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-textPrimary)]">
            Bienvenue sur {appName}
          </h1>
          <p className="text-[var(--color-textSecondary)] mt-3 max-w-2xl mx-auto">
            La solution de gestion pour votre entreprise.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/boutique"
              className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition"
            >
              🛍️ Voir la boutique
            </Link>
            <Link
              to="/services"
              className="px-6 py-3 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textPrimary)] hover:bg-[var(--color-secondary)] transition"
            >
              📋 Nos services
            </Link>
            <Link
              to="/gestion/home"
              className="px-6 py-3 rounded-xl border border-dashed border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition"
            >
              ⚙️ Personnaliser
            </Link>
          </div>
        </MotionBox>
      </div>
      <HomeFooter />
    </>
  );
};

export default HomePage;
