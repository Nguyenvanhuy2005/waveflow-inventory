
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
import { Trash, LoaderCircle } from "lucide-react";

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

interface VariationsTableProps {
  variations: Variation[];
  isLoadingVariations: boolean;
  onUpdateVariation: (index: number, field: string, value: any) => void;
  onDeleteVariation: (index: number) => void;
}

const VariationsTable = ({ 
  variations, 
  isLoadingVariations, 
  onUpdateVariation,
  onDeleteVariation
}: VariationsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[25%]">Biến thể</TableHead>
            <TableHead className="w-[14%]">Giá gốc</TableHead>
            <TableHead className="w-[14%]">Giá khuyến mãi</TableHead>
            <TableHead className="w-[18%]">SKU</TableHead>
            <TableHead className="w-[10%]">Tồn kho</TableHead>
            <TableHead className="w-[10%]">Quản lý kho</TableHead>
            <TableHead className="w-[9%]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoadingVariations ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
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
