import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SpotifyPlayer from "../../components/SpotifyPlayer"; 
import "./principal.css";

export default function AnimaSimplified() {
  const [emotionPopup, setEmotionPopup] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const [analysisVisible, setAnalysisVisible] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [recentTracks, setRecentTracks] = useState([]); // ✅ NUEVO
  const [loadingRecent, setLoadingRecent] = useState(true); // ✅ NUEVO
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  // Manejo de tokens
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jwt = params.get("jwt");
    const spotify = params.get("spotify");

    if (jwt && spotify) {
      localStorage.setItem("token", jwt);
      localStorage.setItem("spotifyToken", spotify);
      window.history.replaceState({}, document.title, "/principal");
    }

    const savedSpotifyToken = localStorage.getItem("spotifyToken");
    if (savedSpotifyToken) {
      setSpotifyToken(savedSpotifyToken);
      console.log("✅ Token de Spotify cargado");
    }
  }, []);

  // ✅ NUEVO: Cargar historial al montar el componente
  useEffect(() => {
    loadRecentTracks();
  }, []);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // ✅ NUEVA FUNCIÓN: Cargar canciones recientes del historial
  const loadRecentTracks = async () => {
    try {
      setLoadingRecent(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('⚠️ No hay token de autenticación');
        setLoadingRecent(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/playback/recent?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar historial');
      }

      const data = await response.json();

      if (data.success && data.tracks && data.tracks.length > 0) {
        console.log('✅ Historial cargado:', data.tracks.length, 'canciones');
        setRecentTracks(data.tracks);
      } else {
        console.log('ℹ️ No hay historial de reproducción');
        setRecentTracks([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar historial:', error);
      setRecentTracks([]);
    } finally {
      setLoadingRecent(false);
    }
  };

  // ✅ NUEVA FUNCIÓN: Guardar canción en el historial
  const saveToHistory = async (track) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('⚠️ No se puede guardar en historial: sin token');
        return;
      }

      const response = await fetch(`${API_URL}/api/playback/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          trackUri: track.uri,
          trackName: track.name,
          artist: track.artist,
          album: track.album,
          albumImage: track.albumImage,
          externalUrl: track.externalUrl
        })
      });

      if (response.ok) {
        console.log('✅ Canción guardada en historial:', track.name);
        // Recargar el historial
        loadRecentTracks();
      }
    } catch (error) {
      console.error('❌ Error al guardar en historial:', error);
    }
  };

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
      setIsCameraActive(true);
      
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
    
    if (!cameraStream) {
      console.error("❌ No hay stream de cámara");
      showNotification('Activa la cámara primero', 'error');
      return;
    }
    
    const video = document.querySelector('#camera-preview video');
    
    if (video) {
      console.log("📷 Capturando imagen del video...");
      
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const photoDataUrl = canvas.toDataURL('image/jpeg');
      setCapturedPhoto(photoDataUrl);
      
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setIsCameraActive(false);
      
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
      const spotifyToken = localStorage.getItem('spotifyToken');
      
      const response = await fetch(`${API_URL}/emociones/analizar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "x-spotify-token": spotifyToken || ""
        },
        body: JSON.stringify({ image: capturedPhoto }),
      });

      const data = await response.json();

      if (!response.ok) {
        showNotification(data.message || "No se pudo analizar la emoción", "error");
        return;
      }

      console.log("📊 Respuesta del servidor:", data);
      console.log("🎵 Playlist recibida:", data.playlist);
      
      setDetectedEmotion(data.emotion);
      showAnalysisResults(data.emotion, data.playlist);
    } catch (error) {
      console.error("Error al analizar emoción:", error);
      showNotification("Error al conectar con el servidor", "error");
    }
  };

  const uploadPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp';
    input.onchange = function(e) {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          showNotification('Por favor selecciona un archivo de imagen válido', 'error');
          return;
        }

        if (file.size > 10 * 1024 * 1024) {
          showNotification('La imagen es demasiado grande. Máximo 10MB', 'error');
          return;
        }

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
        reader.onerror = function() {
          showNotification('Error al cargar la imagen', 'error');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const showAnalysisResults = (emotion, playlist) => {
    setAnalysisVisible(true);
    
    const emotionIcon = document.getElementById('emotion-icon');
    const emotionName = document.getElementById('emotion-name');
    const emotionConfidence = document.getElementById('emotion-confidence');
    
    if (emotionIcon) emotionIcon.textContent = emotion.icon;
    if (emotionName) emotionName.textContent = emotion.name;
    if (emotionConfidence) emotionConfidence.textContent = `Confianza: ${emotion.confidence}%`;
    
    console.log("🎭 Mostrando resultados - Playlist:", playlist);
    
    if (playlist && Array.isArray(playlist) && playlist.length > 0) {
      console.log("✅ Mostrando", playlist.length, "canciones");
      displaySpotifyPlaylist(playlist);
    } else {
      console.warn("⚠️ No hay playlist para mostrar");
      displayFallbackPlaylist(emotion.name);
    }
  };

  const displaySpotifyPlaylist = (tracks) => {
    console.log("🎵 displaySpotifyPlaylist llamada con", tracks.length, "canciones");
    
    setTimeout(() => {
      const playlistDiv = document.getElementById('playlist-preview');
      
      if (!playlistDiv) {
        console.error("❌ No se encontró el elemento playlist-preview");
        return;
      }
      
      console.log("✅ Elemento playlist-preview encontrado");
      
      playlistDiv.innerHTML = tracks.map((track, index) => 
        `<div class="song-item-new" data-track-uri="${track.uri}">
          <div class="song-left">
            <span class="song-number-new">${index + 1}</span>
            <img src="${track.albumImage || '/Assets/logo-anima.png'}" 
                alt="${track.album}" 
                class="song-album-img">
            <div class="song-info-new">
              <div class="song-name-new">${track.name}</div>
              <div class="song-artist-new">${track.artist}</div>
            </div>
          </div>
          <div class="song-actions">
            <button class="play-track-btn-new" data-track-index="${index}" title="Reproducir">
              <i class="fas fa-play"></i>
            </button>
            <a href="${track.externalUrl}" target="_blank" rel="noopener noreferrer" 
              class="spotify-link-new" title="Abrir en Spotify">
              <i class="fab fa-spotify"></i>
            </a>
          </div>
        </div>`
      ).join('');
      
      console.log("✅ HTML de playlist insertado");
      
      setupPlayButtons(tracks);
      
      showNotification('✅ Playlist generada con ' + tracks.length + ' canciones');
    }, 100);
  };

  const setupPlayButtons = (tracks) => {
    const playButtons = document.querySelectorAll('.play-track-btn-new');
    
    console.log("🎧 Configurando", playButtons.length, "botones de reproducción");
    
    playButtons.forEach((button) => {
      button.addEventListener('click', async function(e) {
        e.stopPropagation();
        const trackIndex = parseInt(this.getAttribute('data-track-index'));
        const track = tracks[trackIndex];
        
        if (!track) {
          console.error("❌ No se encontró el track");
          return;
        }
        
        console.log("▶️ Reproduciendo:", track.name);
        
        const spotifyToken = localStorage.getItem('spotifyToken');
        const deviceId = window.spotifyDeviceId;
        
        if (!spotifyToken) {
          showNotification("⚠️ Inicia sesión con Spotify para reproducir música", "error");
          return;
        }
        
        if (!deviceId) {
          showNotification("⚠️ Esperando conexión con Spotify... Intenta de nuevo en unos segundos", "error");
          return;
        }
        
        try {
          showNotification("🎵 Reproduciendo...");
          
          // Transferir reproducción
          await fetch('https://api.spotify.com/v1/me/player', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${spotifyToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              device_ids: [deviceId],
              play: false
            })
          });
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Reproducir canción
          const playResponse = await fetch(`https://api.spotify.com/v1/me/player/play`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${spotifyToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              device_id: deviceId,
              uris: [track.uri],
              position_ms: 0
            })
          });
          
          if (playResponse.ok || playResponse.status === 204) {
            console.log("✅ Canción reproduciendo");
            showNotification("🎵 Reproduciendo: " + track.name);
            
            // ✅ GUARDAR EN HISTORIAL
            await saveToHistory(track);
          } else if (playResponse.status === 403) {
            const errorData = await playResponse.json();
            if (errorData.error?.reason === 'PREMIUM_REQUIRED') {
              showNotification("⚠️ Se requiere Spotify Premium", "error");
            } else {
              showNotification("⚠️ Error de permisos", "error");
            }
          } else {
            showNotification("❌ Error al reproducir", "error");
          }
          
        } catch (error) {
          console.error("❌ Error:", error);
          showNotification("❌ Error de conexión con Spotify", "error");
        }
      });
    });
  };

  // ✅ NUEVA FUNCIÓN: Reproducir desde el historial
  const playRecentTrack = async (track) => {
    const spotifyToken = localStorage.getItem('spotifyToken');
    const deviceId = window.spotifyDeviceId;
    
    if (!spotifyToken) {
      showNotification("⚠️ Inicia sesión con Spotify", "error");
      return;
    }
    
    if (!deviceId) {
      showNotification("⚠️ Esperando conexión con Spotify...", "error");
      return;
    }
    
    try {
      showNotification("🎵 Reproduciendo...");
      
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${spotifyToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false
        })
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const playResponse = await fetch(`https://api.spotify.com/v1/me/player/play`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${spotifyToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_id: deviceId,
          uris: [track.uri],
          position_ms: 0
        })
      });
      
      if (playResponse.ok || playResponse.status === 204) {
        showNotification("🎵 Reproduciendo: " + track.name);
        
        // Guardar nuevamente en el historial
        await saveToHistory(track);
      }
    } catch (error) {
      console.error("❌ Error al reproducir:", error);
      showNotification("❌ Error al reproducir", "error");
    }
  };

  const displayFallbackPlaylist = (emotion) => {
    setTimeout(() => {
      const playlistDiv = document.getElementById('playlist-preview');
      
      if (playlistDiv) {
        playlistDiv.innerHTML = `
          <div style="text-align: center; padding: 20px; color: #aaa;">
            <i class="fas fa-music" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
            <p>No se pudo generar una playlist de Spotify.</p>
            <p style="font-size: 0.9rem;">Intenta iniciar sesión con Spotify para obtener recomendaciones personalizadas.</p>
          </div>
        `;
      }
    }, 100);
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
          await fetch(`${API_URL}/auth/logout`, {
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
          <div className="sidebar-logo">
            <div className="logo-icon">
              <span>🎵</span>
            </div>
            <h1 className="logo-text">Ánima</h1>
          </div>

          <nav className="sidebar-nav">
            <button onClick={() => navigate('/perfil')} className="nav-item">
              <i className="fas fa-user"></i>
              <span>Perfil</span>
            </button>
            
            <button onClick={() => navigate('/Dashboard')} className="nav-item">
              <i className="fas fa-chart-line"></i>
              <span>Dashboard</span>
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

          <button onClick={handleLogout} className="logout-button">
            <i className="fas fa-sign-out-alt"></i>
            <span>Salir</span>
          </button>
        </div>
      </aside>

      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mobile-menu-toggle">
        <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      {/* Main Content */}
      <main className="main-content">
        <div className="main-container">
          <div className="question-card">
            <h2 className="question-title">¿Cómo me siento?</h2>
            
            <button onClick={openEmotionAnalysis} className="camera-button">
              <i className="fas fa-camera"></i>
              <span>Tomar foto</span>
            </button>
          </div>

          {/* ✅ ACTUALIZADO: Lo último que escuchaste */}
          <div className="recent-activity-card">
            <h3 className="recent-title">
              <i className="fas fa-history"></i>
              Lo último que escuchaste
            </h3>
            <div className="recent-content">
              {loadingRecent ? (
                <div className="loading-recent">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Cargando historial...</p>
                </div>
              ) : recentTracks.length > 0 ? (
                <div className="recent-tracks-list">
                  {recentTracks.map((track, index) => (
                    <div key={index} className="recent-track-item">
                      <div className="recent-track-left">
                        <img 
                          src={track.albumImage || '/Assets/logo-anima.png'} 
                          alt={track.album}
                          className="recent-track-img"
                        />
                        <div className="recent-track-info">
                          <div className="recent-track-name">{track.name}</div>
                          <div className="recent-track-artist">{track.artist}</div>
                        </div>
                      </div>
                      <div className="recent-track-actions">
                        <button 
                          onClick={() => playRecentTrack(track)}
                          className="recent-play-btn"
                          title="Reproducir"
                        >
                          <i className="fas fa-play"></i>
                        </button>
                        <a 
                          href={track.externalUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="recent-spotify-link"
                          title="Abrir en Spotify"
                        >
                          <i className="fab fa-spotify"></i>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <i className="fas fa-music recent-icon"></i>
                  <p className="recent-text">
                    Aún no has escuchado nada. ¡Analiza tu emoción y descubre música perfecta para ti!
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de análisis */}
      {emotionPopup && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">Análisis de Emoción</h3>
              <button onClick={closeEmotionModal} className="close-button">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-content">
              <div className="camera-section">
                <div id="camera-preview" className="camera-preview">
                  <i className="fas fa-camera camera-icon"></i>
                  <p>Activa tu cámara para comenzar</p>
                </div>

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

              {analysisVisible && detectedEmotion && (
                <div className="analysis-section">
                  <div className="emotion-result-centered">
                    <div className="emotion-icon-large" id="emotion-icon">{detectedEmotion.icon}</div>
                    <h3 className="emotion-name-large" id="emotion-name">{detectedEmotion.name}</h3>
                    <p className="emotion-confidence-large" id="emotion-confidence">
                      Confianza: {detectedEmotion.confidence}%
                    </p>
                  </div>

                  <div className="analysis-grid">
                    <div className="music-section">
                      <h5 className="music-title">🎵 Tu Playlist Personalizada:</h5>
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

      {spotifyToken && <SpotifyPlayer spotifyToken={spotifyToken} />}
    </div>
  );
}