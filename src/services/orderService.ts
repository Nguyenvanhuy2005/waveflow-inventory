
import { wcApiClient } from "./apiConfig";

export interface Order {
  id: number;
  parent_id: number;
  number: string;
  order_key: string;
  created_via: string;
  version: string;
  status: string;
  currency: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  prices_include_tax: boolean;
  customer_id: number;
  customer_ip_address: string;
  customer_user_agent: string;
  customer_note: string;
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  date_paid: string | null;
  date_paid_gmt: string | null;
  date_completed: string | null;
  date_completed_gmt: string | null;
  cart_hash: string;
  meta_data: {
    id: number;
    key: string;
    value: any;
  }[];
  line_items: {
    id: number;
    name: string;
    product_id: number;
    variation_id: number;
    quantity: number;
    tax_class: string;
    subtotal: string;
    subtotal_tax: string;
    total: string;
    total_tax: string;
    taxes: any[];
    meta_data: any[];
    sku: string;
    price: number;
  }[];
  tax_lines: any[];
  shipping_lines: any[];
  fee_lines: any[];
  coupon_lines: any[];
  refunds: any[];
}

export interface OrderSearchParams {
  search?: string;
  customer?: number;
  status?: string;
  after?: string;
  before?: string;
  per_page?: number;
  page?: number;
}

export const getOrders = async (params?: OrderSearchParams) => {
  const response = await wcApiClient.get<Order[]>("/orders", { params });
  return response.data;
};

export const getOrder = async (id: number) => {
  const response = await wcApiClient.get<Order>(`/orders/${id}`);
  return response.data;
};

export const createOrder = async (orderData: Partial<Order>) => {
  const response = await wcApiClient.post<Order>("/orders", orderData);
  return response.data;
};

export const updateOrder = async (id: number, orderData: Partial<Order>) => {
  const response = await wcApiClient.put<Order>(`/orders/${id}`, orderData);
  return response.data;
};

export const deleteOrder = async (id: number) => {
  const response = await wcApiClient.delete(`/orders/${id}`);
  return response.data;
};

export const getOrderStatuses = async () => {
  const response = await wcApiClient.get("/reports/orders/totals");
  return response.data;
};

export const getRecentOrders = async (limit: number = 10) => {
  const params = {
    per_page: limit,
    orderby: "date",
    order: "desc",
  };
  
  const response = await wcApiClient.get<Order[]>("/orders", { params });
  return response.data;
};

export const getOrdersByDateRange = async (from: string, to: string) => {
  const params = {
    after: from,
    before: to,
    per_page: 100,
  };
  
  const response = await wcApiClient.get<Order[]>("/orders", { params });
  return response.data;
};
