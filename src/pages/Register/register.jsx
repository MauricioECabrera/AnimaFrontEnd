import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./register.css";

export default function Register() {
  const navigate = useNavigate();

  const [popup, setPopup] = useState({
    show: false,
    type: "",
    title: "",
    message: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
  });

  // Lista de contraseñas comunes que NO se permiten
  const commonPasswords = [
    "123456", "password", "123456789", "12345678", "12345", "1234567",
    "password1", "123123", "1234567890", "qwerty", "abc123", "111111",
    "letmein", "welcome", "monkey", "dragon", "master", "sunshine",
    "princess", "password123", "qwerty123", "admin", "root", "user"
  ];

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 🔒 VALIDACIÓN DE CONTRASEÑA SEGURA
  const validatePasswordStrength = (password) => {
    const feedback = [];
    let score = 0;

    // 1. Verificar longitud mínima
    if (password.length < 8) {
      feedback.push("Debe tener al menos 8 caracteres");
    } else {
      score += 1;
    }

    // 2. Verificar letra mayúscula
    if (!/[A-Z]/.test(password)) {
      feedback.push("Debe contener al menos una letra mayúscula");
    } else {
      score += 1;
    }

    // 3. Verificar letra minúscula
    if (!/[a-z]/.test(password)) {
      feedback.push("Debe contener al menos una letra minúscula");
    } else {
      score += 1;
    }

    // 4. Verificar número
    if (!/[0-9]/.test(password)) {
      feedback.push("Debe contener al menos un número");
    } else {
      score += 1;
    }

    // 5. Verificar carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      feedback.push("Debe contener al menos un carácter especial (!@#$%^&*)");
    } else {
      score += 1;
    }

    // 6. Verificar que no sea una contraseña común
    const lowerPassword = password.toLowerCase();
    if (commonPasswords.includes(lowerPassword)) {
      feedback.push("Esta contraseña es muy común. Elige una más segura");
      score = 0; // Contraseña común = score 0
    }

    // 7. Verificar patrones secuenciales
    if (/(.)\1{2,}/.test(password)) {
      feedback.push("Evita repetir el mismo carácter consecutivamente");
      score = Math.max(0, score - 1);
    }

    return { score, feedback };
  };

  const validateForm = ({ name, email, password, confirmPassword }) => {
    if (!name.trim()) {
      return { isValid: false, error: "El nombre completo es obligatorio" };
    }
    if (!email.trim()) {
      return { isValid: false, error: "El correo electrónico es obligatorio" };
    }
    if (!password) {
      return { isValid: false, error: "La contraseña es obligatoria" };
    }
    if (!confirmPassword) {
      return { isValid: false, error: "Debes confirmar tu contraseña" };
    }
    if (!validateEmail(email)) {
      return { isValid: false, error: "Por favor ingresa un correo electrónico válido" };
    }

    // 🔒 VALIDACIÓN DE CONTRASEÑA SEGURA
    const passwordValidation = validatePasswordStrength(password);
    if (passwordValidation.score < 5) {
      const errorMsg = "Contraseña insegura:\n" + passwordValidation.feedback.join("\n");
      return { isValid: false, error: errorMsg };
    }

    if (password !== confirmPassword) {
      return { isValid: false, error: "Las contraseñas no coinciden" };
    }

    return { isValid: true };
  };

  const showPopup = (type, title, message) => {
    setPopup({ show: true, type, title, message });
  };

  const closePopup = () => {
    setPopup({ ...popup, show: false });
  };

  // Actualizar indicador de fortaleza en tiempo real
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    
    if (newPassword) {
      const strength = validatePasswordStrength(newPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  };

  const getPasswordStrengthLabel = (score) => {
    if (score === 0) return "Muy débil";
    if (score <= 2) return "Débil";
    if (score <= 3) return "Aceptable";
    if (score <= 4) return "Buena";
    return "Excelente";
  };

  const getPasswordStrengthColor = (score) => {
    if (score === 0) return "strength-very-weak";
    if (score <= 2) return "strength-weak";
    if (score <= 3) return "strength-fair";
    if (score <= 4) return "strength-good";
    return "strength-excellent";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateForm(formData);

    if (!validation.isValid) {
      showPopup("error", "Error de validación", validation.error);
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showPopup("error", "Error al registrarse", data.message || "No se pudo crear la cuenta");
        return;
      }

      showPopup("success", "¡Registro exitoso!", "Tu cuenta ha sido creada correctamente. Serás redirigido al inicio de sesión.");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      showPopup("error", "Error de conexión", "No se pudo conectar con el servidor. Intenta nuevamente.");
    }
  };

  return (
    <>
      {/* Popup */}
      {popup.show && (
        <div id="popup-overlay" className="popup-overlay show" onClick={closePopup}>
          <div className={`popup popup-${popup.type}`} onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <span id="popup-icon" className="popup-icon">
                {popup.type === "error" ? "⚠️" : "✅"}
              </span>
              <h3 className="popup-title">{popup.title}</h3>
            </div>
            <p className="popup-message" style={{ whiteSpace: 'pre-line' }}>{popup.message}</p>
            <button id="popup-close" className="popup-btn" onClick={closePopup}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Register Container */}
      <div className="login-container">
        <div className="logo">
          <img src="/Assets/logo-anima.png" alt="Logo" />
        </div>

        <h1>Crear Cuenta</h1>
        <p>
          Únete a <strong>Ánima</strong> y comienza ahora
        </p>

        <form id="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre completo</label>
            <input
              type="text"
              id="name"
              placeholder="Tu nombre"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              placeholder="tu@email.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="********"
              required
              value={formData.password}
              onChange={handlePasswordChange}
            />
            
            {/* Indicador de fortaleza de contraseña */}
            {formData.password && (
              <div className="password-strength-container">
                <div className="password-strength-bar">
                  <div 
                    className={`password-strength-fill ${getPasswordStrengthColor(passwordStrength.score)}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  ></div>
                </div>
                <div className="password-strength-label">
                  <span className={getPasswordStrengthColor(passwordStrength.score)}>
                    {getPasswordStrengthLabel(passwordStrength.score)}
                  </span>
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <ul className="password-feedback">
                    {passwordStrength.feedback.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Confirmar contraseña</label>
            <input
              type="password"
              id="confirm-password"
              placeholder="********"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          <button type="submit" className="btn">
            Registrarse
          </button>
        </form>

        <div className="extra-links">
          <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
        </div>

        {/* Botón de regreso al inicio */}
        <div className="back-to-home">
          <Link to="/index" className="btn-secondary">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </>
  );
}