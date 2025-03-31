
import { wcApiClient } from "../apiConfig";
import { ProductVariation } from "./types";

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
