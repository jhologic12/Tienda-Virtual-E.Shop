import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import "./Navbar.css";
import Logo from "../../assets/eshop.png"; // <-- Importa tu logo

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { cart } = useCart();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
        <img src={Logo} alt="E-Shop" className="logo-image" />
        </Link>
      </div>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/carrito">Carrito</Link>
      </div>

      <div className="navbar-cart">
        {isAuthenticated && (
          <>
            <button className="navbar-logout" onClick={logout}>
              Logout
            </button>
            <Link to="/carrito" className="ml-4 relative">
              🛒
              {cartCount > 0 && (
                <span className="navbar-cart-count">{cartCount}</span>
              )}
            </Link>
          </>
        )}

        {!isAuthenticated && <Link to="/login">Login</Link>}
      </div>
    </nav>
  );
};

export default Navbar;
