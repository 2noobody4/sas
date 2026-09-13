import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { 
  Employe, Contrat, FichePaie, Conge, Pointage, 
  EmployeFormData, ContratFormData, FichePaieFormData, 
  CongeFormData, PointageFormData 
} from '../types/rh';
import { useToast } from './useToast';
import { useDataLoader } from '../contexts/DataLoaderContext';
import { useOfflineMutation } from './useOfflineMutation';
import { useComptabiliserCharge } from './useComptabilisation';

// ============================================================
// EMPLOYES
// ============================================================

export const useEmployes = () => {
  const { getData } = useDataLoader();
  return useQuery<Employe[], Error>({
    queryKey: ['employes'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('employes')
          .select('*, user:users(id, nom, prenom, email, telephone)')
          .order('date_embauche', { ascending: false });
        if (error) throw error;
        return data as Employe[];
      } catch {
        const cached = await getData<Employe[]>('employes');
        if (cached) return cached;
        throw new Error('Impossible de charger les employés');
      }
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

export const useEmploye = (id?: string) => {
  return useQuery<Employe | null, Error>({
    queryKey: ['employe', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('employes')
        .select('*, user:users(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Employe;
    },
    enabled: !!id,
  });
};

export const useCreateEmploye = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (data: EmployeFormData): Promise<Employe> => {
    const { data: inserted, error } = await supabase
      .from('employes')
      .insert([{ 
        ...data, 
        statut: data.statut || 'actif' 
      }])
      .select('*, user:users(*)')
      .single();
    
    if (error) throw error;

    if (data.type_contrat) {
      const contratData = {
        employe_id: inserted.id,
        type: data.type_contrat,
        date_debut: data.date_embauche,
        salaire_base: data.salaire_base || 0,
        fichier_url: data.contrat_url || null,
        statut: 'actif',
      };

      const { error: contratError } = await supabase
        .from('contrats')
        .insert([contratData]);

      if (contratError) {
        console.error('[useCreateEmploye] Erreur création contrat:', contratError);
      }
    }

    return inserted;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['employes'] });
        queryClient.invalidateQueries({ queryKey: ['contrats'] });
        success('Employé créé ✅');
      },
      onError: (err: any) => {
        toastError(err.message);
      },
    },
    '/api/employes',
    'POST'
  );
};

export const useUpdateEmploye = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({ id, data }: { id: string; data: Partial<EmployeFormData> }): Promise<Employe> => {
    const { data: updated, error } = await supabase
      .from('employes')
      .update(data)
      .eq('id', id)
      .select('*, user:users(*)')
      .single();
    
    if (error) throw error;

    if (data.type_contrat) {
      const { data: existingContrat } = await supabase
        .from('contrats')
        .select('id')
        .eq('employe_id', id)
        .eq('statut', 'actif')
        .maybeSingle();

      const contratData = {
        employe_id: id,
        type: data.type_contrat,
        date_debut: data.date_embauche || new Date().toISOString().split('T')[0],
        salaire_base: data.salaire_base || 0,
        fichier_url: data.contrat_url || null,
        statut: 'actif',
      };

      if (existingContrat) {
        await supabase
          .from('contrats')
          .update(contratData)
          .eq('id', existingContrat.id);
      } else {
        await supabase
          .from('contrats')
          .insert([contratData]);
      }
    }

    return updated;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['employes'] });
        queryClient.invalidateQueries({ queryKey: ['contrats'] });
        success('Employé mis à jour ✅');
      },
      onError: (err: any) => {
        toastError(err.message);
      },
    },
    '/api/employes',
    'PUT'
  );
};

export const useDeleteEmploye = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase.from('employes').delete().eq('id', id);
    if (error) throw error;
    return id;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['employes'] });
        queryClient.invalidateQueries({ queryKey: ['contrats'] });
        success('Employé supprimé ✅');
      },
      onError: (err: any) => {
        toastError(err.message);
      },
    },
    '/api/employes',
    'DELETE'
  );
};

// ============================================================
// CONTRATS
// ============================================================

export const useContrats = (employeId?: string) => {
  const { getData } = useDataLoader();
  return useQuery<Contrat[], Error>({
    queryKey: ['contrats', employeId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('contrats')
          .select('*, employe:employe_id(*, user:users(*))')
          .order('date_debut', { ascending: false });
        if (employeId) query = query.eq('employe_id', employeId);
        const { data, error } = await query;
        if (error) throw error;
        return data as Contrat[];
      } catch {
        const cached = await getData<Contrat[]>('contrats');
        if (cached) return cached;
        throw new Error('Impossible de charger les contrats');
      }
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

export const useCreateContrat = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (data: ContratFormData): Promise<Contrat> => {
    const { data: inserted, error } = await supabase
      .from('contrats')
      .insert([{ ...data, statut: data.statut || 'actif' }])
      .select('*, employe:employe_id(*, user:users(*))')
      .single();
    if (error) throw error;
    return inserted;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contrats'] });
        success('Contrat créé ✅');
      },
      onError: (err: any) => {
        toastError(err.message);
      },
    },
    '/api/contrats',
    'POST'
  );
};

