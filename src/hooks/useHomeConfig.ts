import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { HomeConfig, HomeBlock, HomeBlockFormData } from '../types/homeConfig';
import { useToast } from './useToast';
import { useDataLoader } from '../contexts/DataLoaderContext';

// ============================================================
// HOME CONFIG
// ============================================================

export const useHomeConfig = () => {
  const { getData } = useDataLoader();
  return useQuery<HomeConfig | null, Error>({
    queryKey: ['home_config'],
    queryFn: async () => {
      try {
        const { data: config, error: configError } = await supabase
          .from('home_config')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (configError && configError.code !== 'PGRST116') throw configError;

        if (!config) {
          return {
            id: 'default',
            blocks: [
              {
                id: 'hero-1',
                type: 'hero',
                title: 'Bienvenue sur App PME',
                subtitle: 'La solution de gestion pour les PME sénégalaises',
                content: 'Gérez vos stocks, vos ventes, votre comptabilité et vos ressources humaines en un seul endroit.',
                image_url: 'https://picsum.photos/seed/hero/1200/400',
                link_url: '/boutique',
                link_label: 'Découvrir la boutique',
                order: 0,
                ordre: 0,
                enabled: true,
              },
              {
                id: 'features-1',
                type: 'features',
                title: 'Nos fonctionnalités',
                subtitle: 'Tout ce dont vous avez besoin pour gérer votre entreprise',
                content: '',
                order: 1,
                ordre: 1,
                enabled: true,
                config: {
                  features: [
                    { icon: '📦', title: 'Gestion de stock', description: 'Suivez vos produits en temps réel' },
                    { icon: '💰', title: 'Caisse', description: 'Enregistrez vos ventes facilement' },
                    { icon: '📊', title: 'Comptabilité', description: 'Suivez vos finances' },
                    { icon: '👥', title: 'RH', description: 'Gérez vos employés' },
                  ]
                }
              },
              {
                id: 'cta-1',
                type: 'cta',
                title: 'Prêt à démarrer ?',
                subtitle: 'Rejoignez des milliers d\'entreprises qui utilisent App PME',
                link_url: '/gestion',
                link_label: 'Commencer maintenant',
                order: 2,
                ordre: 2,
                enabled: true,
              }
            ],
            meta_title: 'App PME - Gestion pour PME sénégalaises',
            meta_description: 'Application de gestion pour PME sénégalaises',
            meta_keywords: 'gestion, PME, Sénégal, stocks, caisse, comptabilité, RH',
            header_style: 'classic',
            show_header: true,
            show_footer: true,
          };
        }

        const { data: blocks, error: blocksError } = await supabase
          .from('home_blocks')
          .select('*')
          .eq('home_config_id', config.id)
          .order('order', { ascending: true });

        if (blocksError) throw blocksError;

        // Normaliser : utiliser order comme champ principal, et ordre comme fallback
        const normalizedBlocks = (blocks || []).map((b: any) => ({
          ...b,
          order: b.order ?? b.ordre ?? 0,
        }));

        return {
          ...config,
          blocks: normalizedBlocks,
        } as HomeConfig;
      } catch {
        const cached = await getData<HomeConfig>('home_config');
        if (cached) return cached;
        throw new Error('Impossible de charger la configuration de la page d\'accueil');
      }
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

// ============================================================
// UPDATE HOME CONFIG
// ============================================================

export const useUpdateHomeConfig = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (data: Partial<HomeConfig>): Promise<HomeConfig> => {
    const { data: existing } = await supabase
      .from('home_config')
      .select('id')
      .limit(1)
      .maybeSingle();

    let configId: string;

    if (existing) {
      const { data: updated, error } = await supabase
        .from('home_config')
        .update({
          meta_title: data.meta_title,
          meta_description: data.meta_description,
          meta_keywords: data.meta_keywords,
          header_style: data.header_style,
          show_header: data.show_header,
          show_footer: data.show_footer,
          custom_css: data.custom_css,
          custom_js: data.custom_js,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      configId = existing.id;
      return { ...updated, blocks: [] };
    } else {
      const { data: inserted, error } = await supabase
        .from('home_config')
        .insert([{
          meta_title: data.meta_title || 'App PME - Gestion pour PME sénégalaises',
          meta_description: data.meta_description || 'Application de gestion pour PME sénégalaises',
          meta_keywords: data.meta_keywords || 'gestion, PME, Sénégal',
          header_style: data.header_style || 'classic',
          show_header: data.show_header !== undefined ? data.show_header : true,
          show_footer: data.show_footer !== undefined ? data.show_footer : true,
          custom_css: data.custom_css || '',
          custom_js: data.custom_js || '',
        }])
        .select()
        .single();

      if (error) throw error;
      configId = inserted.id;
      return { ...inserted, blocks: [] };
    }
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries('home_config');
      success('Configuration de la page d\'accueil mise à jour ✅');
    },
    onError: (err: any) => {
      toastError(err.message);
    },
  });
};

// ============================================================
// HOME BLOCKS CRUD
// ============================================================

export const useCreateHomeBlock = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (data: HomeBlockFormData): Promise<HomeBlock> => {
    const { data: config } = await supabase
      .from('home_config')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (!config) throw new Error('Aucune configuration trouvée');

    const { data: inserted, error } = await supabase
      .from('home_blocks')
      .insert([{
        home_config_id: config.id,
        type: data.type,
        title: data.title,
        subtitle: data.subtitle,
        content: data.content,
        image_url: data.image_url,
        link_url: data.link_url,
        link_label: data.link_label,
        order: data.order,
        ordre: data.order,
        enabled: data.enabled,
        config: data.config,
      }])
      .select()
      .single();

    if (error) throw error;
    return inserted;
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries('home_config');
      success('Bloc créé ✅');
    },
    onError: (err: any) => {
      toastError(err.message);
    },
  });
};

export const useUpdateHomeBlock = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({ id, data }: { id: string; data: Partial<HomeBlockFormData> }): Promise<HomeBlock> => {
    const { data: updated, error } = await supabase
      .from('home_blocks')
      .update({
        type: data.type,
        title: data.title,
        subtitle: data.subtitle,
        content: data.content,
        image_url: data.image_url,
        link_url: data.link_url,
        link_label: data.link_label,
        order: data.order,
        ordre: data.order,
        enabled: data.enabled,
        config: data.config,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries('home_config');
      success('Bloc mis à jour ✅');
    },
    onError: (err: any) => {
      toastError(err.message);
    },
  });
};

export const useDeleteHomeBlock = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase
      .from('home_blocks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries('home_config');
      success('Bloc supprimé ✅');
    },
    onError: (err: any) => {
      toastError(err.message);
    },
  });
};
