
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CustomerSearchParams, getCustomers } from "@/services/customerService";
import { DataTable } from "@/components/DataTable";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Customers = () => {
  const [searchParams, setSearchParams] = useState<CustomerSearchParams>({
    per_page: 10,
    page: 1,
  });

  const { data, isPending } = useQuery({
    queryKey: ["customers", searchParams],
    queryFn: () => getCustomers(searchParams),
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
        <h1 className="text-3xl font-bold">Khách hàng</h1>
        <Button asChild>
          <Link to="/customers/new">
            <Plus className="mr-2 h-4 w-4" /> Thêm khách hàng
          </Link>
        </Button>
      </div>

      <DataTable
        columns={[
          {
            header: "Tên",
            accessorKey: "name",
            cell: (row) => (
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={row.avatar_url} />
                  <AvatarFallback>
                    {row.first_name?.[0]}
                    {row.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    to={`/customers/${row.id}`}
                    className="font-medium hover:underline text-primary"
                  >
                    {row.first_name} {row.last_name}
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    {row.email}
                  </div>
                </div>
              </div>
            ),
          },
          {
            header: "Email",
            accessorKey: "email",
          },
          {
            header: "Ngày đăng ký",
            accessorKey: "date_created",
            cell: (row) => formatDate(row.date_created),
          },
          {
            header: "Số đơn hàng",
            accessorKey: "orders_count",
            cell: () => "Đang tải...", // Ideally, this should show the order count
          },
          {
            header: "Thao tác",
            accessorKey: "id",
            cell: (row) => (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/customers/${row.id}`}>Chi tiết</Link>
                </Button>
              </div>
            ),
          },
        ]}
        data={data || []}
        searchPlaceholder="Tìm kiếm khách hàng..."
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

export default Customers;
