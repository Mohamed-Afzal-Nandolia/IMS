'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Backend returns camelCase fields (Spring Boot default Jackson serialization)
export interface Category {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    parent?: { id: string; name: string } | null;
}

// Form data in camelCase to match backend expectations
export interface CategoryFormData {
    name: string;
    description?: string;
    isActive?: boolean;
    parent?: { id: string } | null;
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
