// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';

// Páginas
import Bienvenida from "./pages/Bienvenida/index";
import Login from "./pages/Login/login";
import Register from "./pages/Register/register";
import Principal from "./pages/Principal/principal";
import RecuperacionContrasena from "./pages/RecuperacionContrasena/RecuperacionContrasena";

// Nuevas páginas
import Historial from "./pages/Historial/historial";
import Perfil from "./pages/Perfil/Perfil";
import Configuracion from "./pages/Configuracion/Configuracion";
import Dashboard from "./pages/Dashboard/Dashboard";
import SpotifyCallback from "./pages/SpotifyCallback"; // ✅ IMPORT CORRECTO


// Componente de protección de rutas
function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    // Capturar tokens desde URL por si vienen del callback
    const params = new URLSearchParams(window.location.search);
    const jwtFromUrl = params.get("jwt");
    const spotifyFromUrl = params.get("spotify");

    if (jwtFromUrl) {
      localStorage.setItem("token", jwtFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (spotifyFromUrl) {
      localStorage.setItem("spotifyToken", spotifyFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const jwt = localStorage.getItem("token");
    const spotifyToken = localStorage.getItem("spotifyToken");

    // Si no hay tokens, no autorizado
    if (!jwt && !spotifyToken) {
      setIsAuth(false);
      return;
    }

    // Si hay JWT, verificarlo
    if (jwt) {
      fetch("http://localhost:4000/auth/verify-token", {
        method: "GET",
        headers: { Authorization: `Bearer ${jwt}` },
      })
        .then((res) => {
          if (res.ok) {
            setIsAuth(true);
          } else {
            // Token inválido → limpiar y bloquear
            localStorage.removeItem("token");
            setIsAuth(false);
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          setIsAuth(false);
        });
    } else if (spotifyToken) {
      // Token de Spotify: verificar estructura simple (no vacío)
      if (spotifyToken.length < 30) {
        localStorage.removeItem("spotifyToken");
        setIsAuth(false);
      } else {
        setIsAuth(true);
      }
    }
  }, []);

  if (isAuth === null) {
    return <div style={{ textAlign: "center", marginTop: "2rem" }}>Verificando acceso...</div>;
  }

  return isAuth ? children : <Navigate to="/login" replace />;
}



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección al inicio */}
        <Route path="/" element={<Navigate to="/index" replace />} />

        {/* Rutas públicas */}
        <Route path="/index" element={<Bienvenida />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recuperar-contrasena" element={<RecuperacionContrasena />} />
        <Route path="/auth/spotify/callback" element={<SpotifyCallback />} /> {/* ✅ AGREGADA AQUÍ */}

        {/* Rutas protegidas */}
        <Route
          path="/principal"
          element={
            <ProtectedRoute>
              <Principal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/historial"
          element={
            <ProtectedRoute>
              <Historial />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracion"
          element={
            <ProtectedRoute>
              <Configuracion />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
    </BrowserRouter>
  );
}