import request from "supertest";
import express from "express";
import { faker } from "@faker-js/faker";
import catalogRoutes, { catalogService } from "../catalog.routes";
import { Product } from "../../models/product.model";
import { ProductFactory } from "../../utils/fixtures";

const app = express();
app.use(express.json());
app.use(catalogRoutes);

const mockRequest = (product?: any): Product => {
  return {
    ...product,
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    stock: faker.number.int({ min: 10, max: 100 }),
    price: +faker.commerce.price(),
  };
};

describe("Catalog Routes", () => {
  describe("Post /products", () => {
    test("should create product successfully", async () => {
      const reqBody = mockRequest();
      const product = ProductFactory.build();
      jest
        .spyOn(catalogService, "createProduct")
        .mockImplementationOnce(() => Promise.resolve(product));
      const response = await request(app)
        .post("/products")
        .send(reqBody)
        .set("Accept", "application/json");
      expect(response.status).toBe(201);
      expect(response.body).toEqual(product);
    });

    test("should respond with validation error 400", async () => {
      const reqBody = mockRequest();
      console.log("reqbody ", reqBody);
      const response = await request(app)
        .post("/products")
        .send({ ...reqBody, name: "" })
        .set("Accept", "application/json");
      expect(response.status).toBe(400);
      expect(response.body).toEqual("name should not be empty");
    });

    test("should respond with validation error 500 and Internal error", async () => {
      const reqBody = mockRequest();
      jest
        .spyOn(catalogService, "createProduct")
        .mockImplementationOnce(() =>
          Promise.reject("unable to create product")
        );
      const response = await request(app)
        .post("/products")
        .send(reqBody)
        .set("Accept", "application/json");
      expect(response.status).toBe(500);
      expect(response.body).toEqual("unable to create product");
    });
  });

  describe("PATCH /products/:id", () => {
    test("should update product successfully", async () => {
      const product = ProductFactory.build();
      const reqBody = {
        name: product.name,
        price: product.price,
        stock: product.stock,
      };
      jest
        .spyOn(catalogService, "updateProduct")
        .mockImplementationOnce(() => Promise.resolve(product));
      const response = await request(app)
        .patch(`/products/${product.id}`)
        .send(reqBody)
        .set("Accept", "application/json");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(product);
    });

    test("should respond with validation error 400", async () => {
      const product = ProductFactory.build();
      const reqBody = {
        name: product.name,
        price: -1,
        stock: product.stock,
      };
      const response = await request(app)
        .patch(`/products/${product.id}`)
        .send({ ...reqBody })
        .set("Accept", "application/json");
      expect(response.status).toBe(400);
      expect(response.body).toEqual("price must not be less than 1");
    });

    test("should respond with validation error 500 and Internal error", async () => {
      const reqBody = mockRequest();
      const product = ProductFactory.build();
      jest
        .spyOn(catalogService, "updateProduct")
        .mockImplementationOnce(() =>
          Promise.reject("unable to update product")
        );
      const response = await request(app)
        .patch(`/products/${product.id}`)
        .send(reqBody)
        .set("Accept", "application/json");
      expect(response.status).toBe(500);
      expect(response.body).toEqual("unable to update product");
    });
  });

  describe("PATCH /products/:id", () => {
    test("should update product successfully", async () => {
      const product = ProductFactory.build();
      const reqBody = {
        name: product.name,
        price: product.price,
        stock: product.stock,
      };
      jest
        .spyOn(catalogService, "updateProduct")
        .mockImplementationOnce(() => Promise.resolve(product));
      const response = await request(app)
        .patch(`/products/${product.id}`)
        .send(reqBody)
        .set("Accept", "application/json");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(product);
    });

    test("should respond with validation error 400", async () => {
      const product = ProductFactory.build();
      const reqBody = {
        name: product.name,
        price: -1,
        stock: product.stock,
      };
      const response = await request(app)
        .patch(`/products/${product.id}`)
        .send({ ...reqBody })
        .set("Accept", "application/json");
      expect(response.status).toBe(400);
      expect(response.body).toEqual("price must not be less than 1");
    });

    test("should respond with validation error 500 and Internal error", async () => {
      const reqBody = mockRequest();
      const product = ProductFactory.build();
      jest
        .spyOn(catalogService, "updateProduct")
        .mockImplementationOnce(() =>
          Promise.reject("unable to update product")
        );
      const response = await request(app)
        .patch(`/products/${product.id}`)
        .send(reqBody)
        .set("Accept", "application/json");
      expect(response.status).toBe(500);
      expect(response.body).toEqual("unable to update product");
    });
  });

  describe("GET /products?limit=0&offset=0", () => {
    test("should return a range of product based on limit & offset", async () => {
      const randomLimit = faker.number.int({ min: 10, max: 50 });
      const products = ProductFactory.buildList(randomLimit);
      jest
        .spyOn(catalogService, "getProducts")
        .mockImplementationOnce(() => Promise.resolve(products));
      const response = await request(app)
        .get(`/products?limit=${randomLimit}&offset=0`)
        // .send(reqBody)   requred when req payload needed to be passed
        .set("Accept", "application/json");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(products);
    });

    test("should respond with validation error 400", async () => {
      const randomLimit = faker.number.int({ min: 10, max: 50 });
      jest
        .spyOn(catalogService, "getProducts")
        .mockImplementationOnce(() =>
          Promise.reject("limit should be greater than 1")
        );

      const response = await request(app)
        .get(`/products?limit=${-1}&offset=0`)
        // .send({ ...reqBody })
        .set("Accept", "application/json");
      expect(response.status).toBe(400);
      expect(response.body).toEqual("limit should be greater than 1");
    });

    test("should respond with validation error 500 and Internal error", async () => {
      const randomLimit = faker.number.int({ min: 10, max: 50 });
      jest
        .spyOn(catalogService, "getProducts")
        .mockImplementationOnce(() => Promise.reject("unable to get products"));
      const response = await request(app)
        .get(`/products?limit=${randomLimit}&offset=0`)
        .set("Accept", "application/json");
      expect(response.status).toBe(500);
      expect(response.body).toEqual("unable to get products");
    });
  });

  describe("GET /products/:id", () => {
    test("should return a product by id", async () => {
      const product = ProductFactory.build();
      jest
        .spyOn(catalogService, "getProduct")
        .mockImplementationOnce(() => Promise.resolve(product));
      const response = await request(app)
        .get(`/products/:${product.id}`)
        // .send(reqBody)   requred when req payload needed to be passed
        .set("Accept", "application/json");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(product);
    });

    test("should respond with validation error 400", async () => {
      jest
        .spyOn(catalogService, "getProduct")
        .mockImplementationOnce(() => Promise.reject("Id not present"));

      const response = await request(app)
        .get(`/products/${null}`)
        // .send({ ...reqBody })
        .set("Accept", "application/json");
      expect(response.status).toBe(400);
      expect(response.body).toEqual("Id not present");
    });

    // test("should respond with validation error 500 and Internal error", async () => {
    //   const randomLimit = faker.number.int({ min: 10, max: 50 });
    //   jest
    //     .spyOn(catalogService, "getProducts")
    //     .mockImplementationOnce(() => Promise.reject("unable to get products"));
    //   const response = await request(app)
    //     .get(`/products?limit=${randomLimit}&offset=0`)
    //     .set("Accept", "application/json");
    //   expect(response.status).toBe(500);
    //   expect(response.body).toEqual("unable to get products");
    // });
  });

  describe("Delete /products/:id", () => {
    test("should delete a product by id", async () => {
      const product = ProductFactory.build();
      jest
        .spyOn(catalogService, "deleteProduct")
        .mockImplementationOnce(() => Promise.resolve({id:product.id}));
      const response = await request(app)
        .delete(`/products/:${product.id}`)
        // .send(reqBody)   requred when req payload needed to be passed
        .set("Accept", "application/json");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({id:product.id});
    });

    test("should respond with validation error 400", async () => {
      jest
        .spyOn(catalogService, "getProduct")
        .mockImplementationOnce(() => Promise.reject("Id not present"));

      const response = await request(app)
        .get(`/products/${null}`)
        // .send({ ...reqBody })
        .set("Accept", "application/json");
      expect(response.status).toBe(400);
      expect(response.body).toEqual("Id not present");
    });

    // test("should respond with validation error 500 and Internal error", async () => {
    //   const randomLimit = faker.number.int({ min: 10, max: 50 });
    //   jest
    //     .spyOn(catalogService, "getProducts")
    //     .mockImplementationOnce(() => Promise.reject("unable to get products"));
    //   const response = await request(app)
    //     .get(`/products?limit=${randomLimit}&offset=0`)
    //     .set("Accept", "application/json");
    //   expect(response.status).toBe(500);
    //   expect(response.body).toEqual("unable to get products");
    // });
  });
});
