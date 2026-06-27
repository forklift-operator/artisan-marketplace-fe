// models.ts

export interface UserResponseDto {
  id: number;
  username: string;
  email: string;
}

export interface ProductResponseDto {
  id: number;
  name: string;
  description: string;
  price: number;
  artisanId: number;
}

export interface ReviewResponseDto {
  id: number;
  productId: number;
  stars: number;
  text: string;
  userId: number;
}

export interface OrderItemResponseDto {
  id: number;
  productId: number;
  quantity: number;
  price: number;
}

export interface OrderResponseDto {
  id: number;
  userId: number;
  items: OrderItemResponseDto[];
  totalPrice: number;
  status: string;
}
