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
  variationsDetails?: ProductVariation[];
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

export interface ProductVariation {
  id: number;
  date_created: string;
  date_modified: string;
  description: string;
  permalink: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_to: string | null;
  on_sale: boolean;
  status: string;
  purchasable: boolean;
  virtual: boolean;
  downloadable: boolean;
  download_limit: number;
  download_expiry: number;
  tax_status: string;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: string;
  backorders: string;
  backorders_allowed: boolean;
  backordered: boolean;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  shipping_class: string;
  shipping_class_id: number;
  image: {
    id: number;
    src: string;
    name: string;
    alt: string;
  };
  attributes: {
    id: number;
    name: string;
    option: string;
  }[];
  menu_order: number;
  meta_data: {
    id: number;
    key: string;
    value: string;
  }[];
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
  
  if (response.data.type === 'variable' && response.data.variations && response.data.variations.length > 0) {
    const variationsDetails = await getProductVariations(id);
    response.data.variationsDetails = variationsDetails;
  }
  
  return response.data;
};

export const createProduct = async (productData: Partial<Product>) => {
  try {
    const response = await wcApiClient.post<Product>("/products", productData);
    
    if (productData.type === 'variable' && productData.variations && Array.isArray(productData.variations) && response.data.id) {
      const variationsToSubmit = productData.variations
        .filter(variation => variation && typeof variation === 'object')
        .map(variation => {
          const variationData: Record<string, any> = {};
          
          // Basic properties
          if (typeof variation === 'object' && variation !== null) {
            const variationObj = variation as Record<string, any>;
            
            variationData.regular_price = variationObj.regular_price || '';
            variationData.sale_price = variationObj.sale_price || '';
            variationData.sku = variationObj.sku || '';
            
            if (variationObj.stock_status) variationData.stock_status = variationObj.stock_status;
            if (variationObj.stock_quantity !== undefined) variationData.stock_quantity = variationObj.stock_quantity;
            if (variationObj.manage_stock !== undefined) variationData.manage_stock = variationObj.manage_stock;
            
            // Handle attributes properly
            if (variationObj.attributes && Array.isArray(variationObj.attributes)) {
              variationData.attributes = variationObj.attributes.map((attr: any) => ({
                name: attr.name,
                option: attr.option
              }));
            }
          }
          
          return variationData;
        })
        .filter(variation => Object.keys(variation).length > 0);
      
      await createProductVariations(response.data.id, variationsToSubmit);
    }
    
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id: number, productData: Partial<Product>) => {
  try {
    const response = await wcApiClient.put<Product>(`/products/${id}`, productData);
    
    if (productData.type === 'variable' && productData.variations && Array.isArray(productData.variations)) {
      const variationsToSubmit = productData.variations
        .filter(variation => variation && typeof variation === 'object')
        .map(variation => {
          const variationData: Record<string, any> = {};
          
          // Basic properties
          if (typeof variation === 'object' && variation !== null) {
            const variationObj = variation as Record<string, any>;
            
            if (variationObj.id) variationData.id = variationObj.id;
            variationData.regular_price = variationObj.regular_price || '';
            variationData.sale_price = variationObj.sale_price || '';
            variationData.sku = variationObj.sku || '';
            
            if (variationObj.stock_status) variationData.stock_status = variationObj.stock_status;
            if (variationObj.stock_quantity !== undefined) variationData.stock_quantity = variationObj.stock_quantity;
            if (variationObj.manage_stock !== undefined) variationData.manage_stock = variationObj.manage_stock;
            
            // Handle attributes properly
            if (variationObj.attributes && Array.isArray(variationObj.attributes)) {
              variationData.attributes = variationObj.attributes.map((attr: any) => ({
                name: attr.name,
                option: attr.option
              }));
            }
          }
          
          return variationData;
        })
        .filter(variation => Object.keys(variation).length > 0);
      
      await updateProductVariations(id, variationsToSubmit);
    }
    
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
    const response = await wcApiClient.get<ProductAttribute[]>("/products/attributes", {
      params: { per_page: 100 } // Fetch up to 100 attributes 
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching product attributes:", error);
    return [];
  }
};

export const getProductAttributeTerms = async (attributeId: number) => {
  try {
    const response = await wcApiClient.get<ProductAttributeTerm[]>(`/products/attributes/${attributeId}/terms`, {
      params: { per_page: 100 } // Fetch up to 100 terms per attribute
    });
    console.log(`Fetched ${response.data.length} terms for attribute ${attributeId}`);
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

export const getProductVariations = async (productId: number) => {
  try {
    const response = await wcApiClient.get<ProductVariation[]>(`/products/${productId}/variations`, {
      params: { per_page: 100 } // Fetch up to 100 variations
    });
    console.log(`Fetched ${response.data.length} variations for product ${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching variations for product ${productId}:`, error);
    return [];
  }
};

export const getProductVariation = async (productId: number, variationId: number) => {
  try {
    const response = await wcApiClient.get<ProductVariation>(`/products/${productId}/variations/${variationId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching variation ${variationId} for product ${productId}:`, error);
    throw error;
  }
};

export const createProductVariations = async (productId: number, variations: Record<string, any>[]) => {
  try {
    if (!Array.isArray(variations) || variations.length === 0) {
      console.log("No variations to create");
      return [];
    }
    
    const createPromises = variations.map(variation => {
      if (!variation || typeof variation !== 'object') {
        console.error("Invalid variation data:", variation);
        return Promise.resolve(null);
      }
      
      return wcApiClient.post(`/products/${productId}/variations`, variation);
    }).filter(Boolean);
    
    if (createPromises.length === 0) {
      return [];
    }
    
    const responses = await Promise.all(createPromises);
    return responses.map(response => response?.data).filter(Boolean);
  } catch (error) {
    console.error(`Error creating variations for product ${productId}:`, error);
    throw error;
  }
};

export const updateProductVariation = async (productId: number, variationId: number, variationData: Partial<ProductVariation>) => {
  try {
    const response = await wcApiClient.put<ProductVariation>(
      `/products/${productId}/variations/${variationId}`,
      variationData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating variation ${variationId} for product ${productId}:`, error);
    throw error;
  }
};

export const updateProductVariations = async (productId: number, variations: Record<string, any>[]) => {
  try {
    console.log("Updating variations with data:", variations);
    
    if (!Array.isArray(variations) || variations.length === 0) {
      console.log("No variations to update");
      return [];
    }
    
    const updatePromises = variations.map(variation => {
      if (!variation || typeof variation !== 'object') {
        console.error("Invalid variation data:", variation);
        return Promise.resolve(null);
      }
      
      if (variation.id) {
        return wcApiClient.put(`/products/${productId}/variations/${variation.id}`, variation);
      }
      return wcApiClient.post(`/products/${productId}/variations`, variation);
    }).filter(Boolean);
    
    if (updatePromises.length === 0) {
      return [];
    }
    
    const responses = await Promise.all(updatePromises);
    return responses.map(response => response?.data).filter(Boolean);
  } catch (error) {
    console.error(`Error updating variations for product ${productId}:`, error);
    throw error;
  }
};

export const deleteProductVariation = async (productId: number, variationId: number) => {
  try {
    const response = await wcApiClient.delete(`/products/${productId}/variations/${variationId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting variation ${variationId} for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Upload an image for a specific product variation
 */
export const uploadProductVariationImage = async (productId: number, variationId: number, file: File) => {
  try {
    // Create FormData object with the image
    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', file.name);
    
    console.log(`Uploading image for product ${productId}, variation ${variationId}`);
    
    // Send the request to the WooCommerce API
    const response = await wcApiClient.post(
      `/products/${productId}/variations/${variationId}`, 
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    // Return the image data from the response
    if (response.data && response.data.image) {
      console.log("Variation image uploaded successfully:", response.data.image);
      return response.data.image;
    }
    
    // If the image wasn't returned in the response, create a temporary URL
    const tempUrl = URL.createObjectURL(file);
    console.log("Creating temporary URL for uploaded image:", tempUrl);
    
    return {
      id: 0,  // Temporary ID
      src: tempUrl
    };
  } catch (error) {
    console.error(`Error uploading image for variation ${variationId}:`, error);
    throw error;
  }
};
