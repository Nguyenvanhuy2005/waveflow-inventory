
import { wcApiClient } from "./apiConfig";

export interface Coupon {
  id: number;
  code: string;
  amount: string;
  discount_type: string;
  description: string;
  date_created: string;
  date_modified: string;
  date_expires: string | null;
  usage_count: number;
  individual_use: boolean;
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  limit_usage_to_x_items: number | null;
  free_shipping: boolean;
  product_categories: number[];
  excluded_product_categories: number[];
  exclude_sale_items: boolean;
  minimum_amount: string;
  maximum_amount: string;
  email_restrictions: string[];
  used_by: string[];
  meta_data: Array<{
    id: number;
    key: string;
    value: string;
  }>;
}

export interface CouponSearchParams {
  search?: string;
  code?: string;
  per_page?: number;
  page?: number;
}

export const getCoupons = async (params?: CouponSearchParams) => {
  try {
    const response = await wcApiClient.get<Coupon[]>("/coupons", { params });
    console.log(`Fetched ${response.data.length} coupons`);
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  }
};

export const getCouponByCode = async (code: string): Promise<Coupon | null> => {
  try {
    console.log(`Searching for coupon with code: ${code}`);
    const response = await wcApiClient.get<Coupon[]>("/coupons", { 
      params: { code }
    });
    
    if (response.data.length > 0) {
      console.log(`Found coupon with code ${code}`);
      return response.data[0];
    }
    
    console.log(`No coupon found with code ${code}`);
    return null;
  } catch (error) {
    console.error(`Error searching for coupon with code ${code}:`, error);
    return null;
  }
};
