'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Business {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    gstin?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
    invoicePrefix?: string;
    purchaseInvoicePrefix?: string;
    invoiceTerms?: string;
    invoiceNotes?: string;
    showBankDetails: boolean;
    showUpiQr: boolean;
    showDigitalSignature: boolean;
    lowStockAlert: boolean;
    newInvoiceAlert: boolean;
    paymentReceivedAlert: boolean;
    overdueInvoicesAlert: boolean;
    globalMinStockLevel: number;
    skuPrefix: string;
    skuCounter: number;
    purchaseInvoiceCounter: number;
    salesInvoiceCounter: number;
    isActive: boolean;
}

export function useBusiness() {
    return useQuery({
        queryKey: ['business'],
        queryFn: async () => {
            const { data } = await api.get<Business>('/business');
            return data;
        },
    });
}

export function useUpdateBusiness() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (business: Partial<Business>) => {
            const { data } = await api.put<Business>('/business', business);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['business'] });
        },
    });
}
