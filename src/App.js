// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Páginas
import Bienvenida from "./pages/Bienvenida/index";
import Login from "./pages/Login/login";
import Register from "./pages/Register/register";
import Principal from "./pages/Principal/principal";
import RecuperacionContrasena from "./pages/RecuperacionContrasena/RecuperacionContrasena";

// Componente de protección de rutas
function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      setIsAuth(false);
      return;
    }

    // Verificar token con el backend
    fetch("http://localhost:4000/auth/verify-token", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) setIsAuth(true);
        else setIsAuth(false);
      })
      .catch(() => setIsAuth(false));
  }, []);

  if (isAuth === null) {
    // Puedes poner aquí un spinner o loader si quieres
    return null;
  }

  return isAuth ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección al inicio */}
        <Route path="/" element={<Navigate to="/index" replace />} />

        {/* Públicas */}
        <Route path="/index" element={<Bienvenida />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recuperar-contrasena" element={<RecuperacionContrasena />} />

        {/* Protegidas */}
        <Route
          path="/principal"
          element={
            <ProtectedRoute>
              <Principal />
            </ProtectedRoute>
          }
        />

        {/* Página por defecto */}
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
