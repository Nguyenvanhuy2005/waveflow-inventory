
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { OrderSearchParams, getOrders } from "@/services/orderService";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Orders = () => {
  const [searchParams, setSearchParams] = useState<OrderSearchParams>({
    per_page: 10,
    page: 1,
  });

  const { data, isPending } = useQuery({
    queryKey: ["orders", searchParams],
    queryFn: () => getOrders(searchParams),
  });

  const handleSearch = (query: string) => {
    setSearchParams((prev) => ({ ...prev, search: query, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page: page + 1 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Đơn hàng</h1>
        <Button asChild>
          <Link to="/orders/new">
            <Plus className="mr-2 h-4 w-4" /> Tạo đơn hàng
          </Link>
        </Button>
      </div>

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
          {
            header: "Thao tác",
            accessorKey: "id",
            cell: (row) => (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/orders/${row.id}`}>Chi tiết</Link>
                </Button>
              </div>
            ),
          },
        ]}
        data={data || []}
        searchPlaceholder="Tìm kiếm đơn hàng..."
        onSearch={handleSearch}
        isPending={isPending}
        pagination={{
          pageIndex: searchParams.page ? searchParams.page - 1 : 0,
          pageCount: 10, // Hardcoded for now, would ideally come from API
          onPageChange: handlePageChange,
        }}
      />
    </div>
  );
};

export default Orders;
