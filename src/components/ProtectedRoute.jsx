import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      setIsAuth(false);
      return;
    }

    // Verificamos el token con el backend
      fetch(`${process.env.REACT_APP_API_URL}/auth/verify-token`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })

      .then((res) => {
        if (res.ok) setIsAuth(true);
        else setIsAuth(false);
      })
      .catch(() => setIsAuth(false));
  }, []);

  if (isAuth === null) return null; // puedes mostrar un spinner

  return isAuth ? children : <Navigate to="/login" replace />;
}
