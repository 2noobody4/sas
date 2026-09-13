import React, { useState } from 'react';
import { MotionBox } from './MotionBox';
import { X, Calendar, Megaphone, ArrowRight } from 'lucide-react';

export interface Announcement {
  id: string;
  type: 'event' | 'update' | 'legal' | 'promo';
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  dismissible?: boolean;
  color?: string;
  bgGradient?: string;
}

interface AnnouncementBannerProps {
  announcements: Announcement[];
  onDismiss?: (id: string) => void;
}

const defaultColors = {
  event: 'from-purple-500 to-pink-500',
  update: 'from-blue-500 to-cyan-500',
  legal: 'from-amber-500 to-orange-500',
  promo: 'from-green-500 to-emerald-500',
};

const defaultIcons = {
  event: <Calendar size={20} />,
  update: <Megaphone size={20} />,
  legal: <X size={20} />,
  promo: <Megaphone size={20} />,
};

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  announcements,
  onDismiss,
}) => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = announcements.filter((a) => !dismissed.has(a.id));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((announcement) => {
        const colorClass = announcement.bgGradient || defaultColors[announcement.type] || 'from-gray-500 to-gray-700';
        const icon = announcement.icon || defaultIcons[announcement.type] || <Megaphone size={20} />;

        return (
          <MotionBox
            key={announcement.id}
            as="div"
            className={`relative overflow-hidden rounded-xl border border-white/20 shadow-lg bg-gradient-to-r ${colorClass} text-white p-4`}
            animation={{ animationInitiale: { nom: 'slideDown' } }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 rounded-full bg-white/20 backdrop-blur-sm">
                {icon}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold">{announcement.title}</h4>
                <p className="text-sm text-white/90 mt-0.5">{announcement.description}</p>
                {announcement.actionLabel && (
                  <button
                    onClick={() => {
                      if (announcement.onAction) {
                        announcement.onAction();
                      } else if (announcement.actionUrl) {
                        window.open(announcement.actionUrl, '_blank');
                      }
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium hover:underline underline-offset-2"
                  >
                    {announcement.actionLabel}
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>

              {announcement.dismissible !== false && (
                <button
                  onClick={() => {
                    setDismissed((prev) => new Set(prev).add(announcement.id));
                    onDismiss?.(announcement.id);
                  }}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Effet de brillance */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          </MotionBox>
        );
      })}
    </div>
  );
};

export default AnnouncementBanner;
