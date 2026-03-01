'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useDashboardStats() {
    return useQuery({
        queryKey: ['dashboard', 'stats'],
        queryFn: async () => {
            // Concurrent API calls to our backend endpoints
            const [salesRes, purchasesRes, productsRes, partiesRes] = await Promise.all([
                api.get('/invoices', { params: { type: 'sale' } }),
                api.get('/invoices', { params: { type: 'purchase' } }),
                api.get('/products'),
                api.get('/parties')
            ]);

            const sales = Array.isArray(salesRes.data) ? salesRes.data : [];
            const purchases = Array.isArray(purchasesRes.data) ? purchasesRes.data : [];
            const products = Array.isArray(productsRes.data) ? productsRes.data : [];
            const parties = Array.isArray(partiesRes.data) ? partiesRes.data : [];

            const totalSales = sales.reduce((sum: number, inv: any) => sum + (inv.totalAmount || inv.total_amount || 0), 0);
            const totalPurchases = purchases.reduce((sum: number, inv: any) => sum + (inv.totalAmount || inv.total_amount || 0), 0);

            const lowStockItems = products
                .filter((p: any) => p.currentStock > 0 && p.currentStock < 20)
                .sort((a: any, b: any) => a.currentStock - b.currentStock)
                .slice(0, 10);

            const recentInvoices = [...sales, ...purchases]
                .sort((a: any, b: any) => new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime())
                .slice(0, 5);

            return {
                totalSales,
                totalPurchases,
                netProfit: totalSales - totalPurchases,
                salesCount: sales.length,
                purchasesCount: purchases.length,
                totalProducts: products.length,
                totalParties: parties.length,
                lowStockItems,
                recentInvoices,
            };
        },
        refetchInterval: 30000, // Refresh every 30s
    });
}
