'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface InvoiceItem {
    id?: string;
    productId: string;
    productName?: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    totalPrice: number;
    product?: { id: string; name: string };
}

export interface Invoice {
    id: string;
    businessId: string;
    invoiceNumber: string;
    type: string;
    partyId: string;
    issueDate: string;
    dueDate: string;
    subtotal: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalAmount: number;
    amountPaid?: number;
    notes: string;
    createdAt: string;
    updatedAt: string;
    party?: { id: string; name: string; gstin: string } | null;
    items?: InvoiceItem[];
}

export interface InvoiceFormData {
    type: string;
    partyId: string;
    issueDate: string;
    dueDate: string;
    subtotal: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalAmount: number;
    amountPaid?: number;
    notes?: string;
    items: InvoiceItem[];
}

interface UseInvoicesOptions {
    type?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

export function useInvoices(options: UseInvoicesOptions = {}) {
    const { type = 'sale', search = '', page = 1, pageSize = 20 } = options;

    return useQuery({
        queryKey: ['invoices', type, search, page, pageSize],
        queryFn: async () => {
            const { data } = await api.get<Invoice[]>('/invoices', {
                params: { type }
            });

            let filtered = Array.isArray(data) ? data : [];

            if (search) {
                const searchLower = search.toLowerCase();
                filtered = filtered.filter(i => i.invoiceNumber?.toLowerCase().includes(searchLower));
            }

            const total = filtered.length;
            const from = (page - 1) * pageSize;
            const to = from + pageSize;
            const paginated = filtered.slice(from, to).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            return { invoices: paginated, total };
        },
    });
}

export function useCreateInvoice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (invoiceData: InvoiceFormData) => {
            const { items, type, partyId, ...invoiceFields } = invoiceData;

            const payloadItems = items.map(item => ({
                product: { id: item.productId },
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                taxRate: item.taxRate,
                taxAmount: item.taxAmount,
                totalPrice: item.totalPrice
            }));

            const payload = {
                invoice: {
                    ...invoiceFields,
                    type,
                    party: { id: partyId }
                },
                items: payloadItems
            };

            const { data } = await api.post<Invoice>('/invoices', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useUpdateInvoice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...values }: Partial<InvoiceFormData> & { id: string }) => {
            // Backend PATCH might be tricky if it doesn't support nested items update yet
            // Assuming the basic invoice fields map exactly like this for now
            const payload = { ...values };
            const { data } = await api.patch<Invoice>(`/invoices/${id}`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useDeleteInvoice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/invoices/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}
