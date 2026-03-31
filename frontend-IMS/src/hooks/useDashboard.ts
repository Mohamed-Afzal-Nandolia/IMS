'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export type TimeRange = '7days' | '30days' | '3months' | '6months' | 'thisYear' | 'custom' | 'specificYear';

export interface DashboardFilter {
    range: TimeRange;
    from?: string;
    to?: string;
    year?: number;
}

export function useDashboardStats(filter: DashboardFilter = { range: '6months' }) {
    return useQuery({
        queryKey: ['dashboard', 'stats', filter],
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

            const allSales = getArray(salesRes);
            const allPurchases = getArray(purchasesRes);
            const products = getArray(productsRes);
            const parties = getArray(partiesRes);

            // --- Apply Filtering ---
            const now = new Date();
            let startDate: Date | null = null;
            let endDate: Date = new Date();
            let isDaily = false;

            if (filter.range === '7days') {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0);
                isDaily = true;
            } else if (filter.range === '30days') {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0);
                isDaily = true;
            } else if (filter.range === '3months') {
                startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0);
            } else if (filter.range === '6months') {
                startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0);
            } else if (filter.range === 'thisYear') {
                startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
            } else if (filter.range === 'specificYear' && filter.year) {
                startDate = new Date(filter.year, 0, 1, 0, 0, 0);
                endDate = new Date(filter.year, 11, 31, 23, 59, 59);
            } else if (filter.range === 'custom' && filter.from && filter.to) {
                startDate = new Date(filter.from);
                endDate = new Date(filter.to);
                endDate.setHours(23, 59, 59, 999);
                const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                isDaily = diffDays <= 65; // Use daily points for ranges up to 2 months
            } else {
                // Default to 6 months
                startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0);
            }

            const filterByDate = (inv: any) => {
                const date = new Date(inv.issueDate || inv.createdAt);
                if (startDate && date < startDate) return false;
                if (date > endDate) return false;
                return true;
            };

            const sales = allSales.filter(filterByDate);
            const purchases = allPurchases.filter(filterByDate);

            // --- Totals ---
            const totalSales = sales.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);
            const totalPurchases = purchases.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);
            const totalSalesTax = sales.reduce((sum: number, inv: any) => sum + (inv.cgstAmount || 0) + (inv.sgstAmount || 0) + (inv.igstAmount || 0), 0);

            // --- Chart Data ---
            const chartData = [];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            if (isDaily && startDate) {
                const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                for (let i = 0; i <= diffDays; i++) {
                    const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
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
            } else if (startDate) {
                // Monthly aggregation
                let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
                while (current <= endDate) {
                    const month = current.getMonth();
                    const year = current.getFullYear();
                    const monthName = months[month];

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
                        name: `${monthName} ${year % 100}`,
                        sales: monthlySales,
                        purchases: monthlyPurchases,
                        revenue: monthlySales,
                        profit: monthlySales - monthlyPurchases
                    });

                    current.setMonth(current.getMonth() + 1);
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

            // --- New Analytics Computations ---
            
            // 1. Top Products (based on sales)
            const productSalesMap: Record<string, { name: string; value: number; quantity: number }> = {};
            sales.forEach((inv: any) => {
                if (inv.items) {
                    inv.items.forEach((item: any) => {
                        const name = item.product?.name || item.productName || `ID: ${item.productId?.slice(0,8)}`;
                        if (!productSalesMap[name]) {
                            productSalesMap[name] = { name, value: 0, quantity: 0 };
                        }
                        productSalesMap[name].value += item.totalPrice || 0;
                        productSalesMap[name].quantity += item.quantity || 0;
                    });
                }
            });
            const topProducts = Object.values(productSalesMap)
                .sort((a, b) => b.value - a.value)
                .slice(0, 5);

            // 2. Sales by Category
            const categorySalesMap: Record<string, { name: string; value: number }> = {};
            sales.forEach((inv: any) => {
                if (inv.items) {
                    inv.items.forEach((item: any) => {
                        const catName = item.product?.category?.name || 'Other';
                        if (!categorySalesMap[catName]) {
                            categorySalesMap[catName] = { name: catName, value: 0 };
                        }
                        categorySalesMap[catName].value += item.totalPrice || 0;
                    });
                }
            });
            const categoryData = Object.values(categorySalesMap)
                .sort((a, b) => b.value - a.value);

            // 3. Inventory Status Breakdown
            let inStock = 0;
            let outOfStock = 0;
            let lowSCount = 0;
            products.forEach((p: any) => {
                const stock = p.currentStock ?? 0;
                const threshold = p.minStockLevel || globalMinStock;
                if (stock <= 0) outOfStock++;
                else if (stock < threshold) lowSCount++;
                else inStock++;
            });
            const inventoryStatusData = [
                { name: 'In Stock', value: inStock, color: '#10b981' },
                { name: 'Low Stock', value: lowSCount, color: '#f59e0b' },
                { name: 'Out of Stock', value: outOfStock, color: '#ef4444' },
            ];

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
                topProducts,
                categoryData,
                inventoryStatusData,
            };
        },
        refetchInterval: 30000, 
        placeholderData: (previousData) => previousData,
    });
}
