'use client';

import { useQuery } from '@tanstack/react-query';
import { insforge } from '@/lib/insforge';

export function useDashboardStats() {
    return useQuery({
        queryKey: ['dashboard', 'stats'],
        queryFn: async () => {
            const [salesRes, purchasesRes, productsRes, partiesRes, lowStockRes, recentInvoicesRes] =
                await Promise.all([
                    // Total sales
                    insforge.database
                        .from('invoices')
                        .select('total_amount', { count: 'exact' })
                        .eq('type', 'sale'),
                    // Total purchases
                    insforge.database
                        .from('invoices')
                        .select('total_amount', { count: 'exact' })
                        .eq('type', 'purchase'),
                    // Products count
                    insforge.database
                        .from('products')
                        .select('id', { count: 'exact' }),
                    // Parties count
                    insforge.database
                        .from('parties')
                        .select('id', { count: 'exact' }),
                    // Low stock items
                    insforge.database
                        .from('products')
                        .select('id, name, current_stock, min_stock_level, unit')
                        .lt('current_stock', 20)
                        .order('current_stock', { ascending: true })
                        .limit(10),
                    // Recent invoices
                    insforge.database
                        .from('invoices')
                        .select('*, party:parties(id, name)')
                        .order('created_at', { ascending: false })
                        .limit(5),
                ]);

            const totalSales = (salesRes.data || []).reduce(
                (sum: number, inv: any) => sum + (inv.total_amount || 0), 0
            );
            const totalPurchases = (purchasesRes.data || []).reduce(
                (sum: number, inv: any) => sum + (inv.total_amount || 0), 0
            );

            return {
                totalSales,
                totalPurchases,
                netProfit: totalSales - totalPurchases,
                salesCount: salesRes.count || 0,
                purchasesCount: purchasesRes.count || 0,
                totalProducts: productsRes.count || 0,
                totalParties: partiesRes.count || 0,
                lowStockItems: (lowStockRes.data || []) as any[],
                recentInvoices: (recentInvoicesRes.data || []) as any[],
            };
        },
        refetchInterval: 30000, // Refresh every 30s
    });
}
