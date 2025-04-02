
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

interface BulkActionsProps {
  onApplyBulkAction: (action: string, regularPrice: string, salePrice: string, stockStatus: string, stockQuantity: string) => void;
}

const BulkActions = ({ onApplyBulkAction }: BulkActionsProps) => {
  const [bulkAction, setBulkAction] = useState<string>("set_sku");

  const handleApply = () => {
    // We only support the set_sku action now
    onApplyBulkAction("set_sku", "", "", "", "");
    toast.success("Đã áp dụng cập nhật SKU hàng loạt thành công");
  };

  return (
    <Card className="bg-muted/30">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/2">
            <div className="flex items-center space-x-2 h-10">
              <CheckCircle className="h-4 w-4" />
              <span>Đặt SKU theo định dạng "SC" + ID sản phẩm cho tất cả biến thể</span>
            </div>
          </div>

          <Button onClick={handleApply}>
            Áp dụng
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkActions;
