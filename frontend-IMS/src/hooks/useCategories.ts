'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { insforge } from '@/lib/insforge';

export interface Category {
    id: string;
    business_id: string;
    name: string;
    description: string;
    parent_id: string | null;
    is_active: boolean;
    created_at: string;
}

export interface CategoryFormData {
    name: string;
    description?: string;
    parent_id?: string | null;
    is_active?: boolean;
}

async function getBusinessId(): Promise<string> {
    // Try localStorage first
    const cached = typeof window !== 'undefined' ? localStorage.getItem('ims_business_id') : null;
    if (cached) return cached;

    // Fetch from database
    const { data } = await insforge.database.from('businesses').select('id').limit(1).single();
    const id = data?.id || '';
    if (id && typeof window !== 'undefined') localStorage.setItem('ims_business_id', id);
    return id;
}

export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data, error } = await insforge.database
                .from('categories')
                .select('*')
                .order('name', { ascending: true });
            if (error) throw error;
            return (data || []) as Category[];
        },
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (cat: CategoryFormData) => {
            const business_id = await getBusinessId();
            const { data, error } = await insforge.database
                .from('categories')
                .insert({ ...cat, business_id })
                .select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...values }: CategoryFormData & { id: string }) => {
            const { data, error } = await insforge.database
                .from('categories')
                .update(values)
                .eq('id', id)
                .select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await insforge.database
                .from('categories')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}
