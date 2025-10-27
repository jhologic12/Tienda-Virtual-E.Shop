// src/pages/CheckoutPage.tsx
import React, { useState } from "react";
import { useCart, CartItem } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "../styles/CheckoutPage.css";

const BACKEND_URL =
  import.meta.env.MODE === "development" ? "" : import.meta.env.VITE_API_URL;

const CheckoutPage: React.FC = () => {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [cardData, setCardData] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirmPurchase = async () => {
    if (!cardData.name || !cardData.number || !cardData.expiry || !cardData.cvv) {
      setError("Por favor completa todos los campos de la tarjeta.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/checkout/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_number: cardData.number,
          holder_name: cardData.name,
          expiration_date: cardData.expiry,
          cvv: cardData.cvv,
        }),
        credentials: "include", // envía la cookie de sesión
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Error procesando el pago");
      }

      const orderData = await response.json();
      clearCart();
      navigate("/confirmation", { state: orderData });
    } catch (err: any) {
      setError(err.message || "Ocurrió un error procesando el pago.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-container">
        <h2>No hay productos en tu carrito 😔</h2>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>

      {/* Resumen del carrito */}
      <div className="cart-summary">
        <h3>Resumen de compra</h3>
        {cart.map((item: CartItem) => (
          <div key={item.product_id} className="cart-item">
            <img
              src={item.image_url || "/placeholder.png"}
              alt={item.name}
              onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.png")}
            />
            <div>
              <p>{item.name}</p>
              <p>Precio: ${item.price.toLocaleString()}</p>
              <p>Cantidad: {item.quantity}</p>
              <p>Subtotal: ${item.subtotal?.toLocaleString()}</p>
            </div>
          </div>
        ))}
        <h3>Total: ${total.toLocaleString()}</h3>
      </div>

      {/* Formulario de tarjeta */}
      <div className="payment-form">
        <h3>Datos de la tarjeta</h3>
        {error && <p className="error">{error}</p>}
        <form>
          <input
            type="text"
            name="name"
            value={cardData.name}
            onChange={handleInputChange}
            placeholder="Nombre en la tarjeta"
          />
          <input
            type="text"
            name="number"
            value={cardData.number}
            onChange={handleInputChange}
            placeholder="Número de tarjeta"
          />
          <div style={{ display: "flex", gap: "1rem" }}>
            <input
              type="text"
              name="expiry"
              value={cardData.expiry}
              onChange={handleInputChange}
              placeholder="MM/AA"
            />
            <input
              type="text"
              name="cvv"
              value={cardData.cvv}
              onChange={handleInputChange}
              placeholder="CVV"
            />
          </div>
          <button type="button" onClick={handleConfirmPurchase} disabled={loading}>
            {loading ? "Procesando..." : "Confirmar compra"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
