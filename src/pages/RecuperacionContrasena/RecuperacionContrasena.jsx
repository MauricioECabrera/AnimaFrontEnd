import { useState } from "react";
import { Link } from "react-router-dom";
import "./RecuperacionContrasena.css";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function RecuperacionContrasena() {
  const [currentStep, setCurrentStep] = useState(1);
  const [popup, setPopup] = useState({
    show: false,
    type: "",
    title: "",
    message: "",
  });

  const [formData, setFormData] = useState({
    email: "",
    verificationCode: "",
    newPassword: "",
    confirmPassword: ""
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

  // 🔒 VALIDACIÓN DE CONTRASEÑA SEGURA (igual que en Register)
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

  const validateStep1 = () => {
    if (!formData.email.trim()) {
      return { isValid: false, error: "El correo electrónico es obligatorio" };
    }
    if (!validateEmail(formData.email)) {
      return { isValid: false, error: "Por favor ingresa un correo electrónico válido" };
    }
    return { isValid: true };
  };

  const validateStep2 = () => {
    if (!formData.verificationCode.trim()) {
      return { isValid: false, error: "El código de verificación es obligatorio" };
    }
    if (formData.verificationCode.length !== 6) {
      return { isValid: false, error: "El código debe tener 6 dígitos" };
    }
    return { isValid: true };
  };

  const validateStep3 = () => {
    if (!formData.newPassword) {
      return { isValid: false, error: "La nueva contraseña es obligatoria" };
    }
    if (!formData.confirmPassword) {
      return { isValid: false, error: "La confirmación de contraseña es obligatoria" };
    }

    // 🔒 VALIDACIÓN DE CONTRASEÑA SEGURA
    const passwordValidation = validatePasswordStrength(formData.newPassword);
    if (passwordValidation.score < 5) {
      const errorMsg = "Contraseña insegura:\n" + passwordValidation.feedback.join("\n");
      return { isValid: false, error: errorMsg };
    }

    if (formData.newPassword !== formData.confirmPassword) {
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
    setFormData({ ...formData, newPassword });
    
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

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    const validation = validateStep1();

    if (!validation.isValid) {
      showPopup("error", "Error de validación", validation.error);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        showPopup("error", "Error al enviar código", data.message || "No se pudo enviar el código. Intenta más tarde.");
        return;
      }

      showPopup("success", "¡Código enviado!", `Se ha enviado un código de verificación a ${formData.email}`);
      setTimeout(() => {
        setCurrentStep(2);
        closePopup();
      }, 2000);
    } catch (err) {
      console.error(err);
      showPopup("error", "Error de conexión", "No se pudo conectar con el servidor.");
    }
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    const validation = validateStep2();

    if (!validation.isValid) {
      showPopup("error", "Error de validación", validation.error);
      return;
    }

    // Pasamos al siguiente paso (el backend validará el código en el reset final)
    showPopup("success", "¡Código ingresado!", "Ahora puedes establecer tu nueva contraseña.");
    setTimeout(() => {
      setCurrentStep(3);
      closePopup();
    }, 1500);
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    const validation = validateStep3();

    if (!validation.isValid) {
      showPopup("error", "Error de validación", validation.error);
      return;
    }

    try {
      // 🔴 TODO: VALIDAR EN EL BACKEND QUE LA NUEVA CONTRASEÑA NO SEA IGUAL A LA ANTERIOR
      // El backend debe:
      // 1. Obtener el hash de la contraseña actual del usuario desde la base de datos
      // 2. Comparar con bcrypt.compare(newPassword, oldPasswordHash)
      // 3. Si son iguales, retornar error: "No puedes usar tu contraseña anterior"
      // 4. Si son diferentes, proceder con el cambio de contraseña
      //
      // Ejemplo de validación en el backend (Node.js/Express):
      // const user = await User.findOne({ email });
      // const isSamePassword = await bcrypt.compare(newPassword, user.password);
      // if (isSamePassword) {
      //   return res.status(400).json({ message: "No puedes usar tu contraseña anterior" });
      // }

      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          code: formData.verificationCode,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showPopup("error", "Error al actualizar", data.message || "El código es incorrecto o ha expirado.");
        return;
      }

      showPopup("success", "¡Contraseña actualizada!", "Tu contraseña ha sido cambiada exitosamente. Serás redirigido al login.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2500);
    } catch (err) {
      console.error(err);
      showPopup("error", "Error de conexión", "No se pudo conectar con el servidor. Intenta nuevamente.");
    }
  };

  // Reenvía el código (opcional)
  const handleResendCode = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        showPopup("error", "Error", data.message || "No se pudo reenviar el código.");
        return;
      }

      showPopup("info", "Código reenviado", `Se ha enviado un nuevo código de verificación a ${formData.email}`);
    } catch (err) {
      console.error(err);
      showPopup("error", "Error de conexión", "No se pudo contactar al servidor.");
    }
  };

  // Regresar un paso
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
        <span className="step-number">1</span>
        <span className="step-label">Correo</span>
      </div>
      <div className={`step-line ${currentStep > 1 ? 'completed' : ''}`}></div>
      <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
        <span className="step-number">2</span>
        <span className="step-label">Código</span>
      </div>
      <div className={`step-line ${currentStep > 2 ? 'completed' : ''}`}></div>
      <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
        <span className="step-number">3</span>
        <span className="step-label">Nueva contraseña</span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <form className="recovery-form" onSubmit={handleStep1Submit}>
      <div className="form-content">
        <h2>Recuperar contraseña</h2>
        <p>Ingresa tu correo electrónico y te enviaremos un código de verificación.</p>
        
        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
      </div>
      
      <button type="submit" className="btn">
        Enviar código
      </button>
    </form>
  );

  const renderStep2 = () => (
    <form className="recovery-form" onSubmit={handleStep2Submit}>
      <div className="form-content">
        <h2>Verificar código</h2>
        <p>Hemos enviado un código de 6 dígitos a <strong>{formData.email}</strong></p>
        
        <div className="form-group">
          <label htmlFor="verificationCode">Código de verificación</label>
          <input
            type="text"
            id="verificationCode"
            placeholder="123456"
            maxLength="6"
            value={formData.verificationCode}
            onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value.replace(/\D/g, '') })}
            required
            className="code-input"
          />
        </div>
        
        <div className="resend-container">
          <span>¿No recibiste el código? </span>
          <button type="button" className="resend-btn" onClick={handleResendCode}>
            Reenviar código
          </button>
        </div>
      </div>
      
      <button type="submit" className="btn">
        Verificar código
      </button>
    </form>
  );

  const renderStep3 = () => (
    <form className="recovery-form" onSubmit={handleStep3Submit}>
      <div className="form-content">
        <h2>Nueva contraseña</h2>
        <p>Establece una nueva contraseña segura para tu cuenta.</p>
        
        <div className="form-group">
          <label htmlFor="newPassword">Nueva contraseña</label>
          <input
            type="password"
            id="newPassword"
            placeholder="********"
            value={formData.newPassword}
            onChange={handlePasswordChange}
            required
          />
          
          {/* Indicador de fortaleza de contraseña */}
          {formData.newPassword && (
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
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="********"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
        </div>
      </div>
      
      <button type="submit" className="btn">
        Cambiar contraseña
      </button>
    </form>
  );

  return (
    <>
      {/* Popup */}
      {popup.show && (
        <div className="popup-overlay show" onClick={closePopup}>
          <div className={`popup popup-${popup.type}`} onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <span className="popup-icon">
                {popup.type === "error" ? "⚠️" : popup.type === "success" ? "✅" : "ℹ️"}
              </span>
              <h3 className="popup-title">{popup.title}</h3>
            </div>
            <p className="popup-message" style={{ whiteSpace: 'pre-line' }}>{popup.message}</p>
            <button className="popup-btn" onClick={closePopup}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="recovery-container">
        <div className="logo">
          <img src="/Assets/logo-anima.png" alt="Logo" />
        </div>

        {renderStepIndicator()}

        <div className="recovery-card">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        <div className="recovery-actions">
          {currentStep > 1 && (
            <button className="back-btn" onClick={handleBack}>
              ← Volver
            </button>
          )}
          
          <Link to="/login" className="login-link">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </>
  );
}