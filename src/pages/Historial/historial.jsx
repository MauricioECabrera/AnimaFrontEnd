import React, { useState, useEffect } from 'react';
import './historial.css';

const Historial = () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
  const [historial, setHistorial] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 9;

  // Simular carga de datos (reemplazar con llamada API real)
  useEffect(() => {
  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Cargar historial
      const historialRes = await fetch(`${API_URL}/emociones/historial?limit=50&offset=0`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!historialRes.ok) throw new Error('Error al cargar historial');
      
      const historialData = await historialRes.json();
      
      // Mapear emojis
      const emocionEmojis = {
        'Felicidad': '😊',
        'Tristeza': '😢',
        'Enojo': '😠',
        'Calma': '😌',
        'Sorpresa': '😲',
        'Miedo': '😨',
        'Disgusto': '🤢',
        'Confusión': '😕'
      };
      
      // Formatear datos
      const historialFormateado = historialData.historial.map(item => ({
        id: item.id,
        fecha: item.fecha_analisis,
        emocion: item.emocion_detectada,
        emoji: emocionEmojis[item.emocion_detectada] || '🎭',
        confianza: parseFloat(item.confianza),
        allEmotions: item.all_emotions
      }));
      
      setHistorial(historialFormateado);

      // Cargar estadísticas
      const statsRes = await fetch(`${API_URL}/emociones/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setEstadisticas(statsData.estadisticas);
      }
      
      setLoading(false);
      
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setLoading(false);
    }
  };

  cargarHistorial();
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
    let historialFiltrado = historial;
    
    if (filtro !== 'todos') {
      historialFiltrado = historial.filter(
        item => item.emocion.toLowerCase() === filtro.toLowerCase()
      );
    }
    
    // Paginación
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    
    return historialFiltrado.slice(inicio, fin);
  };

  const totalPaginas = Math.ceil(
    (filtro === 'todos' ? historial : historial.filter(
      item => item.emocion.toLowerCase() === filtro.toLowerCase()
    )).length / itemsPorPagina
  );

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este análisis?')) return;
    
    try {
      const token = localStorage.getItem('token');
      
      // Por ahora solo eliminar del estado local
      // TODO: Crear endpoint DELETE en el backend
      setHistorial(historial.filter(item => item.id !== id));
      
      alert('✅ Análisis eliminado');
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('❌ Error al eliminar el análisis');
    }
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
        onClick={() => { setFiltro('todos'); setPaginaActual(1); }}
      >
        <i className="fas fa-list"></i>
        Todos ({historial.length})
      </button>
      <button 
        className={`filtro-btn ${filtro === 'felicidad' ? 'active' : ''}`}
        onClick={() => { setFiltro('felicidad'); setPaginaActual(1); }}
      >
        😊 Felicidad
      </button>
      <button 
        className={`filtro-btn ${filtro === 'tristeza' ? 'active' : ''}`}
        onClick={() => { setFiltro('tristeza'); setPaginaActual(1); }}
      >
        😢 Tristeza
      </button>
      <button 
        className={`filtro-btn ${filtro === 'calma' ? 'active' : ''}`}
        onClick={() => { setFiltro('calma'); setPaginaActual(1); }}
      >
        😌 Calma
      </button>
      <button 
        className={`filtro-btn ${filtro === 'enojo' ? 'active' : ''}`}
        onClick={() => { setFiltro('enojo'); setPaginaActual(1); }}
      >
        😠 Enojo
      </button>
      <button 
        className={`filtro-btn ${filtro === 'sorpresa' ? 'active' : ''}`}
        onClick={() => { setFiltro('sorpresa'); setPaginaActual(1); }}
      >
        😲 Sorpresa
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
        <>
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
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="paginacion">
              <button
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="paginacion-btn"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <span className="paginacion-info">
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="paginacion-btn"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  </div>
  )
};



export default Historial;