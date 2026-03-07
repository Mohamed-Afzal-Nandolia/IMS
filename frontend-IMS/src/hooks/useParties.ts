'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Party {
    id: string;
    businessId: string;
    name: string;
    type: string;
    gstin: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    openingBalance: number;
    creditLimit: number;
    billingAddress?: string;
    shippingAddress?: string;
    currentBalance: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PartyFormData {
    name: string;
    type: 'customer' | 'supplier' | 'both';
    gstin?: string;
    phone?: string;
    email?: string;
    billingAddress?: string;
    shippingAddress?: string;
    isActive?: boolean;
}

interface UsePartiesOptions {
    search?: string;
    type?: string;
    page?: number;
    pageSize?: number;
}

export function useParties(options: UsePartiesOptions = {}) {
    const { search = '', type = 'all', page = 1, pageSize = 20 } = options;

    return useQuery({
        queryKey: ['parties', search, type, page, pageSize],
        queryFn: async () => {
            // Because the backend returns all parties and supports basic ?type= filter
            const { data } = await api.get<Party[]>('/parties', {
                params: type !== 'all' ? { type } : undefined
            });

            let filtered = Array.isArray(data) ? data : [];

            if (search) {
                const searchLower = search.toLowerCase();
                filtered = filtered.filter(p => p.name.toLowerCase().includes(searchLower));
            }

            const total = filtered.length;
            const from = (page - 1) * pageSize;
            const to = from + pageSize;
            const paginated = filtered.slice(from, to);

            return { parties: paginated, total };
        },
    });
}

export function useCreateParty() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (party: PartyFormData) => {
            const { data } = await api.post<Party>('/parties', party);
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
            const { data } = await api.patch<Party>(`/parties/${id}`, values);
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
            await api.delete(`/parties/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parties'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}
