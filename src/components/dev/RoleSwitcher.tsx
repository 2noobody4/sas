import React, { useState, memo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from 'react-query';
import { supabase } from '../../lib/supabaseClient';
import { ChevronDown, ChevronUp, Users } from 'lucide-react';
import { MotionBox } from '../ui/MotionBox';
import { useToast } from '../../hooks/useToast';

const AVAILABLE_ROLES = [
  'admin',
  'gestionnaire',
  'comptable',
  'cashier',
  'magasinier',
  'employe',
  'client',
  'fournisseur',
];

const RoleSwitcher = memo(function RoleSwitcher() {
  const { user, updateUserRole, refreshUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { success, error: toastError } = useToast();
  const isDev = process.env.NODE_ENV === 'development';

  const currentRole = user?.role?.nom || 'client';
  const roleId = user?.role?.id || '?';

  console.log('👤 [RoleSwitcher] Rôle actuel :', currentRole);
  console.log('🆔 [RoleSwitcher] ID du rôle :', roleId);

  const { data: roles = [] } = useQuery<string[]>({
    queryKey: ['available_roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('nom')
        .order('nom');
      if (error) throw error;
      return data.map((r: any) => r.nom);
    },
    staleTime: 1000 * 60 * 5,
    enabled: isDev && !!user,
  });

  if (!isDev || !user) return null;

  const handleRoleChange = async (role: string) => {
    if (updating) return;
    if (role === currentRole) {
      setIsOpen(false);
      return;
    }

    setUpdating(true);
    try {
      await updateUserRole(role);
      await refreshUser();
      success(`Rôle changé en "${role}" ✅`);
    } catch (err: any) {
      toastError(err.message || 'Erreur lors du changement de rôle');
    } finally {
      setUpdating(false);
      setIsOpen(false);
    }
  };

  const allRoles = roles.length > 0 ? roles : AVAILABLE_ROLES;

  return (
    <MotionBox
      as="div"
      className="fixed bottom-20 left-4 z-[9999] bg-[var(--color-cardBg)] border border-[var(--color-borderColor)] rounded-xl shadow-xl p-2"
      animation={{ animationInitiale: 'slideUp' }}
    >
      <div className="flex items-center gap-2 min-w-[160px]">
        <Users size={16} className="text-[var(--color-primary)]" />
        <span className="text-xs font-medium text-[var(--color-textSecondary)]">Rôle :</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--color-secondary)] text-[var(--color-textPrimary)] text-sm font-medium hover:bg-[var(--color-secondary)]/70 transition"
          disabled={updating}
        >
          <span className="capitalize">{updating ? '⏳' : currentRole}</span>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <div className="text-[10px] text-[var(--color-textSecondary)] opacity-60">
          ID: {roleId}
        </div>
      </div>

      {isOpen && (
        <MotionBox
          as="div"
          className="absolute bottom-full left-0 mb-1 w-full bg-[var(--color-cardBg)] border border-[var(--color-borderColor)] rounded-lg shadow-lg overflow-hidden"
          animation={{ animationInitiale: 'fadeIn' }}
        >
          <div className="max-h-48 overflow-y-auto">
            {allRoles.map((role: string) => {
              const isActive = role === currentRole;
              return (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`w-full px-3 py-1.5 text-left text-sm hover:bg-[var(--color-secondary)] transition flex items-center justify-between ${
                    isActive ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--color-textPrimary)]'
                  }`}
                  disabled={updating}
                >
                  <span className="capitalize">{role}</span>
                  {isActive && <span className="text-[10px]">✓</span>}
                </button>
              );
            })}
          </div>
        </MotionBox>
      )}
    </MotionBox>
  );
});

export default RoleSwitcher;
