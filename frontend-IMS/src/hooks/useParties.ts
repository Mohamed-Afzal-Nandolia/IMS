'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { insforge } from '@/lib/insforge';

export interface Party {
    id: string;
    business_id: string;
    name: string;
    type: string;
    gstin: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    opening_balance: number;
    credit_limit: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PartyFormData {
    name: string;
    type: 'customer' | 'supplier' | 'both';
    gstin?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    opening_balance?: number;
    credit_limit?: number;
    is_active?: boolean;
}

interface UsePartiesOptions {
    search?: string;
    type?: string;
    page?: number;
    pageSize?: number;
}

async function getBusinessId(): Promise<string> {
    const cached = typeof window !== 'undefined' ? localStorage.getItem('ims_business_id') : null;
    if (cached) return cached;
    const { data } = await insforge.database.from('businesses').select('id').limit(1).single();
    const id = data?.id || '';
    if (id && typeof window !== 'undefined') localStorage.setItem('ims_business_id', id);
    return id;
}

export function useParties(options: UsePartiesOptions = {}) {
    const { search = '', type = 'all', page = 1, pageSize = 20 } = options;

    return useQuery({
        queryKey: ['parties', search, type, page, pageSize],
        queryFn: async () => {
            let query = insforge.database
                .from('parties')
                .select('*', { count: 'exact' });

            if (search) {
                query = query.ilike('name', `%${search}%`);
            }
            if (type !== 'all') {
                query = query.eq('type', type);
            }

            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.order('created_at', { ascending: false }).range(from, to);

            const { data, error, count } = await query;
            if (error) throw error;
            return { parties: (data || []) as Party[], total: count || 0 };
        },
    });
}

export function useCreateParty() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (party: PartyFormData) => {
            const business_id = await getBusinessId();
            const { data, error } = await insforge.database
                .from('parties')
                .insert({ ...party, business_id })
                .select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parties'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useUpdateParty() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...values }: PartyFormData & { id: string }) => {
            const { data, error } = await insforge.database
                .from('parties')
                .update(values)
                .eq('id', id)
                .select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parties'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useDeleteParty() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await insforge.database
                .from('parties')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parties'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}
