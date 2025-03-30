import { wcApiClient } from "./apiConfig";

export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_modified: string;
  type: string;
  status: string;
  featured: boolean;
  catalog_visibility: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_to: string | null;
  price_html: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  download_limit: number;
  download_expiry: number;
  external_url: string;
  button_text: string;
  tax_status: string;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: string;
  backorders: string;
  backorders_allowed: boolean;
  backordered: boolean;
  sold_individually: boolean;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  shipping_required: boolean;
  shipping_taxable: boolean;
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  related_ids: number[];
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  purchase_note: string;
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
  tags: {
    id: number;
    name: string;
    slug: string;
  }[];
  images: {
    id: number;
    date_created: string;
    date_modified: string;
    src: string;
    name: string;
    alt: string;
  }[];
  attributes: {
    id: number;
    name: string;
    position: number;
    visible: boolean;
    variation: boolean;
    options: string[];
  }[];
  default_attributes: any[];
  variations: number[];
  grouped_products: number[];
  menu_order: number;
  meta_data: {
    id: number;
    key: string;
    value: any;
  }[];
}

export interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  type: string;
  order_by: string;
  has_archives: boolean;
}

export interface ProductAttributeTerm {
  id: number;
  name: string;
  slug: string;
  description: string;
  menu_order: number;
  count: number;
}

export interface ProductSearchParams {
  search?: string;
  category?: string;
  status?: string;
  per_page?: number;
  page?: number;
}

export const getProducts = async (params?: ProductSearchParams) => {
  const response = await wcApiClient.get<Product[]>("/products", { params });
  return response.data;
};

export const getProduct = async (id: number) => {
  const response = await wcApiClient.get<Product>(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData: Partial<Product>) => {
  try {
    const response = await wcApiClient.post<Product>("/products", productData);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id: number, productData: Partial<Product>) => {
  try {
    const response = await wcApiClient.put<Product>(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

export const deleteProduct = async (id: number) => {
  const response = await wcApiClient.delete<Product>(`/products/${id}`);
  return response.data;
};

export const getProductCategories = async (params?: { per_page?: number; page?: number }) => {
  try {
    const defaultParams = { per_page: 100, ...params };
    const response = await wcApiClient.get("/products/categories", { params: defaultParams });
    return response.data;
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return [];
  }
};

export const getLowStockProducts = async (threshold: number = 5) => {
  const params = {
    stock_status: "instock",
    per_page: 100,
  };
  
  const response = await wcApiClient.get<Product[]>("/products", { params });
  return response.data.filter(product => 
    product.manage_stock && 
    product.stock_quantity !== null && 
    product.stock_quantity <= threshold
  );
};

export const uploadProductImage = async (productId: number, formData: FormData) => {
  try {
    const response = await wcApiClient.post(`/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading product image:", error);
    throw error;
  }
};

export const uploadMultipleProductImages = async (productId: number, images: File[]) => {
  try {
    const uploadPromises = images.map(image => {
      const formData = new FormData();
      formData.append('image', image);
      return wcApiClient.post(`/products/${productId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    });
    
    const responses = await Promise.all(uploadPromises);
    return responses.map(response => response.data);
  } catch (error) {
    console.error("Error uploading multiple product images:", error);
    throw error;
  }
};

export const getProductAttributes = async () => {
  try {
    const response = await wcApiClient.get<ProductAttribute[]>("/products/attributes");
    return response.data;
  } catch (error) {
    console.error("Error fetching product attributes:", error);
    return [];
  }
};

export const getProductAttributeTerms = async (attributeId: number) => {
  try {
    const response = await wcApiClient.get<ProductAttributeTerm[]>(`/products/attributes/${attributeId}/terms`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching terms for attribute ${attributeId}:`, error);
    return [];
  }
};

export const createProductAttribute = async (attributeData: Partial<ProductAttribute>) => {
  try {
    const response = await wcApiClient.post<ProductAttribute>("/products/attributes", attributeData);
    return response.data;
  } catch (error) {
    console.error("Error creating product attribute:", error);
    throw error;
  }
};

export const createProductAttributeTerm = async (attributeId: number, termData: Partial<ProductAttributeTerm>) => {
  try {
    const response = await wcApiClient.post<ProductAttributeTerm>(`/products/attributes/${attributeId}/terms`, termData);
    return response.data;
  } catch (error) {
    console.error("Error creating attribute term:", error);
    throw error;
  }
};
