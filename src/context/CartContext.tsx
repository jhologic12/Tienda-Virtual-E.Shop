// src/context/CartContext.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";
import { useAuth } from "./AuthContext";

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal?: number;
  image_url?: string;
}

interface AddToCartPayload {
  product_id: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  total: number;
  addToCart: (item: AddToCartPayload) => Promise<void>;
  updateCartItem: (product_id: string, quantity: number) => Promise<void>;
  removeFromCart: (product_id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, logout } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    if (token) fetchCart();
    else {
      setCart([]);
      setTotal(0);
    }
  }, [token]);

  const handleUnauthorized = () => {
    setCart([]);
    setTotal(0);
    logout?.();
  };

  const calculateTotal = (items: CartItem[]) =>
    items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const normalizeImage = (url?: string, product_id?: string) => {
    if (url && url.startsWith("http")) return url;
    return "/placeholder.png";
  };

  const fetchCart = async () => {
    if (!token) throw new Error("Usuario no autenticado");
    try {
      const response = await api.get<CartItem[]>("/cart/list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedItems = response.data.map(item => ({
        ...item,
        subtotal: item.price * item.quantity,
        image_url: normalizeImage(item.image_url, item.product_id),
      }));

      setCart(updatedItems);
      setTotal(calculateTotal(updatedItems));
    } catch (error: any) {
      if (error.response?.status === 401) handleUnauthorized();
      else console.error("Error obteniendo carrito:", error.response?.data);
    }
  };

  const addToCart = async (item: AddToCartPayload) => {
    if (!token) throw new Error("Usuario no autenticado");
    try {
      await api.post(
        "/cart/add",
        { product_id: item.product_id, quantity: item.quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
    } catch (error: any) {
      if (error.response?.status === 401) handleUnauthorized();
      else console.error("Error agregando al carrito:", error.response?.data);
      throw error;
    }
  };

  const updateCartItem = async (product_id: string, quantity: number) => {
    if (!token) throw new Error("Usuario no autenticado");
    try {
      await api.put(`/cart/update/${product_id}`, null, {
        headers: { Authorization: `Bearer ${token}` },
        params: { quantity },
      });
      await fetchCart();
    } catch (error: any) {
      if (error.response?.status === 401) handleUnauthorized();
      else console.error("Error actualizando producto:", error.response?.data);
      throw error;
    }
  };

  const removeFromCart = async (product_id: string) => {
    if (!token) throw new Error("Usuario no autenticado");
    try {
      await api.delete(`/cart/remove/${product_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCart();
    } catch (error: any) {
      if (error.response?.status === 401) handleUnauthorized();
      else console.error("Error eliminando producto:", error.response?.data);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!token) throw new Error("Usuario no autenticado");
    try {
      await api.delete("/cart/clear", { headers: { Authorization: `Bearer ${token}` } });
      setCart([]);
      setTotal(0);
    } catch (error: any) {
      if (error.response?.status === 401) handleUnauthorized();
      else console.error("Error limpiando carrito:", error.response?.data);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, total, addToCart, updateCartItem, removeFromCart, clearCart, fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
};
