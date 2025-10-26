// src/pages/CheckoutPage.tsx
import React, { useState } from "react";
import { useCart, CartItem } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate , Link } from "react-router-dom";
import api from "../api/api";
import "../styles/CheckoutPage.css";
const BACKEND_URL = import.meta.env.VITE_API_URL;
interface CardData {
  card_number: string;
  holder_name: string;
  expiration_date: string;
  cvv: string;
}

// Cambia esta URL según tu servidor
const BASE_URL = BACKEND_URL;

const CheckoutPage: React.FC = () => {
  const { cart, clearCart, total } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [cardData, setCardData] = useState<CardData>({
    card_number: "",
    holder_name: "",
    expiration_date: "",
    cvv: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardData({ ...cardData, [e.target.name]: e.target.value });
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert("Debes iniciar sesión para pagar");
    if (cart.length === 0) return alert("El carrito está vacío");

    setLoading(true);
    try {
      const response = await api.post("/checkout/payment", cardData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orderData = response.data;

      await clearCart();

      navigate("/confirmation", { state: orderData });
    } catch (err: any) {
      alert(`Error procesando pago: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-container">
        <p className="empty-message">Tu carrito está vacío.</p>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>

       {/* Botón regresar al carrito */}
      <div className="back-to-cart">
        <Link
          to="/carrito"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition"
        >
          ← Volver al carrito
        </Link>
      </div>

      {/* Resumen de Compra */}
      <div className="cart-summary">
        <h3>Resumen de Compra</h3>
        {cart.map((item: CartItem) => (
          <div key={item.product_id} className="cart-item">
            <img
              src={item.image_url ? `${BASE_URL}${item.image_url}` : "/placeholder.png"}
              alt={item.name}
              className="product-image"
              onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.png")}
            />
            <div className="cart-item-details">
              <p className="cart-item-name">{item.name}</p>
              <p className="cart-item-quantity">
                {item.quantity} x ${item.price.toLocaleString()}
              </p>
            </div>
            <div className="cart-item-subtotal">${item.subtotal.toLocaleString()}</div>
          </div>
        ))}
        <div className="cart-total">Total: ${total.toLocaleString()}</div>
      </div>

      {/* Formulario de Tarjeta */}
      <div className="payment-form">
        <h3>Datos de la tarjeta</h3>
        <form onSubmit={handlePay}>
          <input
            type="text"
            name="card_number"
            placeholder="Número de tarjeta"
            value={cardData.card_number}
            onChange={handleInputChange}
            required
            className="input-field"
          />
          <input
            type="text"
            name="holder_name"
            placeholder="Nombre en la tarjeta"
            value={cardData.holder_name}
            onChange={handleInputChange}
            required
            className="input-field"
          />
          <div className="input-row">
            <input
              type="text"
              name="expiration_date"
              placeholder="MM/AA"
              value={cardData.expiration_date}
              onChange={handleInputChange}
              required
              className="input-field"
            />
            <input
              type="text"
              name="cvv"
              placeholder="CVV"
              value={cardData.cvv}
              onChange={handleInputChange}
              required
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="pay-button"
          >
            {loading ? "Procesando..." : `Pagar $${total.toLocaleString()}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
