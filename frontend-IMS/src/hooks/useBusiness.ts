'use client';

import { useQuery } from '@tanstack/react-query';
import { insforge } from '@/lib/insforge';

// Fetches the first business — if none exists, creates one
export function useBusiness() {
    return useQuery({
        queryKey: ['business'],
        queryFn: async () => {
            const { data, error } = await insforge.database
                .from('businesses')
                .select('*')
                .limit(1)
                .single();

            if (error || !data) {
                // Create a default business if none exists
                const { data: newBiz, error: createErr } = await insforge.database
                    .from('businesses')
                    .insert({ name: 'My Business' })
                    .select()
                    .single();
                if (createErr) throw createErr;
                return newBiz;
            }
            return data;
        },
        staleTime: Infinity, // Business doesn't change often
    });
}

// Simple helper to get the business_id synchronously from cache
export function getDefaultBusinessId(): string {
    // This is set by the useBusiness hook and stored in localStorage as fallback
    if (typeof window !== 'undefined') {
        return localStorage.getItem('ims_business_id') || '';
    }
    return '';
}
