
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUser, updateUser } from "@/services/userService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = id === "new" ? null : parseInt(id || "0");
  const isNewUser = id === "new";
  const [userData, setUserData] = useState<any>({});

  const { data: user, isPending } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => (userId ? getUser(userId) : Promise.resolve(null)),
    enabled: !isNewUser && !!userId,
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isNewUser
        ? updateUser(0, data) // We'd use createUser in a real app
        : updateUser(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(
        isNewUser
          ? "Người dùng đã được tạo thành công"
          : "Người dùng đã được cập nhật thành công"
      );
      if (isNewUser) {
        navigate("/users");
      }
    },
    onError: () => {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUserData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(userData);
  };

  if (!isNewUser && isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="loading-spinner" />
          <p className="mt-2">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  const displayUser = isNewUser ? {} : { ...user, ...userData };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/users")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">
            {isNewUser ? "Thêm người dùng" : displayUser.name}
          </h1>
        </div>
        <Button onClick={handleSubmit} disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <div className="loading-spinner mr-2" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Lưu
            </>
          )}
        </Button>
      </div>

      {!isNewUser && user && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar_urls?.[96]} />
                  <AvatarFallback className="text-2xl">
                    {user.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex flex-col items-center">
                  <p className="text-sm text-muted-foreground">Vai trò</p>
                  <p className="text-lg font-bold">
                    {user.roles?.[0] === "administrator"
                      ? "Quản trị viên"
                      : user.roles?.[0] === "editor"
                      ? "Biên tập viên"
                      : user.roles?.[0] === "author"
                      ? "Tác giả"
                      : user.roles?.[0] === "contributor"
                      ? "Cộng tác viên"
                      : user.roles?.[0] === "subscriber"
                      ? "Người đăng ký"
                      : user.roles?.[0] === "customer"
                      ? "Khách hàng"
                      : user.roles?.[0] === "shop_manager"
                      ? "Quản lý cửa hàng"
                      : user.roles?.[0]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin người dùng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Tên</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      defaultValue={displayUser.first_name || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Họ</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      defaultValue={displayUser.last_name || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nickname">Biệt danh</Label>
                    <Input
                      id="nickname"
                      name="nickname"
                      defaultValue={displayUser.nickname || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Tên đăng nhập</Label>
                    <Input
                      id="username"
                      name="username"
                      defaultValue={displayUser.slug || ""}
                      disabled
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={displayUser.email || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Giới thiệu</Label>
                  <textarea
                    id="description"
                    name="description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue={displayUser.description || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="url">Website</Label>
                    <Input
                      id="url"
                      name="url"
                      defaultValue={displayUser.url || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locale">Ngôn ngữ</Label>
                    <Input
                      id="locale"
                      name="locale"
                      defaultValue={displayUser.locale || ""}
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {isNewUser && (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin người dùng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">Tên</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Họ</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  name="username"
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">Biệt danh</Label>
                <Input
                  id="nickname"
                  name="nickname"
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                name="password"
                type="password"
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              <select
                id="role"
                name="role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                onChange={(e) =>
                  setUserData((prev: any) => ({
                    ...prev,
                    role: e.target.value,
                  }))
                }
              >
                <option value="">Chọn vai trò</option>
                <option value="administrator">Quản trị viên</option>
                <option value="editor">Biên tập viên</option>
                <option value="author">Tác giả</option>
                <option value="contributor">Cộng tác viên</option>
                <option value="subscriber">Người đăng ký</option>
                <option value="customer">Khách hàng</option>
                <option value="shop_manager">Quản lý cửa hàng</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserDetail;
