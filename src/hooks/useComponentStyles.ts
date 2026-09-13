import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { ComponentStyle, Style, Animation } from '../types/theme';
import { useToast } from './useToast';

// ============================================================
// RÉCUPÉRER TOUS LES STYLES DE COMPOSANTS POUR UN THÈME
// ============================================================
export const useComponentStyles = (themeId: string) => {
  return useQuery<ComponentStyle[], Error>({
    queryKey: ['component_styles', themeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('component_styles')
        .select('*')
        .eq('theme_id', themeId);
      if (error) throw error;
      return data as ComponentStyle[];
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
    enabled: !!themeId,
  });
};

// ============================================================
// RÉCUPÉRER UN STYLE DE COMPOSANT SPÉCIFIQUE
// ============================================================
export const useComponentStyle = (themeId: string, typeComponent: string) => {
  return useQuery<ComponentStyle | null, Error>({
    queryKey: ['component_style', themeId, typeComponent],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('component_styles')
        .select('*')
        .eq('theme_id', themeId)
        .eq('type_component', typeComponent)
        .maybeSingle();
      if (error) throw error;
      return data as ComponentStyle | null;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!themeId && !!typeComponent,
  });
};

// ============================================================
// CRÉER OU METTRE À JOUR UN STYLE DE COMPOSANT
// ============================================================
export const useUpsertComponentStyle = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({
    themeId,
    typeComponent,
    style,
    animation,
  }: {
    themeId: string;
    typeComponent: string;
    style: Style;
    animation?: Animation;
  }): Promise<ComponentStyle> => {
    // Vérifier si le style existe déjà
    const { data: existing } = await supabase
      .from('component_styles')
      .select('id')
      .eq('theme_id', themeId)
      .eq('type_component', typeComponent)
      .maybeSingle();

    let result;
    if (existing) {
      // Mise à jour
      const { data, error } = await supabase
        .from('component_styles')
        .update({
          style,
          animation: animation || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      // Insertion
      const { data, error } = await supabase
        .from('component_styles')
        .insert({
          theme_id: themeId,
          type_component: typeComponent,
          style,
          animation: animation || null,
        })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }
    return result;
  };

  return useMutation(mutationFn, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['component_styles', variables.themeId]);
      queryClient.invalidateQueries(['component_style', variables.themeId, variables.typeComponent]);
      success(`Style du composant "${variables.typeComponent}" sauvegardé ✅`);
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur lors de la sauvegarde du style');
    },
  });
};

// ============================================================
// SUPPRIMER UN STYLE DE COMPOSANT
// ============================================================
export const useDeleteComponentStyle = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({
    themeId,
    typeComponent,
  }: {
    themeId: string;
    typeComponent: string;
  }): Promise<void> => {
    const { error } = await supabase
      .from('component_styles')
      .delete()
      .eq('theme_id', themeId)
      .eq('type_component', typeComponent);
    if (error) throw error;
  };

  return useMutation(mutationFn, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['component_styles', variables.themeId]);
      queryClient.invalidateQueries(['component_style', variables.themeId, variables.typeComponent]);
      success(`Style du composant "${variables.typeComponent}" supprimé ✅`);
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur lors de la suppression du style');
    },
  });
};

// ============================================================
// SYNCHRONISER LES STYLES AVEC LE THÈME (pour l'éditeur)
// ============================================================
export const useSyncComponentStyles = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({
    themeId,
    components,
  }: {
    themeId: string;
    components: ComponentStyle[];
  }): Promise<void> => {
    // Récupérer les styles existants pour ce thème
    const { data: existing } = await supabase
      .from('component_styles')
      .select('id, type_component')
      .eq('theme_id', themeId);

    const existingMap = new Map(existing?.map((e: any) => [e.type_component, e.id]) || []);

    // Pour chaque composant, upsert
    for (const comp of components) {
      if (existingMap.has(comp.typeComponent)) {
        // Mise à jour
        const { error } = await supabase
          .from('component_styles')
          .update({
            style: comp.style,
            animation: comp.animation || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingMap.get(comp.typeComponent));
        if (error) throw error;
      } else {
        // Insertion
        const { error } = await supabase
          .from('component_styles')
          .insert({
            theme_id: themeId,
            type_component: comp.typeComponent,
            style: comp.style,
            animation: comp.animation || null,
          });
        if (error) throw error;
      }
    }
  };

  return useMutation(mutationFn, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['component_styles', variables.themeId]);
      success('Tous les styles de composants ont été synchronisés ✅');
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur lors de la synchronisation des styles');
    },
  });
};
