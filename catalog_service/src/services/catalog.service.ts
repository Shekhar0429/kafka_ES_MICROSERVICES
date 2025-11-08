import { ICatalogRepository } from "../interface/catalogRepository.interface";
import { CatalogEvent, MessageType } from "../types";
import { OrderWithLineItems } from "../types/message.type";
import { logger } from "../utils";
import { AppEventListener } from "../utils/ElasticSearchListener";
import { ElasticSearchService } from "./elasticsearch.service";

export class CatalogService {
  private _repository: ICatalogRepository;

  constructor(repository: ICatalogRepository) {
    this._repository = repository;
  }

  async createProduct(input: any) {
    try {
      const data = await this._repository.create(input);
      if (!data.id) throw new Error("unable to create product");

      AppEventListener.instance.notify({
        event: "createProduct",
        data,
      });

      return data;
    } catch (error: any) {}
  }

  async updateProduct(input: any) {
    try {
      const data = await this._repository.update(input);
      if (!data.id) throw new Error("unable to update product");

      AppEventListener.instance.notify({
        event: "updateProduct",
        data,
      });

      return data;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async getProducts(limit: number, offset: number, search: string) {
    // const results = this._repository.find(limit, offset);
    const elKService = new ElasticSearchService();
    const results = elKService.searchProduct(search);
    console.log("products from elastic search ", results);
    if (!results) {
      logger.info("product not found :: ");
      throw new Error("unable to get products");
    }
    return results;
  }

  async getProduct(id: number) {
    console.log(id);
    console.log("from catlog service", typeof id);
    const product = this._repository.findOne(id);
    return product;
  }

  async getProductsByIds(productIds: number[]) {
    if (!productIds || !productIds.length)
      throw new Error("productIds is required");
    const products = this._repository.findByIds(productIds);
    return products;
  }

  async deleteProduct(id: number) {
    if (!id) throw new Error("product doesn't deleted");
    const res = this._repository.delete(id);

    AppEventListener.instance.notify({
      event: "deleteProduct",
      data: { id },
    });

    return res;
  }

  async handleBrokerMessage(message: MessageType) {
    const eventType = message.event;
    console.log("<------- Event Type --------->", eventType);
    switch (eventType) {
      case CatalogEvent.CREATE_ORDER:
        this.deductStocksPostCreateOrder(message.data as OrderWithLineItems);
        break;

      case CatalogEvent.CANCEL_ORDER:
        this.retainStocksPostCancelOrder(message.data);
      default:
        break;
    }
  }

  retainStocksPostCancelOrder(orderData: any) {
    const { lineItems } = orderData;
    console.log("--------- order items -------- ", lineItems);
    lineItems.forEach(async (item: any) => {
      console.log("Reverting Stock for product :: ", item.productId, item.qty);
      // perform stock update operation
      const product = await this.getProduct(+item.productId);
      if (!product) {
        console.error("Product Not Found", item.productId);
      } else {
        const updatedProduct = { ...product, stock: product.stock + item.qty };
        await this.updateProduct(updatedProduct);
      }
    });
  }

  deductStocksPostCreateOrder(orderData: OrderWithLineItems) {
    const { orderItems } = orderData;
    orderItems.forEach(async (item) => {
      console.log("Deducting Stock for product :: ", item.productId, item.qty);
      // perform stock update operation
      const product = await this.getProduct(+item.productId);
      console.log("prdocut to add ", product);
      if (!product) {
        console.error("Product Not Found", item.productId);
      } else {
        const updatedProduct = { ...product, stock: product.stock - item.qty };
        await this.updateProduct(updatedProduct);
      }
    });
  }
}
