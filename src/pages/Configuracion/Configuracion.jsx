import React, { useState } from 'react';
import './Configuracion.css';

const Configuracion = () => {
  // Estados para las configuraciones
  const [config, setConfig] = useState({
    // Notificaciones
    notificacionesActivas: true,
    notificacionesEmail: false,
    notificacionesAnalisis: true,
    
    // Privacidad
    perfilPublico: false,
    compartirEstadisticas: true,
    guardarHistorial: true,
    
    // Preferencias de música
    reproduccionAutomatica: true,
    volumenInicial: 70,
    calidadAudio: 'alta',
    
    // Análisis
    analisisAutomatico: false,
    guardarFotos: false,
    
    // Apariencia
    colorAcento: 'morado', // morado, azul, verde, rosa
    
    // General
    idioma: 'es',
  });

  const handleToggle = (key) => {
    setConfig({ ...config, [key]: !config[key] });
  };

  const handleChange = (key, value) => {
    setConfig({ ...config, [key]: value });
  };

  const handleGuardarCambios = () => {
    // Aquí se guardarían las configuraciones
    console.log('Configuraciones guardadas:', config);
    // Mostrar notificación de éxito
  };

  const handleRestaurarDefecto = () => {
    if (window.confirm('¿Estás seguro de restaurar la configuración por defecto?')) {
      setConfig({
        notificacionesActivas: true,
        notificacionesEmail: false,
        notificacionesAnalisis: true,
        perfilPublico: false,
        compartirEstadisticas: true,
        guardarHistorial: true,
        reproduccionAutomatica: true,
        volumenInicial: 70,
        calidadAudio: 'alta',
        analisisAutomatico: false,
        guardarFotos: false,
        colorAcento: 'morado',
        idioma: 'es',
      });
    }
  };

  return (
    <div className="configuracion-container">
      <div className="configuracion-header">
        <h1 className="configuracion-title">Configuración</h1>
        <p className="configuracion-subtitle">
          Personaliza tu experiencia en Ánima
        </p>
      </div>

      <div className="configuracion-content">
        
        {/* ===== NOTIFICACIONES ===== */}
        <div className="config-card">
          <div className="config-card-header">
            <i className="fas fa-bell"></i>
            <h2>Notificaciones</h2>
          </div>
          
          <div className="config-options">
            <div className="config-option">
              <div className="option-info">
                <span className="option-title">Notificaciones activas</span>
                <span className="option-description">
                  Recibe notificaciones sobre tu actividad
                </span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={config.notificacionesActivas}
                  onChange={() => handleToggle('notificacionesActivas')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="config-option">
              <div className="option-info">
                <span className="option-title">Notificaciones por email</span>
                <span className="option-description">
                  Recibe actualizaciones en tu correo electrónico
                </span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={config.notificacionesEmail}
                  onChange={() => handleToggle('notificacionesEmail')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="config-option">
              <div className="option-info">
                <span className="option-title">Notificar nuevos análisis</span>
                <span className="option-description">
                  Recibe una notificación al completar un análisis
                </span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={config.notificacionesAnalisis}
                  onChange={() => handleToggle('notificacionesAnalisis')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* ===== PRIVACIDAD ===== */}
        <div className="config-card">
          <div className="config-card-header">
            <i className="fas fa-shield-alt"></i>
            <h2>Privacidad y seguridad</h2>
          </div>
          
          <div className="config-options">
            <div className="config-option">
              <div className="option-info">
                <span className="option-title">Perfil público</span>
                <span className="option-description">
                  Permite que otros usuarios vean tu perfil
                </span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={config.perfilPublico}
                  onChange={() => handleToggle('perfilPublico')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="config-option">
              <div className="option-info">
                <span className="option-title">Compartir estadísticas</span>
                <span className="option-description">
                  Contribuye con datos anónimos para mejorar la app
                </span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={config.compartirEstadisticas}
                  onChange={() => handleToggle('compartirEstadisticas')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="config-option">
              <div className="option-info">
                <span className="option-title">Guardar historial</span>
                <span className="option-description">
                  Mantén un registro de todos tus análisis
                </span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={config.guardarHistorial}
                  onChange={() => handleToggle('guardarHistorial')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* ===== MÚSICA ===== */}
        <div className="config-card">
          <div className="config-card-header">
            <i className="fas fa-music"></i>
            <h2>Preferencias de música</h2>
          </div>
          
          <div className="config-options">
            <div className="config-option">
              <div className="option-info">
                <span className="option-title">Reproducción automática</span>
                <span className="option-description">
                  Reproduce la playlist al terminar el análisis
                </span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={config.reproduccionAutomatica}
                  onChange={() => handleToggle('reproduccionAutomatica')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="config-option-full">
              <div className="option-info">
                <span className="option-title">Volumen inicial</span>
                <span className="option-description">
                  {config.volumenInicial}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.volumenInicial}
                onChange={(e) => handleChange('volumenInicial', parseInt(e.target.value))}
                className="volume-slider"
              />
            </div>

            <div className="config-option-full">
              <div className="option-info">
                <span className="option-title">Calidad de audio</span>
                <span className="option-description">
                  Mejor calidad consume más datos
                </span>
              </div>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="calidad"
                    checked={config.calidadAudio === 'baja'}
                    onChange={() => handleChange('calidadAudio', 'baja')}
                  />
                  <span>Baja</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="calidad"
                    checked={config.calidadAudio === 'media'}
                    onChange={() => handleChange('calidadAudio', 'media')}
                  />
                  <span>Media</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="calidad"
                    checked={config.calidadAudio === 'alta'}
                    onChange={() => handleChange('calidadAudio', 'alta')}
                  />
                  <span>Alta</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* ===== ANÁLISIS ===== */}
        <div className="config-card">
          <div className="config-card-header">
            <i className="fas fa-camera"></i>
            <h2>Análisis de emociones</h2>
          </div>
          
          <div className="config-options">
            <div className="config-option">
              <div className="option-info">
                <span className="option-title">Análisis automático</span>
                <span className="option-description">
                  Analiza la emoción inmediatamente al tomar la foto
                </span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={config.analisisAutomatico}
                  onChange={() => handleToggle('analisisAutomatico')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="config-option">
              <div className="option-info">
                <span className="option-title">Guardar fotos</span>
                <span className="option-description">
                  Guarda las fotos junto con el análisis
                </span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={config.guardarFotos}
                  onChange={() => handleToggle('guardarFotos')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* ===== APARIENCIA ===== */}
        <div className="config-card">
          <div className="config-card-header">
            <i className="fas fa-palette"></i>
            <h2>Apariencia</h2>
          </div>
          
          <div className="config-options">
            <div className="config-option-full">
              <div className="option-info">
                <span className="option-title">Color de acento</span>
                <span className="option-description">
                  Personaliza el color principal de la app
                </span>
              </div>
              <div className="color-options">
                <button
                  className={`color-btn morado ${config.colorAcento === 'morado' ? 'active' : ''}`}
                  onClick={() => handleChange('colorAcento', 'morado')}
                  title="Morado"
                >
                  {config.colorAcento === 'morado' && <i className="fas fa-check"></i>}
                </button>
                <button
                  className={`color-btn azul ${config.colorAcento === 'azul' ? 'active' : ''}`}
                  onClick={() => handleChange('colorAcento', 'azul')}
                  title="Azul"
                >
                  {config.colorAcento === 'azul' && <i className="fas fa-check"></i>}
                </button>
                <button
                  className={`color-btn verde ${config.colorAcento === 'verde' ? 'active' : ''}`}
                  onClick={() => handleChange('colorAcento', 'verde')}
                  title="Verde"
                >
                  {config.colorAcento === 'verde' && <i className="fas fa-check"></i>}
                </button>
                <button
                  className={`color-btn rosa ${config.colorAcento === 'rosa' ? 'active' : ''}`}
                  onClick={() => handleChange('colorAcento', 'rosa')}
                  title="Rosa"
                >
                  {config.colorAcento === 'rosa' && <i className="fas fa-check"></i>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== GENERAL ===== */}
        <div className="config-card">
          <div className="config-card-header">
            <i className="fas fa-cog"></i>
            <h2>General</h2>
          </div>
          
          <div className="config-options">
            <div className="config-option-full">
              <div className="option-info">
                <span className="option-title">Idioma</span>
                <span className="option-description">
                  Selecciona el idioma de la aplicación
                </span>
              </div>
              <select
                className="select-input"
                value={config.idioma}
                onChange={(e) => handleChange('idioma', e.target.value)}
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="pt">Português</option>
              </select>
            </div>
          </div>
        </div>

        {/* ===== BOTONES DE ACCIÓN ===== */}
        <div className="config-actions">
          <button className="btn-secondary-action" onClick={handleRestaurarDefecto}>
            <i className="fas fa-undo"></i>
            Restaurar por defecto
          </button>
          <button className="btn-primary-action" onClick={handleGuardarCambios}>
            <i className="fas fa-save"></i>
            Guardar cambios
          </button>
        </div>

      </div>
    </div>
  );
};

export default Configuracion;