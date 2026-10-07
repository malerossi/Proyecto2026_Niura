import { useNavigate } from 'react-router-dom';

export default function paginageneral() {
  const navigate = useNavigate();

  return (
    <div
      style={{ fontFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif' }}
      className="min-h-screen w-full bg-[#D3E2F3] flex flex-col items-center justify-center p-6 select-none"
    >
      {/* LOGO DE NIURA */}
      <div
        className="absolute"
        style={{
          width: '249.54598999023438px',
          height: '325.00030517578125px',
          top: '179px',
          left: '558px',
        }}
      >
        <img
          src="/images/logo_paginageneral.png"
          alt="Logo Página General"
          className="w-[249.54599px] h-[325.0003px] object-contain opacity-100"
        />
      </div>

      {/* CONTENEDOR DE BOTONES */}
      <div className="flex flex-col items-center justify-center gap-10 max-w-md w-full text-center">
        <div className="flex items-center justify-center gap-4 w-full">
          {/* Botón: Regístrate */}
          <button
            onClick={() => navigate('/registroPaciente')}
            className="bg-[#D8E6F5] hover:bg-[#c9ddf2] text-black font-semibold text-base md:text-lg px-6 py-2.5 rounded-xl border-2 border-[#1A8ECE] shadow-[0_3px_6px_rgba(0,0,0,0.16)] transition-all active:scale-95 cursor-pointer"
          >
            Regístrate
          </button>

          {/* Botón: Inicia sesión */}
          <button
            onClick={() => navigate('/inicioSesionPaciente')}
            className="bg-[#1A8ECE] hover:bg-[#157BB5] text-black font-semibold text-base md:text-lg px-6 py-2.5 rounded-xl border-2 border-[#1A8ECE] shadow-[0_3px_6px_rgba(0,0,0,0.16)] transition-all active:scale-95 cursor-pointer"
          >
            Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );
}