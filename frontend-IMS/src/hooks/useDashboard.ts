'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export type TimeRange = '7days' | '30days' | '6months' | 'thisYear';

export function useDashboardStats(range: TimeRange = '6months') {
    return useQuery({
        queryKey: ['dashboard', 'stats', range],
        queryFn: async () => {
            const params = { pageSize: 1000 };
            const [salesRes, purchasesRes, productsRes, partiesRes, businessRes] = await Promise.all([
                api.get('/invoices', { params: { ...params, type: 'sale' } }),
                api.get('/invoices', { params: { ...params, type: 'purchase' } }),
                api.get('/products', { params }),
                api.get('/parties', { params }),
                api.get('/business/me')
            ]);

            const business = businessRes.data;
            const globalMinStock = business?.globalMinStockLevel || 10;

            const getArray = (res: any) => {
                const data = res.data;
                if (Array.isArray(data)) return data;
                if (data && Array.isArray(data.invoices)) return data.invoices;
                if (data && Array.isArray(data.products)) return data.products;
                if (data && Array.isArray(data.parties)) return data.parties;
                return [];
            };

            const sales = getArray(salesRes);
            const purchases = getArray(purchasesRes);
            const products = getArray(productsRes);
            const parties = getArray(partiesRes);

            const totalSales = sales.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);
            const totalPurchases = purchases.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);
            const totalSalesTax = sales.reduce((sum: number, inv: any) => sum + (inv.cgstAmount || 0) + (inv.sgstAmount || 0) + (inv.igstAmount || 0), 0);

            // Aggregate data for charts based on range
            const chartData = [];
            const now = new Date();
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            if (range === '7days' || range === '30days') {
                const days = range === '7days' ? 7 : 30;
                for (let i = days - 1; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
                    const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                    const dayStart = new Date(d.setHours(0, 0, 0, 0));
                    const dayEnd = new Date(d.setHours(23, 59, 59, 999));

                    const dailySales = sales
                        .filter((inv: any) => {
                            const invDate = new Date(inv.issueDate || inv.createdAt);
                            return invDate >= dayStart && invDate <= dayEnd;
                        })
                        .reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);

                    const dailyPurchases = purchases
                        .filter((inv: any) => {
                            const invDate = new Date(inv.issueDate || inv.createdAt);
                            return invDate >= dayStart && invDate <= dayEnd;
                        })
                        .reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);

                    chartData.push({
                        name: dateStr,
                        sales: dailySales,
                        purchases: dailyPurchases,
                        revenue: dailySales,
                        profit: dailySales - dailyPurchases
                    });
                }
            } else {
                const monthsCount = range === '6months' ? 6 : (now.getMonth() + 1);
                for (let i = monthsCount - 1; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const monthName = months[d.getMonth()];
                    const year = d.getFullYear();
                    const month = d.getMonth();

                    const monthlySales = sales
                        .filter((inv: any) => {
                            const invDate = new Date(inv.issueDate || inv.createdAt);
                            return invDate.getMonth() === month && invDate.getFullYear() === year;
                        })
                        .reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);

                    const monthlyPurchases = purchases
                        .filter((inv: any) => {
                            const invDate = new Date(inv.issueDate || inv.createdAt);
                            return invDate.getMonth() === month && invDate.getFullYear() === year;
                        })
                        .reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);

                    chartData.push({
                        name: monthName,
                        sales: monthlySales,
                        purchases: monthlyPurchases,
                        revenue: monthlySales,
                        profit: monthlySales - monthlyPurchases
                    });
                }
            }

            const lowStockItems = products
                .filter((p: any) => {
                    const threshold = p.minStockLevel || globalMinStock;
                    return (p.currentStock ?? 0) > 0 && (p.currentStock ?? 0) < threshold;
                })
                .sort((a: any, b: any) => (a.currentStock ?? 0) - (b.currentStock ?? 0))
                .slice(0, 10);

            const recentInvoices = [...sales, ...purchases]
                .sort((a: any, b: any) => new Date(b.issueDate || b.createdAt).getTime() - new Date(a.issueDate || a.createdAt).getTime())
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
                chartData,
                totalSalesTax,
            };
        },
        refetchInterval: 30000, 
        placeholderData: (previousData) => previousData,
    });
}
