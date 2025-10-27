import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CheckoutPage.css";
import { useCart } from "../context/CartContext"; // <-- asegúrate de importar
const BACKEND_URL =
  import.meta.env.MODE === "development"
    ? "" // local: usar proxy
    : import.meta.env.VITE_API_URL; // producción

interface CardData {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [cardData, setCardData] = useState<CardData>({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardData({ ...cardData, [e.target.name]: e.target.value });
  };

  const handleConfirmPurchase = async () => {
    setLoading(true);
    setError("");

    try {
      // Obtén el token JWT desde localStorage (o donde lo guardes al hacer login)
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Usuario no autenticado");
        setLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/checkout/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ envío del JWT
        },
        body: JSON.stringify({
          card_number: cardData.number,
          holder_name: cardData.name,
          expiration_date: cardData.expiry,
          cvv: cardData.cvv,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || "Error procesando el pago");
      }

      const data = await response.json();
      // 🔹 Aquí vacías el carrito en el frontend
      clearCart();
      navigate("/confirmation", { state: data });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error procesando el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <h2>Pago</h2>
      <div className="payment-form">
        <h3>Datos de la tarjeta</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleConfirmPurchase();
          }}
        >
          <input
            type="text"
            name="number"
            placeholder="Número de tarjeta"
            value={cardData.number}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="name"
            placeholder="Nombre del titular"
            value={cardData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="expiry"
            placeholder="MM/AA"
            value={cardData.expiry}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="cvv"
            placeholder="CVV"
            value={cardData.cvv}
            onChange={handleInputChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Procesando..." : "Confirmar pago"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default CheckoutPage;
