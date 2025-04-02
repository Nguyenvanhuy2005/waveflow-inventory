
// Re-export everything from all the modules
export * from "./types";
export * from "./productsAPI";
export * from "./productImagesService";
export * from "./productAttributesService";
export * from "./productInventoryService";

// Add specific utility functions for order creation
export const getProductWithVariations = async (productId: number, searchTerm?: string) => {
  const { getProduct, getProductVariations } = await import('./productsAPI');
  
  try {
    // Get the main product
    const product = await getProduct(productId);
    
    // If it's a variable product, load all variations
    if (product.type === 'variable' && product.variations && product.variations.length > 0) {
      console.log(`Loading variations for product ${productId}`);
      const variations = await getProductVariations(productId);
      
      // Filter variations based on search term if provided
      let filteredVariations = variations;
      if (searchTerm && searchTerm.length > 0) {
        console.log(`Filtering variations by search term: ${searchTerm}`);
        filteredVariations = variations.filter(variation => {
          // Search in variation attributes
          const attributeMatch = variation.attributes.some(attr => 
            attr.option.toLowerCase().includes(searchTerm.toLowerCase())
          );
          
          // Search in SKU
          const skuMatch = variation.sku?.toLowerCase().includes(searchTerm.toLowerCase());
          
          return attributeMatch || skuMatch;
        });
        console.log(`Found ${filteredVariations.length} matching variations`);
      }
      
      // Return product with variations using a consistent property name
      return { 
        ...product, 
        variationsDetails: filteredVariations 
      };
    }
    
    return product;
  } catch (error) {
    console.error(`Error fetching product ${productId} with variations:`, error);
    throw error;
  }
};
