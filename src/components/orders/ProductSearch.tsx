
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getProductWithVariations } from "@/services/productService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Package, Plus, Loader2 } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { formatCurrency } from "@/lib/format";
import { Product, ProductVariation } from "@/services/products/types";

interface ProductSearchProps {
  onSelectProduct: (product: any) => void;
}

interface ProductWithVariations extends Product {
  variationsDetails?: ProductVariation[];
}

export function ProductSearch({ onSelectProduct }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [loadingVariations, setLoadingVariations] = useState<{[key: number]: boolean}>({});
  const [expandedProducts, setExpandedProducts] = useState<{[key: number]: ProductVariation[]}>({});

  const { data: products = [], isPending } = useQuery({
    queryKey: ["products-search", searchTerm],
    queryFn: () => getProducts({ search: searchTerm, per_page: 10 }),
    enabled: searchTerm.length > 1 && open, // Changed from 2 to 1 to allow ID searches
  });

  // Function to load and filter product variations
  const loadVariations = async (productId: number) => {
    try {
      setLoadingVariations(prev => ({ ...prev, [productId]: true }));
      
      // Use the getProductWithVariations utility to fetch the product with variations
      const productWithVariations = await getProductWithVariations(productId, searchTerm);
      
      // Get variations from the response
      let variations: ProductVariation[] = [];
      if (productWithVariations.variationsDetails && productWithVariations.variationsDetails.length > 0) {
        variations = productWithVariations.variationsDetails;
        console.log(`Loaded ${variations.length} variations for product ${productId}`);
      } else {
        console.log(`No variations found for product ${productId}`);
      }
      
      // Store the variations in state
      setExpandedProducts(prev => ({
        ...prev,
        [productId]: variations
      }));
      
      setLoadingVariations(prev => ({ ...prev, [productId]: false }));
      return variations;
    } catch (error) {
      console.error(`Error loading variations for product ${productId}:`, error);
      setLoadingVariations(prev => ({ ...prev, [productId]: false }));
      return [];
    }
  };

  // Format variation name
  const formatVariationName = (product: Product, variation: ProductVariation) => {
    // Format attributes
    const attributesText = variation.attributes && variation.attributes.length > 0
      ? variation.attributes.map(attr => attr.option).join(", ")
      : "Biến thể mặc định";
    
    // Add SKU if available
    const skuText = variation.sku ? ` (${variation.sku})` : "";
    
    return `${product.name} - ${attributesText}${skuText}`;
  };

  // Handle selecting a product
  const handleSelectProduct = (product: Product) => {
    onSelectProduct(product);
    setSearchTerm("");
    setOpen(false);
  };

  // Handle selecting a variation
  const handleSelectVariation = (product: Product, variation: ProductVariation) => {
    // Create a product-like object with variation details
    const productWithVariation = {
      ...product,
      id: product.id, // Keep the main product ID
      variation_id: variation.id,
      name: formatVariationName(product, variation),
      sku: variation.sku || product.sku,
      price: variation.price || product.price,
      sale_price: variation.sale_price || product.sale_price,
      regular_price: variation.regular_price || product.regular_price,
      image: variation.image ? variation.image : (product.images && product.images.length > 0 ? product.images[0] : null),
      attributes: variation.attributes,
    };
    
    onSelectProduct(productWithVariation);
    setSearchTerm("");
    setOpen(false);
  };

  // Toggle loading variations
  const toggleProductVariations = async (product: Product) => {
    if (expandedProducts[product.id]) {
      // If already loaded, just toggle visibility
      setExpandedProducts(prev => {
        const newState = { ...prev };
        delete newState[product.id];
        return newState;
      });
    } else {
      // Load variations if not already loaded
      await loadVariations(product.id);
    }
  };

  // Check if a product has variations without checking type
  const hasVariations = (product: Product) => {
    return product.variations && product.variations.length > 0;
  };

  // Helper function to display search guidance
  const getSearchPlaceholder = () => {
    return "Tìm kiếm theo tên, SKU hoặc ID...";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={getSearchPlaceholder()} 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="p-2">
          {isPending ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Đang tìm kiếm...</span>
            </div>
          ) : !products || products.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <Package className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchTerm.length > 1 
                  ? "Không tìm thấy sản phẩm nào" 
                  : "Nhập ít nhất 2 ký tự để tìm kiếm"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Có thể tìm bằng tên, mã SKU, hoặc ID sản phẩm
              </p>
            </div>
          ) : (
            <div className="max-h-72 overflow-auto">
              {products.map((product) => (
                <div key={product.id} className="border-b last:border-0">
                  <div 
                    className="flex items-center justify-between gap-2 p-2 hover:bg-muted cursor-pointer rounded-md"
                    onClick={!hasVariations(product) ? () => handleSelectProduct(product) : () => toggleProductVariations(product)}
                  >
                    <div className="flex items-center gap-2">
                      {product.images && product.images[0] ? (
                        <img 
                          src={product.images[0].src} 
                          alt={product.name} 
                          className="w-10 h-10 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.sku ? `SKU: ${product.sku}` : ""} 
                          {product.sku && product.price ? " | " : ""}
                          {product.price ? formatCurrency(parseFloat(product.price || "0")) : ""}
                          {" "}
                          <span className="text-xs text-gray-400">ID: {product.id}</span>
                        </p>
                      </div>
                    </div>
                    {!hasVariations(product) ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectProduct(product);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                  
                  {/* Variations section */}
                  {hasVariations(product) && (
                    <>
                      {loadingVariations[product.id] && (
                        <div className="ml-6 pl-4 border-l mb-2 py-2">
                          <div className="flex items-center text-sm">
                            <Loader2 className="h-3 w-3 animate-spin mr-2" /> 
                            <span>Đang tải biến thể...</span>
                          </div>
                        </div>
                      )}
                      
                      {expandedProducts[product.id] && expandedProducts[product.id].length > 0 && (
                        <div className="ml-6 pl-4 border-l mb-2">
                          {expandedProducts[product.id].map((variation) => (
                            <div 
                              key={variation.id}
                              className="flex items-center justify-between gap-2 p-1.5 hover:bg-muted cursor-pointer rounded-md"
                              onClick={() => handleSelectVariation(product, variation)}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                <span className="text-sm">
                                  {formatVariationName(product, variation)}
                                </span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectVariation(product, variation);
                                }}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {expandedProducts[product.id] && expandedProducts[product.id].length === 0 && !loadingVariations[product.id] && (
                        <div className="ml-6 pl-4 border-l mb-2 py-2">
                          <p className="text-sm text-muted-foreground">Không tìm thấy biến thể nào</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
