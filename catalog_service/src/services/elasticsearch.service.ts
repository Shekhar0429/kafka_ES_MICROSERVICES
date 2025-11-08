import { CatalogProduct } from "../dto/payload.dto";
import { EventPayload } from "../utils/ElasticSearchListener";
import { Client } from "@elastic/elasticsearch";

export class ElasticSearchService {
  private indexName = "product";
  private client: Client;

  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
    });
    this.createIndex();
  }

  async handleEvents({ event, data }: EventPayload) {
    console.log("ElasticSearchService:handleEvents", event, data);
    switch (event) {
      case "createProduct":
        await this.createProduct(data as CatalogProduct);
        return;

      case "updateProduct":
        await this.updateProduct(data as CatalogProduct);
        return;

      case "deleteProduct":
        const { id } = data as CatalogProduct;
        await this.deleteProduct(id.toString());
        return;
    }
  }

  async createIndex() {
    const indexExists = await this.client.indices.exists({
      index: this.indexName,
    });
    if (!indexExists) {
      await this.client.indices.create({
        index: this.indexName,
        body: {
          mappings: {
            properties: {
              id: { type: "keyword" },
              title: { type: "text" },
              description: { type: "text" },
              price: { type: "float" },
              stock: { type: "integer" },
            },
          },
        },
      });
    }
  }

  async getProduct(id: string) {
    const result = await this.client.get({
      index: this.indexName,
      id,
    });
    return result._source;
  }

  async createProduct(data: CatalogProduct) {
    await this.client.index({
      index: this.indexName,
      id: data.id.toString(),
      document: data,
    });
  }

  async updateProduct(data: CatalogProduct) {
    await this.client.update({
      index: this.indexName,
      id: data.id.toString(),
      doc: data,
    });
  }

  async deleteProduct(id: string) {
    await this.client.delete({
      index: this.indexName,
      id,
    });
  }

  async searchProduct(queryString: string) {
    console.log("search query in elastic search service :: ", queryString);
    const result = await this.client.search({
      index: this.indexName,
      query:
        queryString.length === 0
          ? {
              match_all: {}, // returns all items in queryString is empty
            }
          : {
              multi_match: {
                query: queryString,
                fields: ["name", "description"],
                fuzziness: "AUTO", // gives typo matches eg : phome
              },
            },
    });
    console.log("results in elastic search service ", result);
    return result.hits.hits.map((hit) => hit._source);
  }
}
