
import { wcApiClient } from "../apiConfig";
import { ProductAttribute, ProductAttributeTerm } from "./types";

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
