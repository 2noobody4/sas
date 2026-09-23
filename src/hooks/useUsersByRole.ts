import { useQuery } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { Utilisateur as User } from '../types/modules';
import { useDataLoader } from '../contexts/DataLoaderContext';

export const useUsersByRole = (roles?: string[]) => {
  const { getData } = useDataLoader();

  return useQuery<User[], Error>({
    queryKey: ['users_by_role', roles],
    queryFn: async () => {
      try {
        let query = supabase
          .from('users')
          .select('id, nom, prenom, email, role_id, role:roles(nom)')
          .eq('actif', true)
          .order('nom');

        const { data, error } = await query;
        if (error) throw error;

        if (roles && roles.length > 0) {
          return data.filter((u: any) => roles.includes(u.role?.nom));
        }
        return data as User[];
      } catch {
        const cached = await getData<User[]>('users');
        if (cached) return cached;
        throw new Error('Impossible de charger les utilisateurs');
      }
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};
