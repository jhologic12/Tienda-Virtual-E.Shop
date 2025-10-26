import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/RegisterPage.css"; // ✅ Importaremos el archivo CSS que vamos a crear

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_API_URL;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post(`${BACKEND_URL}/auth/register`, {
        email,
        full_name: fullName,
        password,
        is_admin: false,
      });

      setErrorMessage("");
      setSuccessMessage("✅ Registro exitoso. Redirigiendo al login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      setSuccessMessage("");
      if (error.response && error.response.data?.detail) {
        const backendDetails = error.response.data.detail;
        const errorMsg = Array.isArray(backendDetails)
          ? backendDetails[0].msg
          : "Error inesperado";
        setErrorMessage(errorMsg);
      } else {
        setErrorMessage("Error de conexión con el servidor");
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Crear cuenta</h2>
        <form onSubmit={handleRegister} className="register-form">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {errorMessage && <p className="error-text">{errorMessage}</p>}
          {successMessage && <p className="success-text">{successMessage}</p>}

          <button type="submit" className="register-btn">Registrarse</button>
        </form>

        <p className="login-link">
          ¿Ya tienes una cuenta? <a href="/login">Inicia sesión</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
