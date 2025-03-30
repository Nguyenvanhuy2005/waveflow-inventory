
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Trash, LoaderCircle, Image } from "lucide-react";
import { useRef } from "react";

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
  image?: {
    id?: number;
    src?: string;
  };
}

interface VariationsTableProps {
  variations: Variation[];
  isLoadingVariations: boolean;
  onUpdateVariation: (index: number, field: string, value: any) => void;
  onDeleteVariation: (index: number) => void;
  onSelectVariationImage: (index: number, file: File) => void;
}

const VariationsTable = ({ 
  variations, 
  isLoadingVariations, 
  onUpdateVariation,
  onDeleteVariation,
  onSelectVariationImage
}: VariationsTableProps) => {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleImageClick = (index: number) => {
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]?.click();
    }
  };

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onSelectVariationImage(index, e.target.files[0]);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[5%]">ID</TableHead>
            <TableHead className="w-[20%]">Biến thể</TableHead>
            <TableHead className="w-[10%]">Giá gốc</TableHead>
            <TableHead className="w-[10%]">Giá KM</TableHead>
            <TableHead className="w-[15%]">SKU</TableHead>
            <TableHead className="w-[7%]">Tồn kho</TableHead>
            <TableHead className="w-[8%]">Quản lý</TableHead>
            <TableHead className="w-[15%]">Hình ảnh</TableHead>
            <TableHead className="w-[10%]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoadingVariations ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                <div className="flex items-center justify-center">
                  <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                  <span>Đang tải biến thể...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            variations.map((variation, index) => (
              <TableRow key={index}>
                <TableCell>
                  {variation.id || <span className="text-muted-foreground italic">Mới</span>}
                </TableCell>
                <TableCell className="font-medium">
                  {variation.attributes && variation.attributes.length > 0 ? (
                    variation.attributes.map(attr => (
                      <div key={attr.name} className="mb-1">
                        <span className="font-medium">{attr.name}:</span> {attr.option}
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground italic">Không có thuộc tính</div>
                  )}
                </TableCell>
                <TableCell>
                  <Input 
                    type="text" 
                    value={variation.regular_price} 
                    onChange={(e) => onUpdateVariation(index, "regular_price", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="text" 
                    value={variation.sale_price} 
                    onChange={(e) => onUpdateVariation(index, "sale_price", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="text" 
                    value={variation.sku} 
                    onChange={(e) => onUpdateVariation(index, "sku", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    value={variation.stock_quantity || 0} 
                    onChange={(e) => onUpdateVariation(index, "stock_quantity", parseInt(e.target.value))}
                    disabled={!variation.manage_stock}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <Switch
                      checked={variation.manage_stock || false}
                      onCheckedChange={(checked) => onUpdateVariation(index, "manage_stock", checked)}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-10 h-10 border rounded cursor-pointer flex items-center justify-center bg-muted/30"
                      onClick={() => handleImageClick(index)}
                    >
                      {variation.image && variation.image.src ? (
                        <img 
                          src={variation.image.src} 
                          alt={`Biến thể ${index}`} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageChange(index, e)}
                      ref={el => fileInputRefs.current[index] = el}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDeleteVariation(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default VariationsTable;
