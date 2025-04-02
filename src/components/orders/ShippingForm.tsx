
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/format";

interface ShippingFormProps {
  billing: any;
  shipping: any;
  shippingTotal: string;
  onShippingUpdate: (shipping: any) => void;
  onShippingCostUpdate: (cost: string) => void;
}

export function ShippingForm({ 
  billing, 
  shipping, 
  shippingTotal, 
  onShippingUpdate, 
  onShippingCostUpdate 
}: ShippingFormProps) {
  const [sameAsBilling, setSameAsBilling] = useState(true);
  
  // Update shipping when billing changes if sameAsBilling is true
  useEffect(() => {
    if (sameAsBilling) {
      const shippingInfo = {
        first_name: billing.first_name,
        last_name: billing.last_name,
        address_1: billing.address_1,
        city: billing.city,
        state: billing.state,
        postcode: billing.postcode,
        country: billing.country || "VN",
        phone: billing.phone
      };
      
      onShippingUpdate(shippingInfo);
    }
  }, [sameAsBilling, billing, onShippingUpdate]);
  
  const handleShippingInfoChange = (field: string, value: string) => {
    onShippingUpdate({
      ...shipping,
      [field]: value
    });
  };
  
  const handleSameAsBillingChange = (checked: boolean) => {
    setSameAsBilling(checked);
    
    if (checked) {
      const shippingInfo = {
        first_name: billing.first_name,
        last_name: billing.last_name,
        address_1: billing.address_1,
        city: billing.city,
        state: billing.state,
        postcode: billing.postcode,
        country: billing.country || "VN",
        phone: billing.phone
      };
      
      onShippingUpdate(shippingInfo);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin giao hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="same-as-billing"
            checked={sameAsBilling}
            onCheckedChange={handleSameAsBillingChange}
          />
          <Label htmlFor="same-as-billing">Giống thông tin thanh toán</Label>
        </div>
        
        {!sameAsBilling && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shipping.first_name">Họ</Label>
                <Input
                  id="shipping.first_name"
                  value={shipping?.first_name || ""}
                  onChange={(e) => handleShippingInfoChange("first_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping.last_name">Tên</Label>
                <Input
                  id="shipping.last_name"
                  value={shipping?.last_name || ""}
                  onChange={(e) => handleShippingInfoChange("last_name", e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shipping.address_1">Địa chỉ</Label>
              <Input
                id="shipping.address_1"
                value={shipping?.address_1 || ""}
                onChange={(e) => handleShippingInfoChange("address_1", e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shipping.city">Thành phố</Label>
                <Input
                  id="shipping.city"
                  value={shipping?.city || ""}
                  onChange={(e) => handleShippingInfoChange("city", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping.state">Tỉnh/Thành</Label>
                <Input
                  id="shipping.state"
                  value={shipping?.state || ""}
                  onChange={(e) => handleShippingInfoChange("state", e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shipping.phone">Số điện thoại</Label>
              <Input
                id="shipping.phone"
                value={shipping?.phone || ""}
                onChange={(e) => handleShippingInfoChange("phone", e.target.value)}
              />
            </div>
          </div>
        )}
        
        <div className="space-y-2 pt-4 border-t">
          <Label htmlFor="shipping-cost">Phí giao hàng</Label>
          <Input
            id="shipping-cost"
            type="number"
            min="0"
            value={shippingTotal}
            onChange={(e) => onShippingCostUpdate(e.target.value)}
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground">
            Nhập 0 để miễn phí giao hàng.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
