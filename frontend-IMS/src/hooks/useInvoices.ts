'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface InvoiceItem {
    id?: string;
    product_id: string;
    product_name?: string;
    quantity: number;
    unit_price: number;
    discount: number;
    gst_rate: number;
    gst_amount: number;
    total: number;
    product?: { id: string; name: string };
}

export interface Invoice {
    id: string;
    business_id: string;
    invoice_number: string;
    invoice_type: string;
    type: string;
    party_id: string;
    invoice_date: string;
    due_date: string;
    subtotal: number;
    discount_amount: number;
    cgst_amount: number;
    sgst_amount: number;
    igst_amount: number;
    total_amount: number;
    amount_paid: number;
    status: string;
    notes: string;
    created_at: string;
    updated_at: string;
    party?: { id: string; name: string; gstin: string } | null;
    invoice_items?: InvoiceItem[];
}

export interface InvoiceFormData {
    invoice_type: string;
    party_id: string;
    invoice_date: string;
    due_date: string;
    subtotal: number;
    discount_amount: number;
    cgst_amount: number;
    sgst_amount: number;
    igst_amount: number;
    total_amount: number;
    amount_paid?: number;
    status?: string;
    notes?: string;
    items: InvoiceItem[];
}

interface UseInvoicesOptions {
    type?: string;
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

export function useInvoices(options: UseInvoicesOptions = {}) {
    const { type = 'sale', status = 'all', search = '', page = 1, pageSize = 20 } = options;

    return useQuery({
        queryKey: ['invoices', type, status, search, page, pageSize],
        queryFn: async () => {
            const { data } = await api.get<Invoice[]>('/invoices', {
                params: { type }
            });

            let filtered = Array.isArray(data) ? data : [];

            if (status && status !== 'all') {
                filtered = filtered.filter(i => i.status === status);
            }
            if (search) {
                const searchLower = search.toLowerCase();
                filtered = filtered.filter(i => i.invoice_number?.toLowerCase().includes(searchLower));
            }

            const total = filtered.length;
            const from = (page - 1) * pageSize;
            const to = from + pageSize;
            const paginated = filtered.slice(from, to).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            // Map frontend expectations
            const mappedInvoices = paginated.map(inv => ({
                ...inv,
                invoice_type: inv.type, // Map 'type' to 'invoice_type' expected by frontend
            }));

            return { invoices: mappedInvoices, total };
        },
    });
}

export function useCreateInvoice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (invoiceData: InvoiceFormData) => {
            const { items, invoice_type, party_id, ...invoiceFields } = invoiceData;

            // Generate invoice number
            const prefix = invoice_type === 'sale' ? 'INV' :
                invoice_type === 'purchase' ? 'PUR' :
                    invoice_type === 'quotation' ? 'QUO' :
                        invoice_type === 'sale_return' ? 'SRN' :
                            invoice_type === 'purchase_return' ? 'PRN' :
                                invoice_type === 'purchase_order' ? 'PO' : 'DOC';
            const invoiceNumber = `${prefix}-${Date.now().toString(36).toUpperCase()}`;

            const payloadItems = items.map(item => ({
                product: { id: item.product_id },
                quantity: item.quantity,
                unitPrice: item.unit_price,
                discount: item.discount || 0,
                gstRate: item.gst_rate,
                gstAmount: item.gst_amount,
                total: item.total
            }));

            const payload = {
                invoice: {
                    ...invoiceFields,
                    type: invoice_type,
                    invoiceNumber,
                    party: { id: party_id }
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
