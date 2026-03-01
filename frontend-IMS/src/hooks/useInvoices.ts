'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { insforge } from '@/lib/insforge';

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

async function getBusinessId(): Promise<string> {
    const cached = typeof window !== 'undefined' ? localStorage.getItem('ims_business_id') : null;
    if (cached) return cached;
    const { data } = await insforge.database.from('businesses').select('id').limit(1).single();
    const id = data?.id || '';
    if (id && typeof window !== 'undefined') localStorage.setItem('ims_business_id', id);
    return id;
}

export function useInvoices(options: UseInvoicesOptions = {}) {
    const { type = 'sale', status = 'all', search = '', page = 1, pageSize = 20 } = options;

    return useQuery({
        queryKey: ['invoices', type, status, search, page, pageSize],
        queryFn: async () => {
            // DB column is 'type' not 'invoice_type'
            let query = insforge.database
                .from('invoices')
                .select('*, party:parties(id, name, gstin)', { count: 'exact' })
                .eq('type', type);

            if (status && status !== 'all') {
                query = query.eq('status', status);
            }
            if (search) {
                query = query.ilike('invoice_number', `%${search}%`);
            }

            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.order('created_at', { ascending: false }).range(from, to);

            const { data, error, count } = await query;
            if (error) throw error;
            // Map 'type' to 'invoice_type' for frontend consistency
            const invoices = (data || []).map((inv: any) => ({
                ...inv,
                invoice_type: inv.type,
            })) as Invoice[];
            return { invoices, total: count || 0 };
        },
    });
}

export function useCreateInvoice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (invoiceData: InvoiceFormData) => {
            const { items, invoice_type, ...invoiceFields } = invoiceData;
            const business_id = await getBusinessId();

            // Generate invoice number
            const prefix = invoice_type === 'sale' ? 'INV' :
                invoice_type === 'purchase' ? 'PUR' :
                    invoice_type === 'quotation' ? 'QUO' :
                        invoice_type === 'sale_return' ? 'SRN' :
                            invoice_type === 'purchase_return' ? 'PRN' :
                                invoice_type === 'purchase_order' ? 'PO' : 'DOC';
            const invoiceNumber = `${prefix}-${Date.now().toString(36).toUpperCase()}`;

            // DB column is 'type' not 'invoice_type'
            const { data: invoice, error: invoiceError } = await insforge.database
                .from('invoices')
                .insert({
                    ...invoiceFields,
                    type: invoice_type,
                    invoice_number: invoiceNumber,
                    business_id,
                })
                .select();

            if (invoiceError) throw invoiceError;
            if (!invoice || !invoice[0]) throw new Error('Failed to create invoice');

            // Insert invoice items
            if (items.length > 0) {
                const itemsToInsert = items.map((item) => ({
                    invoice_id: invoice[0].id,
                    product_id: item.product_id || null,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    discount: item.discount || 0,
                    gst_rate: item.gst_rate,
                    gst_amount: item.gst_amount,
                    total: item.total,
                }));

                const { error: itemsError } = await insforge.database
                    .from('invoice_items')
                    .insert(itemsToInsert);
                if (itemsError) console.warn('Items insert error:', itemsError);
            }

            return invoice[0];
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
            const { items, invoice_type, ...invoiceFields } = values;
            const updateData: any = { ...invoiceFields };
            if (invoice_type) updateData.type = invoice_type;

            const { data, error } = await insforge.database
                .from('invoices')
                .update(updateData)
                .eq('id', id)
                .select();
            if (error) throw error;
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
            // Delete items first
            await insforge.database.from('invoice_items').delete().eq('invoice_id', id);
            const { error } = await insforge.database.from('invoices').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}
