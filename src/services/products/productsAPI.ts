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
    // Default parameters to fetch more products
    const defaultParams = { 
      per_page: 100, // Increased default to show more products
      ...params 
    };

    console.log("Fetching products with params:", defaultParams);
    
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
    
    // Perform the main search
    const response = await wcApiClient.get<Product[]>("/products", { params: defaultParams });
    let products = response.data;
    
    // Client-side filtering for better search functionality
    if (params?.search && params.search.length > 0) {
      const searchTerm = params.search.toLowerCase();
      console.log(`Filtering products by search term: ${searchTerm}`);
      
      products = products.filter(product => {
        // Search in product name
        const nameMatch = product.name?.toLowerCase().includes(searchTerm);
        
        // Search in SKU
        const skuMatch = product.sku?.toLowerCase().includes(searchTerm);
        
        // Search in product description
        const descriptionMatch = product.description?.toLowerCase().includes(searchTerm);
        
        // Search in short description
        const shortDescriptionMatch = product.short_description?.toLowerCase().includes(searchTerm);
        
        return nameMatch || skuMatch || descriptionMatch || shortDescriptionMatch;
      });
      
      console.log(`Filtered to ${products.length} products matching search term: ${params.search}`);
    }
    
    // Load variations for products that have them to calculate proper stock
    const productsWithVariations = await Promise.all(
      products.map(async (product) => {
        if (product.variations && product.variations.length > 0) {
          try {
            const variationsDetails = await getProductVariations(product.id);
            return { ...product, variationsDetails };
          } catch (error) {
            console.error(`Error loading variations for product ${product.id}:`, error);
            return product;
          }
        }
        return product;
      })
    );
    
    console.log(`Fetched ${productsWithVariations.length} products with variation details`);
    return productsWithVariations;
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
