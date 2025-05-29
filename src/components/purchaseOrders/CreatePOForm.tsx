
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { ProductSearch } from "@/components/orders/ProductSearch";
import { CreatePurchaseOrderData, PurchaseOrderItem } from "@/types/purchaseOrder";
import { calculatePOTotals } from "@/services/purchaseOrderService";

interface CreatePOFormProps {
  onSubmit: (data: CreatePurchaseOrderData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface POFormData {
  supplier_id: string;
  expected_delivery_date: string;
  notes: string;
  tags: string;
}

const mockSuppliers = [
  { id: 1, name: "Công ty TNHH ABC" },
  { id: 2, name: "Nhà cung cấp XYZ" },
];

export function CreatePOForm({ onSubmit, onCancel, isSubmitting }: CreatePOFormProps) {
  const [items, setItems] = useState<Omit<PurchaseOrderItem, 'id' | 'total_price'>[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<POFormData>();

  const totals = calculatePOTotals(items.map((item, index) => ({
    ...item,
    id: String(index),
    total_price: calculateItemTotal(item),
  })));

  const calculateItemTotal = (item: Omit<PurchaseOrderItem, 'id' | 'total_price'>) => {
    const subtotal = item.quantity * item.unit_price;
    const discountAmount = item.discount_amount || (item.discount_percentage ? subtotal * (item.discount_percentage / 100) : 0);
    return subtotal - discountAmount;
  };

  const handleAddProduct = (product: any) => {
    const newItem: Omit<PurchaseOrderItem, 'id' | 'total_price'> = {
      product_id: product.id,
      variation_id: product.variation_id,
      product_name: product.name,
      sku: product.sku || '',
      quantity: 1,
      unit_price: parseFloat(product.price || '0'),
      discount_percentage: 0,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof Omit<PurchaseOrderItem, 'id' | 'total_price'>, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Clear discount_amount if discount_percentage is set and vice versa
    if (field === 'discount_percentage' && value > 0) {
      updatedItems[index].discount_amount = undefined;
    } else if (field === 'discount_amount' && value > 0) {
      updatedItems[index].discount_percentage = undefined;
    }
    
    setItems(updatedItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const onFormSubmit = (data: POFormData) => {
    const submitData: CreatePurchaseOrderData = {
      supplier_id: parseInt(data.supplier_id),
      expected_delivery_date: data.expected_delivery_date || undefined,
      items,
      notes: data.notes || undefined,
      tags: tags.length > 0 ? tags : undefined,
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin đơn đặt hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier_id">Nhà cung cấp *</Label>
              <Select onValueChange={(value) => setValue('supplier_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhà cung cấp" />
                </SelectTrigger>
                <SelectContent>
                  {mockSuppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={String(supplier.id)}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supplier_id && <p className="text-destructive text-sm mt-1">Vui lòng chọn nhà cung cấp</p>}
            </div>

            <div>
              <Label htmlFor="expected_delivery_date">Ngày giao hàng dự kiến</Label>
              <Input
                type="date"
                {...register('expected_delivery_date')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Thêm tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  {tag} ×
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              {...register('notes')}
              placeholder="Ghi chú đơn hàng..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sản phẩm đặt hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProductSearch onSelectProduct={handleAddProduct} />

          {items.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                <div className="col-span-3">Sản phẩm</div>
                <div className="col-span-1">SL</div>
                <div className="col-span-2">Giá</div>
                <div className="col-span-2">Chiết khấu</div>
                <div className="col-span-2">Thành tiền</div>
                <div className="col-span-2">Thao tác</div>
              </div>
              
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 border rounded">
                  <div className="col-span-3">
                    <div className="font-medium">{item.product_name}</div>
                    <div className="text-sm text-muted-foreground">SKU: {item.sku}</div>
                  </div>
                  
                  <div className="col-span-1">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  
                  <div className="col-span-2 space-y-1">
                    <Input
                      type="number"
                      placeholder="% CK"
                      value={item.discount_percentage || ''}
                      onChange={(e) => updateItem(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                    />
                    <Input
                      type="number"
                      placeholder="Số tiền CK"
                      value={item.discount_amount || ''}
                      onChange={(e) => updateItem(index, 'discount_amount', parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  
                  <div className="col-span-2 font-medium">
                    {formatCurrency(calculateItemTotal(item))}
                  </div>
                  
                  <div className="col-span-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Tổng kết đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-right">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Chiết khấu:</span>
                <span className="text-red-600">-{formatCurrency(totals.total_discount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Tổng cộng:</span>
                <span>{formatCurrency(totals.total_amount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting || items.length === 0}>
          {isSubmitting ? "Đang tạo..." : "Tạo đơn đặt hàng"}
        </Button>
      </div>
    </form>
  );
}
