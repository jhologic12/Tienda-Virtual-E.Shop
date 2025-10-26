// src/pages/Home.tsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useCart } from "../context/CartContext";
import { Product } from "../types";
import { backendImage } from "../utils/image";
import "./Home.css";

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<Product[]>("/products/");
        setProducts(response.data);
      } catch (err: any) {
        console.error("Error obteniendo productos:", err.response?.status, err.response?.data);
        setError("No se pudieron cargar los productos.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (id: string) => {
    try {
      await addToCart({ product_id: id, quantity: 1 });
      alert("Producto agregado al carrito");
    } catch {
      alert("No se pudo agregar el producto al carrito");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>{error}</p>;
  if (products.length === 0) return <p>No hay productos disponibles.</p>;

  return (
    <div className="home-container">
      <h1>Productos</h1>

      {/* Input de búsqueda */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <p>No se encontraron productos con ese nombre.</p>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="image-container">
                <img
                  src={backendImage(product.image_thumbnail)}
                  alt={product.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.png";
                  }}
                />
                {product.stock <= 5 && <span className="badge-stock">¡Pocas unidades!</span>}
              </div>
              <div className="card-content">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p>Precio: ${product.price.toLocaleString()}</p>
                <p>Stock: {product.stock}</p>
                <button className="add-cart-btn" onClick={() => handleAddToCart(product.id)}>
                  Agregar al carrito
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
