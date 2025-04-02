
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getProductVariations } from "@/services/productService";
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
  variationsData?: ProductVariation[];
}

export function ProductSearch({ onSelectProduct }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [loadingVariations, setLoadingVariations] = useState<{[key: number]: boolean}>({});

  const { data: products = [], isPending } = useQuery({
    queryKey: ["products-search", searchTerm],
    queryFn: () => getProducts({ search: searchTerm, per_page: 10 }),
    enabled: searchTerm.length > 2 && open,
  });

  // Function to load product variations
  const loadVariations = async (productId: number) => {
    try {
      setLoadingVariations(prev => ({ ...prev, [productId]: true }));
      const variations = await getProductVariations(productId);
      setLoadingVariations(prev => ({ ...prev, [productId]: false }));
      return variations;
    } catch (error) {
      console.error(`Error loading variations for product ${productId}:`, error);
      setLoadingVariations(prev => ({ ...prev, [productId]: false }));
      return [];
    }
  };

  // Handle selecting a product
  const handleSelectProduct = (product: Product) => {
    onSelectProduct(product);
    setSearchTerm("");
    setOpen(false);
  };

  // Handle selecting a variation
  const handleSelectVariation = async (product: Product, variationId: number) => {
    try {
      setLoadingVariations(prev => ({ ...prev, [`${product.id}-${variationId}`]: true }));
      
      // Get the variation details
      const variations = await getProductVariations(product.id);
      const variation = variations.find(v => v.id === variationId);
      
      if (variation) {
        // Create a product-like object with variation details
        const productWithVariation = {
          ...product,
          id: product.id, // Keep the main product ID
          variation_id: variation.id,
          name: `${product.name} - ${variation.attributes.map(attr => attr.option).join(', ')}`,
          sku: variation.sku || product.sku,
          price: variation.price || product.price,
          sale_price: variation.sale_price || product.sale_price,
          regular_price: variation.regular_price || product.regular_price,
          image: variation.image ? variation.image : (product.images && product.images.length > 0 ? product.images[0] : null),
          attributes: variation.attributes,
        };
        
        onSelectProduct(productWithVariation);
      }
      
      setLoadingVariations(prev => ({ ...prev, [`${product.id}-${variationId}`]: false }));
      setSearchTerm("");
      setOpen(false);
    } catch (error) {
      console.error(`Error selecting variation ${variationId} for product ${product.id}:`, error);
      setLoadingVariations(prev => ({ ...prev, [`${product.id}-${variationId}`]: false }));
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm sản phẩm..." 
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
                {searchTerm.length > 2 
                  ? "Không tìm thấy sản phẩm nào" 
                  : "Nhập ít nhất 3 ký tự để tìm kiếm"}
              </p>
            </div>
          ) : (
            <div className="max-h-72 overflow-auto">
              {products.map((product) => (
                <div key={product.id} className="border-b last:border-0">
                  <div 
                    className="flex items-center justify-between gap-2 p-2 hover:bg-muted cursor-pointer rounded-md"
                    onClick={product.type !== 'variable' ? () => handleSelectProduct(product) : undefined}
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
                        </p>
                      </div>
                    </div>
                    {product.type !== 'variable' && (
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
                    )}
                  </div>
                  
                  {/* Variations section */}
                  {product.type === 'variable' && product.variations && product.variations.length > 0 && (
                    <div className="ml-6 pl-4 border-l mb-2">
                      {product.variations.map((variationId: number) => (
                        <div 
                          key={variationId}
                          className="flex items-center justify-between gap-2 p-1.5 hover:bg-muted cursor-pointer rounded-md"
                          onClick={() => handleSelectVariation(product, variationId)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            <span className="text-sm">
                              {loadingVariations[`${product.id}-${variationId}`] ? (
                                <span className="flex items-center">
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" /> Đang tải...
                                </span>
                              ) : (
                                `Biến thể #${variationId}`
                              )}
                            </span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectVariation(product, variationId);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
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
