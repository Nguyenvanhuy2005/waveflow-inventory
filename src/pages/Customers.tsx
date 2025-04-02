
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getCustomers, type CustomersResponse, type Customer } from "@/services/customerService";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, CalendarIcon, User2 } from "lucide-react";
import { getRelativeTimeString } from "@/lib/format";
import { ColumnDef } from "@tanstack/react-table";
import { getCellContent } from "@/components/table/TableCellHelpers";

export default function Customers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  
  const { data, isPending } = useQuery<CustomersResponse>({
    queryKey: ["customers", { page, search }],
    queryFn: () => getCustomers({ page, search }),
  });

  const customers = data?.customers || [];
  const totalPages = data?.totalPages || 1;

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "customer",
      header: "Khách hàng",
      cell: (props) => {
        const avatarUrl = getCellContent(props, 'avatar_url');
        const firstName = getCellContent(props, 'first_name');
        const lastName = getCellContent(props, 'last_name');
        const id = getCellContent(props, 'id');
        
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={avatarUrl} alt={`${firstName} ${lastName}`} />
              <AvatarFallback><User2 className="h-4 w-4" /></AvatarFallback>
            </Avatar>
            <div>
              <Link to={`/customers/${id}`} className="font-medium hover:underline">
                {firstName} {lastName}
              </Link>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (props) => getCellContent(props, 'email'),
    },
    {
      accessorKey: "orders_count",
      header: "Đơn hàng",
      cell: (props) => {
        const ordersCount = getCellContent(props, 'orders_count') || 0;
        return (
          <Badge variant="outline">
            {ordersCount}
          </Badge>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Ngày đăng ký",
      cell: (props) => {
        const dateCreated = getCellContent(props, 'date_created');
        return (
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span>{getRelativeTimeString(dateCreated)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-right">Thao tác</div>,
      cell: (props) => {
        const id = getCellContent(props, 'id');
        return (
          <div className="text-right">
            <Link to={`/customers/${id}`}>
              <Button variant="ghost" size="sm">Chi tiết</Button>
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Khách hàng</h1>
        <Link to="/customers/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm khách hàng
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={customers}
            searchPlaceholder="Tìm kiếm khách hàng..."
            onSearch={setSearch}
            isPending={isPending}
            pagination={{
              pageIndex: page - 1,
              pageSize: 10, // Add the missing pageSize property
              pageCount: totalPages,
              onPageChange: (pageIndex) => setPage(pageIndex + 1),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
