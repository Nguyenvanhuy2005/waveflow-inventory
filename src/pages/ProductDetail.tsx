
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProduct } from "@/services/productService";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import ProductForm from "@/components/products/ProductForm";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = id === "new" ? null : parseInt(id || "0");
  const isNewProduct = id === "new";
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<any[]>([]);

  // Load product data
  const { data: product, isPending, error, isError } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => (productId ? getProduct(productId) : Promise.resolve(null)),
    enabled: !isNewProduct && !!productId,
  });

  // Handle API error
  useEffect(() => {
    if (error) {
      console.error("Error fetching product data:", error);
      toast.error("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
    }
  }, [error]);

  // Update data when product is loaded
  useEffect(() => {
    if (product) {
      // Update product attributes if available
      if (product.attributes && product.attributes.length > 0) {
        console.log("Loading product attributes:", product.attributes);
        
        // Process attributes to ensure they have all required properties
        const processedAttributes = product.attributes.map(attr => ({
          id: attr.id,
          name: attr.name,
          position: attr.position || 0,
          visible: attr.visible !== undefined ? attr.visible : true,
          variation: attr.variation !== undefined ? attr.variation : false,
          // Ensure options is always an array of strings
          options: Array.isArray(attr.options) 
            ? attr.options.map(opt => typeof opt === 'string' ? opt : String(opt))
            : []
        }));
        
        setSelectedAttributes(processedAttributes);
        console.log("Processed attributes:", processedAttributes);
      } else {
        // Reset attributes if none are present
        setSelectedAttributes([]);
      }

      // Update image preview URLs if available
      if (product.images && product.images.length > 0) {
        setImagePreviewUrls(product.images.map(img => img.src));
      } else {
        setImagePreviewUrls([]);
      }
      
      console.log("Loaded product data:", product);
    }
  }, [product]);

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

  if (!isNewProduct && isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Không tìm thấy sản phẩm</h1>
        </div>
        <Alert variant="destructive">
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>
            Không thể tải thông tin sản phẩm. Vui lòng quay lại sau hoặc thử với sản phẩm khác.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/products")}>Quay lại danh sách sản phẩm</Button>
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
            {isNewProduct ? "Thêm sản phẩm mới" : product?.name || "Đang tải..."}
          </h1>
          {!isNewProduct && product?.status && (
            <StatusBadge status={product.status} type="product" />
          )}
        </div>
      </div>

      <ProductForm
        product={product}
        productId={productId}
        isNewProduct={isNewProduct}
        selectedImages={selectedImages}
        imagePreviewUrls={imagePreviewUrls}
        selectedAttributes={selectedAttributes}
        setSelectedAttributes={setSelectedAttributes}
        setSelectedImages={setSelectedImages}
        setImagePreviewUrls={setImagePreviewUrls}
      />
    </div>
  );
};

export default ProductDetail;
