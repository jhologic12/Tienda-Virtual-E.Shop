// src/context/AuthContext.tsx
import React, { createContext, useState, ReactNode, useContext, useEffect } from "react";
import axios from "axios";
const BACKEND_URL = import.meta.env.VITE_API_URL;

interface DecodedUser {
  sub: string;
  email: string;
  full_name?: string;
  exp: number;
  [key: string]: any;
}

interface LoginResponse {
  access_token: string;
}

interface AuthContextType {
  token: string | null;
  user: DecodedUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ Función nativa para decodificar el JWT
function decodeJWT(token: string): DecodedUser | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<DecodedUser | null>(null);

  // ✅ Al cargar la app, recuperar token
  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    if (savedToken) {
      setToken(savedToken);
      const decodedUser = decodeJWT(savedToken);
      if (decodedUser) {
        setUser(decodedUser);
      } else {
        logout();
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post<LoginResponse>(
        `${BACKEND_URL}/auth/login`,
        { email, password }
      );

      const receivedToken = response.data.access_token;
      setToken(receivedToken);
      localStorage.setItem("authToken", receivedToken);

      const decodedUser = decodeJWT(receivedToken);
      if (decodedUser) {
        setUser(decodedUser);
      }
    } catch {
      throw new Error("Error al iniciar sesión");
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  return context;
};
