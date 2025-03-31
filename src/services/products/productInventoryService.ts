
import { wcApiClient } from "../apiConfig";
import { Product } from "./types";

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
