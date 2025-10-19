import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./principal.css";

export default function AnimaSimplified() {
  const [emotionPopup, setEmotionPopup] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const [analysisVisible, setAnalysisVisible] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const navigate = useNavigate();


  // 🟢 ESTE useEffect maneja tokens de Spotify y JWT
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jwt = params.get("jwt");
    const spotifyToken = params.get("spotify");

    if (jwt && spotifyToken) {
      localStorage.setItem("token", jwt);
      localStorage.setItem("spotifyToken", spotifyToken);
      window.history.replaceState({}, document.title, "/principal");
    }


  }, []);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const openEmotionAnalysis = () => {
    setEmotionPopup(true);
    document.body.style.overflow = 'hidden';
  };

  const closeEmotionModal = () => {
    setEmotionPopup(false);
    document.body.style.overflow = 'auto';
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    resetCameraInterface();
  };

  const startCamera = async () => {
    try {
      console.log("🎥 Iniciando cámara...");
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      setIsCameraActive(true); // ✅ ACTIVAR ESTADO
      
      const videoElement = document.createElement('video');
      videoElement.srcObject = stream;
      videoElement.autoplay = true;
      videoElement.style.width = '100%';
      videoElement.style.borderRadius = '12px';
      
      const preview = document.getElementById('camera-preview');
      if (preview) {
        preview.innerHTML = '';
        preview.appendChild(videoElement);
      }
      
      showNotification('Cámara activada correctamente');
      console.log("✅ Cámara activada");
    } catch (error) {
      console.error("❌ Error al activar cámara:", error);
      showNotification('Error al acceder a la cámara', 'error');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
  console.log("📸 Intentando capturar foto...");
  console.log("Stream activo:", !!cameraStream);
  
  if (!cameraStream) {
    console.error("❌ No hay stream de cámara");
    showNotification('Activa la cámara primero', 'error');
    return;
  }
  
  const video = document.querySelector('#camera-preview video');
  console.log("Video encontrado:", !!video);
  
  if (video) {
    console.log("📷 Capturando imagen del video...");
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    console.log("Canvas creado:", canvas.width, "x", canvas.height);
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    const photoDataUrl = canvas.toDataURL('image/jpeg');
    setCapturedPhoto(photoDataUrl);
    
    // Detener la cámara
    cameraStream.getTracks().forEach(track => track.stop());
    setCameraStream(null);
    setIsCameraActive(false);
    
    // Mostrar la foto capturada
    const preview = document.getElementById('camera-preview');
    if (preview) {
      const img = document.createElement('img');
      img.src = photoDataUrl;
      img.style.width = '100%';
      img.style.borderRadius = '12px';
      preview.innerHTML = '';
      preview.appendChild(img);
    }
    
    showNotification('Foto capturada correctamente');
    console.log("✅ Foto capturada");
  } else {
    console.error("❌ No se encontró el elemento video");
    showNotification('Error al capturar foto', 'error');
  }
};

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setDetectedEmotion(null);
    setAnalysisVisible(false);
    setIsCameraActive(false);
    resetCameraInterface();
    showNotification('Preparando cámara nuevamente...');
  };

