'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Department {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface DepartmentFormData {
    name: string;
    description?: string;
    isActive?: boolean;
}

export function useDepartments() {
    return useQuery({
        queryKey: ['departments'],
        queryFn: async () => {
            const { data } = await api.get<Department[]>('/departments');
            let departments = Array.isArray(data) ? data : [];
            return departments.sort((a, b) => a.name.localeCompare(b.name));
        },
    });
}

export function useCreateDepartment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (dept: DepartmentFormData) => {
            const { data } = await api.post<Department>('/departments', dept);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
        },
    });
}

export function useUpdateDepartment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...values }: DepartmentFormData & { id: string }) => {
            const { data } = await api.patch<Department>(`/departments/${id}`, values);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            // Invalidate categories too since they might reference this department name
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}

export function useDeleteDepartment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/departments/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}
