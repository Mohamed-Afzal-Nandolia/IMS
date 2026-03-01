'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Product {
    id: string;
    business_id: string;
    name: string;
    sku: string;
    hsn_code: string;
    sac_code: string;
    category_id: string | null;
    unit: string;
    selling_price: number;
    sellingPrice?: number;
    purchase_price: number;
    purchasePrice?: number;
    mrp: number;
    gst_rate: number;
    cess_rate: number;
    current_stock?: number;
    currentStock?: number;
    opening_stock?: number;
    openingStock?: number;
    min_stock_level?: number;
    minStockLevel?: number;
    description: string;
    is_active?: boolean;
    isActive?: boolean;
    created_at?: string;
    createdAt?: string;
    updated_at?: string;
    updatedAt?: string;
    category?: { id: string; name: string } | null;
}

export interface ProductFormData {
    name: string;
    sku?: string;
    hsn_code?: string;
    category_id?: string | null;
    unit?: string;
    selling_price: number;
    purchase_price: number;
    gst_rate?: number;
    current_stock?: number;
    min_stock_level?: number;
    description?: string;
    is_active?: boolean;
    category?: { id: string } | null;
}

interface UseProductsOptions {
    search?: string;
    category?: string;
    stockFilter?: 'all' | 'low_stock' | 'in_stock' | 'out_of_stock';
    page?: number;
    pageSize?: number;
}

export function useProducts(options: UseProductsOptions = {}) {
    const { search = '', category = '', stockFilter = 'all', page = 1, pageSize = 20 } = options;

    return useQuery({
        queryKey: ['products', search, category, stockFilter, page, pageSize],
        queryFn: async () => {
            const { data } = await api.get<Product[]>('/products');
            let filtered = Array.isArray(data) ? data : [];

            if (search) {
                const searchLower = search.toLowerCase();
                filtered = filtered.filter(p => p.name.toLowerCase().includes(searchLower));
            }
            if (category) {
                filtered = filtered.filter(p => p.category?.id === category);
            }
            if (stockFilter === 'low_stock') {
                filtered = filtered.filter(p => (p.current_stock || p.currentStock || 0) > 0 && (p.current_stock || p.currentStock || 0) < 20);
            } else if (stockFilter === 'in_stock') {
                filtered = filtered.filter(p => (p.current_stock || p.currentStock || 0) > 0);
            } else if (stockFilter === 'out_of_stock') {
                filtered = filtered.filter(p => (p.current_stock || p.currentStock || 0) <= 0);
            }

            const total = filtered.length;
            const from = (page - 1) * pageSize;
            const to = from + pageSize;
            const paginated = filtered.slice(from, to).sort((a, b) => new Date((b.createdAt || b.created_at) as string).getTime() - new Date((a.createdAt || a.created_at) as string).getTime());

            return { products: paginated, total };
        },
    });
}

export function useProduct(id: string | null) {
    return useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            if (!id) return null;
            // The backend doesn't have a single GET id currently, so fetch all and find
            const { data } = await api.get<Product[]>('/products');
            const found = data.find((p) => p.id === id);
            if (!found) throw new Error('Product not found');
            return found;
        },
        enabled: !!id,
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (product: ProductFormData) => {
            // Map category_id to category object for the backend request
            const payload = { ...product };
            if (payload.category_id) {
                payload.category = { id: payload.category_id };
            }
            const { data } = await api.post<Product>('/products', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...values }: ProductFormData & { id: string }) => {
            const payload = { ...values };
            if (payload.category_id) {
                payload.category = { id: payload.category_id };
            } else if (payload.category_id === null) {
                payload.category = null;
            }
            const { data } = await api.patch<Product>(`/products/${id}`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/products/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}
