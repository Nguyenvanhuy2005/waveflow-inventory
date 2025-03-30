
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { UserSearchParams, getUsers, testWordPressApiConnection } from "@/services/userService";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, RefreshCcw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { getStoredCredentials } from "@/services/apiConfig";

const Users = () => {
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    per_page: 10,
    page: 1,
  });
  const [connectionStatus, setConnectionStatus] = useState<{
    checked: boolean;
    success: boolean;
    message?: string;
  }>({ checked: false, success: false });

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["users", searchParams],
    queryFn: () => getUsers(searchParams),
    retry: 1,
  });

  useEffect(() => {
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    try {
      const result = await testWordPressApiConnection();
      setConnectionStatus({
        checked: true,
        success: result.success,
        message: result.success ? "Kết nối WordPress API thành công" : `Kết nối thất bại: ${result.error}`,
      });
      
      if (!result.success) {
        toast.error(`Không thể kết nối đến WordPress API: ${result.error}`);
      }
    } catch (error) {
      setConnectionStatus({
        checked: true,
        success: false,
        message: "Lỗi khi kiểm tra kết nối API",
      });
    }
  };

  const handleSearch = (query: string) => {
    setSearchParams((prev) => ({ ...prev, search: query, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page: page + 1 }));
  };

  const credentials = getStoredCredentials();
  const hasCredentials = !!credentials?.wpUsername && !!credentials?.wpPassword;

  if (!hasCredentials) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Người dùng</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Chưa cấu hình API</AlertTitle>
          <AlertDescription>
            Bạn cần thiết lập thông tin đăng nhập WordPress API trong phần Cài đặt trước khi sử dụng tính năng này.
          </AlertDescription>
        </Alert>
        <Button asChild>
          <Link to="/settings">
            Đi đến Cài đặt
          </Link>
        </Button>
      </div>
    );
  }

  if (connectionStatus.checked && !connectionStatus.success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Người dùng</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Không thể kết nối đến WordPress API</AlertTitle>
          <AlertDescription>
            {connectionStatus.message || "Kiểm tra thông tin đăng nhập và kết nối mạng của bạn."}
          </AlertDescription>
        </Alert>
        <div className="flex space-x-4">
          <Button onClick={checkApiConnection}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Kiểm tra lại kết nối
          </Button>
          <Button variant="outline" asChild>
            <Link to="/settings">
              Kiểm tra cài đặt
            </Link>
          </Button>
        </div>
      </div>
    );
  }

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

      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi khi tải dữ liệu</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Không thể tải danh sách người dùng"}
          </AlertDescription>
        </Alert>
      )}

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

      {(!data || data.length === 0) && !isPending && !isError && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <p className="text-muted-foreground mb-4">
              {connectionStatus.success 
                ? "Không có dữ liệu người dùng nào hoặc bạn không có quyền xem danh sách người dùng." 
                : "Không thể tải dữ liệu người dùng. Vui lòng kiểm tra kết nối API."}
            </p>
            <Button onClick={() => refetch()}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Tải lại dữ liệu
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Users;
