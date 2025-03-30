
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface BulkActionsProps {
  onApplyBulkAction: (action: string, regularPrice: string, salePrice: string) => void;
}

const BulkActions = ({ onApplyBulkAction }: BulkActionsProps) => {
  const [bulkAction, setBulkAction] = useState<string>("");
  const [bulkPrice, setBulkPrice] = useState<string>("");
  const [bulkSalePrice, setBulkSalePrice] = useState<string>("");

  const handleApply = () => {
    if (!bulkAction) return;

    switch (bulkAction) {
      case "set_regular_price":
        if (bulkPrice.trim() === "") {
          toast.error("Vui lòng nhập giá");
          return;
        }
        break;
      case "set_sale_price":
        if (bulkSalePrice.trim() === "") {
          toast.error("Vui lòng nhập giá khuyến mãi");
          return;
        }
        break;
      default:
        break;
    }

    onApplyBulkAction(bulkAction, bulkPrice, bulkSalePrice);
    setBulkAction("");
    setBulkPrice("");
    setBulkSalePrice("");
  };

  return (
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
                <SelectItem value="set_sku">Đặt SKU (SC+id)</SelectItem>
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

          <Button onClick={handleApply} disabled={!bulkAction}>
            Áp dụng
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkActions;
