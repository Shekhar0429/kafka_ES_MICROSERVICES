import { CreateProductRequest } from "./product.dto";

export type CatalogProduct = {
  id: number;
} & Partial<CreateProductRequest>;