const confirmPhoto = async () => {
  if (!capturedPhoto) return;

  showNotification('Analizando emoción con inteligencia artificial... 🧠');

  try {
    const response = await fetch("http://localhost:4000/emociones/analizar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ image: capturedPhoto }),
    });

    const data = await response.json();

    if (!response.ok) {
      showNotification(data.message || "No se pudo analizar la emoción", "error");
      return;
    }

    setDetectedEmotion(data.emotion);
    showAnalysisResults(data.emotion);
  } catch (error) {
    console.error("Error al analizar emoción:", error);
    showNotification("Error al conectar con el servidor", "error");
  }
};


  const uploadPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const photoDataUrl = e.target.result;
          setCapturedPhoto(photoDataUrl);
          
          const img = document.createElement('img');
          img.src = photoDataUrl;
          img.style.width = '100%';
          img.style.borderRadius = '12px';
          
          const preview = document.getElementById('camera-preview');
          if (preview) {
            preview.innerHTML = '';
            preview.appendChild(img);
          }
          
          showNotification('Imagen cargada correctamente');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const showAnalysisResults = (emotion) => {
    setAnalysisVisible(true);
    
    const emotionIcon = document.getElementById('emotion-icon');
    const emotionName = document.getElementById('emotion-name');
    const emotionConfidence = document.getElementById('emotion-confidence');
    
    if (emotionIcon) emotionIcon.textContent = emotion.icon;
    if (emotionName) emotionName.textContent = emotion.name;
    if (emotionConfidence) emotionConfidence.textContent = `Confianza: ${emotion.confidence}%`;
    
    generatePlaylist(emotion.name);
  };

  const generatePlaylist = (emotion) => {
    const playlists = {
      'Felicidad': ['Happy - Pharrell Williams', 'Good as Hell - Lizzo', 'Uptown Funk - Bruno Mars'],
      'Calma': ['Weightless - Marconi Union', 'River - Joni Mitchell', 'Mad World - Gary Jules'],
      'Energía': ['Eye of the Tiger - Survivor', 'Thunder - Imagine Dragons', 'High Hopes - Panic!'],
      'Concentración': ['Clair de Lune - Debussy', 'Gymnopédie No.1 - Satie', 'The Blue Notebooks - Max Richter'],
      'Tristeza': ['Someone Like You - Adele', 'The Scientist - Coldplay', 'Fix You - Coldplay'],
      'Sorpresa': ['Bohemian Rhapsody - Queen', 'Mr. Blue Sky - ELO', 'September - Earth, Wind & Fire']
    };
    
    const songs = playlists[emotion] || ['Música personalizada para ti'];
    const playlistDiv = document.getElementById('playlist-preview');
    
    if (playlistDiv) {
      playlistDiv.innerHTML = songs.map(song => 
        `<div class="song-item">
          <i class="fas fa-music"></i>
          <span>${song}</span>
          <button class="play-song-btn"><i class="fas fa-play"></i></button>
        </div>`
      ).join('');
    }
  };

  const resetCameraInterface = () => {
    const preview = document.getElementById('camera-preview');
    const startBtn = document.getElementById('start-camera');
    const takeBtn = document.getElementById('take-photo');
    
    if (preview) {
      preview.innerHTML = `
        <i class="fas fa-camera camera-icon"></i>
        <p>Activa tu cámara para comenzar</p>
      `;
    }
    if (startBtn) {
      startBtn.style.display = 'inline-flex';
      startBtn.innerHTML = '<i class="fas fa-video"></i> Activar Cámara';
    }
    if (takeBtn) takeBtn.disabled = true;
    
    setCapturedPhoto(null);
    setDetectedEmotion(null);
    setAnalysisVisible(false);
  };

  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <i class="fas fa-info-circle"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 100);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const handleLogout = async () => {
    if (window.confirm("¿Estás seguro que deseas cerrar sesión?")) {
      showNotification("Cerrando sesión...");

      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");

        if (token) {
          await fetch("http://localhost:4000/auth/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("spotifyToken");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("spotifyToken");

        showNotification("Sesión cerrada correctamente ✅");

        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      } catch (err) {
        console.error("Error de conexión:", err);
        showNotification("Error al cerrar sesión ❌");
      }
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-content">
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="logo-icon">
              <span>🎵</span>
            </div>
            <h1 className="logo-text">Ánima</h1>
          </div>

          {/* Menu Items */}
          <nav className="sidebar-nav">
            <button onClick={() => navigate('/perfil')} className="nav-item">
              <i className="fas fa-user"></i>
              <span>Perfil</span>
            </button>
            
            <button onClick={() => navigate('/historial')} className="nav-item">
              <i className="fas fa-history"></i>
              <span>Historial</span>
            </button>

            <button onClick={() => navigate('/configuracion')} className="nav-item">
              <i className="fas fa-cog"></i>
              <span>Configuración</span>
            </button>
          </nav>

          {/* Logout Button */}
          <button onClick={handleLogout} className="logout-button">
            <i className="fas fa-sign-out-alt"></i>
            <span>Salir</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Toggle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mobile-menu-toggle">
        <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      {/* Main Content */}
      <main className="main-content">
        <div className="main-container">
          {/* Main Question Card */}
          <div className="question-card">
            <h2 className="question-title">¿Cómo me siento?</h2>
            
            {/* Camera Button */}
            <button onClick={openEmotionAnalysis} className="camera-button">
              <i className="fas fa-camera"></i>
              <span>Tomar foto</span>
            </button>
          </div>
        </div>
      </main>

      {/* Emotion Analysis Modal */}
      {emotionPopup && (
        <div className="modal-overlay">
          <div className="modal-container">
            {/* Modal Header */}
            <div className="modal-header">
              <h3 className="modal-title">Análisis de Emoción</h3>
              <button onClick={closeEmotionModal} className="close-button">
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="modal-content">
              {/* Camera Section */}
              <div className="camera-section">
                <div id="camera-preview" className="camera-preview">
                  <i className="fas fa-camera camera-icon"></i>
                  <p>Activa tu cámara para comenzar</p>
                </div>

                {/* Camera Controls */}
                <div className="camera-controls">
                  {!capturedPhoto ? (
                    <>
                      <button 
                        onClick={startCamera} 
                        disabled={isCameraActive}
                        className="btn-camera btn-primary"
                      >
                        <i className={`fas ${isCameraActive ? 'fa-check' : 'fa-video'}`}></i>
                        {isCameraActive ? 'Cámara Activa' : 'Activar Cámara'}
                      </button>
                      
                      <button 
                        onClick={capturePhoto} 
                        disabled={!isCameraActive}
                        className="btn-camera btn-success"
                      >
                        <i className="fas fa-camera"></i>
                        Capturar Foto
                      </button>
                      
                      <button onClick={uploadPhoto} className="btn-camera btn-secondary">
                        <i className="fas fa-upload"></i>
                        Subir Imagen
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={retakePhoto} className="btn-camera btn-warning">
                        <i className="fas fa-redo"></i>
                        Tomar otra foto
                      </button>
                      
                      <button onClick={confirmPhoto} className="btn-camera btn-success" disabled={analysisVisible}>
                        <i className="fas fa-check"></i>
                        Confirmar y analizar
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Analysis Results */}
              {analysisVisible && detectedEmotion && (
                <div className="analysis-section">
                  <div className="analysis-grid">
                    {/* Emotion Display */}
                    <div className="emotion-display">
                      <div id="emotion-icon" className="emotion-icon">{detectedEmotion.icon}</div>
                      <h4 id="emotion-name" className="emotion-name">{detectedEmotion.name}</h4>
                      <p id="emotion-confidence" className="emotion-confidence">
                        Confianza: {detectedEmotion.confidence}%
                      </p>
                    </div>

                    {/* Music Recommendations */}
                    <div className="music-section">
                      <h5 className="music-title">Recomendaciones musicales:</h5>
                      <div id="playlist-preview" className="playlist-preview">
                        <div className="loading-music">
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>Generando playlist...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}