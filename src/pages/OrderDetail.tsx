
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrder, updateOrder } from "@/services/orderService";
import { getProducts } from "@/services/products"; // Import from the correct service
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, Trash2, Search } from "lucide-react";
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
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Fetch existing order data if editing
  const { data: order, isPending } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => (orderId ? getOrder(orderId) : Promise.resolve(null)),
    enabled: !isNewOrder && !!orderId,
  });

  // Product search
  const { data: products } = useQuery({
    queryKey: ["products-search", searchTerm],
    queryFn: () => getProducts({ search: searchTerm, per_page: 5 }),
    enabled: isNewOrder && searchTerm.length > 2,
  });

  // Update products search results
  useEffect(() => {
    if (products && products.length > 0) {
      setSearchResults(products);
    } else {
      setSearchResults([]);
    }
  }, [products]);

  // Update order data when fetched
  useEffect(() => {
    if (order) {
      setOrderData(order);
    }
  }, [order]);

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
    
    setSearchTerm("");
    setSearchResults([]);
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
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Billing Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Thông tin thanh toán</h3>
                
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
              </div>
              
              {/* Shipping Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Thông tin giao hàng</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shipping.first_name">Họ</Label>
                    <Input
                      id="shipping.first_name"
                      value={orderData.shipping?.first_name || ""}
                      onChange={(e) => updateCustomerInfo("shipping.first_name", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="shipping.last_name">Tên</Label>
                    <Input
                      id="shipping.last_name"
                      value={orderData.shipping?.last_name || ""}
                      onChange={(e) => updateCustomerInfo("shipping.last_name", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shipping.address_1">Địa chỉ</Label>
                  <Input
                    id="shipping.address_1"
                    value={orderData.shipping?.address_1 || ""}
                    onChange={(e) => updateCustomerInfo("shipping.address_1", e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shipping.city">Thành phố</Label>
                    <Input
                      id="shipping.city"
                      value={orderData.shipping?.city || ""}
                      onChange={(e) => updateCustomerInfo("shipping.city", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="shipping.state">Tỉnh/Thành</Label>
                    <Input
                      id="shipping.state"
                      value={orderData.shipping?.state || ""}
                      onChange={(e) => updateCustomerInfo("shipping.state", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Tổng quan đơn hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Trạng thái:</span>
                <Select value={orderData.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="processing">Đang xử lý</SelectItem>
                    <SelectItem value="on-hold">Tạm giữ</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {!isNewOrder && (
                <div className="flex justify-between">
                  <span>Ngày tạo:</span>
                  <span>{formatDate(orderData.date_created)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Phương thức thanh toán:</span>
                <Select value={orderData.payment_method || "cod"} onValueChange={(value) => 
                  setOrderData((prev: any) => ({...prev, payment_method: value}))}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Phương thức thanh toán" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bacs">Chuyển khoản</SelectItem>
                    <SelectItem value="cod">Thanh toán khi nhận hàng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <div className="flex gap-2">
                  <Input 
                    type="number"
                    value={orderData.shipping_total || "0"}
                    onChange={(e) => setOrderData((prev: any) => ({
                      ...prev,
                      shipping_total: e.target.value
                    }))}
                    className="w-20 h-6 text-right"
                  />
                </div>
              </div>
              
              <div className="flex justify-between">
                <span>Thuế:</span>
                <span>{formatCurrency(totals.tax)}</span>
              </div>
              
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Tổng cộng:</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Search (only for new orders) */}
        {isNewOrder && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Thêm sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full bg-white shadow-lg rounded-md mt-1 z-10 border border-border">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
                          onClick={() => addProductToOrder(product)}
                        >
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0].src}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-md" />
                          )}
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              SKU: {product.sku || "N/A"} | Giá: {formatCurrency(parseFloat(product.price || "0"))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead className="text-center">Số lượng</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                  {isNewOrder && <TableHead className="w-10"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderData.line_items && orderData.line_items.length > 0 ? (
                  orderData.line_items.map((item: any, index: number) => (
                    <TableRow key={item.id || index}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            SKU: {item.sku || "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(parseFloat(item.price || "0"))}
                      </TableCell>
                      <TableCell className="text-center">
                        {isNewOrder ? (
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => 
                              updateLineItemQuantity(index, parseInt(e.target.value))
                            }
                            className="w-16 mx-auto text-center"
                            min="1"
                          />
                        ) : (
                          item.quantity
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(parseFloat(item.price || "0") * item.quantity)}
                      </TableCell>
                      {isNewOrder && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
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
                    <TableCell colSpan={isNewOrder ? 5 : 4} className="text-center py-8">
                      Chưa có sản phẩm nào trong đơn hàng
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetail;
