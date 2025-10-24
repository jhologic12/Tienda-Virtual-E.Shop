import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "../styles/CartPage.css";
import { CartItem } from "../types";

const BACKEND_URL = "http://localhost:8000"; // <-- host del backend

const CartPage: React.FC = () => {
  const { cart, total, updateCartItem, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (product_id: string, quantity: number) => {
    if (quantity < 1) return;
    updateCartItem(product_id, quantity);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate("/checkout");
  };

  if (cart.length === 0)
    return (
      <div className="cart-container">
        <h2>Tu carrito está vacío 😔</h2>
      </div>
    );

  return (
    <div className="cart-container">
      <h2>Mi Carrito</h2>
      <div className="cart-grid">
        {cart.map((item: CartItem) => (
          <div key={item.product_id} className="cart-card">
            <img
              src={item.image_url ? `${BACKEND_URL}${item.image_url}` : "/placeholder.png"}
              alt={item.name}
              className="cart-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.png";
              }}
            />
            <div className="cart-details">
              <h3>{item.name}</h3>
              <p>Precio: ${item.price.toLocaleString()}</p>
              <p>Subtotal: ${item.subtotal.toLocaleString()}</p>
              <div className="quantity-control">
                <button
                  onClick={() =>
                    handleQuantityChange(item.product_id, item.quantity - 1)
                  }
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    handleQuantityChange(item.product_id, item.quantity + 1)
                  }
                >
                  +
                </button>
              </div>
            </div>
            <div className="cart-actions">
              <button
                className="remove-btn"
                onClick={() => removeFromCart(item.product_id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-footer">
        <h3>Total: ${total.toLocaleString()}</h3>
        <div className="footer-buttons">
          <button className="clear-cart-btn" onClick={clearCart}>
            Vaciar carrito
          </button>
          <button
            className="checkout-btn"
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            Pagar ahora
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
