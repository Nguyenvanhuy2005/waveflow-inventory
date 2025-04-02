import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "../services/dashboardService";
import { StatsCard } from "../components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PackageOpen, ShoppingCart, Users, AlertCircle } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCellContent } from "@/components/table/TableCellHelpers";

const Dashboard = () => {
  const { data, isPending, error, refetch } = useQuery({
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-4">Tổng quan</h1>
        </div>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Không thể tải dữ liệu</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>Vui lòng kiểm tra kết nối API hoặc thử lại sau.</p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="self-start">
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const dashboardData = {
    totalOrders: data?.totalOrders || 0,
    totalRevenue: data?.totalRevenue || 0,
    lowStockProducts: data?.lowStockProducts || [],
    topCustomers: data?.topCustomers || [],
    recentOrders: data?.recentOrders || [],
    revenueData: data?.revenueData || [],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-4">Tổng quan</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tổng doanh thu"
          value={formatCurrency(dashboardData.totalRevenue)}
          description="30 ngày qua"
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Đơn hàng"
          value={dashboardData.totalOrders}
          description="30 ngày qua"
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Sản phẩm sắp hết"
          value={dashboardData.lowStockProducts.length}
          description="Cần nhập thêm"
          icon={<PackageOpen className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Khách hàng hàng đầu"
          value={dashboardData.topCustomers.length}
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
            {dashboardData.revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.revenueData}>
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
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Không có dữ liệu doanh thu trong 30 ngày qua
              </div>
            )}
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
            {dashboardData.lowStockProducts && dashboardData.lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.lowStockProducts.slice(0, 5).map((product) => (
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
            {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
              <DataTable
                columns={[
                  {
                    header: "Mã đơn hàng",
                    accessorKey: "number",
                    cell: (props) => (
                      <Link to={`/orders/${getCellContent(props, 'id')}`} className="font-medium text-primary hover:underline">
                        #{getCellContent(props, 'number')}
                      </Link>
                    ),
                  },
                  {
                    header: "Khách hàng",
                    accessorKey: "billing.first_name",
                    cell: (props) => {
                      const billing = getCellContent(props, 'billing');
                      return (
                        <div>
                          {billing?.first_name} {billing?.last_name}
                        </div>
                      );
                    },
                  },
                  {
                    header: "Trạng thái",
                    accessorKey: "status",
                    cell: (props) => <StatusBadge status={getCellContent(props, 'status')} type="order" />,
                  },
                  {
                    header: "Ngày tạo",
                    accessorKey: "date_created",
                    cell: (props) => formatDate(getCellContent(props, 'date_created')),
                  },
                  {
                    header: "Tổng tiền",
                    accessorKey: "total",
                    cell: (props) => formatCurrency(parseFloat(getCellContent(props, 'total') || '0')),
                  },
                ]}
                data={dashboardData.recentOrders}
              />
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                Không có đơn hàng gần đây
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
