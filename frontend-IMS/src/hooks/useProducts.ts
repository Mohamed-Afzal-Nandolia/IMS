'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Backend returns camelCase fields (Spring Boot default Jackson serialization)
export interface Product {
    id: string;
    name: string;
    sku: string;
    hsnCode: string;
    sacCode: string;
    unit: string;
    sellingPrice: number;
    purchasePrice: number;
    mrp: number;
    gstRate: number;
    cessRate: number;
    currentStock: number;
    minStockLevel: number;
    isLowStock: boolean;
    description: string;
    isActive: boolean;
    size?: string;
    color?: string;
    brand?: string;
    material?: string;
    attributes?: string;
    discountRate?: number;
    createdAt: string;
    updatedAt: string;
    category?: { id: string; name: string } | null;
}

// Form data uses camelCase to match what backend expects on POST/PATCH
export interface ProductFormData {
    name: string;
    sku?: string;
    hsnCode?: string;
    unit?: string;
    sellingPrice: number;
    purchasePrice: number;
    gstRate: number;
    currentStock?: number;
    minStockLevel: number;
    description?: string;
    isActive?: boolean;
    size?: string;
    color?: string;
    brand?: string;
    material?: string;
    attributes?: string;
    discountRate?: number;
    // category_id is a UI-only helper; mapped to category object below
    category_id?: string | null;
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
                filtered = filtered.filter(p => p.isLowStock);
            } else if (stockFilter === 'in_stock') {
                filtered = filtered.filter(p => (p.currentStock || 0) > 0);
            } else if (stockFilter === 'out_of_stock') {
                filtered = filtered.filter(p => (p.currentStock || 0) <= 0);
            }

            const total = filtered.length;
            const from = (page - 1) * pageSize;
            const to = from + pageSize;
            const paginated = filtered
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(from, to);

            return { products: paginated, total };
        },
    });
}

export function useProduct(id: string | null) {
    return useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            if (!id) return null;
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
            // Build payload in camelCase for the backend
            const { category_id, ...rest } = product;
            const payload: any = { ...rest };
            if (category_id) {
                payload.category = { id: category_id };
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
            const { category_id, ...rest } = values;
            const payload: any = { ...rest };
            if (category_id) {
                payload.category = { id: category_id };
            } else if (category_id === null) {
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
