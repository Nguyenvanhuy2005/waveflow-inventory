
import { wcApiClient } from "./apiConfig";

export interface Customer {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  username: string;
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
  is_paying_customer: boolean;
  avatar_url: string;
  meta_data: {
    id: number;
    key: string;
    value: any;
  }[];
}

export interface CustomerSearchParams {
  search?: string;
  role?: string;
  per_page?: number;
  page?: number;
}

export const getCustomers = async (params?: CustomerSearchParams) => {
  const response = await wcApiClient.get<Customer[]>("/customers", { params });
  return response.data;
};

export const getCustomer = async (id: number) => {
  const response = await wcApiClient.get<Customer>(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (customerData: Partial<Customer>) => {
  const response = await wcApiClient.post<Customer>("/customers", customerData);
  return response.data;
};

export const updateCustomer = async (id: number, customerData: Partial<Customer>) => {
  const response = await wcApiClient.put<Customer>(`/customers/${id}`, customerData);
  return response.data;
};

export const deleteCustomer = async (id: number) => {
  const response = await wcApiClient.delete(`/customers/${id}`);
  return response.data;
};

export const getCustomerOrders = async (customerId: number) => {
  const response = await wcApiClient.get(`/orders`, {
    params: {
      customer: customerId,
    },
  });
  return response.data;
};

export const getTopCustomers = async (limit: number = 5) => {
  const params = {
    orderby: "id",
    per_page: 100, // We'll filter this down after getting total spending
  };
  
  const customers = await wcApiClient.get<Customer[]>("/customers", { params });
  
  // Now get all orders to calculate customer spending
  const orders = await wcApiClient.get("/orders", { params: { per_page: 100 } });
  
  // Map customer ID to total spending
  const customerSpending: Record<number, number> = {};
  orders.data.forEach((order: any) => {
    if (order.customer_id > 0) {
      const total = parseFloat(order.total);
      customerSpending[order.customer_id] = (customerSpending[order.customer_id] || 0) + total;
    }
  });
  
  // Add spending to customer objects
  const customersWithSpending = customers.data.map(customer => ({
    ...customer,
    total_spent: customerSpending[customer.id] || 0,
  }));
  
  // Sort by spending and get top N
  return customersWithSpending
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, limit);
};
