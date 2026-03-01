'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { insforge } from '@/lib/insforge';

// DB columns: name, sku, hsn_code, sac_code, description, unit, purchase_price, selling_price, mrp,
//             gst_rate, cess_rate, opening_stock, current_stock, min_stock_level,
//             batch_tracking, expiry_tracking, image_url, is_active, category_id, business_id

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
    purchase_price: number;
    mrp: number;
    gst_rate: number;
    cess_rate: number;
    current_stock: number;
    opening_stock: number;
    min_stock_level: number;
    description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
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
}

interface UseProductsOptions {
    search?: string;
    category?: string;
    stockFilter?: 'all' | 'low_stock' | 'in_stock' | 'out_of_stock';
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

export function useProducts(options: UseProductsOptions = {}) {
    const { search = '', category = '', stockFilter = 'all', page = 1, pageSize = 20 } = options;

    return useQuery({
        queryKey: ['products', search, category, stockFilter, page, pageSize],
        queryFn: async () => {
            let query = insforge.database
                .from('products')
                .select('*, category:categories(id, name)', { count: 'exact' });

            if (search) {
                query = query.ilike('name', `%${search}%`);
            }
            if (category) {
                query = query.eq('category_id', category);
            }
            if (stockFilter === 'low_stock') {
                query = query.gt('current_stock', 0).lt('current_stock', 20);
            } else if (stockFilter === 'in_stock') {
                query = query.gt('current_stock', 0);
            } else if (stockFilter === 'out_of_stock') {
                query = query.eq('current_stock', 0);
            }

            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.order('created_at', { ascending: false }).range(from, to);

            const { data, error, count } = await query;
            if (error) throw error;
            return { products: (data || []) as Product[], total: count || 0 };
        },
    });
}

export function useProduct(id: string | null) {
    return useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await insforge.database
                .from('products')
                .select('*, category:categories(id, name)')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data as Product;
        },
        enabled: !!id,
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (product: ProductFormData) => {
            const business_id = await getBusinessId();
            const { data, error } = await insforge.database
                .from('products')
                .insert({ ...product, business_id })
                .select();
            if (error) throw error;
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
            const { data, error } = await insforge.database
                .from('products')
                .update(values)
                .eq('id', id)
                .select();
            if (error) throw error;
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
            const { error } = await insforge.database
                .from('products')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}
