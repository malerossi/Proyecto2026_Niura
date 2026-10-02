import { useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determinamos cuál es la ruta actual para encender la pestaña correcta
  const rutaActual = location.pathname;

  return (
    <header
      style={{ fontFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif' }}
      className="w-full bg-[#87C9D6] border-b-2 border-black/20 px-6 py-2.5 flex items-center justify-center shrink-0 shadow-sm"
    >
      <nav className="flex items-center justify-center gap-8 md:gap-16 max-w-4xl w-full">
        
        {/* INICIO */}
        <button
          onClick={() => navigate('/pendientespaciente')}
          className={`flex flex-col items-center justify-center gap-1 transition-all group ${
            rutaActual === '/pendientespaciente' || rutaActual === '/'
              ? 'scale-105 font-bold opacity-100'
              : 'opacity-80 hover:opacity-100'
          }`}
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-black stroke-[1.8]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <span className="text-black text-xs md:text-sm font-bold tracking-tight">
            Inicio
          </span>
        </button>

        {/* USUARIO */}
        <button
          onClick={() => navigate('/inicioSesionPaciente')}
          className={`flex flex-col items-center justify-center gap-1 transition-all group ${
            rutaActual.includes('inicioSesion') || rutaActual.includes('registro')
              ? 'scale-105 font-bold opacity-100'
              : 'opacity-80 hover:opacity-100'
          }`}
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-black stroke-[1.8]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="9" r="3" />
              <path d="M6 18c0-3 2.5-5 6-5s6 2 6 5" />
            </svg>
          </div>
          <span className="text-black text-xs md:text-sm font-bold tracking-tight">
            Usuario
          </span>
        </button>

        {/* RACHA */}
        <button
          onClick={() => navigate('/racha')}
          className={`flex flex-col items-center justify-center gap-1 transition-all group ${
            rutaActual === '/racha'
              ? 'scale-105 font-bold opacity-100'
              : 'opacity-80 hover:opacity-100'
          }`}
        >
          <div className="w-8 h-8 flex items-center justify-center relative">
            <svg
              className="w-8 h-8 text-[#E2922A] fill-[#E2922A]"
              viewBox="0 0 24 24"
            >
              <path d="M12 23c-4.97 0-9-3.58-9-8 0-4.19 3.03-7.6 7-8 .5 1.5 1.5 2.5 3 3 0-2.5 1-5 4-7 1 3.5 4 5 4 9 0 4.42-4.03 8-9 8z" />
            </svg>
            <span className="absolute bottom-1 text-[10px] font-extrabold text-black">
              {localStorage.getItem('rachaActual') || 0}
            </span>
          </div>
          <span className="text-black text-xs md:text-sm font-bold tracking-tight">
            Racha
          </span>
        </button>

        {/* NOTICIAS */}
        <button
          onClick={() => navigate('/notificaciones')}
          className={`flex flex-col items-center justify-center gap-1 transition-all group ${
            rutaActual === '/notificaciones'
              ? 'scale-105 font-bold opacity-100'
              : 'opacity-80 hover:opacity-100'
          }`}
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-[#E5B82A] fill-[#E5B82A] stroke-black stroke-[1]"
              viewBox="0 0 24 24"
            >
              <path d="M12 22a2.5 2.5 0 002.5-2.5h-5A2.5 2.5 0 0012 22zm6.5-6v-5.5c0-3.07-1.63-5.64-4.5-6.32V3.5a1.5 1.5 0 00-3 0v.68C8.13 4.86 6.5 7.42 6.5 10.5V16l-2 2v1h15v-1l-2-2z" />
            </svg>
          </div>
          <span className="text-black text-xs md:text-sm font-bold tracking-tight">
            Noticias
          </span>
        </button>

        {/* TU RED */}
        <button
          onClick={() => navigate('/reddecontactosmia')}
          className={`flex flex-col items-center justify-center gap-1 transition-all group ${
            rutaActual.includes('reddecontactos')
              ? 'scale-105 font-bold opacity-100'
              : 'opacity-80 hover:opacity-100'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-[#0085FF] border border-black/30 flex items-center justify-center shadow-sm">
            <svg
              className="w-5 h-5 text-white fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          </div>
          <span className="text-black text-xs md:text-sm font-bold tracking-tight">
            Tu red
          </span>
        </button>

      </nav>
    </header>
  );
}