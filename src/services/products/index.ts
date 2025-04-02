
// Re-export everything from all the modules
export * from "./types";
export * from "./productsAPI";
export * from "./productImagesService";
export * from "./productAttributesService";
export * from "./productInventoryService";

// Add specific utility functions for order creation
export const getProductWithVariations = async (productId: number) => {
  const { getProduct, getProductVariations } = await import('./productsAPI');
  
  try {
    // Get the main product
    const product = await getProduct(productId);
    
    // If it's a variable product, load all variations
    if (product.type === 'variable' && product.variations && product.variations.length > 0) {
      const variations = await getProductVariations(productId);
      return { ...product, variationsData: variations };
    }
    
    return product;
  } catch (error) {
    console.error(`Error fetching product ${productId} with variations:`, error);
    throw error;
  }
};
