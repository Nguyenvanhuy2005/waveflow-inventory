
import { PurchaseOrder, CreatePurchaseOrderData, PurchaseOrderItem } from "@/types/purchaseOrder";

// Mock data for demonstration
const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: "PO001",
    po_number: "PO-2024-001",
    supplier_id: 1,
    supplier_name: "Công ty TNHH ABC",
    status: "pending",
    order_date: "2024-05-25T10:00:00Z",
    expected_delivery_date: "2024-06-01T10:00:00Z",
    items: [
      {
        id: "1",
        product_id: 101,
        product_name: "Sản phẩm A",
        sku: "SKU001",
        quantity: 50,
        unit_price: 100000,
        discount_percentage: 5,
        discount_amount: 250000,
        total_price: 4750000,
      }
    ],
    subtotal: 5000000,
    total_discount: 250000,
    total_amount: 4750000,
    notes: "Đơn hàng mẫu",
    tags: ["urgent", "regular"],
    created_by: "Admin",
    created_at: "2024-05-25T10:00:00Z",
    updated_at: "2024-05-25T10:00:00Z",
  }
];

export const getPurchaseOrders = async (filters?: {
  status?: string;
  supplier_id?: number;
  start_date?: string;
  end_date?: string;
}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filtered = [...mockPurchaseOrders];
  
  if (filters?.status) {
    filtered = filtered.filter(po => po.status === filters.status);
  }
  
  if (filters?.supplier_id) {
    filtered = filtered.filter(po => po.supplier_id === filters.supplier_id);
  }
  
  return filtered;
};

export const getPurchaseOrder = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockPurchaseOrders.find(po => po.id === id);
};

export const createPurchaseOrder = async (data: CreatePurchaseOrderData) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newPO: PurchaseOrder = {
    id: `PO${String(mockPurchaseOrders.length + 1).padStart(3, '0')}`,
    po_number: `PO-2024-${String(mockPurchaseOrders.length + 1).padStart(3, '0')}`,
    supplier_id: data.supplier_id,
    supplier_name: "Supplier Name", // Would come from supplier lookup
    status: 'draft',
    order_date: new Date().toISOString(),
    expected_delivery_date: data.expected_delivery_date,
    items: data.items.map((item, index) => ({
      ...item,
      id: String(index + 1),
      total_price: calculateItemTotal(item),
    })),
    subtotal: 0,
    total_discount: 0,
    total_amount: 0,
    notes: data.notes,
    tags: data.tags,
    created_by: "Current User",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  // Calculate totals
  const calculations = calculatePOTotals(newPO.items);
  newPO.subtotal = calculations.subtotal;
  newPO.total_discount = calculations.total_discount;
  newPO.total_amount = calculations.total_amount;
  
  mockPurchaseOrders.push(newPO);
  return newPO;
};

export const updatePurchaseOrder = async (id: string, data: Partial<PurchaseOrder>) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockPurchaseOrders.findIndex(po => po.id === id);
  if (index === -1) throw new Error("Purchase order not found");
  
  mockPurchaseOrders[index] = {
    ...mockPurchaseOrders[index],
    ...data,
    updated_at: new Date().toISOString(),
  };
  
  return mockPurchaseOrders[index];
};

const calculateItemTotal = (item: Omit<PurchaseOrderItem, 'id' | 'total_price'>) => {
  const subtotal = item.quantity * item.unit_price;
  const discountAmount = item.discount_amount || (item.discount_percentage ? subtotal * (item.discount_percentage / 100) : 0);
  return subtotal - discountAmount;
};

export const calculatePOTotals = (items: PurchaseOrderItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const total_discount = items.reduce((sum, item) => {
    const discountAmount = item.discount_amount || (item.discount_percentage ? (item.quantity * item.unit_price) * (item.discount_percentage / 100) : 0);
    return sum + discountAmount;
  }, 0);
  const total_amount = subtotal - total_discount;
  
  return { subtotal, total_discount, total_amount };
};
