import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DashBoard.css";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [emotionData, setEmotionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAnalisis: 0,
    emocionDominante: null,
    promedioConfianza: 0,
    tendenciaSemanal: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('semana');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmotionHistory();
  }, [selectedPeriod]);

  const fetchEmotionHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:4000/emociones/historial?periodo=${selectedPeriod}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmotionData(data.historial || []);
        calculateStats(data.historial || []);
      }
    } catch (error) {
      console.error("Error al cargar historial:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    if (!data || data.length === 0) {
      setStats({
        totalAnalisis: 0,
        emocionDominante: null,
        promedioConfianza: 0,
        tendenciaSemanal: []
      });
      return;
    }

    // Total de análisis
    const totalAnalisis = data.length;

    // Calcular emoción dominante
    const emotionCounts = {};
    let totalConfianza = 0;

    data.forEach(item => {
      const emotion = item.emocion_detectada;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      totalConfianza += item.confianza || 0;
    });

    const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) => 
      emotionCounts[a] > emotionCounts[b] ? a : b
    );

    // Promedio de confianza
    const promedioConfianza = (totalConfianza / totalAnalisis).toFixed(1);

    // Tendencia semanal (últimos 7 días)
    const last7Days = data.slice(0, 7);
    const tendenciaSemanal = processTrendData(last7Days);

    setStats({
      totalAnalisis,
      emocionDominante: {
        name: dominantEmotion,
        icon: getEmotionIcon(dominantEmotion),
        count: emotionCounts[dominantEmotion]
      },
      promedioConfianza,
      tendenciaSemanal,
      distribucionEmociones: emotionCounts
    });
  };

  const processTrendData = (data) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const emotionsByDay = {};

    data.forEach(item => {
      const date = new Date(item.fecha_analisis);
      const dayName = days[date.getDay()];
      
      if (!emotionsByDay[dayName]) {
        emotionsByDay[dayName] = {};
      }
      
      const emotion = item.emocion_detectada;
      emotionsByDay[dayName][emotion] = (emotionsByDay[dayName][emotion] || 0) + 1;
    });

    return Object.entries(emotionsByDay).map(([day, emotions]) => ({
      day,
      ...emotions
    }));
  };

  const getEmotionIcon = (emotion) => {
    const icons = {
      // Inglés (por si acaso)
      'HAPPY': '😊',
      'SAD': '😢',
      'ANGRY': '😠',
      'SURPRISED': '😲',
      'DISGUSTED': '🤢',
      'FEAR': '😨',
      'CALM': '😌',
      'CONFUSED': '😕',
      // Español (tu sistema actual)
      'Felicidad': '😊',
      'Tristeza': '😢',
      'Enojo': '😠',
      'Sorpresa': '😲',
      'Disgusto': '🤢',
      'Miedo': '😨',
      'Calma': '😌',
      'Confusión': '😕'
    };
    return icons[emotion] || '😐';
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      // Inglés
      'HAPPY': '#FFD700',
      'SAD': '#4169E1',
      'ANGRY': '#DC143C',
      'SURPRISED': '#FF8C00',
      'DISGUSTED': '#32CD32',
      'FEAR': '#9370DB',
      'CALM': '#20B2AA',
      'CONFUSED': '#C0C0C0',
      // Español (tu sistema actual)
      'Felicidad': '#FFD700',
      'Tristeza': '#4169E1',
      'Enojo': '#DC143C',
      'Sorpresa': '#FF8C00',
      'Disgusto': '#32CD32',
      'Miedo': '#9370DB',
      'Calma': '#20B2AA',
      'Confusión': '#C0C0C0'
    };
    return colors[emotion] || '#808080';
  };

  const handleLogout = async () => {
    if (window.confirm("¿Estás seguro que deseas cerrar sesión?")) {
      try {
        const token = localStorage.getItem("token");
        
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
        sessionStorage.clear();

        window.location.href = "/login";
      } catch (err) {
        console.error("Error al cerrar sesión:", err);
      }
    }
  };

  return (
    <div className="dashboard-container">
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
            <button onClick={() => navigate('/principal')} className="nav-item">
              <i className="fas fa-home"></i>
              <span>Inicio</span>
            </button>

            <button onClick={() => navigate('/perfil')} className="nav-item">
              <i className="fas fa-user"></i>
              <span>Perfil</span>
            </button>
            
            <button onClick={() => navigate('/dashboard')} className="nav-item active">
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

      {/* Mobile Menu Toggle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mobile-menu-toggle">
        <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            <i className="fas fa-chart-line"></i>
            Dashboard de Emociones
          </h1>
          
          {/* Period Selector */}
          <div className="period-selector">
            <button 
              className={`period-btn ${selectedPeriod === 'semana' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('semana')}
            >
              Semana
            </button>
            <button 
              className={`period-btn ${selectedPeriod === 'mes' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('mes')}
            >
              Mes
            </button>
            <button 
              className={`period-btn ${selectedPeriod === 'todo' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('todo')}
            >
              Todo
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin loading-icon"></i>
            <p>Cargando estadísticas...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon stat-icon-primary">
                  <i className="fas fa-camera"></i>
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stats.totalAnalisis}</h3>
                  <p className="stat-label">Total de Análisis</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-icon-success">
                  <i className="fas fa-percentage"></i>
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stats.promedioConfianza}%</h3>
                  <p className="stat-label">Confianza Promedio</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-icon-emotion">
                  <span className="stat-emoji">
                    {stats.emocionDominante?.icon || '😐'}
                  </span>
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">
                    {stats.emocionDominante?.name || 'N/A'}
                  </h3>
                  <p className="stat-label">Emoción Dominante</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-icon-info">
                  <i className="fas fa-calendar-week"></i>
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stats.tendenciaSemanal.length}</h3>
                  <p className="stat-label">Días Activos</p>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
              {/* Emotion Distribution Chart */}
              <div className="chart-card">
                <h3 className="chart-title">
                  <i className="fas fa-chart-pie"></i>
                  Distribución de Emociones
                </h3>
                <div className="emotion-distribution">
                  {stats.distribucionEmociones && Object.entries(stats.distribucionEmociones).map(([emotion, count]) => {
                    const percentage = ((count / stats.totalAnalisis) * 100).toFixed(1);
                    return (
                      <div key={emotion} className="emotion-bar-container">
                        <div className="emotion-bar-label">
                          <span className="emotion-bar-icon">{getEmotionIcon(emotion)}</span>
                          <span className="emotion-bar-name">{emotion}</span>
                          <span className="emotion-bar-value">{count}</span>
                        </div>
                        <div className="emotion-bar-bg">
                          <div 
                            className="emotion-bar-fill"
                            style={{
                              width: `${percentage}%`,
                              background: getEmotionColor(emotion)
                            }}
                          >
                            <span className="emotion-bar-percentage">{percentage}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Trend */}
              <div className="chart-card">
                <h3 className="chart-title">
                  <i className="fas fa-chart-line"></i>
                  Tendencia Semanal
                </h3>
                <div className="weekly-chart">
                  {stats.tendenciaSemanal.length > 0 ? (
                    stats.tendenciaSemanal.map((dayData, index) => (
                      <div key={index} className="day-column">
                        <div className="day-emotions">
                          {Object.entries(dayData).filter(([key]) => key !== 'day').map(([emotion, count]) => (
                            <div 
                              key={emotion}
                              className="emotion-block"
                              style={{
                                height: `${count * 20}px`,
                                background: getEmotionColor(emotion)
                              }}
                              title={`${emotion}: ${count}`}
                            >
                              <span className="emotion-block-icon">{getEmotionIcon(emotion)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="day-label">{dayData.day}</div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">
                      <i className="fas fa-inbox"></i>
                      <p>No hay datos para este período</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Analysis */}
              <div className="chart-card full-width">
                <h3 className="chart-title">
                  <i className="fas fa-clock"></i>
                  Análisis Recientes
                </h3>
                <div className="recent-analysis-list">
                  {emotionData.length > 0 ? (
                    emotionData.slice(0, 5).map((item, index) => (
                      <div key={index} className="analysis-item">
                        <div className="analysis-emotion">
                          <span className="analysis-icon">{getEmotionIcon(item.emocion_detectada)}</span>
                          <div className="analysis-info">
                            <h4 className="analysis-emotion-name">{item.emocion_detectada}</h4>
                            <p className="analysis-date">
                              {new Date(item.fecha_analisis).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="analysis-confidence">
                          <div className="confidence-circle">
                            <svg className="confidence-ring" viewBox="0 0 36 36">
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="3"
                              />
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={getEmotionColor(item.emocion_detectada)}
                                strokeWidth="3"
                                strokeDasharray={`${item.confianza}, 100`}
                              />
                            </svg>
                            <span className="confidence-text">{item.confianza}%</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">
                      <i className="fas fa-inbox"></i>
                      <p>No hay análisis recientes</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Emotion Insights */}
              <div className="chart-card">
                <h3 className="chart-title">
                  <i className="fas fa-lightbulb"></i>
                  Insights de Emociones
                </h3>
                <div className="insights-list">
                  {stats.emocionDominante && (
                    <>
                      <div className="insight-item">
                        <i className="fas fa-star insight-icon"></i>
                        <div className="insight-content">
                          <h4>Emoción Predominante</h4>
                          <p>
                            Tu emoción más frecuente es <strong>{stats.emocionDominante.name}</strong> 
                            {' '}({stats.emocionDominante.count} veces)
                          </p>
                        </div>
                      </div>

                      <div className="insight-item">
                        <i className="fas fa-chart-line insight-icon"></i>
                        <div className="insight-content">
                          <h4>Precisión de Análisis</h4>
                          <p>
                            La confianza promedio de tus análisis es de <strong>{stats.promedioConfianza}%</strong>
                          </p>
                        </div>
                      </div>

                      <div className="insight-item">
                        <i className="fas fa-calendar-check insight-icon"></i>
                        <div className="insight-content">
                          <h4>Actividad</h4>
                          <p>
                            Has realizado <strong>{stats.totalAnalisis}</strong> análisis en este período
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Positive vs Negative */}
              <div className="chart-card">
                <h3 className="chart-title">
                  <i className="fas fa-balance-scale"></i>
                  Emociones Positivas vs Negativas
                </h3>
                <div className="balance-chart">
                  {stats.distribucionEmociones && (() => {
                    // Emociones positivas y negativas (inglés y español)
                    const positive = ['HAPPY', 'CALM', 'SURPRISED', 'Felicidad', 'Calma', 'Sorpresa'];
                    const negative = ['SAD', 'ANGRY', 'FEAR', 'DISGUSTED', 'Tristeza', 'Enojo', 'Miedo', 'Disgusto'];
                    
                    let positiveCount = 0;
                    let negativeCount = 0;
                    
                    Object.entries(stats.distribucionEmociones).forEach(([emotion, count]) => {
                      if (positive.includes(emotion)) positiveCount += count;
                      else if (negative.includes(emotion)) negativeCount += count;
                    });
                    
                    const total = positiveCount + negativeCount;
                    const positivePercent = total > 0 ? ((positiveCount / total) * 100).toFixed(1) : 0;
                    const negativePercent = total > 0 ? ((negativeCount / total) * 100).toFixed(1) : 0;
                    
                    return (
                      <>
                        <div className="balance-item positive">
                          <div className="balance-icon">😊</div>
                          <h4>Positivas</h4>
                          <div className="balance-bar">
                            <div 
                              className="balance-fill"
                              style={{ width: `${positivePercent}%` }}
                            ></div>
                          </div>
                          <p className="balance-value">{positiveCount} ({positivePercent}%)</p>
                        </div>
                        
                        <div className="balance-item negative">
                          <div className="balance-icon">😔</div>
                          <h4>Negativas</h4>
                          <div className="balance-bar">
                            <div 
                              className="balance-fill"
                              style={{ width: `${negativePercent}%` }}
                            ></div>
                          </div>
                          <p className="balance-value">{negativeCount} ({negativePercent}%)</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}