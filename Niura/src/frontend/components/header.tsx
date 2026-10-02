import { useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const rutaActual = location.pathname;

  return (
    <header
      style={{ fontFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif' }}
      className="w-full bg-[#87C9D6] border-b-2 border-[#18243A]/20 px-4 py-3 flex items-center justify-center shrink-0 shadow-sm select-none"
    >
      <nav className="flex items-center justify-center gap-8 sm:gap-12 md:gap-16 max-w-4xl w-full">
        
        {/* 1. INICIO */}
        <button
          onClick={() => navigate('/pendientespaciente')}
          className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            rutaActual === '/pendientespaciente' || rutaActual === '/'
              ? 'scale-105'
              : 'opacity-90 hover:opacity-100 hover:scale-105'
          }`}
        >
          <div className="w-9 h-9 flex items-center justify-center">
            <svg width="34" height="34" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Casa con relleno beige y borde oscuro */}
              <path
                d="M16 3L3 14H6V28H12V20H20V28H26V14H29L16 3Z"
                fill="#DDD8D0"
                stroke="#18243A"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-[#18243A] text-sm md:text-base font-semibold tracking-tight">
            Inicio
          </span>
        </button>

        {/* 2. USUARIO */}
        <button
          onClick={() => navigate('/inicioSesionPaciente')}
          className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            rutaActual.includes('inicioSesion') || rutaActual.includes('registro')
              ? 'scale-105'
              : 'opacity-90 hover:opacity-100 hover:scale-105'
          }`}
        >
          <div className="w-9 h-9 flex items-center justify-center">
            <svg width="34" height="34" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Círculo exterior */}
              <circle cx="16" cy="16" r="14" stroke="#18243A" strokeWidth="1.8" />
              {/* Cabeza celeste con borde oscuro */}
              <circle cx="16" cy="11.5" r="4.2" fill="#D9E8FF" stroke="#18243A" strokeWidth="1.5" />
              {/* Hombros celestes con borde oscuro */}
              <path
                d="M7.5 25.5C7.5 20.8 11.3 17 16 17C20.7 17 24.5 20.8 24.5 25.5"
                fill="#D9E8FF"
                stroke="#18243A"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <span className="text-[#18243A] text-sm md:text-base font-semibold tracking-tight">
            Usuario
          </span>
        </button>

        {/* 3. RACHA */}
        <button
          onClick={() => navigate('/racha')}
          className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            rutaActual === '/racha'
              ? 'scale-105'
              : 'opacity-90 hover:opacity-100 hover:scale-105'
          }`}
        >
          <div className="w-9 h-9 flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Llama amarilla */}
              <path
                d="M20 3C20 3 24 7.5 24 11.5C24 13.2 23.2 14.5 22 15.3C24.5 15 27.5 17.5 27.5 21.5C27.5 26.5 23 30 18 30C13 30 9 26.5 9 21.5C9 18.5 10.8 15.8 13 14.2C13 12.5 14.2 11 15.5 10C15.5 12 17 13.5 18.5 13.5C18.5 11 20 3 20 3Z"
                fill="#FFD13B"
                stroke="#18243A"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              {/* Número "10" sobrepuesto */}
              <text
                x="15"
                y="28"
                fontFamily="Arial, Helvetica, sans-serif"
                fontWeight="900"
                fontSize="13"
                fill="#FFD13B"
                stroke="#18243A"
                strokeWidth="2.8"
                paintOrder="stroke fill"
                textAnchor="middle"
              >
                {localStorage.getItem('rachaActual') || 10}
              </text>
            </svg>
          </div>
          <span className="text-[#18243A] text-sm md:text-base font-semibold tracking-tight">
            Racha
          </span>
        </button>

        {/* 4. NOTICIAS */}
        <button
          onClick={() => navigate('/notificaciones')}
          className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            rutaActual === '/notificaciones'
              ? 'scale-105'
              : 'opacity-90 hover:opacity-100 hover:scale-105'
          }`}
        >
          <div className="w-9 h-9 flex items-center justify-center">
            <svg width="34" height="34" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Batidor / Péndulo inferior */}
              <path
                d="M13.5 25.5C13.5 26.9 14.6 28 16 28C17.4 28 18.5 26.9 18.5 25.5"
                fill="#DDD8D0"
                stroke="#18243A"
                strokeWidth="1.8"
              />
              {/* Argolla superior */}
              <path d="M16 4V7" stroke="#18243A" strokeWidth="2" strokeLinecap="round" />
              {/* Cuerpo de la campana */}
              <path
                d="M7.5 23.5C7.5 23.5 9 22 9 15C9 11.1 12.1 8 16 8C19.9 8 23 11.1 23 15C23 22 24.5 23.5 24.5 23.5H7.5Z"
                fill="#FFD13B"
                stroke="#18243A"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-[#18243A] text-sm md:text-base font-semibold tracking-tight">
            Noticias
          </span>
        </button>

        {/* 5. TU RED */}
        <button
          onClick={() => navigate('/reddecontactosmia')}
          className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            rutaActual.includes('reddecontactos')
              ? 'scale-105'
              : 'opacity-90 hover:opacity-100 hover:scale-105'
          }`}
        >
          <div className="w-9 h-9 flex items-center justify-center">
            <svg width="34" height="34" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Botón azul redondeado */}
              <rect x="2" y="2" width="28" height="28" rx="7" fill="#0082D0" stroke="#18243A" strokeWidth="1.5" />
              {/* Persona frontal */}
              <circle cx="13" cy="12" r="3" fill="white" />
              <path d="M7.5 22C7.5 18.8 10 16.5 13 16.5C16 16.5 18.5 18.8 18.5 22H7.5Z" fill="white" />
              {/* Persona secundaria atrás */}
              <circle cx="20.5" cy="13" r="2.4" fill="white" />
              <path d="M18.2 22C18.5 20.1 20 18.2 22 18.2C23.2 18.2 24.2 18.7 24.8 19.5C24.2 21 24 22 24 22H18.2Z" fill="white" />
            </svg>
          </div>
          <span className="text-[#18243A] text-sm md:text-base font-semibold tracking-tight">
            Tu red
          </span>
        </button>

      </nav>
    </header>
  );
}