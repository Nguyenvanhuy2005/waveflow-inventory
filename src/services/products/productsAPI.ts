
import { wcApiClient } from "../apiConfig";
import { 
  Product, 
  ProductSearchParams,
  ProductVariation 
} from "./types";
import {
  uploadProductImages,
  getProductVariations,
  createProductVariations,
  updateProductVariations
} from "./productImagesService";

// Main product CRUD operations
export const getProducts = async (params?: ProductSearchParams) => {
  try {
    // Check if the search term might be a product ID
    if (params?.search && !isNaN(Number(params.search))) {
      console.log(`Search term looks like an ID: ${params.search}`);
      try {
        // Try to fetch the specific product by ID
        const product = await getProduct(Number(params.search));
        return [product]; // Return as array for consistency
      } catch (error) {
        console.log(`No product found with ID ${params.search}, continuing with regular search`);
        // If no product found by ID, continue with regular search
      }
    }
    
    // Check if search is a SKU - need to modify params for SKU search
    const searchParams = { ...params };
    if (params?.search && params.search.length > 0) {
      if (params.search.toUpperCase().startsWith('SC') || 
          /^[A-Z0-9-_]+$/.test(params.search.toUpperCase())) {
        console.log(`Search term looks like a SKU: ${params.search}`);
        // WooCommerce doesn't have a direct SKU filter in the products endpoint
        // We'll add it as a parameter and handle in a filter below
        searchParams.sku = params.search;
      }
    }

    const defaultParams = { per_page: 20, ...searchParams };
    const response = await wcApiClient.get<Product[]>("/products", { params: defaultParams });
    
    let products = response.data;
    
    // If we're searching for a SKU, filter results client-side
    if (searchParams.sku) {
      products = products.filter(product => 
        product.sku?.toLowerCase().includes(searchParams.sku!.toLowerCase())
      );
      
      console.log(`Filtered to ${products.length} products matching SKU: ${searchParams.sku}`);
    }
    
    console.log(`Fetched ${products.length} products`);
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getProduct = async (id: number) => {
  try {
    console.log(`Fetching product with ID ${id}`);
    const response = await wcApiClient.get<Product>(`/products/${id}`);
    
    // Always check if product has variations regardless of type
    if (response.data.variations && response.data.variations.length > 0) {
      console.log(`Product ${id} has ${response.data.variations.length} variations`);
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

// Re-export these functions from the other modules so they can be used where needed
export { 
  uploadProductImages,
  uploadProductImage,
  getProductVariations,
  createProductVariations,
  updateProductVariations,
  getProductVariation,
  deleteProductVariation,
  uploadProductVariationImage
} from "./productImagesService";
