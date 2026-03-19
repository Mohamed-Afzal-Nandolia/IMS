'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface ProductTemplateValue {
    id: string;
    value: string;
    sortOrder: number;
}

export interface ProductTemplate {
    id: string;
    name: string;
    templateType: string;
    isSystem: boolean;
    sortOrder: number;
    values: ProductTemplateValue[];
}

export function useProductTemplates() {
    return useQuery({
        queryKey: ['product-templates'],
        queryFn: async () => {
            const { data } = await api.get<ProductTemplate[]>('/product-templates');
            return data;
        },
    });
}

export function useCreateProductTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (template: Partial<ProductTemplate>) => {
            const { data } = await api.post<ProductTemplate>('/product-templates', template);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-templates'] });
        },
    });
}

export function useUpdateProductTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...values }: Partial<ProductTemplate> & { id: string }) => {
            const { data } = await api.put(`/product-templates/${id}`, values);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-templates'] });
        },
    });
}

export function useDeleteProductTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/product-templates/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-templates'] });
        },
    });
}
