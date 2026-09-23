// ============================================================
// HOME FOOTER — Pied de page avec infos de la boutique
// Version V3 — Compatible React 16
// ============================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../contexts/ConfigContext';
import {
  Mail, Phone, MapPin,
  Facebook, Instagram, Linkedin, Twitter, Youtube, Music2,
} from 'lucide-react';

export const HomeFooter: React.FC = () => {
  const config = useConfig();

  const appName = config.storeName || 'App PME';
  const year = new Date().getFullYear();

  const socials = [
    { url: config.facebook_url, Icon: Facebook, label: 'Facebook', color: '#1877F2' },
    { url: config.instagram_url, Icon: Instagram, label: 'Instagram', color: '#E4405F' },
    { url: config.twitter_url, Icon: Twitter, label: 'Twitter', color: '#1DA1F2' },
    { url: config.linkedin_url, Icon: Linkedin, label: 'LinkedIn', color: '#0A66C2' },
    { url: config.youtube_url, Icon: Youtube, label: 'YouTube', color: '#FF0000' },
    { url: config.tiktok_url, Icon: Music2, label: 'TikTok', color: '#000000' },
  ].filter((s) => s.url && s.url.trim() !== '');

  const hasContact = config.storeEmail || config.storePhone || config.storeAddress;

  return (
    <footer className="mt-12 bg-[var(--color-cardBg)] border-t border-[var(--color-borderColor)]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Colonne 1 : Identité */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              {config.logo_url ? (
                <img
                  src={config.logo_url}
                  alt={appName}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold">
                  {appName.charAt(0).toUpperCase()}
                </div>
              )}
              <h3 className="text-lg font-bold text-[var(--color-textPrimary)]">
                {appName}
              </h3>
            </div>
            <p className="text-sm text-[var(--color-textSecondary)] leading-relaxed">
              Votre partenaire pour la gestion d'entreprise.
            </p>
          </div>

          {/* Colonne 2 : Contact */}
          {hasContact && (
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-textPrimary)] mb-3">
                Contact
              </h4>
              <ul className="space-y-2 text-sm text-[var(--color-textSecondary)]">
                {config.storeEmail && (
                  <li>
                    <a
                      href={`mailto:${config.storeEmail}`}
                      className="flex items-center gap-2 hover:text-[var(--color-primary)] transition"
                    >
                      <Mail size={16} className="text-[var(--color-primary)] flex-shrink-0" />
                      <span className="truncate">{config.storeEmail}</span>
                    </a>
                  </li>
                )}
                {config.storePhone && (
                  <li>
                    <a
                      href={`tel:${config.storePhone}`}
                      className="flex items-center gap-2 hover:text-[var(--color-primary)] transition"
                    >
                      <Phone size={16} className="text-[var(--color-primary)] flex-shrink-0" />
                      <span>{config.storePhone}</span>
                    </a>
                  </li>
                )}
                {config.storeAddress && (
                  <li className="flex items-start gap-2">
                    <MapPin size={16} className="text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                    <span>{config.storeAddress}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Colonne 3 : Réseaux sociaux */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-textPrimary)] mb-3">
              Suivez-nous
            </h4>
            {socials.length === 0 ? (
              <p className="text-sm text-[var(--color-textSecondary)] italic">
                Aucun réseau social configuré
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {socials.map(({ url, Icon, label, color }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={label}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition transform hover:scale-110"
                    style={{
                      backgroundColor: 'var(--color-secondary)',
                      color: 'var(--color-textPrimary)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = color;
                      (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-secondary)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--color-textPrimary)';
                    }}
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <Link to="/services" className="text-[var(--color-textSecondary)] hover:text-[var(--color-primary)] transition">
                Services
              </Link>
              <Link to="/boutique" className="text-[var(--color-textSecondary)] hover:text-[var(--color-primary)] transition">
                Boutique
              </Link>
              <Link to="/messages" className="text-[var(--color-textSecondary)] hover:text-[var(--color-primary)] transition">
                Contact
              </Link>
            </div>
          </div>
        </div>

        {/* Ligne de copyright */}
        <div className="mt-8 pt-6 border-t border-[var(--color-borderColor)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--color-textSecondary)]">
            © {year} {appName} · Tous droits réservés
          </p>
          <p className="text-xs text-[var(--color-textSecondary)]">
            Propulsé par <span className="font-medium text-[var(--color-primary)]">App PME</span> v{config.app_version || '3.0.0'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
