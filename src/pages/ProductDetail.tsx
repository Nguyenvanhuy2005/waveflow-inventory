
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProduct, createProduct, updateProduct, getProductCategories, getProductAttributes, getProductAttributeTerms } from "@/services/productService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  X
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const productId = id === "new" ? null : parseInt(id || "0");
  const isNewProduct = id === "new";
  const [productData, setProductData] = useState<any>({});
  const [selectedTab, setSelectedTab] = useState("general");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<any[]>([]);

  // Tạo schema cho việc validate form
  const productFormSchema = z.object({
    name: z.string().min(1, "Tên sản phẩm không được để trống"),
    regular_price: z.string().optional(),
    sale_price: z.string().optional(),
    description: z.string().optional(),
    short_description: z.string().optional(),
    sku: z.string().optional(),
    manage_stock: z.boolean().default(false),
    stock_quantity: z.number().optional(),
    stock_status: z.string().default("instock"),
    backorders: z.string().default("no"),
    categories: z.array(z.number()).optional(),
    status: z.string().default("publish"),
    featured: z.boolean().default(false),
    sold_individually: z.boolean().default(false),
    weight: z.string().optional(),
    dimensions: z.object({
      length: z.string().optional(),
      width: z.string().optional(),
      height: z.string().optional(),
    }).optional(),
    attributes: z.array(z.any()).optional(),
  });

  const { data: product, isPending } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => (productId ? getProduct(productId) : Promise.resolve(null)),
    enabled: !isNewProduct && !!productId,
  });

  const { data: categories } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => getProductCategories(),
  });

  const { data: attributes } = useQuery({
    queryKey: ["product-attributes"],
    queryFn: () => getProductAttributes(),
  });

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      regular_price: "",
      sale_price: "",
      description: "",
      short_description: "",
      sku: "",
      manage_stock: false,
      stock_quantity: 0,
      stock_status: "instock",
      backorders: "no",
      categories: [],
      status: "publish",
      featured: false,
      sold_individually: false,
      weight: "",
      dimensions: {
        length: "",
        width: "",
        height: "",
      },
      attributes: [],
    },
  });

  // Cập nhật form khi có dữ liệu sản phẩm
  useEffect(() => {
    if (product) {
      // Cập nhật dữ liệu form từ sản phẩm
      form.reset({
        name: product.name || "",
        regular_price: product.regular_price || "",
        sale_price: product.sale_price || "",
        description: product.description || "",
        short_description: product.short_description || "",
        sku: product.sku || "",
        manage_stock: product.manage_stock || false,
        stock_quantity: product.stock_quantity || 0,
        stock_status: product.stock_status || "instock",
        backorders: product.backorders || "no",
        categories: product.categories?.map(cat => cat.id) || [],
        status: product.status || "publish",
        featured: product.featured || false,
        sold_individually: product.sold_individually || false,
        weight: product.weight || "",
        dimensions: {
          length: product.dimensions?.length || "",
          width: product.dimensions?.width || "",
          height: product.dimensions?.height || "",
        },
        attributes: product.attributes || [],
      });

      // Cập nhật danh sách thuộc tính sản phẩm
      if (product.attributes && product.attributes.length > 0) {
        setSelectedAttributes(product.attributes);
      }

      // Cập nhật danh sách hình ảnh nếu có
      if (product.images && product.images.length > 0) {
        setImagePreviewUrls(product.images.map(img => img.src));
      }
    }
  }, [product, form]);

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isNewProduct
        ? createProduct(data)
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
    onError: (error) => {
      console.error("Lỗi khi lưu sản phẩm:", error);
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProductData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...filesArray]);
      
      // Tạo URL để xem trước hình ảnh
      const newImageUrls = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviewUrls((prev) => [...prev, ...newImageUrls]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    
    // Revoke URL để tránh rò rỉ bộ nhớ
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Hàm xử lý thêm thuộc tính mới
  const addAttribute = (attributeId: number, attributeName: string) => {
    // Kiểm tra xem thuộc tính đã tồn tại chưa
    const exists = selectedAttributes.some(attr => attr.id === attributeId);
    if (exists) {
      toast.error("Thuộc tính này đã được thêm");
      return;
    }

    // Thêm thuộc tính mới
    const newAttribute = {
      id: attributeId,
      name: attributeName,
      position: selectedAttributes.length,
      visible: true,
      variation: false,
      options: [] as string[],
    };
    setSelectedAttributes([...selectedAttributes, newAttribute]);
  };

  // Hàm xử lý xóa thuộc tính
  const removeAttribute = (attributeId: number) => {
    setSelectedAttributes(selectedAttributes.filter(attr => attr.id !== attributeId));
  };

  // Lấy danh sách các giá trị của thuộc tính
  const { data: attributeTerms, refetch: refetchTerms } = useQuery({
    queryKey: ["attribute-terms", selectedAttributes.map(attr => attr.id)],
    queryFn: async () => {
      const results: Record<number, any[]> = {};
      for (const attr of selectedAttributes) {
        if (attr.id) {
          const terms = await getProductAttributeTerms(attr.id);
          results[attr.id] = terms;
        }
      }
      return results;
    },
    enabled: selectedAttributes.length > 0,
  });

  // Cập nhật giá trị thuộc tính
  const updateAttributeOptions = (attributeId: number, options: string[]) => {
    setSelectedAttributes(
      selectedAttributes.map(attr => 
        attr.id === attributeId ? { ...attr, options } : attr
      )
    );
  };

  // Thêm giá trị thuộc tính
  const addAttributeOption = (attributeId: number, option: string) => {
    setSelectedAttributes(
      selectedAttributes.map(attr => {
        if (attr.id === attributeId) {
          // Kiểm tra xem option đã tồn tại chưa
          if (attr.options.includes(option)) {
            return attr;
          }
          return { ...attr, options: [...attr.options, option] };
        }
        return attr;
      })
    );
  };

  // Xóa giá trị thuộc tính
  const removeAttributeOption = (attributeId: number, option: string) => {
    setSelectedAttributes(
      selectedAttributes.map(attr => {
        if (attr.id === attributeId) {
          return { ...attr, options: attr.options.filter(opt => opt !== option) };
        }
        return attr;
      })
    );
  };

  // Cập nhật cài đặt thuộc tính
  const updateAttributeSetting = (attributeId: number, key: string, value: boolean) => {
    setSelectedAttributes(
      selectedAttributes.map(attr => {
        if (attr.id === attributeId) {
          return { ...attr, [key]: value };
        }
        return attr;
      })
    );
  };

  useEffect(() => {
    // Cập nhật thuộc tính vào form
    form.setValue('attributes', selectedAttributes);
  }, [selectedAttributes, form]);

  const onSubmit = (values: z.infer<typeof productFormSchema>) => {
    // Kết hợp dữ liệu form với dữ liệu hình ảnh và các dữ liệu khác
    const formData = {
      ...values,
      // Bao gồm thuộc tính đã được cập nhật
      attributes: selectedAttributes,
      // TODO: Xử lý upload hình ảnh qua WooCommerce API
    };
    
    mutation.mutate(formData);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">
            {isNewProduct ? "Thêm sản phẩm mới" : form.watch("name")}
          </h1>
          {!isNewProduct && product?.status && (
            <StatusBadge status={product.status} type="product" />
          )}
        </div>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={mutation.isPending}
        >
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-3 md:w-[600px]">
              <TabsTrigger value="general">Thông tin cơ bản</TabsTrigger>
              <TabsTrigger value="inventory">Kho hàng</TabsTrigger>
              <TabsTrigger value="attributes">Thuộc tính</TabsTrigger>
            </TabsList>
            
            {/* Tab Thông tin cơ bản */}
            <TabsContent value="general" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin sản phẩm</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên sản phẩm <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã SKU</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trạng thái</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="publish">Đang bán</SelectItem>
                              <SelectItem value="draft">Bản nháp</SelectItem>
                              <SelectItem value="pending">Chờ phê duyệt</SelectItem>
                              <SelectItem value="private">Riêng tư</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Sản phẩm nổi bật</FormLabel>
                          <FormDescription>
                            Hiển thị sản phẩm này trong danh sách nổi bật
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mô tả đầy đủ</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={5}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="short_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mô tả ngắn</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="regular_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giá thường</FormLabel>
                          <FormControl>
                            <Input {...field} type="text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="sale_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giá khuyến mãi</FormLabel>
                          <FormControl>
                            <Input {...field} type="text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Danh mục sản phẩm */}
                  <div className="space-y-2">
                    <Label>Danh mục</Label>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                      {categories?.map((category) => (
                        <div 
                          key={category.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox 
                            id={`category-${category.id}`}
                            checked={form.watch("categories")?.includes(category.id)}
                            onCheckedChange={(checked) => {
                              const currentCategories = form.getValues("categories") || [];
                              if (checked) {
                                form.setValue("categories", [...currentCategories, category.id]);
                              } else {
                                form.setValue("categories", 
                                  currentCategories.filter(id => id !== category.id)
                                );
                              }
                            }}
                          />
                          <label 
                            htmlFor={`category-${category.id}`}
                            className="text-sm"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Quản lý hình ảnh */}
                  <div className="space-y-4">
                    <Label>Hình ảnh sản phẩm</Label>
                    <div className="flex flex-wrap gap-4">
                      {imagePreviewUrls.map((url, index) => (
                        <div 
                          key={index} 
                          className="relative h-24 w-24 rounded-md border border-gray-200"
                        >
                          <img 
                            src={url} 
                            alt={`Product ${index}`} 
                            className="h-full w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <label 
                        htmlFor="image-upload"
                        className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 hover:bg-gray-50"
                      >
                        <Upload className="h-6 w-6 text-gray-400" />
                        <span className="mt-1 text-xs text-gray-500">Thêm ảnh</span>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Tab Kho hàng */}
            <TabsContent value="inventory" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quản lý kho hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="manage_stock"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Quản lý tồn kho</FormLabel>
                          <FormDescription>
                            Bật tính năng quản lý tồn kho cho sản phẩm này
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("manage_stock") && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="stock_quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số lượng tồn kho</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stock_status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trạng thái kho hàng</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="instock">Còn hàng</SelectItem>
                                <SelectItem value="outofstock">Hết hàng</SelectItem>
                                <SelectItem value="onbackorder">Đặt trước</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="backorders"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cho phép đặt hàng khi hết</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                          disabled={!form.watch("manage_stock")}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn cài đặt" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no">Không</SelectItem>
                            <SelectItem value="notify">Có, thông báo cho khách</SelectItem>
                            <SelectItem value="yes">Có, không thông báo cho khách</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sold_individually"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Bán riêng lẻ</FormLabel>
                          <FormDescription>
                            Giới hạn mỗi đơn hàng chỉ có thể mua 1 sản phẩm này
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Tab Thuộc tính */}
            <TabsContent value="attributes" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Thuộc tính sản phẩm</CardTitle>
                  <Select
                    onValueChange={(value) => {
                      const selectedAttr = attributes?.find(attr => attr.id.toString() === value);
                      if (selectedAttr) {
                        addAttribute(selectedAttr.id, selectedAttr.name);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Thêm thuộc tính" />
                    </SelectTrigger>
                    <SelectContent>
                      {attributes?.map(attr => (
                        <SelectItem 
                          key={attr.id} 
                          value={attr.id.toString()}
                          disabled={selectedAttributes.some(a => a.id === attr.id)}
                        >
                          {attr.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedAttributes.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Chưa có thuộc tính nào được thêm
                    </p>
                  ) : (
                    selectedAttributes.map((attr) => (
                      <div key={attr.id} className="border rounded-md p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">{attr.name}</h3>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeAttribute(attr.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`visible-${attr.id}`}
                              checked={attr.visible}
                              onCheckedChange={(checked) => 
                                updateAttributeSetting(attr.id, 'visible', !!checked)
                              }
                            />
                            <label htmlFor={`visible-${attr.id}`}>Hiển thị</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`variation-${attr.id}`}
                              checked={attr.variation}
                              onCheckedChange={(checked) => 
                                updateAttributeSetting(attr.id, 'variation', !!checked)
                              }
                            />
                            <label htmlFor={`variation-${attr.id}`}>Dùng cho biến thể</label>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Giá trị thuộc tính</Label>
                          <div className="flex flex-wrap gap-2">
                            {attr.options.map((option: string) => (
                              <Badge 
                                key={option} 
                                className="py-1 px-2 flex items-center gap-1"
                                variant="secondary"
                              >
                                {option}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 rounded-full"
                                  onClick={() => removeAttributeOption(attr.id, option)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Select
                            onValueChange={(value) => addAttributeOption(attr.id, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn giá trị" />
                            </SelectTrigger>
                            <SelectContent>
                              {attributeTerms && attributeTerms[attr.id]?.map((term: any) => (
                                <SelectItem 
                                  key={term.id} 
                                  value={term.name}
                                  disabled={attr.options.includes(term.name)}
                                >
                                  {term.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Hoặc nhập giá trị mới"
                              className="w-64"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const value = (e.target as HTMLInputElement).value.trim();
                                  if (value) {
                                    addAttributeOption(attr.id, value);
                                    (e.target as HTMLInputElement).value = '';
                                  }
                                }
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={(e) => {
                                const input = (e.currentTarget.previousSibling as HTMLInputElement);
                                const value = input.value.trim();
                                if (value) {
                                  addAttributeOption(attr.id, value);
                                  input.value = '';
                                }
                              }}
                            >
                              Thêm
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
};

export default ProductDetail;
