
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/products";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Package, Plus } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { formatCurrency } from "@/lib/format";

interface ProductSearchProps {
  onSelectProduct: (product: any) => void;
}

export function ProductSearch({ onSelectProduct }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const { data: products, isPending } = useQuery({
    queryKey: ["products-search", searchTerm],
    queryFn: () => getProducts({ search: searchTerm, per_page: 10 }),
    enabled: searchTerm.length > 2 && open,
  });

  const handleSelectProduct = (product: any) => {
    onSelectProduct(product);
    setSearchTerm("");
    setOpen(false);
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
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-2">
          {isPending ? (
            <div className="flex items-center justify-center p-4">
              <div className="loading-spinner mr-2" />
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
                <div 
                  key={product.id}
                  className="flex items-center justify-between gap-2 p-2 hover:bg-muted cursor-pointer rounded-md"
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
                        SKU: {product.sku || "N/A"} | {formatCurrency(parseFloat(product.price || "0"))}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSelectProduct(product)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
