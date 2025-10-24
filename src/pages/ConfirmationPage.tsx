// src/pages/ConfirmationPage.tsx
import React from "react";
import { useLocation, Link } from "react-router-dom";
import "../styles/ConfirmationPage.css";

interface PurchasedItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  image_url?: string;
}

interface OrderData {
  message: string;
  total: number;
  items: PurchasedItem[];
}

// Cambia esta URL según tu servidor
const BASE_URL = "http://127.0.0.1:8000";

const ConfirmationPage: React.FC = () => {
  const location = useLocation();
  const orderData = location.state as OrderData | undefined;

  if (!orderData) {
    return (
      <div className="confirmation-container">
        <p className="empty-message">No hay datos de la orden para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <h1 className="confirmation-title">¡Pago Exitoso! ✅</h1>
          <p className="confirmation-message">{orderData.message}</p>
          <p className="confirmation-total">Total pagado: ${orderData.total.toLocaleString()}</p>
        </div>

        <div className="confirmation-items">
          {orderData.items.map((item) => (
            <div key={item.product_id} className="confirmation-item">
              <img
                src={item.image_url ? `${BASE_URL}${item.image_url}` : "/placeholder.png"}
                alt={item.product_name}
                className="confirmation-product-image"
                onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.png")}
              />
              <div className="confirmation-item-details">
                <p className="confirmation-item-name">{item.product_name}</p>
                <p className="confirmation-item-quantity">
                  {item.quantity} x ${item.price.toLocaleString()}
                </p>
              </div>
              <div className="confirmation-item-subtotal">${item.subtotal.toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div className="confirmation-footer">
          <Link to="/" className="back-button">
            Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
