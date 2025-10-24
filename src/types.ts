// src/types.ts
export interface Product {
  uuid: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  is_active: boolean;
  image_small: string;
  image_thumbnail: string;
  image_medium: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
 image_url?: string; // <-- agregamos esta línea
}
