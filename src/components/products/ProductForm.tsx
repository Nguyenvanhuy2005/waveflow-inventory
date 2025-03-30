
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct, updateProduct } from "@/services/productService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import {
  Form,
} from "@/components/ui/form";
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

  const form = useForm<z.infer<typeof ProductFormSchema>>({
    resolver: zodResolver(ProductFormSchema),
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

  const onSubmit = (values: z.infer<typeof ProductFormSchema>) => {
    // Kết hợp dữ liệu form với dữ liệu hình ảnh và các dữ liệu khác
    const formData = {
      ...values,
      attributes: selectedAttributes,
    };
    
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
