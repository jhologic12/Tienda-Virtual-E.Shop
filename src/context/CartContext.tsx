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
  image_url?: string; // <-- agrega esta línea// URL de la imagen del producto
}

interface CartContextType {
  cart: CartItem[];
  total: number;
  addToCart: (item: { product_uuid: string; quantity: number }) => Promise<void>;
  updateCartItem: (product_uuid: string, quantity: number) => Promise<void>;
  removeFromCart: (product_uuid: string) => Promise<void>;
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

  // Cuando cambia el token, cargamos el carrito o lo limpiamos
  useEffect(() => {
    if (token) fetchCart();
    else {
      setCart([]);
      setTotal(0);
    }
  }, [token]);

  // -----------------------------
  // Función para manejar 401 Unauthorized
  // -----------------------------
  const handleUnauthorized = () => {
    setCart([]);
    setTotal(0);
    logout?.();
  };

  // -----------------------------
  // Obtener carrito y total
  // -----------------------------
  const fetchCart = async () => {
  if (!token) throw new Error("Usuario no autenticado");
  try {
    const response = await api.get<CartItem[]>("/cart/list", {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });

    // Usar image_url del backend o fallback vacío
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

  // -----------------------------
  // Agregar producto al carrito
  // -----------------------------
  const addToCart = async (item: { product_uuid: string; quantity: number }) => {
    if (!token) throw new Error("Usuario no autenticado");
    try {
      await api.post("/cart/add", item, { headers: { Authorization: `Bearer ${token}` } });
      await fetchCart();
    } catch (error: any) {
      if (error.response?.status === 401) handleUnauthorized();
      else console.error("Error agregando al carrito:", error.response?.data);
      throw error;
    }
  };

  // -----------------------------
  // Actualizar cantidad de un producto
  // -----------------------------
  const updateCartItem = async (product_uuid: string, quantity: number) => {
    if (!token) throw new Error("Usuario no autenticado");
    try {
      await api.put(`/cart/update/${product_uuid}`, null, {
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

  // -----------------------------
  // Eliminar producto del carrito
  // -----------------------------
  const removeFromCart = async (product_uuid: string) => {
    if (!token) throw new Error("Usuario no autenticado");
    try {
      await api.delete(`/cart/remove/${product_uuid}`, { headers: { Authorization: `Bearer ${token}` } });
      await fetchCart();
    } catch (error: any) {
      if (error.response?.status === 401) handleUnauthorized();
      else console.error("Error eliminando producto:", error.response?.data);
      throw error;
    }
  };

  // -----------------------------
  // Limpiar carrito completo
  // -----------------------------
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

// -----------------------------
// Hook para usar CartContext
// -----------------------------
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
};
