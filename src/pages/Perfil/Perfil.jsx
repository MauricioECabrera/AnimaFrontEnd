import React, { useState, useEffect } from 'react';
import './Perfil.css';

const Perfil = () => {
  // ============================================
  // ESTADO DEL USUARIO - AQUÍ VAN LOS DATOS DEL BACKEND
  // ============================================
  const [usuario, setUsuario] = useState({
    // 🔴 BACKEND: Reemplazar con datos reales del usuario autenticado
    nombre: 'Usuario Demo',
    email: 'usuario@email.com',
    fotoPerfil: null, // URL de la foto o null si no tiene
    fechaRegistro: '2024-09-01T10:00:00',
    
    // 🔴 BACKEND: Datos de conexión con Spotify
    spotifyConectado: false, // true/false si tiene Spotify conectado
    spotifyEmail: null, // Email de Spotify o null
    spotifyNombre: null, // Nombre de usuario de Spotify o null
    spotifyFoto: null, // Foto de perfil de Spotify o null
    
    // 🔴 BACKEND: Estadísticas del usuario
    totalAnalisis: 0, // Total de análisis realizados
    emocionFavorita: 'N/A', // Emoción más común
    emocionFavoritaEmoji: '😊',
    cancionesFavoritas: 0, // Total de canciones en favoritos
  });

  const [editando, setEditando] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [loading, setLoading] = useState(true);

  // ============================================
  // CARGAR DATOS DEL USUARIO - CONECTAR CON BACKEND
  // ============================================
  useEffect(() => {
    // 🔴 BACKEND: Aquí hacer la petición GET para obtener los datos del usuario
    const cargarDatosUsuario = async () => {
      try {
        setLoading(true);
        
        // TODO: Reemplazar con tu endpoint
        // const response = await fetch('/api/usuario/perfil', {
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('token')}`
        //   }
        // });
        // const data = await response.json();
        // setUsuario(data);
        
        // Simulación de carga (ELIMINAR cuando conectes con backend)
        setTimeout(() => {
          setUsuario({
            nombre: 'José De la Cruz',
            email: 'jose.delacruz@email.com',
            fotoPerfil: null,
            fechaRegistro: '2024-09-01T10:00:00',
            spotifyConectado: true,
            spotifyEmail: 'jose.spotify@email.com',
            spotifyNombre: 'josemusic',
            spotifyFoto: null,
            totalAnalisis: 42,
            emocionFavorita: 'Feliz',
            emocionFavoritaEmoji: '😊',
            cancionesFavoritas: 127,
          });
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        setLoading(false);
      }
    };

    cargarDatosUsuario();
  }, []);

  // ============================================
  // GUARDAR CAMBIOS DE NOMBRE - CONECTAR CON BACKEND
  // ============================================
  const handleGuardarNombre = async () => {
    // 🔴 BACKEND: Aquí hacer la petición PUT/PATCH para actualizar el nombre
    try {
      // TODO: Reemplazar con tu endpoint
      // await fetch('/api/usuario/actualizar', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({ nombre: nuevoNombre })
      // });
      
      setUsuario({ ...usuario, nombre: nuevoNombre });
      setEditando(false);
      // Mostrar notificación de éxito
    } catch (error) {
      console.error('Error al actualizar nombre:', error);
      // Mostrar notificación de error
    }
  };

  // ============================================
  // CAMBIAR FOTO DE PERFIL - CONECTAR CON BACKEND
  // ============================================
  const handleCambiarFoto = async (event) => {
    const archivo = event.target.files[0];
    if (!archivo) return;

    // 🔴 BACKEND: Aquí hacer la petición POST para subir la foto
    try {
      const formData = new FormData();
      formData.append('foto', archivo);

      // TODO: Reemplazar con tu endpoint
      // const response = await fetch('/api/usuario/foto', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: formData
      // });
      // const data = await response.json();
      // setUsuario({ ...usuario, fotoPerfil: data.fotoUrl });
      
      // Simulación (ELIMINAR cuando conectes con backend)
      const reader = new FileReader();
      reader.onloadend = () => {
        setUsuario({ ...usuario, fotoPerfil: reader.result });
      };
      reader.readAsDataURL(archivo);
      
    } catch (error) {
      console.error('Error al subir foto:', error);
    }
  };

  // ============================================
  // CONECTAR/DESCONECTAR SPOTIFY - CONECTAR CON BACKEND
  // ============================================
  const handleSpotifyToggle = async () => {
    // 🔴 BACKEND: Aquí manejar la conexión/desconexión con Spotify
    if (usuario.spotifyConectado) {
      // Desconectar Spotify
      // TODO: Reemplazar con tu endpoint
      // await fetch('/api/spotify/desconectar', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // });
      
      setUsuario({
        ...usuario,
        spotifyConectado: false,
        spotifyEmail: null,
        spotifyNombre: null,
        spotifyFoto: null,
      });
    } else {
      // Conectar Spotify - Redirigir a OAuth
      // TODO: Reemplazar con tu URL de autenticación de Spotify
      // window.location.href = '/api/spotify/auth';
      
      alert('Redirigiendo a autenticación de Spotify...');
    }
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="perfil-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h1 className="perfil-title">Mi Perfil</h1>
        <p className="perfil-subtitle">Gestiona tu información personal</p>
      </div>

      <div className="perfil-content">
        {/* ===== TARJETA DE INFORMACIÓN PERSONAL ===== */}
        <div className="perfil-card info-card">
          <div className="card-header">
            <h2 className="card-title">
              <i className="fas fa-user"></i>
              Información Personal
            </h2>
          </div>

          <div className="perfil-avatar-section">
            <div className="avatar-container">
              {usuario.fotoPerfil ? (
                <img 
                  src={usuario.fotoPerfil} 
                  alt="Foto de perfil" 
                  className="avatar-img"
                />
              ) : (
                <div className="avatar-placeholder">
                  <i className="fas fa-user"></i>
                </div>
              )}
              <label htmlFor="foto-input" className="avatar-edit-btn" title="Cambiar foto">
                <i className="fas fa-camera"></i>
              </label>
              <input
                id="foto-input"
                type="file"
                accept="image/*"
                onChange={handleCambiarFoto}
                style={{ display: 'none' }}
              />
            </div>

            <div className="info-section">
              <div className="info-item">
                <label className="info-label">Nombre</label>
                {editando ? (
                  <div className="edit-nombre">
                    <input
                      type="text"
                      value={nuevoNombre}
                      onChange={(e) => setNuevoNombre(e.target.value)}
                      className="nombre-input"
                      placeholder="Ingresa tu nombre"
                    />
                    <button 
                      className="btn-save"
                      onClick={handleGuardarNombre}
                    >
                      <i className="fas fa-check"></i>
                    </button>
                    <button 
                      className="btn-cancel"
                      onClick={() => setEditando(false)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ) : (
                  <div className="info-value-with-edit">
                    <span className="info-value">{usuario.nombre}</span>
                    <button 
                      className="btn-edit"
                      onClick={() => {
                        setNuevoNombre(usuario.nombre);
                        setEditando(true);
                      }}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                  </div>
                )}
              </div>

              <div className="info-item">
                <label className="info-label">Email</label>
                <span className="info-value">{usuario.email}</span>
              </div>

              <div className="info-item">
                <label className="info-label">Miembro desde</label>
                <span className="info-value">
                  {formatearFecha(usuario.fechaRegistro)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== TARJETA DE SPOTIFY ===== */}
        <div className="perfil-card spotify-card">
          <div className="card-header">
            <h2 className="card-title">
              <i className="fab fa-spotify"></i>
              Conexión con Spotify
            </h2>
          </div>

          <div className="spotify-content">
            {usuario.spotifyConectado ? (
              <div className="spotify-connected">
                <div className="spotify-status">
                  <i className="fas fa-check-circle"></i>
                  <span>Cuenta conectada</span>
                </div>
                
                <div className="spotify-info">
                  {usuario.spotifyFoto && (
                    <img 
                      src={usuario.spotifyFoto} 
                      alt="Spotify" 
                      className="spotify-avatar"
                    />
                  )}
                  <div className="spotify-details">
                    <span className="spotify-name">{usuario.spotifyNombre}</span>
                    <span className="spotify-email">{usuario.spotifyEmail}</span>
                  </div>
                </div>

                <button 
                  className="btn-disconnect"
                  onClick={handleSpotifyToggle}
                >
                  <i className="fas fa-unlink"></i>
                  Desconectar Spotify
                </button>
              </div>
            ) : (
              <div className="spotify-disconnected">
                <i className="fab fa-spotify spotify-icon-large"></i>
                <h3>Conecta tu cuenta de Spotify</h3>
                <p>
                  Conecta tu cuenta para recibir recomendaciones personalizadas
                  y acceder a tus playlists favoritas
                </p>
                <button 
                  className="btn-connect-spotify"
                  onClick={handleSpotifyToggle}
                >
                  <i className="fab fa-spotify"></i>
                  Conectar con Spotify
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ===== TARJETA DE ESTADÍSTICAS ===== */}
        <div className="perfil-card stats-card">
          <div className="card-header">
            <h2 className="card-title">
              <i className="fas fa-chart-bar"></i>
              Mis Estadísticas
            </h2>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">
                <i className="fas fa-camera"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">{usuario.totalAnalisis}</span>
                <span className="stat-label">Análisis realizados</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">
                <span className="stat-emoji">{usuario.emocionFavoritaEmoji}</span>
              </div>
              <div className="stat-info">
                <span className="stat-value">{usuario.emocionFavorita}</span>
                <span className="stat-label">Emoción más común</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">
                <i className="fas fa-music"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">{usuario.cancionesFavoritas}</span>
                <span className="stat-label">Canciones favoritas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;