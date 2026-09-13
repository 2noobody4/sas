import React from 'react';
import { Header as BaseHeader, HeaderProps } from '../../layout/Header';

export const HeaderClassic: React.FC<HeaderProps> = (props) => (
  <BaseHeader {...props} className={`border-b border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] ${props.className || ''}`} />
);

export const HeaderDark: React.FC<HeaderProps> = (props) => (
  <BaseHeader {...props} className={`border-b border-[var(--color-borderColor)] bg-[var(--color-primaryDark)] text-white ${props.className || ''}`} />
);

export const HeaderMinimal: React.FC<HeaderProps> = (props) => (
  <BaseHeader {...props} className={`border-none bg-transparent text-[var(--color-textPrimary)] ${props.className || ''}`} />
);

export const HeaderGlass: React.FC<HeaderProps> = (props) => (
  <BaseHeader {...props} className={`backdrop-blur-xl border-b border-white/20 bg-white/10 text-white ${props.className || ''}`} />
);

export const HeaderGradient: React.FC<HeaderProps> = (props) => (
  <BaseHeader {...props} className={`border-none shadow-md bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white ${props.className || ''}`} />
);

export const HEADER_STYLES_MAP = {
  classic: HeaderClassic,
  dark: HeaderDark,
  minimal: HeaderMinimal,
  glass: HeaderGlass,
  gradient: HeaderGradient,
};

export type HeaderStyleKey = keyof typeof HEADER_STYLES_MAP;
