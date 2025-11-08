import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class CreateProductRequest {
  @IsString()
  @IsNotEmpty()
  name: string = "";

  @IsString()
  description: string = "";

  @IsNumber()
  @Min(1)
  price: number = 0;

  @IsNumber()
  stock: number = 0;
}

export class updateProductRequest {
  name?: string = "";

  description?: string = "";

  price?: number = 0;

  @IsNumber()
  stock?: number = 0;
}
