import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomer, getCustomerOrders, updateCustomer } from "@/services/customerService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Order } from "@/services/types";
import { CellContext } from "@tanstack/react-table";
import { getCellContent } from "@/components/table/TableCellHelpers";

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const customerId = id === "new" ? null : parseInt(id || "0");
  const isNewCustomer = id === "new";
  const [customerData, setCustomerData] = useState<any>({});

  const { data: customer, isPending: isCustomerLoading } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => (customerId ? getCustomer(customerId) : Promise.resolve(null)),
    enabled: !isNewCustomer && !!customerId,
  });

  const { data: customerOrders, isPending: isOrdersLoading } = useQuery({
    queryKey: ["customerOrders", customerId],
    queryFn: () => (customerId ? getCustomerOrders(customerId) : Promise.resolve([]) as Promise<Order[]>),
    enabled: !isNewCustomer && !!customerId,
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isNewCustomer
        ? updateCustomer(0, data) // We'd use createCustomer in a real app
        : updateCustomer(customerId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", customerId] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success(
        isNewCustomer
          ? "Khách hàng đã được tạo thành công"
          : "Khách hàng đã được cập nhật thành công"
      );
      if (isNewCustomer) {
        navigate("/customers");
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
    setCustomerData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(customerData);
  };

  if (!isNewCustomer && isCustomerLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="loading-spinner" />
          <p className="mt-2">Đang tải thông tin khách hàng...</p>
        </div>
      </div>
    );
  }

  const displayCustomer = isNewCustomer ? {} : { ...customer, ...customerData };
  const totalSpent = customerOrders?.reduce(
    (sum: number, order: Order) => sum + parseFloat(order.total || "0"),
    0
  ) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/customers")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">
            {isNewCustomer
              ? "Thêm khách hàng mới"
              : `${displayCustomer.first_name} ${displayCustomer.last_name}`}
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

      {!isNewCustomer && customer && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={customer.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {customer.first_name?.[0]}
                    {customer.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">
                  {customer.first_name} {customer.last_name}
                </h2>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
                <div className="flex flex-col items-center">
                  <p className="text-sm text-muted-foreground">Tổng chi tiêu</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(totalSpent)}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-sm text-muted-foreground">Đơn hàng</p>
                  <p className="text-lg font-bold">
                    {customerOrders?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <Tabs defaultValue="info">
              <TabsList>
                <TabsTrigger value="info">Thông tin</TabsTrigger>
                <TabsTrigger value="billing">Địa chỉ thanh toán</TabsTrigger>
                <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin khách hàng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">Tên</Label>
                        <Input
                          id="first_name"
                          name="first_name"
                          defaultValue={displayCustomer.first_name || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Họ</Label>
                        <Input
                          id="last_name"
                          name="last_name"
                          defaultValue={displayCustomer.last_name || ""}
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
                        defaultValue={displayCustomer.email || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="username">Tên đăng nhập</Label>
                        <Input
                          id="username"
                          name="username"
                          defaultValue={displayCustomer.username || ""}
                          onChange={handleInputChange}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Vai trò</Label>
                        <Input
                          id="role"
                          name="role"
                          defaultValue={displayCustomer.role || ""}
                          onChange={handleInputChange}
                          disabled
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="billing" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Địa chỉ thanh toán</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="billing.first_name">Tên</Label>
                        <Input
                          id="billing.first_name"
                          name="billing.first_name"
                          defaultValue={displayCustomer.billing?.first_name || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billing.last_name">Họ</Label>
                        <Input
                          id="billing.last_name"
                          name="billing.last_name"
                          defaultValue={displayCustomer.billing?.last_name || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billing.address_1">Địa chỉ</Label>
                      <Input
                        id="billing.address_1"
                        name="billing.address_1"
                        defaultValue={displayCustomer.billing?.address_1 || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billing.address_2">Địa chỉ (dòng 2)</Label>
                      <Input
                        id="billing.address_2"
                        name="billing.address_2"
                        defaultValue={displayCustomer.billing?.address_2 || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="billing.city">Thành phố</Label>
                        <Input
                          id="billing.city"
                          name="billing.city"
                          defaultValue={displayCustomer.billing?.city || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billing.state">Tỉnh/Thành</Label>
                        <Input
                          id="billing.state"
                          name="billing.state"
                          defaultValue={displayCustomer.billing?.state || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billing.postcode">Mã bưu điện</Label>
                        <Input
                          id="billing.postcode"
                          name="billing.postcode"
                          defaultValue={displayCustomer.billing?.postcode || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="billing.country">Quốc gia</Label>
                        <Input
                          id="billing.country"
                          name="billing.country"
                          defaultValue={displayCustomer.billing?.country || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billing.phone">Điện thoại</Label>
                        <Input
                          id="billing.phone"
                          name="billing.phone"
                          defaultValue={displayCustomer.billing?.phone || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="orders" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Lịch sử đơn hàng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={[
                        {
                          header: "Mã đơn hàng",
                          accessorKey: "number",
                          cell: (props) => (
                            <Link
                              to={`/orders/${getCellContent(props, 'id')}`}
                              className="font-medium text-primary hover:underline"
                            >
                              #{getCellContent(props, 'number')}
                            </Link>
                          ),
                        },
                        {
                          header: "Ngày tạo",
                          accessorKey: "date_created",
                          cell: (props) => formatDate(getCellContent(props, 'date_created')),
                        },
                        {
                          header: "Trạng thái",
                          accessorKey: "status",
                          cell: (props) => (
                            <StatusBadge
                              status={getCellContent(props, 'status')}
                              type="order"
                            />
                          ),
                        },
                        {
                          header: "Tổng tiền",
                          accessorKey: "total",
                          cell: (props) => 
                            formatCurrency(parseFloat(getCellContent(props, 'total') || "0")),
                        },
                      ]}
                      data={customerOrders || []}
                      isPending={isOrdersLoading}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      {isNewCustomer && (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">Tên</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Họ</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  onChange={handleInputChange}
                  required
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
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="billing.phone">Điện thoại</Label>
                <Input
                  id="billing.phone"
                  name="billing.phone"
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  name="username"
                  onChange={handleInputChange}
                  required
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
                required
              />
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4">Địa chỉ khách hàng</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="billing.first_name">Tên (hóa đơn)</Label>
                    <Input
                      id="billing.first_name"
                      name="billing.first_name"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing.last_name">Họ (hóa đơn)</Label>
                    <Input
                      id="billing.last_name"
                      name="billing.last_name"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billing.address_1">Địa chỉ</Label>
                  <Input
                    id="billing.address_1"
                    name="billing.address_1"
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="billing.city">Thành phố</Label>
                    <Input
                      id="billing.city"
                      name="billing.city"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing.state">Tỉnh/Thành</Label>
                    <Input
                      id="billing.state"
                      name="billing.state"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing.postcode">Mã bưu điện</Label>
                    <Input
                      id="billing.postcode"
                      name="billing.postcode"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="billing.country">Quốc gia</Label>
                  <Input
                    id="billing.country"
                    name="billing.country"
                    onChange={handleInputChange}
                    placeholder="VN"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="billing.email">Email (hóa đơn)</Label>
                  <Input
                    id="billing.email"
                    name="billing.email"
                    type="email"
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="billing.company">Công ty (nếu có)</Label>
                  <Input
                    id="billing.company"
                    name="billing.company"
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerDetail;
