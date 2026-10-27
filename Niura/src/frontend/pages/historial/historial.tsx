import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Icons implemented strictly as inline SVGs (No external dependencies)
const BackIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="w-5 h-5"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const PlayIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

const DownloadIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const FilmIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <line x1="7" y1="2" x2="7" y2="22" />
    <line x1="17" y1="2" x2="17" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="2" y1="7" x2="7" y2="7" />
    <line x1="2" y1="17" x2="7" y2="17" />
    <line x1="17" y1="17" x2="22" y2="17" />
    <line x1="17" y1="7" x2="22" y2="7" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="w-5 h-5 text-emerald-400 shrink-0"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

interface VideoFile {
  id: string;
  title: string;
  filename: string;
  format: 'MP4' | 'MOV' | 'MKV';
  quality: '4K' | '1080p' | '720p';
  duration: string;
  size: string;
  date: string;
  thumbnailGradient: string;
}

export default function historial() {
  // Posición dinámica del slider inferior (0 a 100%)
  const [sliderPos, setSliderPos] = useState<number>(18);
  const navigate = useNavigate();
  // Estado para la notificación flotante de descarga
  const [downloadNotice, setDownloadNotice] = useState<{ filename: string; size: string } | null>(null);

  // Datos de videos para "Más recientes"
  const recientes: VideoFile[] = [
    {
      id: 'v1',
      title: 'Video_Promocional_Campania_2026',
      filename: 'Video_Promocional_Campania_2026.mp4',
      format: 'MP4',
      quality: '4K',
      duration: '02:45',
      size: '142.5 MB',
      date: 'Hace 30 mins',
      thumbnailGradient: 'from-slate-800 via-indigo-950 to-slate-900',
    },
    {
      id: 'v2',
      title: 'Grabacion_Entrevista_Cliente_01',
      filename: 'Grabacion_Entrevista_Cliente_01.mov',
      format: 'MOV',
      quality: '1080p',
      duration: '14:20',
      size: '512.0 MB',
      date: 'Ayer',
      thumbnailGradient: 'from-blue-900 via-slate-900 to-teal-950',
    },
    {
      id: 'v3',
      title: 'Demo_Presentacion_Producto_V2',
      filename: 'Demo_Presentacion_Producto_V2.mp4',
      format: 'MP4',
      quality: '1080p',
      duration: '05:12',
      size: '88.3 MB',
      date: 'Hace 2 días',
      thumbnailGradient: 'from-zinc-800 via-stone-900 to-slate-900',
    },
  ];

  // Datos de videos para "Más archivos"
  const masArchivos: VideoFile[] = [
    {
      id: 'v4',
      title: 'Tutorial_Capacitacion_Interna_Modulo1',
      filename: 'Tutorial_Capacitacion_Interna_Modulo1.mp4',
      format: 'MP4',
      quality: '1080p',
      duration: '22:15',
      size: '740.2 MB',
      date: '15 Oct 2026',
      thumbnailGradient: 'from-slate-900 via-neutral-900 to-gray-800',
    },
    {
      id: 'v5',
      title: 'Resumen_Evento_Anual_Highlights',
      filename: 'Resumen_Evento_Anual_Highlights.mkv',
      format: 'MKV',
      quality: '4K',
      duration: '08:04',
      size: '310.8 MB',
      date: '08 Oct 2026',
      thumbnailGradient: 'from-cyan-950 via-slate-900 to-slate-800',
    },
    {
      id: 'v6',
      title: 'B-Roll_Tomas_Aereas_Oficina',
      filename: 'B-Roll_Tomas_Aereas_Oficina.mov',
      format: 'MOV',
      quality: '4K',
      duration: '03:50',
      size: '225.4 MB',
      date: '28 Sep 2026',
      thumbnailGradient: 'from-slate-800 via-blue-950 to-neutral-900',
    },
  ];

  // Función para descargar el video generado dinámicamente como Blob MP4/Video
  const handleDownloadVideo = (video: VideoFile, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    // Crear un blob simulado de video con el título y metadata
    const dummyVideoContent = `=== VIDEO BINARY FILE DATA ===\nTitle: ${video.title}\nFormat: ${video.format}\nQuality: ${video.quality}\nDuration: ${video.duration}\nSize: ${video.size}`;
    const blob = new Blob([dummyVideoContent], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);

    // Crear un elemento anchor temporal para activar la descarga directa
    const link = document.createElement('a');
    link.href = url;
    link.download = video.filename;
    document.body.appendChild(link);
    link.click();
    
    // Limpieza
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Activar aviso emergente de descarga
    setDownloadNotice({ filename: video.filename, size: video.size });

    // Ocultar aviso después de 4 segundos
    setTimeout(() => {
      setDownloadNotice(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between select-none font-sans bg-[#a3d8e5] p-6 md:p-10 relative overflow-x-hidden">
      
      {/* AVISO / TOAST DE DESCARGA ACTIVA */}
      {downloadNotice && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-3.5 animate-bounce">
          <CheckCircleIcon />
          <div>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Descarga iniciada</p>
            <p className="text-sm font-medium text-slate-100 truncate max-w-xs">{downloadNotice.filename}</p>
            <p className="text-[11px] text-slate-400">{downloadNotice.size}</p>
          </div>
        </div>
      )}

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 max-w-6xl w-full mx-auto flex flex-col justify-between pt-2 pb-6">
        <div>
          {/* Botón superior izquierdo de volver (círculo con flecha) */}
          <div className="mb-6">
            <button
              onClick={ ()=>    navigate(-1)}
              className="w-10 h-10 rounded-full border border-black flex items-center justify-center text-black hover:bg-black/10 active:scale-95 transition-all shadow-xs"
              title="Volver"
            >
              <BackIcon />
            </button>
          </div>

          {/* SECCIÓN 1: MÁS RECIENTES */}
          <section className="mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-black mb-4 tracking-tight flex items-center space-x-2">
              <span>Más recientes</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recientes.map((video) => (
                <div
                  key={video.id}
                  onClick={(e) => handleDownloadVideo(video, e)}
                  className="bg-[#dcdcdc] border border-black aspect-[16/10] relative rounded-md overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
                  title={`Haz clic para descargar ${video.filename}`}
                >
                  {/* Miniatura del Video con Degradado y Textura */}
                  <div className={`w-full h-full bg-gradient-to-br ${video.thumbnailGradient} relative flex flex-col justify-between p-3.5 text-white`}>
                    
                    {/* Badge Superior: Formato, Calidad y Tamaño */}
                    <div className="flex items-center justify-between z-10">
                      <div className="flex items-center space-x-1.5">
                        <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-bold tracking-wider text-cyan-300 border border-white/10">
                          {video.format}
                        </span>
                        <span className="bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-200">
                          {video.quality}
                        </span>
                      </div>
                      <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-slate-300 border border-white/10">
                        {video.size}
                      </span>
                    </div>

                    {/* Botón Central de Reproducción (Play / Indicador de Video) */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-xs border border-white/30 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 group-hover:border-cyan-300 transition-all duration-300 shadow-lg">
                        <PlayIcon className="w-6 h-6 ml-0.5" />
                      </div>
                    </div>

                    {/* Badge Inferior: Título, Duración y Botón de Descarga Directa */}
                    <div className="z-10 mt-auto bg-gradient-to-t from-black/90 via-black/50 to-transparent -mx-3.5 -mb-3.5 p-3.5 pt-6">
                      <p className="font-semibold text-white text-sm truncate group-hover:text-cyan-300 transition-colors">
                        {video.title}
                      </p>
                      
                      <div className="flex items-center justify-between mt-1 text-xs text-slate-300">
                        <span className="flex items-center space-x-1 font-mono text-[11px]">
                          <FilmIcon />
                          <span>{video.duration}</span>
                        </span>

                        <button
                          onClick={(e) => handleDownloadVideo(video, e)}
                          className="flex items-center space-x-1 text-xs bg-white/20 hover:bg-cyan-500 hover:text-slate-950 text-white px-2.5 py-1 rounded transition-colors border border-white/20 font-medium"
                        >
                          <DownloadIcon className="w-3.5 h-3.5" />
                          <span>Descargar</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECCIÓN 2: MÁS ARCHIVOS */}
          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-black mb-4 tracking-tight">
              Más archivos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {masArchivos.map((video) => (
                <div
                  key={video.id}
                  onClick={(e) => handleDownloadVideo(video, e)}
                  className="bg-[#dcdcdc] border border-black aspect-[16/10] relative rounded-md overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
                  title={`Haz clic para descargar ${video.filename}`}
                >
                  {/* Miniatura del Video */}
                  <div className={`w-full h-full bg-gradient-to-br ${video.thumbnailGradient} relative flex flex-col justify-between p-3.5 text-white`}>
                    
                    {/* Badges superiores */}
                    <div className="flex items-center justify-between z-10">
                      <div className="flex items-center space-x-1.5">
                        <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-bold tracking-wider text-cyan-300 border border-white/10">
                          {video.format}
                        </span>
                        <span className="bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-200">
                          {video.quality}
                        </span>
                      </div>
                      <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-slate-300 border border-white/10">
                        {video.size}
                      </span>
                    </div>

                    {/* Play Icon Centrado */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-xs border border-white/30 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 group-hover:border-cyan-300 transition-all duration-300 shadow-lg">
                        <PlayIcon className="w-6 h-6 ml-0.5" />
                      </div>
                    </div>

                    {/* Fondo e Información inferior */}
                    <div className="z-10 mt-auto bg-gradient-to-t from-black/90 via-black/50 to-transparent -mx-3.5 -mb-3.5 p-3.5 pt-6">
                      <p className="font-semibold text-white text-sm truncate group-hover:text-cyan-300 transition-colors">
                        {video.title}
                      </p>
                      
                      <div className="flex items-center justify-between mt-1 text-xs text-slate-300">
                        <span className="flex items-center space-x-1 font-mono text-[11px]">
                          <FilmIcon />
                          <span>{video.duration}</span>
                        </span>

                        <button
                          onClick={(e) => handleDownloadVideo(video, e)}
                          className="flex items-center space-x-1 text-xs bg-white/20 hover:bg-cyan-500 hover:text-slate-950 text-white px-2.5 py-1 rounded transition-colors border border-white/20 font-medium"
                        >
                          <DownloadIcon className="w-3.5 h-3.5" />
                          <span>Descargar</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* SLIDER / SCROLLBAR INFERIOR ESTILIZADO */}
        <div className="pt-6 pb-2 w-full max-w-2xl mx-auto">
          <div 
            className="w-full bg-[#c8dce1] border border-slate-400/50 h-3.5 rounded-full relative overflow-hidden shadow-inner cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
              setSliderPos(percentage);
            }}
          >
            {/* Cápsula deslizante del slider */}
            <div
              className="absolute top-0 bottom-0 bg-[#2b3543] rounded-full w-14 transition-all duration-150 ease-out shadow-sm"
              style={{ left: `calc(${sliderPos}% - ${(sliderPos / 100) * 56}px)` }}
            />
          </div>
        </div>
      </main>

    </div>
  );}