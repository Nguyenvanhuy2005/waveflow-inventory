
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct, updateProduct, uploadProductVariationImage } from "@/services/productService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ProductTabs from "./ProductTabs";
import { ProductFormSchema } from "./ProductFormSchema";
import { formatVariationAttributesForApi } from "./tabs/variations/variationUtils";

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
  const [productType, setProductType] = useState("variable"); // Always set to variable
  const [variations, setVariations] = useState<any[]>([]);

  // Initialize form with product data if editing
  const form = useForm<z.infer<typeof ProductFormSchema>>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: product?.name || "",
      type: "variable", // Always set to variable
      regular_price: product?.regular_price || "",
      sale_price: product?.sale_price || "",
      sku: product?.sku || "",
      manage_stock: product?.manage_stock || false,
      stock_quantity: product?.stock_quantity || 0,
      stock_status: product?.stock_status || "instock",
      backorders: product?.backorders || "no",
      categories: product?.categories?.map((cat: any) => cat.id) || [],
      status: product?.status || "publish",
      featured: product?.featured || false,
      weight: product?.weight || "",
      dimensions: {
        length: product?.dimensions?.length || "",
        width: product?.dimensions?.width || "",
        height: product?.dimensions?.height || "",
      },
      attributes: [],
      variations: [],
    },
  });

  // Update form values when product data changes
  useEffect(() => {
    if (product) {
      const categories = product.categories?.map((cat: any) => cat.id) || [];
      
      form.reset({
        name: product.name || "",
        type: "variable", // Always set to variable regardless of product type
        regular_price: product.regular_price || "",
        sale_price: product.sale_price || "",
        sku: product.sku || "",
        manage_stock: product.manage_stock || false,
        stock_quantity: product.stock_quantity || 0,
        stock_status: product.stock_status || "instock",
        backorders: product.backorders || "no",
        categories: categories,
        status: product.status || "publish",
        featured: product.featured || false,
        weight: product.weight || "",
        dimensions: {
          length: product.dimensions?.length || "",
          width: product.dimensions?.width || "",
          height: product.dimensions?.height || "",
        },
        attributes: [],
        variations: [],
      });
      
      setProductType("variable"); // Always set to variable
      
      // Set variations if they exist
      if (product.variationsDetails && Array.isArray(product.variationsDetails)) {
        console.log("Loading existing variations:", product.variationsDetails);
        setVariations(product.variationsDetails);
      } else {
        setVariations([]);
      }
      
      // Load existing images
      if (product.images && Array.isArray(product.images)) {
        console.log("Loading existing product images:", product.images);
        setImagePreviewUrls(product.images.map((img: any) => img.src));
      }
    }
  }, [product, form]);

  // Handler to upload variation image
  const handleUploadVariationImage = async (productId: number | null, variationId: number | undefined, file: File) => {
    if (!productId || !variationId) {
      throw new Error("Product ID and variation ID are required to upload an image");
    }
    
    try {
      console.log(`Uploading image for variation ${variationId} of product ${productId}`);
      const response = await uploadProductVariationImage(productId, variationId, file);
      console.log("Variation image upload response:", response);
      return response;
    } catch (error) {
      console.error("Error uploading variation image:", error);
      throw error;
    }
  };

  const mutation = useMutation({
    mutationFn: (data: any) => {
      // Prepare the data for API submission
      const preparedData = { ...data };
      
      // Set the product type to variable
      preparedData.type = "variable";
      
      // Format categories as expected by WooCommerce API
      if (preparedData.categories && preparedData.categories.length > 0) {
        preparedData.categories = preparedData.categories.map((id: number) => ({ id }));
      }
      
      // Add attributes with proper formatting for WooCommerce API
      if (selectedAttributes && selectedAttributes.length > 0) {
        preparedData.attributes = selectedAttributes.map(attr => ({
          id: attr.id,
          name: attr.name,
          position: attr.position || 0,
          visible: attr.visible === undefined ? true : attr.visible,
          variation: attr.variation === undefined ? false : attr.variation,
          options: Array.isArray(attr.options) ? attr.options : []
        }));
      } else {
        preparedData.attributes = [];
      }
      
      // Process variations for API submission
      if (variations && Array.isArray(variations) && variations.length > 0) {
        const formattedVariations = formatVariationAttributesForApi(variations);
        console.log("Formatted variations for API:", formattedVariations);
        preparedData.variations = formattedVariations;
      } else {
        preparedData.variations = [];
      }
      
      // Add selected images to the product data
      if (selectedImages && selectedImages.length > 0) {
        preparedData.images = selectedImages;
      }
      
      // If we have existing images from the product, include them
      if (!isNewProduct && product && product.images && Array.isArray(product.images)) {
        // Include existing images in the update
        if (!preparedData.images) {
          preparedData.images = [...product.images];
        } else {
          // Add the File objects to the array that already has existing images
          preparedData.images = [...product.images, ...preparedData.images];
        }
      }
      
      console.log("Final data prepared for API submission:", preparedData);
      
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
    console.log("Product type:", productType);
    console.log("Variations:", variations);
    
    // Validate attributes for variations
    const variationAttributes = selectedAttributes.filter(attr => attr.variation === true);
    if (productType === "variable" && variationAttributes.length === 0) {
      toast.error("Sản phẩm biến thể cần ít nhất một thuộc tính được đánh dấu 'Dùng cho biến thể'");
      setSelectedTab("attributes");
      return;
    }
    
    // Check if variation attributes have values
    const attributesWithoutOptions = variationAttributes.filter(attr => !attr.options || attr.options.length === 0);
    if (attributesWithoutOptions.length > 0) {
      toast.error(`Thuộc tính ${attributesWithoutOptions.map(a => a.name).join(", ")} không có giá trị. Vui lòng thêm giá trị cho thuộc tính.`);
      setSelectedTab("attributes");
      return;
    }
    
    // Check for missing attributes in variations
    if (variations.length > 0) {
      const missingAttributes = variations.some(v => 
        !v.attributes || !Array.isArray(v.attributes) || v.attributes.length === 0
      );
      
      if (missingAttributes) {
        console.warn("Some variations are missing attributes, they will be generated from selected attributes");
        // We'll let the API handle this, as it's fixed in the API submission process
      }
    }
    
    // Prepare the data for submission
    const formData = {
      ...values,
      type: "variable", // Always set to variable
    };
    
    console.log("Submitting data:", formData);
    mutation.mutate(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ProductTabs 
          form={form}
          product={product}
          productId={productId}
          selectedTab={selectedTab} 
          setSelectedTab={setSelectedTab}
          selectedImages={selectedImages}
          imagePreviewUrls={imagePreviewUrls}
          selectedAttributes={selectedAttributes}
          setSelectedAttributes={setSelectedAttributes}
          productType={productType}
          setProductType={setProductType}
          variations={variations}
          setVariations={setVariations}
          setSelectedImages={setSelectedImages}
          setImagePreviewUrls={setImagePreviewUrls}
          uploadVariationImage={handleUploadVariationImage}
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
