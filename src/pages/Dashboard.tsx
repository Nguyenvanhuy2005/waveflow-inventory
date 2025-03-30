
import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "../services/dashboardService";
import { StatsCard } from "../components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PackageOpen, ShoppingCart, Users } from "lucide-react";
import { DataTable } from "../components/DataTable";
import { StatusBadge } from "../components/StatusBadge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";
import { 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Bar, 
  CartesianGrid, 
  Tooltip
} from "recharts";

const Dashboard = () => {
  const { data, isPending, error } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: getDashboardData,
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="loading-spinner" />
          <p className="mt-2">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 my-4">
        <h3 className="text-lg font-semibold">Không thể tải dữ liệu</h3>
        <p>Vui lòng kiểm tra kết nối API hoặc thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-4">Tổng quan</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tổng doanh thu"
          value={formatCurrency(data?.totalRevenue || 0)}
          description="30 ngày qua"
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Đơn hàng"
          value={data?.totalOrders || 0}
          description="30 ngày qua"
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Sản phẩm sắp hết"
          value={data?.lowStockProducts?.length || 0}
          description="Cần nhập thêm"
          icon={<PackageOpen className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Khách hàng hàng đầu"
          value={data?.topCustomers?.length || 0}
          description="Theo doanh thu"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.revenueData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => formatDate(value, 'dd/MM')}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value, {notation: 'compact'})}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => formatDate(label, 'dd/MM/yyyy')}
                />
                <Bar dataKey="amount" fill="#3b82f6" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sản phẩm sắp hết</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/products">Xem tất cả</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {data.lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {product.images && product.images[0] ? (
                        <img 
                          src={product.images[0].src} 
                          alt={product.name} 
                          className="w-10 h-10 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                          <PackageOpen className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {product.sku || "N/A"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{product.stock_quantity}</div>
                      <div className="text-sm text-muted-foreground">Còn lại</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                Không có sản phẩm nào sắp hết hàng
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Đơn hàng gần đây</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/orders">Xem tất cả</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={[
                {
                  header: "Mã đơn hàng",
                  accessorKey: "number",
                  cell: (row) => (
                    <Link to={`/orders/${row.id}`} className="font-medium text-primary hover:underline">
                      #{row.number}
                    </Link>
                  ),
                },
                {
                  header: "Khách hàng",
                  accessorKey: "billing.first_name",
                  cell: (row) => (
                    <div>
                      {row.billing?.first_name} {row.billing?.last_name}
                    </div>
                  ),
                },
                {
                  header: "Trạng thái",
                  accessorKey: "status",
                  cell: (row) => <StatusBadge status={row.status} type="order" />,
                },
                {
                  header: "Ngày tạo",
                  accessorKey: "date_created",
                  cell: (row) => formatDate(row.date_created),
                },
                {
                  header: "Tổng tiền",
                  accessorKey: "total",
                  cell: (row) => formatCurrency(parseFloat(row.total)),
                },
              ]}
              data={data?.recentOrders || []}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
