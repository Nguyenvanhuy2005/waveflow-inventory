
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct, updateProduct } from "@/services/productService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ProductTabs from "./ProductTabs";
import { ProductFormSchema } from "./ProductFormSchema";

type ProductFormProps = {
  product: any;
  productId: number | null;
  isNewProduct: boolean;
  selectedImages: File[];
  imagePreviewUrls: string[];
  selectedAttributes: any[];
  setSelectedAttributes: (attributes: any[]) => void;
  setSelectedImages: (files: File[]) => void;
  setImagePreviewUrls: (urls: string[]) => void;
};

const ProductForm = ({
  product,
  productId,
  isNewProduct,
  selectedImages,
  imagePreviewUrls,
  selectedAttributes,
  setSelectedAttributes,
  setSelectedImages,
  setImagePreviewUrls
}: ProductFormProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("general");

  // Initialize form with product data if editing
  const form = useForm<z.infer<typeof ProductFormSchema>>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: product?.name || "",
      regular_price: product?.regular_price || "",
      sale_price: product?.sale_price || "",
      description: product?.description || "",
      short_description: product?.short_description || "",
      sku: product?.sku || "",
      manage_stock: product?.manage_stock || false,
      stock_quantity: product?.stock_quantity || 0,
      stock_status: product?.stock_status || "instock",
      backorders: product?.backorders || "no",
      categories: product?.categories?.map((cat: any) => cat.id) || [],
      status: product?.status || "publish",
      featured: product?.featured || false,
      sold_individually: product?.sold_individually || false,
      weight: product?.weight || "",
      dimensions: {
        length: product?.dimensions?.length || "",
        width: product?.dimensions?.width || "",
        height: product?.dimensions?.height || "",
      },
      attributes: [],
    },
  });

  // Update form values when product data changes
  useEffect(() => {
    if (product) {
      const categories = product.categories?.map((cat: any) => cat.id) || [];
      
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
        categories: categories,
        status: product.status || "publish",
        featured: product.featured || false,
        sold_individually: product.sold_individually || false,
        weight: product.weight || "",
        dimensions: {
          length: product.dimensions?.length || "",
          width: product.dimensions?.width || "",
          height: product.dimensions?.height || "",
        },
        attributes: [],
      });
    }
  }, [product, form]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      // Prepare the data for API submission
      const preparedData = { ...data };
      
      // Format categories as expected by WooCommerce API
      if (preparedData.categories && preparedData.categories.length > 0) {
        preparedData.categories = preparedData.categories.map((id: number) => ({ id }));
      }
      
      console.log("Sending to API:", preparedData);
      
      return isNewProduct
        ? createProduct(preparedData)
        : updateProduct(productId!, preparedData);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(
        isNewProduct
          ? "Sản phẩm đã được tạo thành công"
          : "Sản phẩm đã được cập nhật thành công"
      );
      
      console.log("API Response:", response);
      
      if (isNewProduct) {
        navigate("/products");
      }
    },
    onError: (error: any) => {
      console.error("Lỗi khi lưu sản phẩm:", error);
      
      if (error.response?.data?.message) {
        toast.error(`Lỗi: ${error.response.data.message}`);
      } else if (error.message && error.message.includes("401")) {
        toast.error("Lỗi xác thực API: Khóa API không có quyền ghi dữ liệu. Vui lòng kiểm tra lại quyền của khóa API.");
      } else {
        toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      }
    },
  });

  const onSubmit = (values: z.infer<typeof ProductFormSchema>) => {
    console.log("Form values:", values);
    console.log("Selected attributes:", selectedAttributes);
    
    // Prepare the data for submission
    const formData = {
      ...values,
      attributes: selectedAttributes,
    };
    
    console.log("Submitting data:", formData);
    mutation.mutate(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ProductTabs 
          form={form}
          selectedTab={selectedTab} 
          setSelectedTab={setSelectedTab}
          selectedImages={selectedImages}
          imagePreviewUrls={imagePreviewUrls}
          selectedAttributes={selectedAttributes}
          setSelectedAttributes={setSelectedAttributes}
          setSelectedImages={setSelectedImages}
          setImagePreviewUrls={setImagePreviewUrls}
        />
        
        <div className="mt-4 flex justify-end">
          <Button 
            type="submit"
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
      </form>
    </Form>
  );
};

export default ProductForm;
