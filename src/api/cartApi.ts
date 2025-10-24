// src/api/cartApi.ts
import api from "./api";

export type CartItem = {
  product_uuid: string;
  name: string;
  price: number;
  quantity: number;
};

// Agregar un producto
export const addToCart = async (item: { product_uuid: string; quantity: number }) => {
  return api.post("/cart/add", item);
};

// Eliminar producto
export const removeFromCart = async (product_uuid: string) => {
  return api.delete(`/cart/remove/${product_uuid}`);
};

// Vaciar carrito
export const clearCart = async () => {
  return api.post("/cart/clear");
};

// Listar carrito
export const getCart = async () => {
  return api.get<CartItem[]>("/cart/list");
};

// Total del carrito
export const getCartTotal = async () => {
  return api.get<{ total: number }>("/cart/total");
};
