
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { OrderSearchParams, getOrders } from "@/services/orderService";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getCellContent } from "@/components/table/TableCellHelpers";

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
              const firstName = getCellContent(props, 'billing')?.first_name;
              const lastName = getCellContent(props, 'billing')?.last_name;
              return (
                <div>
                  {firstName} {lastName}
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
          {
            header: "Thao tác",
            accessorKey: "id",
            cell: (props) => (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/orders/${getCellContent(props, 'id')}`}>Chi tiết</Link>
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
