
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProduct, updateProduct } from "@/services/productService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const productId = id === "new" ? null : parseInt(id || "0");
  const isNewProduct = id === "new";
  const [productData, setProductData] = useState<any>({});

  const { data: product, isPending } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => (productId ? getProduct(productId) : Promise.resolve(null)),
    enabled: !isNewProduct && !!productId,
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isNewProduct
        ? updateProduct(0, data) // We'd use createProduct in a real app
        : updateProduct(productId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(
        isNewProduct
          ? "Sản phẩm đã được tạo thành công"
          : "Sản phẩm đã được cập nhật thành công"
      );
      if (isNewProduct) {
        navigate("/products");
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
    setProductData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(productData);
  };

  if (!isNewProduct && isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="loading-spinner" />
          <p className="mt-2">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  const displayProduct = isNewProduct ? {} : { ...product, ...productData };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">
            {isNewProduct ? "Thêm sản phẩm" : displayProduct.name}
          </h1>
          {!isNewProduct && displayProduct.status && (
            <StatusBadge status={displayProduct.status} type="product" />
          )}
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

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="inventory">Kho hàng</TabsTrigger>
          <TabsTrigger value="attributes">Thuộc tính</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên sản phẩm</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={displayProduct.name || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">Mã SKU</Label>
                  <Input
                    id="sku"
                    name="sku"
                    defaultValue={displayProduct.sku || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={5}
                  defaultValue={displayProduct.description || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="regular_price">Giá thường</Label>
                  <Input
                    id="regular_price"
                    name="regular_price"
                    type="text"
                    defaultValue={displayProduct.regular_price || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale_price">Giá khuyến mãi</Label>
                  <Input
                    id="sale_price"
                    name="sale_price"
                    type="text"
                    defaultValue={displayProduct.sale_price || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Trạng thái</Label>
                  <select
                    id="status"
                    name="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    defaultValue={displayProduct.status || ""}
                    onChange={(e) =>
                      setProductData((prev: any) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="publish">Đang bán</option>
                    <option value="draft">Bản nháp</option>
                    <option value="pending">Chờ phê duyệt</option>
                    <option value="private">Riêng tư</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inventory" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý kho hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Số lượng tồn kho</Label>
                  <Input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    defaultValue={displayProduct.stock_quantity || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manage_stock">Quản lý kho hàng</Label>
                  <select
                    id="manage_stock"
                    name="manage_stock"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    defaultValue={
                      displayProduct.manage_stock ? "true" : "false"
                    }
                    onChange={(e) =>
                      setProductData((prev: any) => ({
                        ...prev,
                        manage_stock: e.target.value === "true",
                      }))
                    }
                  >
                    <option value="true">Có</option>
                    <option value="false">Không</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stock_status">Trạng thái kho hàng</Label>
                  <select
                    id="stock_status"
                    name="stock_status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    defaultValue={displayProduct.stock_status || ""}
                    onChange={(e) =>
                      setProductData((prev: any) => ({
                        ...prev,
                        stock_status: e.target.value,
                      }))
                    }
                  >
                    <option value="instock">Còn hàng</option>
                    <option value="outofstock">Hết hàng</option>
                    <option value="onbackorder">Đặt trước</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backorders">Cho phép đặt hàng khi hết</Label>
                  <select
                    id="backorders"
                    name="backorders"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    defaultValue={displayProduct.backorders || ""}
                    onChange={(e) =>
                      setProductData((prev: any) => ({
                        ...prev,
                        backorders: e.target.value,
                      }))
                    }
                  >
                    <option value="no">Không</option>
                    <option value="notify">Có, thông báo cho khách</option>
                    <option value="yes">Có, không thông báo cho khách</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="attributes" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Thuộc tính sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Chức năng này đang được phát triển.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductDetail;
