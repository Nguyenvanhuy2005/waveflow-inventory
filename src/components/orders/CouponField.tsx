
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Tag, Check, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getCouponByCode, Coupon } from "@/services/couponService";

interface CouponFieldProps {
  onApplyCoupon: (coupon: Coupon | null) => void;
  appliedCoupon: Coupon | null;
}

export function CouponField({ onApplyCoupon, appliedCoupon }: CouponFieldProps) {
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }
    
    try {
      setIsLoading(true);
      const coupon = await getCouponByCode(couponCode);
      
      if (coupon) {
        toast.success(`Đã áp dụng mã giảm giá: ${coupon.code}`);
        onApplyCoupon(coupon);
        setCouponCode("");
      } else {
        toast.error("Mã giảm giá không hợp lệ hoặc đã hết hạn");
        onApplyCoupon(null);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error("Có lỗi xảy ra khi áp dụng mã giảm giá");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    onApplyCoupon(null);
    toast.success("Đã xóa mã giảm giá");
  };

  return (
    <div className="space-y-2">
      <Label>Mã giảm giá</Label>
      
      {appliedCoupon ? (
        <div className="flex items-center gap-2 p-2 border rounded-md">
          <Tag className="h-4 w-4 text-primary" />
          <div className="flex-1">
            <div className="flex items-center">
              <span className="font-medium uppercase">{appliedCoupon.code}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                ({appliedCoupon.discount_type === 'percent' ? `Giảm ${appliedCoupon.amount}%` : `Giảm ${formatCurrency(parseFloat(appliedCoupon.amount))}`})
              </span>
            </div>
            {appliedCoupon.description && (
              <p className="text-xs text-muted-foreground">{appliedCoupon.description}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={handleRemoveCoupon}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã giảm giá"
            className="uppercase"
          />
          <Button onClick={handleApplyCoupon} disabled={isLoading || !couponCode}>
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Đang kiểm tra</>
            ) : (
              <>Áp dụng</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
