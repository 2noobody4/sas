import React from 'react';
import { MotionBox } from '../ui/MotionBox';
import { X } from 'lucide-react';

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  icon,
  onClose,
  children,
}) => {
  return (
    <MotionBox
      as="div"
      type="settings"
      variant="section"
      className="p-6 rounded-xl mt-6 border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
      animation={{
        animationInitiale: 'slideUp',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h2 className="text-xl font-semibold text-[var(--color-textPrimary)]">
            {title}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 transition text-[var(--color-textSecondary)]"
        >
          <X size={20} />
        </button>
      </div>
      <div className="space-y-4">{children}</div>
    </MotionBox>
  );
};
