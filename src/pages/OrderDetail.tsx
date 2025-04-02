
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrder, updateOrder } from "@/services/orderService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CustomerSearch } from "@/components/orders/CustomerSearch";
import { ProductSearch } from "@/components/orders/ProductSearch";

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const orderId = id === "new" ? null : parseInt(id || "0");
  const isNewOrder = id === "new";
  
  const [orderData, setOrderData] = useState<any>({
    billing: {},
    shipping: {},
    line_items: [],
    shipping_lines: [],
    status: "pending"
  });
  
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Fetch existing order data if editing
  const { data: order, isPending } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => (orderId ? getOrder(orderId) : Promise.resolve(null)),
    enabled: !isNewOrder && !!orderId,
  });

  // Update order data when fetched
  useEffect(() => {
    if (order) {
      setOrderData(order);
    }
  }, [order]);

  // Update order with customer data when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      setOrderData((prev: any) => ({
        ...prev,
        customer_id: selectedCustomer.id,
        billing: {
          ...selectedCustomer.billing,
          email: selectedCustomer.email || selectedCustomer.billing?.email
        },
        shipping: selectedCustomer.shipping || {}
      }));
    }
  }, [selectedCustomer]);

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    let total = 0;
    let tax = 0;

    if (orderData.line_items && orderData.line_items.length > 0) {
      orderData.line_items.forEach((item: any) => {
        subtotal += (parseFloat(item.price) * item.quantity);
      });
      
      // Add shipping
      const shipping = parseFloat(orderData.shipping_total || "0");
      
      // Calculate tax (simple calculation for demo)
      tax = subtotal * 0.1; // 10% tax
      
      total = subtotal + shipping + tax;
    }

    return {
      subtotal,
      shipping: parseFloat(orderData.shipping_total || "0"),
      tax,
      total
    };
  };

  const totals = calculateTotals();

  // Save order mutation
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

  // Status change handler
  const handleStatusChange = (status: string) => {
    setOrderData((prev: any) => ({ ...prev, status }));
    if (!isNewOrder) {
      mutation.mutate({ status });
    }
  };

  // Add product to order
  const addProductToOrder = (product: any) => {
    const newItem = {
      product_id: product.id,
      name: product.name,
      sku: product.sku || "",
      price: product.price || "0",
      quantity: 1,
      total: product.price || "0"
    };
    
    setOrderData((prev: any) => ({
      ...prev,
      line_items: [...(prev.line_items || []), newItem]
    }));
  };
  
  // Remove line item
  const removeLineItem = (index: number) => {
    const updatedItems = [...orderData.line_items];
    updatedItems.splice(index, 1);
    
    setOrderData((prev: any) => ({
      ...prev,
      line_items: updatedItems
    }));
  };
  
  // Update line item quantity
  const updateLineItemQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    
    const updatedItems = [...orderData.line_items];
    const item = updatedItems[index];
    
    updatedItems[index] = {
      ...item,
      quantity,
      total: (parseFloat(item.price) * quantity).toString()
    };
    
    setOrderData((prev: any) => ({
      ...prev,
      line_items: updatedItems
    }));
  };
  
  // Update customer information
  const updateCustomerInfo = (field: string, value: string) => {
    const [section, key] = field.split('.');
    
    setOrderData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  // Save the entire order
  const handleSaveOrder = () => {
    // Validate minimum required fields
    if (isNewOrder) {
      if (!orderData.billing?.first_name || !orderData.billing?.last_name) {
        toast.error("Vui lòng nhập tên khách hàng");
        return;
      }
      
      if (orderData.line_items.length === 0) {
        toast.error("Đơn hàng phải có ít nhất một sản phẩm");
        return;
      }
    }
    
    mutation.mutate(orderData);
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
            {isNewOrder ? "Tạo đơn hàng mới" : `Đơn hàng #${orderData.number || ""}`}
          </h1>
          {!isNewOrder && orderData.status && (
            <StatusBadge status={orderData.status} type="order" />
          )}
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1">
            <Button
              variant="outline"
              onClick={() => handleStatusChange("processing")}
              disabled={orderData.status === "processing"}
            >
              Đang xử lý
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStatusChange("completed")}
              disabled={orderData.status === "completed"}
            >
              Hoàn thành
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStatusChange("cancelled")}
              disabled={orderData.status === "cancelled"}
            >
              Hủy
            </Button>
          </div>

          <Button onClick={handleSaveOrder} disabled={mutation.isPending}>
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Customer Information */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isNewOrder && (
              <CustomerSearch 
                onSelectCustomer={setSelectedCustomer} 
                selectedCustomer={selectedCustomer}
              />
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billing.first_name">Họ</Label>
                <Input
                  id="billing.first_name"
                  value={orderData.billing?.first_name || ""}
                  onChange={(e) => updateCustomerInfo("billing.first_name", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="billing.last_name">Tên</Label>
                <Input
                  id="billing.last_name"
                  value={orderData.billing?.last_name || ""}
                  onChange={(e) => updateCustomerInfo("billing.last_name", e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="billing.email">Email</Label>
              <Input
                id="billing.email"
                type="email"
                value={orderData.billing?.email || ""}
                onChange={(e) => updateCustomerInfo("billing.email", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="billing.phone">Số điện thoại</Label>
              <Input
                id="billing.phone"
                value={orderData.billing?.phone || ""}
                onChange={(e) => updateCustomerInfo("billing.phone", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="billing.address_1">Địa chỉ</Label>
              <Input
                id="billing.address_1"
                value={orderData.billing?.address_1 || ""}
                onChange={(e) => updateCustomerInfo("billing.address_1", e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billing.city">Thành phố</Label>
                <Input
                  id="billing.city"
                  value={orderData.billing?.city || ""}
                  onChange={(e) => updateCustomerInfo("billing.city", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="billing.state">Tỉnh/Thành</Label>
                <Input
                  id="billing.state"
                  value={orderData.billing?.state || ""}
                  onChange={(e) => updateCustomerInfo("billing.state", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Order Items */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sản phẩm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isNewOrder && (
              <ProductSearch onSelectProduct={addProductToOrder} />
            )}
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Tổng</TableHead>
                    {isNewOrder && <TableHead className="w-[50px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderData.line_items?.length ? (
                    orderData.line_items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{formatCurrency(parseFloat(item.price || "0"))}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-16"
                            min="1"
                            value={item.quantity}
                            disabled={!isNewOrder}
                            onChange={(e) => updateLineItemQuantity(index, parseInt(e.target.value))}
                          />
                        </TableCell>
                        <TableCell>
                          {formatCurrency(parseFloat(item.price || "0") * item.quantity)}
                        </TableCell>
                        {isNewOrder && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLineItem(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Chưa có sản phẩm nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="border rounded-md p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tạm tính:</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Thuế (10%):</span>
                <span>{formatCurrency(totals.tax)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Phí giao hàng:</span>
                <span>{formatCurrency(totals.shipping)}</span>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center font-semibold">
                  <span>Tổng cộng:</span>
                  <span className="text-lg">{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetail;
