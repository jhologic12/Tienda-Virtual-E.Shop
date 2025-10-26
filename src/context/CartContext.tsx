// src/context/CartContext.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";
import { useAuth } from "./AuthContext";

// -----------------------------
// Tipos
// -----------------------------
export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image_url?: string;
}

// Actualizamos este tipo para que reciba product_id directamente
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

// -----------------------------
// Contexto
// -----------------------------
const CartContext = createContext<CartContextType | undefined>(undefined);

// -----------------------------
// Provider
// -----------------------------
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

  const fetchCart = async () => {
    if (!token) throw new Error("Usuario no autenticado");
    try {
      const response = await api.get<CartItem[]>("/cart/list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart(
        response.data.map(item => ({
          ...item,
          image_url: item.image_url || `/static/products/${item.product_id}_small.webp`
        }))
      );

      const totalResponse = await api.get<{ total: number }>("/cart/total", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTotal(totalResponse.data.total);
    } catch (error: any) {
      if (error.response?.status === 401) handleUnauthorized();
      else console.error("Error obteniendo carrito:", error.response?.data);
    }
  };

  // ✅ AHORA addToCart usa directamente product_id
  const addToCart = async (item: AddToCartPayload) => {
    if (!token) throw new Error("Usuario no autenticado");
    try {
      await api.post(
        "/cart/add",
        item, // 👈 Ya enviamos { product_id, quantity }
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
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
      await api.delete(`/cart/remove/${product_id}`, { headers: { Authorization: `Bearer ${token}` } });
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
