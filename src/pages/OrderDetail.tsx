
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrder, updateOrder } from "@/services/orderService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const orderId = id === "new" ? null : parseInt(id || "0");
  const isNewOrder = id === "new";
  const [orderData, setOrderData] = useState<any>({});

  const { data: order, isPending } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => (orderId ? getOrder(orderId) : Promise.resolve(null)),
    enabled: !isNewOrder && !!orderId,
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isNewOrder
        ? updateOrder(0, data) // We'd use createOrder in a real app
        : updateOrder(orderId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(
        isNewOrder
          ? "Đơn hàng đã được tạo thành công"
          : "Đơn hàng đã được cập nhật thành công"
      );
      if (isNewOrder) {
        navigate("/orders");
      }
    },
    onError: () => {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    },
  });

  const handleStatusChange = (status: string) => {
    setOrderData((prev: any) => ({ ...prev, status }));
    mutation.mutate({ status });
  };

  if (!isNewOrder && isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="loading-spinner" />
          <p className="mt-2">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  const displayOrder = isNewOrder ? {} : { ...order, ...orderData };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/orders")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">
            {isNewOrder ? "Tạo đơn hàng mới" : `Đơn hàng #${displayOrder.number}`}
          </h1>
          {!isNewOrder && displayOrder.status && (
            <StatusBadge status={displayOrder.status} type="order" />
          )}
        </div>
        <div className="flex gap-2">
          {!isNewOrder && (
            <>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange("processing")}
                  disabled={displayOrder.status === "processing"}
                >
                  Đang xử lý
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange("completed")}
                  disabled={displayOrder.status === "completed"}
                >
                  Hoàn thành
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={displayOrder.status === "cancelled"}
                >
                  Hủy
                </Button>
              </div>
            </>
          )}

          <Button onClick={() => mutation.mutate(orderData)} disabled={mutation.isPending}>
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
      </div>

      {!isNewOrder && displayOrder.id && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Mã đơn hàng:</div>
                <div>#{displayOrder.number}</div>

                <div className="font-medium">Ngày tạo:</div>
                <div>{formatDate(displayOrder.date_created)}</div>

                <div className="font-medium">Phương thức thanh toán:</div>
                <div>{displayOrder.payment_method_title || "N/A"}</div>

                <div className="font-medium">Trạng thái thanh toán:</div>
                <div>
                  {displayOrder.date_paid
                    ? "Đã thanh toán"
                    : "Chưa thanh toán"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="font-medium">Địa chỉ thanh toán</div>
                <div className="text-sm">
                  <p>
                    {displayOrder.billing?.first_name}{" "}
                    {displayOrder.billing?.last_name}
                  </p>
                  {displayOrder.billing?.company && (
                    <p>{displayOrder.billing.company}</p>
                  )}
                  <p>
                    {displayOrder.billing?.address_1}
                    {displayOrder.billing?.address_2
                      ? `, ${displayOrder.billing.address_2}`
                      : ""}
                  </p>
                  <p>
                    {displayOrder.billing?.city},{" "}
                    {displayOrder.billing?.state}{" "}
                    {displayOrder.billing?.postcode}
                  </p>
                  <p>{displayOrder.billing?.country}</p>
                  <p>
                    Email: {displayOrder.billing?.email || "N/A"}
                  </p>
                  <p>
                    Điện thoại: {displayOrder.billing?.phone || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tổng thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Tạm tính:</div>
                <div className="text-right">
                  {formatCurrency(
                    parseFloat(displayOrder.total) -
                      parseFloat(displayOrder.shipping_total) -
                      parseFloat(displayOrder.total_tax)
                  )}
                </div>

                <div className="font-medium">Phí vận chuyển:</div>
                <div className="text-right">
                  {formatCurrency(
                    parseFloat(displayOrder.shipping_total || "0")
                  )}
                </div>

                <div className="font-medium">Thuế:</div>
                <div className="text-right">
                  {formatCurrency(parseFloat(displayOrder.total_tax || "0"))}
                </div>

                <div className="font-medium">Giảm giá:</div>
                <div className="text-right">
                  {formatCurrency(
                    parseFloat(displayOrder.discount_total || "0")
                  )}
                </div>

                <div className="col-span-2 border-t pt-2">
                  <div className="flex justify-between font-medium">
                    <span>Tổng cộng:</span>
                    <span className="text-xl font-bold">
                      {formatCurrency(parseFloat(displayOrder.total || "0"))}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium">Sản phẩm</th>
                      <th className="py-2 text-right font-medium">Đơn giá</th>
                      <th className="py-2 text-center font-medium">Số lượng</th>
                      <th className="py-2 text-right font-medium">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayOrder.line_items?.map((item: any) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            SKU: {item.sku || "N/A"}
                          </div>
                        </td>
                        <td className="py-2 text-right">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right">
                          {formatCurrency(parseFloat(item.total || "0"))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isNewOrder && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Chức năng tạo đơn hàng mới đang được phát triển. Vui lòng quay lại sau.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderDetail;
