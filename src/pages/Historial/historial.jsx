import React, { useState, useEffect } from 'react';
import './historial.css';

const Historial = () => {
  const [historial, setHistorial] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [loading, setLoading] = useState(true);

  // Simular carga de datos (reemplazar con llamada API real)
  useEffect(() => {
    setTimeout(() => {
      setHistorial([
        {
          id: 1,
          fecha: '2024-10-15T14:30:00',
          emocion: 'Feliz',
          emoji: '😊',
          confianza: 95.5,
          canciones: [
            { titulo: 'Happy', artista: 'Pharrell Williams' },
            { titulo: 'Good Vibrations', artista: 'The Beach Boys' },
            { titulo: 'Walking on Sunshine', artista: 'Katrina and The Waves' }
          ]
        },
        {
          id: 2,
          fecha: '2024-10-14T09:15:00',
          emocion: 'Triste',
          emoji: '😢',
          confianza: 88.3,
          canciones: [
            { titulo: 'Someone Like You', artista: 'Adele' },
            { titulo: 'The Scientist', artista: 'Coldplay' },
            { titulo: 'Fix You', artista: 'Coldplay' }
          ]
        },
        {
          id: 3,
          fecha: '2024-10-13T18:45:00',
          emocion: 'Energético',
          emoji: '⚡',
          confianza: 92.7,
          canciones: [
            { titulo: 'Eye of the Tiger', artista: 'Survivor' },
            { titulo: "Don't Stop Me Now", artista: 'Queen' },
            { titulo: 'Stronger', artista: 'Kanye West' }
          ]
        },
        {
          id: 4,
          fecha: '2024-10-12T16:20:00',
          emocion: 'Relajado',
          emoji: '😌',
          confianza: 91.2,
          canciones: [
            { titulo: 'Weightless', artista: 'Marconi Union' },
            { titulo: 'Clair de Lune', artista: 'Claude Debussy' },
            { titulo: 'Strawberry Swing', artista: 'Coldplay' }
          ]
        },
        {
          id: 5,
          fecha: '2024-10-11T20:10:00',
          emocion: 'Enojado',
          emoji: '😠',
          confianza: 87.9,
          canciones: [
            { titulo: 'Break Stuff', artista: 'Limp Bizkit' },
            { titulo: 'Killing in the Name', artista: 'Rage Against the Machine' },
            { titulo: 'Bodies', artista: 'Drowning Pool' }
          ]
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const opciones = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return fecha.toLocaleDateString('es-ES', opciones);
  };

  const filtrarHistorial = () => {
    if (filtro === 'todos') return historial;
    return historial.filter(item => item.emocion.toLowerCase() === filtro.toLowerCase());
  };

  const handleEliminar = (id) => {
    setHistorial(historial.filter(item => item.id !== id));
  };

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h1 className="historial-title">Mi Historial</h1>
        <p className="historial-subtitle">
          Revisa tus análisis emocionales anteriores
        </p>
      </div>

      <div className="historial-filtros">
        <button 
          className={`filtro-btn ${filtro === 'todos' ? 'active' : ''}`}
          onClick={() => setFiltro('todos')}
        >
          <i className="fas fa-list"></i>
          Todos
        </button>
        <button 
          className={`filtro-btn ${filtro === 'feliz' ? 'active' : ''}`}
          onClick={() => setFiltro('feliz')}
        >
          <i className="fas fa-smile"></i>
          Feliz
        </button>
        <button 
          className={`filtro-btn ${filtro === 'triste' ? 'active' : ''}`}
          onClick={() => setFiltro('triste')}
        >
          <i className="fas fa-sad-tear"></i>
          Triste
        </button>
        <button 
          className={`filtro-btn ${filtro === 'energético' ? 'active' : ''}`}
          onClick={() => setFiltro('energético')}
        >
          <i className="fas fa-bolt"></i>
          Energético
        </button>
        <button 
          className={`filtro-btn ${filtro === 'relajado' ? 'active' : ''}`}
          onClick={() => setFiltro('relajado')}
        >
          <i className="fas fa-spa"></i>
          Relajado
        </button>
      </div>

      <div className="historial-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando historial...</p>
          </div>
        ) : filtrarHistorial().length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <h3>No hay registros</h3>
            <p>No tienes análisis guardados todavía</p>
          </div>
        ) : (
          <div className="historial-grid">
            {filtrarHistorial().map((item) => (
              <div key={item.id} className="historial-card">
                <div className="card-header">
                  <div className="emotion-badge">
                    <span className="emotion-emoji">{item.emoji}</span>
                    <div className="emotion-info">
                      <span className="emotion-name">{item.emocion}</span>
                      <span className="emotion-confidence">
                        {item.confianza}% confianza
                      </span>
                    </div>
                  </div>
                  <button 
                    className="delete-btn"
                    onClick={() => handleEliminar(item.id)}
                    title="Eliminar"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>

                <div className="card-date">
                  <i className="far fa-calendar"></i>
                  {formatearFecha(item.fecha)}
                </div>

                <div className="card-songs">
                  <h4 className="songs-title">
                    <i className="fas fa-music"></i>
                    Canciones recomendadas
                  </h4>
                  <ul className="songs-list">
                    {item.canciones.map((cancion, index) => (
                      <li key={index} className="song-item">
                        <span className="song-number">{index + 1}</span>
                        <div className="song-details">
                          <span className="song-title">{cancion.titulo}</span>
                          <span className="song-artist">{cancion.artista}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <button className="replay-btn">
                  <i className="fas fa-redo"></i>
                  Reproducir playlist
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Historial;