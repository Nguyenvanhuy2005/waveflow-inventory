
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid, RotateCcw, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import NoVariationsState from "./NoVariationsState";
import BulkActions from "./BulkActions";
import VariationsTable from "./VariationsTable";
import ConfirmationDialogs from "./ConfirmationDialogs";
import { generateVariationCombinations, createVariationsFromCombinations, applyBulkActionToVariations } from "./variationUtils";

interface Variation {
  id?: number;
  attributes: {
    name: string; 
    option: string;
  }[];
  regular_price: string;
  sale_price: string;
  sku: string;
  stock_quantity?: number;
  manage_stock?: boolean;
}

interface VariationsTabProps {
  form: any;
  product: any;
  productType: string;
  selectedAttributes: any[];
  variations: Variation[];
  setVariations: (variations: Variation[]) => void;
  isLoadingVariations?: boolean;
}

const VariationsTab = ({ 
  form, 
  product,
  productType,
  selectedAttributes,
  variations,
  setVariations,
  isLoadingVariations = false
}: VariationsTabProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [deleteVariationIndex, setDeleteVariationIndex] = useState<number | null>(null);
  const [isDeleteVariationDialogOpen, setIsDeleteVariationDialogOpen] = useState(false);

  // Get variation attributes - only those with 'variation' flag set to true
  const variationAttributes = selectedAttributes.filter(attr => attr.variation);

  // Check if we have attributes set for variations
  const hasVariationAttributes = variationAttributes.length > 0;

  // Generate all possible variations from selected attributes
  const generateVariations = () => {
    if (!hasVariationAttributes) {
      toast.error("Không có thuộc tính nào được đánh dấu để tạo biến thể. Hãy đánh dấu ít nhất một thuộc tính.");
      return;
    }

    setIsGenerating(true);

    try {
      // Get all combinations
      const combinations = generateVariationCombinations(selectedAttributes);
      
      if (combinations.length === 0) {
        toast.error("Không có thuộc tính nào được đánh dấu để tạo biến thể");
        setIsGenerating(false);
        return;
      }

      // Default data for new variations
      const defaultVariationData = {
        regular_price: form.getValues('regular_price') || '',
        sale_price: form.getValues('sale_price') || '',
        sku: form.getValues('sku') || '',
        stock_quantity: form.getValues('stock_quantity') || 0,
        manage_stock: form.getValues('manage_stock') || false
      };

      // Create variations from combinations
      const newVariations = createVariationsFromCombinations(
        combinations,
        variations,
        defaultVariationData
      );

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
  const handleBulkAction = (action: string, regularPrice: string, salePrice: string) => {
    if (!action) return;

    const updatedVariations = applyBulkActionToVariations(
      variations,
      action,
      regularPrice,
      salePrice
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
        toast.success("Đã cập nhật SKU cho tất cả biến thể theo định dạng SC+id");
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

  return (
    <div className="space-y-4 pt-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Biến thể sản phẩm</CardTitle>
            {!hasVariationAttributes && (
              <p className="text-sm text-muted-foreground mt-1">
                Chưa có thuộc tính nào được đánh dấu để tạo biến thể. Vui lòng chọn ít nhất một thuộc tính trong tab Thuộc tính.
              </p>
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
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
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
                isLoadingVariations={isLoadingVariations}
                onUpdateVariation={updateVariation}
                onDeleteVariation={confirmDeleteVariation}
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

export default VariationsTab;