export const useUpdateContrat = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({ id, data }: { id: string; data: Partial<ContratFormData> }): Promise<Contrat> => {
    const { data: updated, error } = await supabase
      .from('contrats')
      .update(data)
      .eq('id', id)
      .select('*, employe:employe_id(*, user:users(*))')
      .single();
    if (error) throw error;
    return updated;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contrats'] });
        success('Contrat mis à jour ✅');
      },
      onError: (err: any) => {
        toastError(err.message);
      },
    },
    '/api/contrats',
    'PUT'
  );
};

export const useDeleteContrat = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase.from('contrats').delete().eq('id', id);
    if (error) throw error;
    return id;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contrats'] });
        success('Contrat supprimé ✅');
      },
      onError: (err: any) => {
        toastError(err.message);
      },
    },
    '/api/contrats',
    'DELETE'
  );
};

// ============================================================
// FICHES DE PAIE (avec comptabilisation)
// ============================================================

export const useFichesPaie = (employeId?: string) => {
  const { getData } = useDataLoader();
  return useQuery<FichePaie[], Error>({
    queryKey: ['fiches_paie', employeId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('fiches_paie')
          .select('*, employe:employe_id(*, user:users(*))')
          .order('periode', { ascending: false });
        if (employeId) query = query.eq('employe_id', employeId);
        const { data, error } = await query;
        if (error) throw error;
        return data as FichePaie[];
      } catch {
        const cached = await getData<FichePaie[]>('fiches_paie');
        if (cached) return cached;
        throw new Error('Impossible de charger les fiches de paie');
      }
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

export const useCreateFichePaie = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const comptabiliserCharge = useComptabiliserCharge();

  const mutationFn = async (data: FichePaieFormData): Promise<FichePaie> => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const montantNet = data.salaire_base + data.primes - data.deductions;
    
    // 1. Créer la fiche de paie
    const { data: inserted, error } = await supabase
      .from('fiches_paie')
      .insert([{ 
        ...data, 
        montant_net: montantNet, 
        statut: data.statut || 'brouillon',
        type: data.type || 'reglement'
      }])
      .select('*, employe:employe_id(*, user:users(*))')
      .single();
    
    if (error) throw error;

    // 2. 🔥 COMPTABILISATION : Si la fiche est validée ou payée
    if ((data.statut === 'validee' || data.statut === 'payee') && userId && montantNet > 0) {
      try {
        // Récupérer les comptes par défaut
        const { data: comptes } = await supabase
          .from('comptes')
          .select('id, numero')
          .in('numero', ['641000', '521000']);

        const compteChargePersonnel = comptes?.find((c: any) => c.numero === '641000');
        const compteBanque = comptes?.find((c: any) => c.numero === '521000');

        if (compteChargePersonnel && compteBanque) {
          await comptabiliserCharge.mutateAsync({
            saisieId: inserted.id,
            montant: montantNet,
            compteDebitId: compteChargePersonnel.id,
            compteCreditId: compteBanque.id,
            type: 'salaire',
            libelle: `Salaire ${data.periode} - Employé ${inserted.employe?.user?.nom || ''}`,
            userId: userId,
          });
        }
      } catch (comptaError) {
        console.error('[useCreateFichePaie] Erreur comptabilisation:', comptaError);
      }
    }

    return inserted;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['fiches_paie'] });
        queryClient.invalidateQueries({ queryKey: ['transactions_comptables'] });
        queryClient.invalidateQueries({ queryKey: ['comptes'] });
        success('Fiche de paie créée ✅');
      },
      onError: (err: any) => {
        toastError(err.message);
      },
    },
    '/api/fiches_paie',
    'POST'
  );
};

export const useDeleteFichePaie = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<string> => {
    // Supprimer la transaction comptable associée
    await supabase
      .from('transactions_comptables')
      .update({ annulee: true, annulee_le: new Date().toISOString() })
      .eq('reference', id)
      .eq('type', 'salaire');

    const { error } = await supabase.from('fiches_paie').delete().eq('id', id);
    if (error) throw error;
    return id;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['fiches_paie'] });
        queryClient.invalidateQueries({ queryKey: ['transactions_comptables'] });
        queryClient.invalidateQueries({ queryKey: ['comptes'] });
        success('Fiche de paie supprimée ✅');
      },
      onError: (err: any) => {
        toastError(err.message);
      },
    },
    '/api/fiches_paie',
    'DELETE'
  );
};

