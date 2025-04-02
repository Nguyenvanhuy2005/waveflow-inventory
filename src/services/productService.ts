
// Re-export from the new modular structure
export * from "./products";

// Re-export specific types for backward compatibility
export type { ProductSearchParams } from "./products/types";
export type { Product } from "./products/types";
