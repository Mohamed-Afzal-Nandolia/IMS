'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

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

export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await api.get<Category[]>('/categories');
            let categories = Array.isArray(data) ? data : [];
            return categories.sort((a, b) => a.name.localeCompare(b.name));
        },
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (cat: CategoryFormData) => {
            const { data } = await api.post<Category>('/categories', cat);
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
            const { data } = await api.patch<Category>(`/categories/${id}`, values);
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
            await api.delete(`/categories/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}
