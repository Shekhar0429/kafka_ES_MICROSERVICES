import { CartRepositoryType } from "../types/repository.type";
import * as Repository from "../repository/cart.repository";
import * as Service from "./cart.service";

describe("cartService", () => {
  let repo: CartRepositoryType;
  beforeEach(() => {
    repo = Repository.CartRepository;
  });

  afterEach(() => {
    repo = {} as CartRepositoryType;
  });

  it("should return correct data while creating cart", async () => {
    const input = { customerId: 123, productId: 20000, qty: 10 };

    jest
      .spyOn(repo, "create")
      .mockImplementationOnce(() =>
        Promise.resolve({ message: "Cart created successfully", input })
      );

    const result = await Service.CreateCart(input, repo);
    expect(result).toEqual({
      message: "Cart created successfully",
      input,
    });
  });
});
