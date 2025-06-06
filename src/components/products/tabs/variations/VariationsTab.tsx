
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid, RotateCcw, LoaderCircle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import NoVariationsState from "./NoVariationsState";
import BulkActions from "./BulkActions";
import VariationsTable from "./VariationsTable";
import ConfirmationDialogs from "./ConfirmationDialogs";
import { 
  generateVariationCombinations, 
  createVariationsFromCombinations, 
  applyBulkActionToVariations,
  updateVariationImage
} from "./variationUtils";

interface AttributeOption {
  name: string;
  option: string;
}

interface Variation {
  id?: number;
  attributes: AttributeOption[];
  regular_price: string;
  sale_price: string;
  sku: string;
  stock_quantity?: number;
  stock_status?: string;
  manage_stock?: boolean;
  image?: {
    id?: number;
    src?: string;
  };
}

interface VariationsTabProps {
  form: any;
  product: any;
  productType: string;
  selectedAttributes: any[];
  variations: Variation[];
  setVariations: (variations: Variation[]) => void;
  isLoadingVariations?: boolean;
  uploadVariationImage?: (productId: number | null, variationId: number | undefined, file: File) => Promise<any>;
  productId: number | null;
  isUploadingImage?: boolean;
}

const VariationsTab = ({ 
  form, 
  product,
  productType,
  selectedAttributes,
  variations,
  setVariations,
  isLoadingVariations = false,
  uploadVariationImage,
  productId,
  isUploadingImage = false
}: VariationsTabProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [deleteVariationIndex, setDeleteVariationIndex] = useState<number | null>(null);
  const [isDeleteVariationDialogOpen, setIsDeleteVariationDialogOpen] = useState(false);
  const [attributeWarning, setAttributeWarning] = useState<string | null>(null);

  // Debug current variations data
  useEffect(() => {
    console.log("Current variations in VariationsTab:", variations);
    console.log("Current selected attributes in VariationsTab:", selectedAttributes);
  }, [variations, selectedAttributes]);

  // Check for attributes marked for variations
  useEffect(() => {
    const variationAttributes = selectedAttributes.filter(attr => attr.variation === true);
    if (variationAttributes.length === 0) {
      setAttributeWarning("Không có thuộc tính nào được đánh dấu để tạo biến thể. Vui lòng đánh dấu ít nhất một thuộc tính ở tab Thuộc tính.");
    } else if (variationAttributes.some(attr => !attr.options || attr.options.length === 0)) {
      setAttributeWarning("Có thuộc tính được đánh dấu để tạo biến thể nhưng không có giá trị nào. Vui lòng thêm giá trị cho các thuộc tính.");
    } else {
      setAttributeWarning(null);
    }
  }, [selectedAttributes]);

  // Get variation attributes - only those with 'variation' flag set to true
  const variationAttributes = selectedAttributes.filter(attr => attr.variation === true);

  // Check if we have attributes set for variations
  const hasVariationAttributes = variationAttributes.length > 0 && 
    variationAttributes.every(attr => attr.options && attr.options.length > 0);

  // Generate all possible variations from selected attributes
  const generateVariations = () => {
    if (!hasVariationAttributes) {
      toast.error("Không có thuộc tính nào được đánh dấu để tạo biến thể hoặc thuộc tính không có giá trị. Vui lòng kiểm tra lại tab Thuộc tính.");
      return;
    }

    setIsGenerating(true);
    toast.loading("Đang tạo biến thể...");

    try {
      // Get all combinations
      const combinations = generateVariationCombinations(variationAttributes);
      
      if (combinations.length === 0) {
        toast.error("Không thể tạo biến thể từ thuộc tính đã chọn");
        setIsGenerating(false);
        return;
      }
      
      console.log("Generated attribute combinations:", combinations);

      // Default data for new variations
      const defaultVariationData = {
        regular_price: form.getValues('regular_price') || '',
        sale_price: form.getValues('sale_price') || '',
        sku: form.getValues('sku') || '',
        stock_quantity: form.getValues('stock_quantity') || 0,
        stock_status: form.getValues('stock_status') || 'instock',
        manage_stock: form.getValues('manage_stock') || false
      };

      // Find existing variation IDs from product if available
      let existingVariationDetails: any[] = [];
      if (product && product.variationsDetails && Array.isArray(product.variationsDetails)) {
        existingVariationDetails = product.variationsDetails;
        console.log("Existing variation details:", existingVariationDetails);
      }

      // Create variations from combinations
      const newVariations = createVariationsFromCombinations(
        combinations,
        variations,
        defaultVariationData
      );
      
      console.log("Created new variations:", newVariations);

      // If this is an existing product, preserve the variation IDs
      if (existingVariationDetails.length > 0) {
        // Map the existing variations by their attribute signature
        const existingVariationsMap = new Map();
        
        existingVariationDetails.forEach((variation: any) => {
          if (variation && variation.attributes && Array.isArray(variation.attributes)) {
            const signature = variation.attributes
              .map((attr: any) => `${attr.name}:${attr.option}`)
              .sort()
              .join('|');
            existingVariationsMap.set(signature, {
              id: variation.id,
              image: variation.image,
              sku: variation.sku,
              regular_price: variation.regular_price,
              sale_price: variation.sale_price,
              stock_quantity: variation.stock_quantity,
              stock_status: variation.stock_status,
              manage_stock: variation.manage_stock
            });
          }
        });
        
        // Assign IDs and images to new variations if they match with existing ones
        newVariations.forEach(variation => {
          if (variation.attributes && Array.isArray(variation.attributes)) {
            const signature = variation.attributes
              .map(attr => `${attr.name}:${attr.option}`)
              .sort()
              .join('|');
            
            const existingData = existingVariationsMap.get(signature);
            if (existingData) {
              // Copy all existing data
              variation.id = existingData.id;
              variation.sku = existingData.sku || variation.sku;
              variation.regular_price = existingData.regular_price || variation.regular_price;
              variation.sale_price = existingData.sale_price || variation.sale_price;
              variation.stock_quantity = existingData.stock_quantity !== undefined ? existingData.stock_quantity : variation.stock_quantity;
              variation.stock_status = existingData.stock_status || variation.stock_status;
              variation.manage_stock = existingData.manage_stock !== undefined ? existingData.manage_stock : variation.manage_stock;
              
              // Set image if it exists
              if (existingData.image) {
                variation.image = existingData.image;
              }
            } else if (!variation.sku) {
              // Generate a SKU if none exists
              variation.sku = `SC${Math.floor(Math.random() * 10000)}`;
            }
          }
        });
      }

      setVariations(newVariations);
      toast.success(`Đã tạo ${newVariations.length} biến thể`);
    } catch (error) {
      console.error("Error generating variations:", error);
      toast.error("Có lỗi xảy ra khi tạo biến thể");
    } finally {
      setIsGenerating(false);
    }
  };

  // Update a single variation
  const updateVariation = (index: number, field: string, value: any) => {
    const updatedVariations = [...variations];
    updatedVariations[index] = {
      ...updatedVariations[index],
      [field]: value
    };
    setVariations(updatedVariations);
  };

  // Delete a variation
  const confirmDeleteVariation = (index: number) => {
    setDeleteVariationIndex(index);
    setIsDeleteVariationDialogOpen(true);
  };

  const deleteVariation = () => {
    if (deleteVariationIndex !== null) {
      const updatedVariations = [...variations];
      updatedVariations.splice(deleteVariationIndex, 1);
      setVariations(updatedVariations);
      toast.success("Đã xóa biến thể");
    }
    setIsDeleteVariationDialogOpen(false);
    setDeleteVariationIndex(null);
  };

  // Apply bulk action to all variations
  const handleBulkAction = (
    action: string, 
    regularPrice: string, 
    salePrice: string, 
    stockStatus: string,
    stockQuantity: string
  ) => {
    if (!action) return;

    const updatedVariations = applyBulkActionToVariations(
      variations,
      action,
      regularPrice,
      salePrice,
      stockStatus,
      stockQuantity
    );
    
    setVariations(updatedVariations);

    // Show success message based on action
    switch (action) {
      case "set_regular_price":
        toast.success("Đã cập nhật giá cho tất cả biến thể");
        break;
      case "set_sale_price":
        toast.success("Đã cập nhật giá khuyến mãi cho tất cả biến thể");
        break;
      case "set_sku":
        toast.success("Đã cập nhật SKU cho tất cả biến thể theo định dạng SC+ID");
        break;
      case "set_stock_status":
        toast.success("Đã cập nhật trạng thái tồn kho cho tất cả biến thể");
        break;
      case "set_stock_quantity":
        toast.success("Đã cập nhật số lượng tồn kho cho tất cả biến thể");
        break;
      case "toggle_manage_stock":
        toast.success("Đã bật quản lý kho cho tất cả biến thể");
        break;
      default:
        break;
    }
  };

  // Handler to clear all variations
  const clearAllVariations = () => {
    setIsConfirmDialogOpen(false);
    setVariations([]);
    toast.info("Đã xóa tất cả biến thể");
  };

  // Handle variation image selection
  const handleSelectVariationImage = async (index: number, file: File) => {
    if (!uploadVariationImage || !productId) {
      toast.error("Không thể tải lên hình ảnh vào lúc này");
      return;
    }

    try {
      const variation = variations[index];
      
      if (!variation.id) {
        toast.warning("Cần lưu sản phẩm trước khi tải lên hình ảnh cho biến thể mới");
        return;
      }
      
      console.log(`Uploading image for variation ${variation.id} at index ${index}`);
      
      // Upload the image and get the response
      const imageData = await uploadVariationImage(productId, variation.id, file);
      
      // Update the variation with new image
      const updatedVariations = updateVariationImage(variations, index, imageData);
      setVariations(updatedVariations);
      
      toast.success("Đã tải lên hình ảnh cho biến thể");
    } catch (error) {
      console.error("Error uploading variation image:", error);
      toast.error("Có lỗi xảy ra khi tải lên hình ảnh");
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Biến thể sản phẩm</CardTitle>
            {attributeWarning && (
              <div className="flex items-center text-amber-500 mt-2">
                <AlertCircle className="h-4 w-4 mr-1" />
                <p className="text-sm">{attributeWarning}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {variations.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setIsConfirmDialogOpen(true)}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Xóa tất cả
              </Button>
            )}
            
            <Button
              onClick={generateVariations}
              disabled={isGenerating || !hasVariationAttributes}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Grid className="mr-2 h-4 w-4" />
                  Tạo biến thể
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {variations.length === 0 ? (
            <NoVariationsState hasVariationAttributes={hasVariationAttributes} />
          ) : (
            <>
              {/* Bulk actions */}
              <BulkActions 
                onApplyBulkAction={handleBulkAction} 
              />

              {/* Variations table */}
              <VariationsTable 
                variations={variations}
                isLoadingVariations={isLoadingVariations || isUploadingImage || isGenerating}
                onUpdateVariation={updateVariation}
                onDeleteVariation={confirmDeleteVariation}
                onSelectVariationImage={handleSelectVariationImage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialogs */}
      <ConfirmationDialogs
        isConfirmDialogOpen={isConfirmDialogOpen}
        setIsConfirmDialogOpen={setIsConfirmDialogOpen}
        isDeleteVariationDialogOpen={isDeleteVariationDialogOpen}
        setIsDeleteVariationDialogOpen={setIsDeleteVariationDialogOpen}
        onClearAllVariations={clearAllVariations}
        onDeleteVariation={deleteVariation}
      />
    </div>
  );
};

export { VariationsTab };
