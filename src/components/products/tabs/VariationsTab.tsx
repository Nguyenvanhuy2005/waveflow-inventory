import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { ArrowUpDown, Plus, RotateCcw, Grid, LoaderCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";

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
  const [bulkAction, setBulkAction] = useState<string>("");
  const [bulkPrice, setBulkPrice] = useState<string>("");
  const [bulkSalePrice, setBulkSalePrice] = useState<string>("");

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
      // Get all attributes marked for variations
      const attributesForVariation = selectedAttributes.filter(attr => attr.variation);
      
      if (attributesForVariation.length === 0) {
        toast.error("Không có thuộc tính nào được đánh dấu để tạo biến thể");
        setIsGenerating(false);
        return;
      }

      // This function generates all possible combinations recursively
      const generateCombinations = (
        attributes: any[],
        currentIndex: number,
        currentCombination: {name: string, option: string}[],
        result: {name: string, option: string}[][]
      ) => {
        // Base case: if we've processed all attributes, add the current combo to results
        if (currentIndex === attributes.length) {
          result.push([...currentCombination]);
          return;
        }

        const currentAttr = attributes[currentIndex];
        
        // If no options for this attribute, skip
        if (!currentAttr.options || currentAttr.options.length === 0) {
          generateCombinations(attributes, currentIndex + 1, currentCombination, result);
          return;
        }

        // For each option of the current attribute
        for (const option of currentAttr.options) {
          // Add this attribute-option pair to current combination
          currentCombination.push({
            name: currentAttr.name,
            option: option
          });
          
          // Recursive call for next attribute
          generateCombinations(attributes, currentIndex + 1, currentCombination, result);
          
          // Backtrack: remove last added pair
          currentCombination.pop();
        }
      };

      // Generate all possible combinations
      const combinations: {name: string, option: string}[][] = [];
      generateCombinations(attributesForVariation, 0, [], combinations);
      
      console.log("Generated combinations:", combinations);

      // Create variations from combinations
      const defaultVariationData = {
        regular_price: form.getValues('regular_price') || '',
        sale_price: form.getValues('sale_price') || '',
        sku: form.getValues('sku') || '',
        stock_quantity: form.getValues('stock_quantity') || 0,
        manage_stock: form.getValues('manage_stock') || false
      };

      // Keep existing variations that match our combinations, add new ones for missing combinations
      const existingVariationMap = new Map();
      
      // Map existing variations by their attribute combination signature
      variations.forEach(variation => {
        const signature = variation.attributes
          .map(attr => `${attr.name}:${attr.option}`)
          .sort()
          .join('|');
        existingVariationMap.set(signature, variation);
      });

      // Create new variations array with all required combinations
      const newVariations: Variation[] = combinations.map(combination => {
        // Create signature for this combination
        const signature = combination
          .map(attr => `${attr.name}:${attr.option}`)
          .sort()
          .join('|');
        
        // If this combination already exists in our variations, use that data
        if (existingVariationMap.has(signature)) {
          return existingVariationMap.get(signature);
        }
        
        // Otherwise create a new variation
        return {
          attributes: combination,
          ...defaultVariationData
        };
      });

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

  // Apply bulk action to all variations
  const applyBulkAction = () => {
    if (!bulkAction) return;

    const updatedVariations = [...variations];

    switch (bulkAction) {
      case "set_regular_price":
        if (bulkPrice.trim() === "") {
          toast.error("Vui lòng nhập giá");
          return;
        }
        updatedVariations.forEach(variation => {
          variation.regular_price = bulkPrice;
        });
        toast.success("Đã cập nhật giá cho tất cả biến thể");
        break;
        
      case "set_sale_price":
        if (bulkSalePrice.trim() === "") {
          toast.error("Vui lòng nhập giá khuyến mãi");
          return;
        }
        updatedVariations.forEach(variation => {
          variation.sale_price = bulkSalePrice;
        });
        toast.success("Đã cập nhật giá khuyến mãi cho tất cả biến thể");
        break;
        
      default:
        break;
    }
    
    setVariations(updatedVariations);
    setBulkAction("");
    setBulkPrice("");
    setBulkSalePrice("");
  };

  // Handler to clear all variations
  const clearAllVariations = () => {
    setIsConfirmDialogOpen(false);
    setVariations([]);
    toast.info("Đã xóa tất cả biến thể");
  };

  // Return early if product type is not variable
  if (productType !== 'variable') {
    return (
      <div className="space-y-4 pt-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-3 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-medium">Không phải sản phẩm biến thể</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Để quản lý biến thể, vui lòng chuyển loại sản phẩm sang "Sản phẩm có biến thể" 
                trong tab Thông tin cơ bản
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <div className="flex flex-col items-center justify-center py-8 space-y-3 text-center">
              {hasVariationAttributes ? (
                <>
                  <Grid className="h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Chưa có biến thể nào</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Nhấn "Tạo biến thể" để tạo tất cả các biến thể có thể từ thuộc tính đã chọn.
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Cần chọn thuộc tính</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Vui lòng chọn ít nhất một thuộc tính trong tab Thuộc tính và đánh dấu
                    "Dùng cho biến thể" để có thể tạo biến thể cho sản phẩm này.
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Bulk actions */}
              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-1/4">
                      <Label>Thao tác hàng loạt</Label>
                      <Select value={bulkAction} onValueChange={setBulkAction}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn hành động..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="set_regular_price">Đặt giá gốc</SelectItem>
                          <SelectItem value="set_sale_price">Đặt giá khuyến mãi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {bulkAction === "set_regular_price" && (
                      <div className="w-full md:w-1/4">
                        <Label>Giá gốc</Label>
                        <Input 
                          type="text" 
                          value={bulkPrice} 
                          onChange={(e) => setBulkPrice(e.target.value)}
                          placeholder="Nhập giá gốc"
                        />
                      </div>
                    )}

                    {bulkAction === "set_sale_price" && (
                      <div className="w-full md:w-1/4">
                        <Label>Giá khuyến mãi</Label>
                        <Input 
                          type="text" 
                          value={bulkSalePrice} 
                          onChange={(e) => setBulkSalePrice(e.target.value)}
                          placeholder="Nhập giá khuyến mãi"
                        />
                      </div>
                    )}

                    <Button 
                      onClick={applyBulkAction} 
                      disabled={!bulkAction}
                    >
                      Áp dụng
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Variations table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Biến thể</TableHead>
                      <TableHead className="w-[15%]">Giá gốc</TableHead>
                      <TableHead className="w-[15%]">Giá khuyến mãi</TableHead>
                      <TableHead className="w-[20%]">SKU</TableHead>
                      <TableHead className="w-[10%]">Tồn kho</TableHead>
                      <TableHead className="w-[10%]">Quản lý kho</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingVariations ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex items-center justify-center">
                            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                            <span>Đang tải biến thể...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      variations.map((variation, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {variation.attributes.map(attr => (
                              <div key={attr.name} className="mb-1">
                                <span className="font-medium">{attr.name}:</span> {attr.option}
                              </div>
                            ))}
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="text" 
                              value={variation.regular_price} 
                              onChange={(e) => updateVariation(index, "regular_price", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="text" 
                              value={variation.sale_price} 
                              onChange={(e) => updateVariation(index, "sale_price", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="text" 
                              value={variation.sku} 
                              onChange={(e) => updateVariation(index, "sku", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={variation.stock_quantity || 0} 
                              onChange={(e) => updateVariation(index, "stock_quantity", parseInt(e.target.value))}
                              disabled={!variation.manage_stock}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <Switch
                                checked={variation.manage_stock || false}
                                onCheckedChange={(checked) => updateVariation(index, "manage_stock", checked)}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog for clearing variations */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tất cả biến thể?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa tất cả biến thể hiện tại. Bạn có chắc chắn muốn tiếp tục?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={clearAllVariations} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa tất cả
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VariationsTab;
