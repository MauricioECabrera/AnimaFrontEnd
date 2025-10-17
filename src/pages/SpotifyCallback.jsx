import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SpotifyCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener parámetros de la URL (jwt y spotify)
    const params = new URLSearchParams(window.location.search);
    const jwtToken = params.get("jwt");
    const spotifyToken = params.get("spotify");

    if (jwtToken) {
      localStorage.setItem("token", jwtToken);
    }
    if (spotifyToken) {
      localStorage.setItem("spotifyToken", spotifyToken);
    }

    // 🔁 Redirigir a principal
    navigate("/principal", { replace: true });
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "5rem" }}>
      <h2>Conectando con Spotify...</h2>
      <p>Por favor espera un momento</p>
    </div>
  );
}

