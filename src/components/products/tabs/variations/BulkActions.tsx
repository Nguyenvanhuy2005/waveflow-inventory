
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

interface BulkActionsProps {
  onApplyBulkAction: (action: string, regularPrice: string, salePrice: string, stockStatus: string, stockQuantity: string) => void;
}

const BulkActions = ({ onApplyBulkAction }: BulkActionsProps) => {
  const [bulkAction, setBulkAction] = useState<string>("");
  const [bulkPrice, setBulkPrice] = useState<string>("");
  const [bulkSalePrice, setBulkSalePrice] = useState<string>("");
  const [bulkStockStatus, setBulkStockStatus] = useState<string>("instock");
  const [bulkStockQuantity, setBulkStockQuantity] = useState<string>("");

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
      case "set_stock_quantity":
        if (bulkStockQuantity.trim() === "") {
          toast.error("Vui lòng nhập số lượng tồn kho");
          return;
        }
        break;
      default:
        break;
    }

    onApplyBulkAction(bulkAction, bulkPrice, bulkSalePrice, bulkStockStatus, bulkStockQuantity);
    toast.success("Đã áp dụng thao tác hàng loạt thành công");
    setBulkAction("");
    setBulkPrice("");
    setBulkSalePrice("");
    setBulkStockQuantity("");
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
                <SelectItem value="set_sku">Đặt SKU (SC+ID)</SelectItem>
                <SelectItem value="set_stock_status">Đặt trạng thái tồn kho</SelectItem>
                <SelectItem value="set_stock_quantity">Đặt số lượng tồn kho</SelectItem>
                <SelectItem value="toggle_manage_stock">Bật/tắt quản lý kho</SelectItem>
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

          {bulkAction === "set_stock_status" && (
            <div className="w-full md:w-1/4">
              <Label>Trạng thái tồn kho</Label>
              <Select value={bulkStockStatus} onValueChange={setBulkStockStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instock">Còn hàng</SelectItem>
                  <SelectItem value="outofstock">Hết hàng</SelectItem>
                  <SelectItem value="onbackorder">Đặt trước</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {bulkAction === "set_stock_quantity" && (
            <div className="w-full md:w-1/4">
              <Label>Số lượng tồn kho</Label>
              <Input 
                type="number" 
                value={bulkStockQuantity} 
                onChange={(e) => setBulkStockQuantity(e.target.value)}
                placeholder="Nhập số lượng"
                min="0"
              />
            </div>
          )}

          {bulkAction === "toggle_manage_stock" && (
            <div className="w-full md:w-1/4">
              <div className="flex items-center space-x-2 h-10 mt-6">
                <CheckCircle className="h-4 w-4" />
                <span>Bật quản lý kho cho tất cả biến thể</span>
              </div>
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
