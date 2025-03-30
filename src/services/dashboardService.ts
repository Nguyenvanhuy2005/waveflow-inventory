
import { subDays, format, parseISO } from "date-fns";
import { getOrdersByDateRange } from "./orderService";
import { getLowStockProducts } from "./productService";
import { getTopCustomers } from "./customerService";
import { getRecentOrders } from "./orderService";

export const getDashboardData = async () => {
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);
  
  // Chuyển sang định dạng ISO 8601 đầy đủ theo yêu cầu của WooCommerce API
  const fromDate = format(thirtyDaysAgo, "yyyy-MM-dd'T'HH:mm:ss");
  const toDate = format(today, "yyyy-MM-dd'T'HH:mm:ss");
  
  try {
    // Get orders for the last 30 days
    const orders = await getOrdersByDateRange(fromDate, toDate);
    
    // Get low stock products
    const lowStockProducts = await getLowStockProducts(5);
    
    // Get top customers
    const topCustomers = await getTopCustomers(5);
    
    // Get recent orders
    const recentOrders = await getRecentOrders(10);
    
    // Calculate revenue
    const totalRevenue = orders.reduce((sum, order) => {
      // Only count completed orders
      if (order.status === "completed" || order.status === "processing") {
        return sum + parseFloat(order.total);
      }
      return sum;
    }, 0);
    
    // Group by date for chart
    const revenueByDate: Record<string, number> = {};
    orders.forEach(order => {
      const date = format(parseISO(order.date_created), "yyyy-MM-dd");
      if (order.status === "completed" || order.status === "processing") {
        revenueByDate[date] = (revenueByDate[date] || 0) + parseFloat(order.total);
      }
    });
    
    // Convert to array for chart
    const revenueData = Object.entries(revenueByDate).map(([date, amount]) => ({
      date,
      amount,
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      totalOrders: orders.length,
      totalRevenue,
      lowStockProducts,
      topCustomers,
      recentOrders,
      revenueData,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};
