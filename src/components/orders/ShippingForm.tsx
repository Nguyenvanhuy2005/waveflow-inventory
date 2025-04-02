
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  
  // Standard shipping costs (simplified example)
  const SHIPPING_OPTIONS = [
    { id: "standard", name: "Giao hàng tiêu chuẩn", cost: "30000" },
    { id: "express", name: "Giao hàng nhanh", cost: "50000" },
    { id: "free", name: "Miễn phí giao hàng", cost: "0" }
  ];
  
  const [selectedShippingOption, setSelectedShippingOption] = useState(SHIPPING_OPTIONS[0].id);
  
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
  
  // Update shipping cost when option changes
  useEffect(() => {
    const option = SHIPPING_OPTIONS.find(opt => opt.id === selectedShippingOption);
    if (option) {
      onShippingCostUpdate(option.cost);
    }
  }, [selectedShippingOption, onShippingCostUpdate]);
  
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
          <Label>Phương thức giao hàng</Label>
          <div className="space-y-2">
            {SHIPPING_OPTIONS.map(option => (
              <div key={option.id} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`shipping-option-${option.id}`}
                  name="shipping-option"
                  value={option.id}
                  checked={selectedShippingOption === option.id}
                  onChange={() => setSelectedShippingOption(option.id)}
                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                />
                <Label htmlFor={`shipping-option-${option.id}`} className="flex-1">
                  {option.name}
                </Label>
                <span className="text-sm font-medium">
                  {formatCurrency(parseFloat(option.cost))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
