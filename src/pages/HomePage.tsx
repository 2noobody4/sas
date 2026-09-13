import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MotionBox } from '../components/ui/MotionBox';
import { useHomeConfig } from '../hooks/useHomeConfig';
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
} from '../components/home/widgets';

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
  const { setLoading, setProgress } = usePageLoading();

  // Synchroniser le chargement de HomePage avec le loader global
  useEffect(() => {
    if (isLoading) {
      setLoading(true, 'Chargement de la page d\'accueil...');
      setProgress(0);
    } else {
      setLoading(false);
    }
  }, [isLoading, setLoading, setProgress]);

  if (isLoading) return null; // Le FullScreenLoader s'affiche via le contexte

  if (error) {
    return (
      <div className="p-6 text-center text-[var(--color-danger)]">
        <p>Erreur lors du chargement de la page d'accueil</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const blocks = config?.blocks || [];

  if (blocks.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <MotionBox type="card" variant="large" className="p-8">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">Bienvenue sur App PME</h1>
          <p className="text-[var(--color-textSecondary)] mt-4">La page d'accueil est vide. Connectez-vous en tant qu'administrateur pour personnaliser les blocs.</p>
          <Link to="/gestion/home" className="mt-6 inline-block px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-dark)] transition">Personnaliser</Link>
        </MotionBox>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {blocks.filter(b => b.enabled !== false).map((block) => {
        const Widget = widgetMap[block.type];
        if (!Widget) return null;
        return <Widget key={block.id} block={block} />;
      })}
      <div className="h-8" />
    </div>
  );
};

export default HomePage;