// ============================================================
// AVANCES SALAIRE
// ============================================================

export const useAvancesSalaire = (employeId?: string) => {
  const { getData } = useDataLoader();
  return useQuery<any[], Error>({
    queryKey: ['avances_salaire', employeId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('avances_salaire')
          .select('*, employe:employe_id(*)')
          .order('date_avance', { ascending: false });
        if (employeId) query = query.eq('employe_id', employeId);
        const { data, error } = await query;
        if (error) {
          console.warn('[useAvancesSalaire] Erreur:', error);
          return [];
        }
        return data || [];
      } catch (err) {
        console.warn('[useAvancesSalaire] Erreur:', err);
        const cached = await getData<any[]>('avances_salaire');
        if (cached) return cached;
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

// ============================================================
// CONGES
// ============================================================

export const useConges = (employeId?: string) => {
  const { getData } = useDataLoader();
  return useQuery<Conge[], Error>({
    queryKey: ['conges', employeId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('conges')
          .select('*, employe:employe_id(*, user:users(*)), approuve_par:approuve_par_id(*)')
          .order('date_debut', { ascending: false });
        if (employeId) query = query.eq('employe_id', employeId);
        const { data, error } = await query;
        if (error) throw error;
        return data as Conge[];
      } catch {
        const cached = await getData<Conge[]>('conges');
        if (cached) return cached;
        throw new Error('Impossible de charger les congés');
      }
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

export const useCreateConge = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (data: CongeFormData): Promise<Conge> => {
    const { data: inserted, error } = await supabase
      .from('conges')
      .insert([{ ...data, statut: 'en_attente' }])
      .select('*, employe:employe_id(*, user:users(*))')
      .single();
    if (error) throw error;
    return inserted;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['conges'] });
        success('Demande de congé créée ✅');
      },
      onError: (err: any) => {
        toastError(err.message);
      },
    },
    '/api/conges',
    'POST'
  );
};

export const useUpdateConge = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({ id, statut }: { id: string; statut: 'approuve' | 'refuse' }): Promise<Conge> => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { data: updated, error } = await supabase
      .from('conges')
      .update({ statut, approuve_par_id: userId })
      .eq('id', id)
      .select('*, employe:employe_id(*, user:users(*))')
      .single();
    if (error) throw error;
    return updated;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['conges'] });
        success('Congé mis à jour ✅');
      },
      onError: (err: any) => {
        toastError(err.message);
      },
    },
    '/api/conges',
    'PUT'
  );
};

export const useDeleteConge = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase.from('conges').delete().eq('id', id);
    if (error) throw error;
    return id;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['conges'] });
        success('Congé supprimé ✅');
      },
      onError: (err: any) => {
        toastError(err.message);
      },
    },
    '/api/conges',
    'DELETE'
  );
};

// ============================================================
// POINTAGES
// ============================================================

export const usePointages = (employeId?: string, date?: string) => {
  const { getData } = useDataLoader();
  return useQuery<Pointage[], Error>({
    queryKey: ['pointages', employeId, date],
    queryFn: async () => {
      try {
        let query = supabase
          .from('pointages')
          .select('*, employe:employe_id(*, user:users(*))')
          .order('date', { ascending: false });
        if (employeId) query = query.eq('employe_id', employeId);
        if (date) query = query.eq('date', date);
        const { data, error } = await query;
        if (error) throw error;
        return data as Pointage[];
      } catch {
        const cached = await getData<Pointage[]>('pointages');
        if (cached) return cached;
        throw new Error('Impossible de charger les pointages');
      }
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

export const useCreatePointage = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (data: PointageFormData): Promise<Pointage> => {
    const { data: inserted, error } = await supabase
      .from('pointages')
      .insert([{ ...data, statut: data.statut || 'present' }])
      .select('*, employe:employe_id(*, user:users(*))')
      .single();
    if (error) throw error;
    return inserted;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pointages'] });
        success('Pointage enregistré ✅');
      },
      onError: (err: any) => {
        toastError(err.message);
      },
    },
    '/api/pointages',
    'POST'
  );
};

export const useDeletePointage = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase.from('pointages').delete().eq('id', id);
    if (error) throw error;
    return id;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pointages'] });
        success('Pointage supprimé ✅');
      },
      onError: (err: any) => {
        toastError(err.message);
      },
    },
    '/api/pointages',
    'DELETE'
  );
};
