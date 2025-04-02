
// Re-export from the new modular structure
export * from "./products";

// Re-export specific types for backward compatibility
export type { ProductSearchParams, Product, ProductVariation } from "./products/types";

// Re-export specific functions for convenience
export { 
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductVariations,
  getProductAttributes,
  getProductAttributeTerms,
  getProductCategories
} from "./products";
