
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { UserSearchParams, getUsers } from "@/services/userService";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Users = () => {
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    per_page: 10,
    page: 1,
  });

  const { data, isPending } = useQuery({
    queryKey: ["users", searchParams],
    queryFn: () => getUsers(searchParams),
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
        <h1 className="text-3xl font-bold">Người dùng</h1>
        <Button asChild>
          <Link to="/users/new">
            <Plus className="mr-2 h-4 w-4" /> Thêm người dùng
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
                  <AvatarImage src={row.avatar_urls?.[96]} />
                  <AvatarFallback>
                    {row.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    to={`/users/${row.id}`}
                    className="font-medium hover:underline text-primary"
                  >
                    {row.name}
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    {row.email}
                  </div>
                </div>
              </div>
            ),
          },
          {
            header: "Tên đăng nhập",
            accessorKey: "slug",
          },
          {
            header: "Email",
            accessorKey: "email",
          },
          {
            header: "Vai trò",
            accessorKey: "roles",
            cell: (row) => (
              <div>
                {row.roles?.map((role: string) => {
                  let roleName = role;
                  switch (role) {
                    case "administrator":
                      roleName = "Quản trị viên";
                      break;
                    case "editor":
                      roleName = "Biên tập viên";
                      break;
                    case "author":
                      roleName = "Tác giả";
                      break;
                    case "contributor":
                      roleName = "Cộng tác viên";
                      break;
                    case "subscriber":
                      roleName = "Người đăng ký";
                      break;
                    case "customer":
                      roleName = "Khách hàng";
                      break;
                    case "shop_manager":
                      roleName = "Quản lý cửa hàng";
                      break;
                    default:
                      break;
                  }
                  return roleName;
                })}
              </div>
            ),
          },
          {
            header: "Thao tác",
            accessorKey: "id",
            cell: (row) => (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/users/${row.id}`}>Chi tiết</Link>
                </Button>
              </div>
            ),
          },
        ]}
        data={data || []}
        searchPlaceholder="Tìm kiếm người dùng..."
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

export default Users;
