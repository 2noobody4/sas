import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  nom?: string;
  prenom?: string;
  role?: {
    id: string;
    nom: string;
    permissions: string[];
  };
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginResult {
  success: boolean;
  error?: string;
}

export interface RegisterResult {
  success: boolean;
  error?: string;
  user?: SupabaseUser;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const [stableUser, setStableUser] = useState<User | null>(null);
  const isLoadingRef = useRef(false);

  // ✅ loadUser memoized avec dépendances vides
  const loadUser = useCallback(async (): Promise<User | null> => {
    // Éviter les appels simultanés
    if (isLoadingRef.current) {
      return state.user;
    }
    
    isLoadingRef.current = true;
    
    try {
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

      if (error && error.name !== 'AuthSessionMissingError') {
        throw error;
      }

      if (!supabaseUser) {
        setState({ user: null, loading: false, error: null });
        setStableUser(null);
        isLoadingRef.current = false;
        return null;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, nom, prenom, email, role_id')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (userError) {
        console.warn('Erreur chargement utilisateur:', userError);
      }

      let role = undefined;
      if (userData?.role_id) {
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('id, nom, permissions')
          .eq('id', userData.role_id)
          .maybeSingle();

        if (roleError) {
          console.warn('Erreur chargement rôle:', roleError);
        } else if (roleData) {
          role = {
            id: roleData.id,
            nom: roleData.nom,
            permissions: roleData.permissions || [],
          };
        }
      }

      const newUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        nom: userData?.nom || '',
        prenom: userData?.prenom || '',
        role,
      };

      setStableUser(prev => (prev && prev.id === newUser.id ? prev : newUser));
      setState({ user: newUser, loading: false, error: null });
      isLoadingRef.current = false;
      return newUser;
    } catch (err: any) {
      if (err.name === 'AuthSessionMissingError' || err.message?.includes('Auth session missing')) {
        setState({ user: null, loading: false, error: null });
        setStableUser(null);
        isLoadingRef.current = false;
        return null;
      }
      console.error('Erreur chargement utilisateur:', err);
      setState({ user: null, loading: false, error: err.message });
      setStableUser(null);
      isLoadingRef.current = false;
      return null;
    }
  }, []); // ✅ Dépendances vides

  // ✅ refreshUser memoized avec loadUser stable
  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  // ✅ updateUserRole memoized avec loadUser stable
  const updateUserRole = useCallback(async (roleNom: string): Promise<void> => {
    if (!state.user) throw new Error('Utilisateur non connecté');

    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('nom', roleNom)
      .maybeSingle();

    if (roleError) throw new Error('Erreur lors de la récupération du rôle: ' + roleError.message);
    if (!roleData) throw new Error(`Rôle "${roleNom}" introuvable`);

    const roleId = roleData.id;

    const { error: updateError } = await supabase
      .from('users')
      .update({ role_id: roleId })
      .eq('id', state.user.id);

    if (updateError) throw new Error('Erreur lors de la mise à jour du rôle: ' + updateError.message);

    await loadUser();
  }, [state.user, loadUser]);

  // ✅ useEffect avec loadUser stable (ne change pas)
  useEffect(() => {
    loadUser();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        loadUser();
      } else if (event === 'SIGNED_OUT') {
        setState({ user: null, loading: false, error: null });
        setStableUser(null);
      }
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, [loadUser]); // ✅ loadUser stable

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await loadUser();
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message === 'Invalid login credentials'
        ? 'Email ou mot de passe incorrect'
        : 'Erreur de connexion: ' + err.message;
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [loadUser]);

  const register = useCallback(async (
    email: string,
    password: string,
    nom: string,
    prenom: string
  ): Promise<RegisterResult> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('nom', 'client')
        .maybeSingle();

      if (roleError && roleError.code !== 'PGRST116') {
        throw new Error('Erreur lors de la vérification du rôle: ' + roleError.message);
      }

      let roleId = roleData?.id || null;

      if (!roleId) {
        const { data: newRole, error: createError } = await supabase
          .from('roles')
          .upsert(
            { nom: 'client', description: 'Client standard', permissions: [] },
            { onConflict: 'nom' }
          )
          .select()
          .single();

        if (createError || !newRole) {
          throw new Error('Impossible de créer le rôle client: ' + (createError?.message || 'inconnu'));
        }
        roleId = newRole.id;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nom, prenom },
        },
      });

      if (authError) {
        let friendlyMessage = 'Erreur lors de l\'inscription. ';
        if (authError.message.includes('already registered')) {
          friendlyMessage += 'Cet email est déjà utilisé. Veuillez vous connecter.';
        } else if (authError.message.includes('Database error saving new user')) {
          friendlyMessage += 'Problème technique. Contactez le support.';
        } else {
          friendlyMessage += authError.message;
        }
        setState(prev => ({ ...prev, loading: false, error: friendlyMessage }));
        return { success: false, error: friendlyMessage };
      }

      if (!authData.user) {
        throw new Error('Aucun utilisateur créé');
      }

      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          nom,
          prenom,
          email,
          actif: true,
          role_id: roleId,
        }, {
          onConflict: 'id',
        });

      if (upsertError) {
        const errorMessage = 'Compte créé mais profil non enregistré: ' + upsertError.message;
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        return { success: false, error: errorMessage, user: authData.user };
      }

      setState(prev => ({ ...prev, loading: false }));
      return { success: true, user: authData.user };

    } catch (err: any) {
      const errorMessage = err.message || 'Erreur inattendue';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, loading: false, error: null });
    setStableUser(null);
  }, []);

  return {
    ...state,
    user: stableUser,
    login,
    register,
    logout,
    loadUser,
    refreshUser,
    updateUserRole,
  };
};

export default useAuth;
