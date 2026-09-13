import React, { useState } from 'react';
import { MotionBox } from '../../components/ui/MotionBox';
import { SettingsCard } from '../../components/settings/SettingsCard';
import { IdentitySettings } from '../../components/settings/IdentitySettings';
import { AppearanceSettings } from '../../components/settings/AppearanceSettings';
import { InterfaceSettings } from '../../components/settings/InterfaceSettings';
import { LocalizationSettings } from '../../components/settings/LocalizationSettings';
import { NotificationSettings } from '../../components/settings/NotificationSettings';
import { SecuritySettings } from '../../components/settings/SecuritySettings';
import { SystemSettings } from '../../components/settings/SystemSettings';
import { SettingsPreview } from '../../components/settings/SettingsPreview';
import { useConfig } from '../../contexts/ConfigContext';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabaseClient';

type SectionKey = 'identity' | 'appearance' | 'interface' | 'localization' | 'notifications' | 'security' | 'system';

const sections: {
  key: SectionKey;
  icon: string;
  title: string;
  description: string;
  summary?: string;
  component: React.ComponentType<{ onClose: () => void }>;
}[] = [
  {
    key: 'identity',
    icon: '🏪',
    title: 'Identité',
    description: 'Nom, logo et informations générales de l\'application.',
    summary: 'Nom, logo, contact',
    component: IdentitySettings,
  },
  {
    key: 'appearance',
    icon: '🎨',
    title: 'Apparence',
    description: 'Thème, couleurs et animations.',
    summary: 'Thème, animations',
    component: AppearanceSettings,
  },
  {
    key: 'interface',
    icon: '🧭',
    title: 'Interface',
    description: 'Header, navigation et affichage des éléments.',
    summary: 'Header, navbar',
    component: InterfaceSettings,
  },
  {
    key: 'localization',
    icon: '🌍',
    title: 'Régionalisation',
    description: 'Langue, devise, fuseau horaire.',
    summary: 'Langue, devise',
    component: LocalizationSettings,
  },
  {
    key: 'notifications',
    icon: '🔔',
    title: 'Notifications',
    description: 'Gestion globale des notifications.',
    summary: 'Activées, son',
    component: NotificationSettings,
  },
  {
    key: 'security',
    icon: '🔐',
    title: 'Sécurité',
    description: 'Sessions, authentification.',
    summary: 'Session',
    component: SecuritySettings,
  },
  {
    key: 'system',
    icon: '🛠️',
    title: 'Système',
    description: 'Maintenance, version, cache.',
    summary: 'v3.0.0',
    component: SystemSettings,
  },
];

export const SettingsPage: React.FC = () => {
  const config = useConfig();
  const { success, error: toastError } = useToast();
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
  const [resetting, setResetting] = useState(false);

  const handleClose = () => setActiveSection(null);

  const handleReset = async () => {
    if (!window.confirm('Voulez-vous vraiment réinitialiser tous les paramètres aux valeurs par défaut ? Cette action est irréversible.')) {
      return;
    }
    setResetting(true);
    try {
      const configId = config.id || '00000000-0000-0000-0000-000000000000';
      const defaultValues = {
        store_name: 'Ma Boutique',
        logo_url: '',
        header_style: 'classic',
        navbar_style: 'classic',
        nav_background_color: '#FFFFFF',
        locale: 'fr',
        currency: 'XOF',
        timezone: 'Africa/Dakar',
        date_format: 'DD/MM/YYYY',
        enable_notifications: true,
        theme_mode: 'light',
        font_family: 'Inter',
        animations_enabled: true,
        push_enabled: true,
        in_app_notifications: true,
        sound_enabled: true,
        show_badges: true,
        store_email: '',
        store_phone: '',
        store_address: '',
        facebook_url: '',
        twitter_url: '',
        instagram_url: '',
        linkedin_url: '',
        youtube_url: '',
        tiktok_url: '',
        theme_id: null,
        session_duration: 60,
        inactivity_timeout: 15,
        two_factor_auth: false,
        maintenance_mode: false,
        app_version: 'v3.0.0',
        log_level: 'info',
        cache_enabled: true,
      };
      const { error } = await supabase
        .from('config')
        .update(defaultValues)
        .eq('id', configId);
      if (error) throw error;
      await config.refreshConfig();
      success('Paramètres réinitialisés ✅');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setResetting(false);
    }
  };

  const ActiveComponent = activeSection
    ? sections.find((s) => s.key === activeSection)?.component
    : null;

  return (
    <MotionBox
      as="div"
      type="page"
      variant="default"
      className="p-6 max-w-6xl mx-auto bg-[var(--color-background)]"
    >
      <div className="flex flex-wrap items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-textPrimary)]">
            ⚙️ Paramètres
          </h1>
          <p className="mt-1 text-[var(--color-textSecondary)]">
            Configurez l'apparence et le comportement général de votre application.
          </p>
        </div>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="px-4 py-2 rounded border border-[var(--color-danger)] text-[var(--color-danger)] bg-transparent text-sm font-medium transition hover:bg-red-50"
        >
          {resetting ? 'Réinitialisation...' : '🔄 Réinitialiser tout'}
        </button>
      </div>

      {!activeSection ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sections.map((section) => (
              <SettingsCard
                key={section.key}
                icon={section.icon}
                title={section.title}
                description={section.description}
                summary={section.summary}
                onClick={() => setActiveSection(section.key)}
              />
            ))}
          </div>
          <div className="mt-8">
            <SettingsPreview />
          </div>
        </>
      ) : (
        ActiveComponent && <ActiveComponent onClose={handleClose} />
      )}
    </MotionBox>
  );
};

export default SettingsPage;
