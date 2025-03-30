
import * as z from "zod";

export const ProductFormSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  regular_price: z.string().optional(),
  sale_price: z.string().optional(),
  description: z.string().optional(),
  short_description: z.string().optional(),
  sku: z.string().optional(),
  manage_stock: z.boolean().default(false),
  stock_quantity: z.number().optional(),
  stock_status: z.string().default("instock"),
  backorders: z.string().default("no"),
  categories: z.array(z.number()).optional(),
  status: z.string().default("publish"),
  featured: z.boolean().default(false),
  sold_individually: z.boolean().default(false),
  weight: z.string().optional(),
  dimensions: z.object({
    length: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
  }).optional(),
  attributes: z.array(z.any()).optional(),
});
