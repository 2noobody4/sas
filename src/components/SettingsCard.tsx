import React from 'react';
import { MotionBox } from './MotionBox';
import { ChevronRight } from 'lucide-react';

interface SettingsCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  summary?: string;
  onClick: () => void;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  icon,
  title,
  description,
  summary,
  onClick,
}) => {
  return (
    <MotionBox
      as="div"
      type="settings"
      variant="card"
      className="p-5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] flex flex-col"
      onClick={onClick}
      animation={{
        declenchees: [{ trigger: 'hover', animation: 'liftHover' }],
      }}
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl">{icon}</span>
        <ChevronRight size={20} className="text-[var(--color-textSecondary)]" />
      </div>
      <h3 className="text-lg font-semibold mt-3 text-[var(--color-textPrimary)]">
        {title}
      </h3>
      <p className="text-sm mt-1 flex-1 text-[var(--color-textSecondary)]">
        {description}
      </p>
      {summary && (
        <p className="text-xs mt-2 font-medium text-[var(--color-primary)]">
          {summary}
        </p>
      )}
    </MotionBox>
  );
};
