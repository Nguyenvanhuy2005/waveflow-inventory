
export interface PurchaseOrderItem {
  id: string;
  product_id: number;
  variation_id?: number;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  discount_percentage?: number;
  total_price: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: number;
  supplier_name: string;
  status: 'draft' | 'pending' | 'approved' | 'received' | 'cancelled';
  order_date: string;
  expected_delivery_date?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  total_discount: number;
  tax_amount?: number;
  total_amount: number;
  notes?: string;
  tags?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePurchaseOrderData {
  supplier_id: number;
  expected_delivery_date?: string;
  items: Omit<PurchaseOrderItem, 'id' | 'total_price'>[];
  notes?: string;
  tags?: string[];
}
