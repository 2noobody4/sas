import React from 'react';

interface SessionStatusBadgeProps {
  statut: 'ouverte' | 'fermee';
}

export const SessionStatusBadge: React.FC<SessionStatusBadgeProps> = ({ statut }) => {
  const isOpen = statut === 'ouverte';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        isOpen
          ? 'bg-[var(--color-success)] text-white'
          : 'bg-[var(--color-secondary)] text-[var(--color-textSecondary)]'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isOpen ? 'bg-white' : 'bg-[var(--color-textSecondary)]'}`} />
      {isOpen ? 'Ouverte' : 'Fermée'}
    </span>
  );
};

export default SessionStatusBadge;
