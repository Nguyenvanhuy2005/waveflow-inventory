
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
    console.log("Setting form values from product data:", product);
    
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
        // Ensure variations have all required properties
        const processedVariations = product.variationsDetails.map((variation: any) => {
          // Make sure variation has attributes array
          if (!variation.attributes || !Array.isArray(variation.attributes)) {
            variation.attributes = [];
          }
          
          // Ensure essential properties exist
          return {
            id: variation.id,
            regular_price: variation.regular_price || "",
            sale_price: variation.sale_price || "",
            sku: variation.sku || "",
            stock_quantity: variation.stock_quantity || 0,
            stock_status: variation.stock_status || "instock",
            manage_stock: variation.manage_stock || false,
            attributes: variation.attributes,
            image: variation.image || null
          };
        });
        
        setVariations(processedVariations);
      } else {
        setVariations([]);
      }
      
      // Load existing images
      if (product.images && Array.isArray(product.images)) {
        console.log("Loading existing product images:", product.images);
        const validImages = product.images.filter((img: any) => img && img.src);
        setImagePreviewUrls(validImages.map((img: any) => img.src));
      }
    }
  }, [product, form]);

  // Handler to upload variation image
  const handleUploadVariationImage = async (productId: number | null, variationId: number | undefined, file: File) => {
    if (!productId || !variationId) {
      toast.error("Sản phẩm hoặc biến thể chưa được lưu. Vui lòng lưu sản phẩm trước.");
      throw new Error("Product ID and variation ID are required to upload an image");
    }
    
    try {
      setIsUploadingImage(true);
      console.log(`Uploading image for variation ${variationId} of product ${productId}`);
      const response = await uploadProductVariationImage(productId, variationId, file);
      console.log("Variation image upload response:", response);
      setIsUploadingImage(false);
      return response;
    } catch (error) {
      setIsUploadingImage(false);
      console.error("Error uploading variation image:", error);
      toast.error("Không thể tải lên hình ảnh cho biến thể. Vui lòng thử lại.");
      throw error;
    }
  };

  const mutation = useMutation({
    mutationFn: (data: any) => {
      // Show loading toast
      const loadingToast = toast.loading(
        isNewProduct ? "Đang tạo sản phẩm..." : "Đang cập nhật sản phẩm..."
      );
      
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
          id: attr.id || 0,
          name: attr.name || "",
          position: attr.position || 0,
          visible: attr.visible === undefined ? true : attr.visible,
          variation: attr.variation === undefined ? false : attr.variation,
          options: Array.isArray(attr.options) ? attr.options : []
        }));
        
        console.log("Prepared attributes for API:", preparedData.attributes);
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
        console.log(`Adding ${selectedImages.length} new images to product`);
        preparedData.images = selectedImages;
      }
      
      // If we have existing images from the product, include them
      if (!isNewProduct && product && product.images && Array.isArray(product.images)) {
        const existingImages = product.images.filter((img: any) => img && img.id && img.src);
        console.log(`Found ${existingImages.length} existing images`);
        
        if (!preparedData.images) {
          preparedData.images = [...existingImages];
        } else {
          // We only send file objects for new images, existing images are kept separate
          console.log("Keeping existing images in update");
        }
      }
      
      console.log("Final data prepared for API submission:", preparedData);
      
      return isNewProduct
        ? createProduct(preparedData)
        : updateProduct(productId!, preparedData)
        .finally(() => {
          // Dismiss loading toast
          toast.dismiss(loadingToast);
        });
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
        navigate(`/products/${response.id}`);
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
          isUploadingImage={isUploadingImage}
        />
        
        <div className="mt-8 flex justify-end">
          <Button 
            type="submit"
            disabled={mutation.isPending || isUploadingImage}
            size="lg"
            className="px-6"
          >
            {mutation.isPending ? (
              <>
                <div className="loading-spinner mr-2" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Lưu sản phẩm
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
