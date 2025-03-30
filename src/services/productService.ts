
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
  try {
    const defaultParams = { per_page: 20, ...params };
    const response = await wcApiClient.get<Product[]>("/products", { params: defaultParams });
    console.log(`Fetched ${response.data.length} products`);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getProduct = async (id: number) => {
  try {
    console.log(`Fetching product with ID ${id}`);
    const response = await wcApiClient.get<Product>(`/products/${id}`);
    
    if (response.data.type === 'variable' && response.data.variations && response.data.variations.length > 0) {
      console.log(`Product ${id} is variable with ${response.data.variations.length} variations`);
      const variationsDetails = await getProductVariations(id);
      response.data.variationsDetails = variationsDetails;
      console.log(`Loaded ${variationsDetails.length} variation details for product ${id}`);
    }
    
    console.log(`Product ${id} loaded successfully`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

export const createProduct = async (productData: Partial<Product>) => {
  try {
    console.log("Creating product with data:", productData);
    
    // Prepare data for API submission
    const dataToSubmit: any = { ...productData };
    
    // Remove images from the direct submission as we'll handle them separately
    const imagesToUpload = dataToSubmit.images;
    delete dataToSubmit.images;
    
    // Remove variations from the direct submission as we'll handle them separately
    const variationsToCreate = dataToSubmit.variations;
    delete dataToSubmit.variations;
    
    // Create the main product first
    const response = await wcApiClient.post<Product>("/products", dataToSubmit);
    const productId = response.data.id;
    console.log("Product created with ID:", productId);
    
    // Upload images if they exist
    if (imagesToUpload && Array.isArray(imagesToUpload) && imagesToUpload.length > 0) {
      console.log(`Uploading ${imagesToUpload.length} images for new product ${productId}`);
      await uploadProductImages(productId, imagesToUpload);
    }
    
    // If we have variations, we need to create them separately
    if (productData.type === 'variable' && 
        variationsToCreate && 
        Array.isArray(variationsToCreate) &&
        variationsToCreate.length > 0 &&
        productId) {
      
      console.log(`Creating ${variationsToCreate.length} variations for product ${productId}`);
      await createProductVariations(productId, variationsToCreate);
    }
    
    return response.data;
  } catch (error: any) {
    console.error("Error creating product:", error);
    
    // More descriptive error messages
    if (error.response?.status === 401) {
      console.error("Authentication error - Check API credentials");
    } else if (error.response?.status === 400) {
      console.error("Bad request - Check data format:", error.response.data);
    }
    
    throw error;
  }
};

export const updateProduct = async (id: number, productData: Partial<Product>) => {
  try {
    console.log(`Updating product ${id} with data:`, productData);
    
    // Prepare data for API submission
    const dataToSubmit: any = { ...productData };
    
    // Remove images from the direct submission as we'll handle them separately
    const imagesToUpload = dataToSubmit.images?.filter((img: any) => img instanceof File);
    delete dataToSubmit.images;
    
    // Remove variations from the direct submission as we'll handle them separately
    const variationsToUpdate = dataToSubmit.variations;
    delete dataToSubmit.variations;
    
    // Update the main product first
    const response = await wcApiClient.put<Product>(`/products/${id}`, dataToSubmit);
    console.log(`Product ${id} updated successfully`);
    
    // Upload new images if they exist
    if (imagesToUpload && Array.isArray(imagesToUpload) && imagesToUpload.length > 0) {
      console.log(`Uploading ${imagesToUpload.length} new images for product ${id}`);
      await uploadProductImages(id, imagesToUpload);
    }
    
    // If we have variations, we need to update them separately
    if (productData.type === 'variable' && 
        variationsToUpdate && 
        Array.isArray(variationsToUpdate) &&
        variationsToUpdate.length > 0) {
      
      console.log(`Updating ${variationsToUpdate.length} variations for product ${id}`);
      await updateProductVariations(id, variationsToUpdate);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

export const deleteProduct = async (id: number) => {
  try {
    const response = await wcApiClient.delete<Product>(`/products/${id}`);
    console.log(`Product ${id} deleted successfully`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};

export const getProductCategories = async (params?: { per_page?: number; page?: number }) => {
  try {
    const defaultParams = { per_page: 100, ...params };
    const response = await wcApiClient.get("/products/categories", { params: defaultParams });
    console.log(`Fetched ${response.data.length} product categories`);
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

export const uploadProductImages = async (productId: number, images: any[]) => {
  try {
    console.log(`Uploading ${images.length} images for product ${productId}`);
    
    const uploadPromises = images
      .filter(image => image instanceof File)
      .map(image => {
        const formData = new FormData();
        formData.append('file', image, image.name);
        console.log(`Uploading image file ${image.name}`);
        
        return wcApiClient.post(`/products/${productId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      });
    
    if (uploadPromises.length === 0) {
      console.log("No valid images to upload");
      return [];
    }
    
    const responses = await Promise.all(uploadPromises);
    console.log(`Successfully uploaded ${responses.length} images`);
    return responses.map(response => response?.data).filter(Boolean);
  } catch (error) {
    console.error("Error uploading product images:", error);
    throw error;
  }
};

export const uploadProductImage = async (productId: number, file: File) => {
  try {
    console.log(`Uploading image for product ${productId}`);
    
    const formData = new FormData();
    formData.append('file', file, file.name);
    
    const response = await wcApiClient.post(`/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    console.log("Image upload response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error uploading product image:", error);
    throw error;
  }
};

export const getProductAttributes = async () => {
  try {
    const response = await wcApiClient.get<ProductAttribute[]>("/products/attributes", {
      params: { per_page: 100 } // Fetch up to 100 attributes 
    });
    console.log(`Fetched ${response.data.length} product attributes`);
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
    console.log("Created new product attribute:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating product attribute:", error);
    throw error;
  }
};

export const createProductAttributeTerm = async (attributeId: number, termData: Partial<ProductAttributeTerm>) => {
  try {
    const response = await wcApiClient.post<ProductAttributeTerm>(`/products/attributes/${attributeId}/terms`, termData);
    console.log(`Created new attribute term for attribute ${attributeId}:`, response.data);
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
    console.log(`Fetched variation ${variationId} for product ${productId}`);
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
    
    console.log(`Creating ${variations.length} variations for product ${productId}`);
    
    const createPromises = variations.map(variation => {
      if (!variation || typeof variation !== 'object') {
        console.error("Invalid variation data:", variation);
        return Promise.resolve(null);
      }
      
      // Ensure attributes exist and are properly formatted
      if (!variation.attributes || !Array.isArray(variation.attributes) || variation.attributes.length === 0) {
        console.warn("Variation missing attributes, skipping:", variation);
        return Promise.resolve(null);
      }
      
      return wcApiClient.post(`/products/${productId}/variations`, variation);
    }).filter(Boolean);
    
    if (createPromises.length === 0) {
      return [];
    }
    
    const responses = await Promise.all(createPromises);
    console.log(`Successfully created ${responses.filter(Boolean).length} variations`);
    return responses.map(response => response?.data).filter(Boolean);
  } catch (error) {
    console.error(`Error creating variations for product ${productId}:`, error);
    throw error;
  }
};

export const updateProductVariations = async (productId: number, variations: Record<string, any>[]) => {
  try {
    if (!Array.isArray(variations) || variations.length === 0) {
      console.log("No variations to update");
      return [];
    }
    
    console.log(`Updating ${variations.length} variations for product ${productId}`);
    
    const updatePromises = variations.map(variation => {
      if (!variation || typeof variation !== 'object') {
        console.error("Invalid variation data:", variation);
        return Promise.resolve(null);
      }
      
      // Ensure attributes exist and are properly formatted
      if (!variation.attributes || !Array.isArray(variation.attributes) || variation.attributes.length === 0) {
        console.warn("Variation missing attributes, adding empty array:", variation);
        variation.attributes = [];
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
    console.log(`Successfully updated ${responses.filter(Boolean).length} variations`);
    return responses.map(response => response?.data).filter(Boolean);
  } catch (error) {
    console.error(`Error updating variations for product ${productId}:`, error);
    throw error;
  }
};

export const deleteProductVariation = async (productId: number, variationId: number) => {
  try {
    const response = await wcApiClient.delete(`/products/${productId}/variations/${variationId}`);
    console.log(`Deleted variation ${variationId} for product ${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting variation ${variationId} for product ${productId}:`, error);
    throw error;
  }
};

export const uploadProductVariationImage = async (productId: number, variationId: number, file: File) => {
  try {
    console.log(`Uploading image for product ${productId}, variation ${variationId}`);
    
    // First upload the image to the WordPress media library
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('alt', `Variation ${variationId} image`);
    
    // Upload to WooCommerce/WordPress media library
    const mediaResponse = await wcApiClient.post('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    console.log("Media upload response:", mediaResponse.data);
    
    if (mediaResponse.data && mediaResponse.data.id) {
      // Now update the variation with the image ID
      const imageData = {
        image: { id: mediaResponse.data.id }
      };
      
      // Update the variation with the image
      const variationResponse = await wcApiClient.put(
        `/products/${productId}/variations/${variationId}`, 
        imageData
      );
      
      console.log("Variation image update response:", variationResponse.data);
      
      if (variationResponse.data && variationResponse.data.image) {
        return variationResponse.data.image;
      }
    }
    
    // Fallback to return a temporary URL
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
