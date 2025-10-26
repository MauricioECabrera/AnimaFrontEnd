import { useEffect, useState, useRef } from 'react';
import './SpotifyPlayer.css';

export default function SpotifyPlayer({ spotifyToken }) {
  const [player, setPlayer] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (!spotifyToken) return;

    console.log("🎵 Inicializando Spotify Web Playback SDK...");

    const loadSpotifySDK = () => {
      return new Promise((resolve) => {
        // Si ya está cargado
        if (window.Spotify) {
          console.log("✅ SDK ya está cargado");
          resolve();
          return;
        }

        // Si ya se está cargando
        if (scriptLoadedRef.current) {
          console.log("⏳ SDK ya se está cargando...");
          const checkInterval = setInterval(() => {
            if (window.Spotify) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
          return;
        }

        // Cargar el script
        scriptLoadedRef.current = true;
        console.log("📥 Cargando SDK de Spotify...");

        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;

        window.onSpotifyWebPlaybackSDKReady = () => {
          console.log("✅ SDK de Spotify listo");
          resolve();
        };

        script.onerror = () => {
          console.error("❌ Error al cargar SDK de Spotify");
          scriptLoadedRef.current = false;
        };

        document.body.appendChild(script);
      });
    };

    const initializePlayer = async () => {
      if (playerRef.current) {
        console.log("✅ Player ya existe");
        return;
      }

      await loadSpotifySDK();

      console.log("🎵 Creando reproductor...");

      const spotifyPlayer = new window.Spotify.Player({
        name: 'Ánima Web Player',
        getOAuthToken: cb => { cb(spotifyToken); },
        volume: 0.5
      });

      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('✅ Reproductor listo con Device ID:', device_id);
        window.spotifyDeviceId = device_id;
      });

      spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('❌ Device ID desconectado:', device_id);
      });

      spotifyPlayer.addListener('player_state_changed', (state) => {
        if (!state) return;
        
        console.log('🎵 Estado actualizado');
        
        setCurrentTrack(state.track_window.current_track);
        setIsPlaying(!state.paused);
        setPosition(state.position);
        setDuration(state.duration);
      });

      spotifyPlayer.addListener('authentication_error', ({ message }) => {
        console.error('❌ Error de autenticación:', message);
      });

      spotifyPlayer.addListener('account_error', ({ message }) => {
        console.error('❌ Error de cuenta (Premium requerido):', message);
      });

      spotifyPlayer.addListener('playback_error', ({ message }) => {
        console.error('❌ Error de reproducción:', message);
      });

      const success = await spotifyPlayer.connect();
      
      if (success) {
        console.log('✅ Reproductor conectado');
        playerRef.current = spotifyPlayer;
        setPlayer(spotifyPlayer);
      } else {
        console.error('❌ No se pudo conectar');
      }
    };

    initializePlayer();

    return () => {
      if (playerRef.current) {
        console.log('🔌 Desconectando...');
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    };
  }, [spotifyToken]);

  // Actualizar posición
  useEffect(() => {
    if (!isPlaying || !player) return;

    const interval = setInterval(() => {
      player.getCurrentState().then(state => {
        if (state) {
          setPosition(state.position);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, player]);

  const togglePlay = () => {
    if (player) player.togglePlay();
  };

  const skipNext = () => {
    if (player) player.nextTrack();
  };

  const skipPrevious = () => {
    if (player) player.previousTrack();
  };

  const seek = (e) => {
    const progressBar = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const width = progressBar.offsetWidth;
    const newPosition = (clickX / width) * duration;
    
    if (player) player.seek(newPosition);
  };

  const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  return (
    <div className="spotify-player">
      <div className="player-track-info">
        <img 
          src={currentTrack.album.images[0]?.url} 
          alt={currentTrack.name}
          className="player-album-art"
        />
        <div className="player-track-details">
          <div className="player-track-name">{currentTrack.name}</div>
          <div className="player-track-artist">
            {currentTrack.artists.map(artist => artist.name).join(', ')}
          </div>
        </div>
      </div>

      <div className="player-controls">
        <button onClick={skipPrevious} className="player-btn">
          <i className="fas fa-step-backward"></i>
        </button>
        
        <button onClick={togglePlay} className="player-btn player-btn-play">
          <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
        </button>
        
        <button onClick={skipNext} className="player-btn">
          <i className="fas fa-step-forward"></i>
        </button>
      </div>

      <div className="player-progress-section">
        <span className="player-time">{formatTime(position)}</span>
        <div className="player-progress-bar" onClick={seek}>
          <div 
            className="player-progress-fill"
            style={{ width: `${(position / duration) * 100}%` }}
          ></div>
        </div>
        <span className="player-time">{formatTime(duration)}</span>
      </div>
    </div>
  );
}