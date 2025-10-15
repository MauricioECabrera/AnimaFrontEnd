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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
    if (formData.newPassword.length < 6) {
      return { isValid: false, error: "La contraseña debe tener al menos 6 caracteres" };
    }
    if (!formData.confirmPassword) {
      return { isValid: false, error: "La confirmación de contraseña es obligatoria" };
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
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            required
          />
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
            <p className="popup-message">{popup.message}</p>
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