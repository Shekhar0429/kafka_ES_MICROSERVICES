import { faker } from "@faker-js/faker";
import { Product } from "../../models/product.model";
import { Factory } from "rosie";

export const ProductFactory = new Factory<Product>()
  .attr("id", faker.number.int({ min: 1, max: 1000 }))
  .attr("name", faker.commerce.productName())
  .attr("description", faker.commerce.productDescription)
  .attr("price", +faker.commerce.price())
  .attr("stock", faker.number.int({ min: 10, max: 100 }));
