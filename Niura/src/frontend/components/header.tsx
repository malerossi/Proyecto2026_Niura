
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRacha } from '../Contexts/contextracha';
import inicioImg from '../images/inicio_icono.png';
import usuarioImg from '../images/usuario_icono.png';
import rachaImg from '../images/racha_icono.png';
import noticiasImg from '../images/notificaciones_icono.png';
import tuRedImg from '../images/reddecontactos_icono.png';



interface NavItemProps {
  activo: boolean;
  onClick: () => void;
  src: string;
  alt: string;
  children?: ReactNode;
}

function NavItem({ activo, onClick, src, alt, children }: NavItemProps) {

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={alt}
      className={`flex items-center justify-center transition-all cursor-pointer ${
        activo ? 'scale-105' : 'opacity-90 hover:opacity-100 hover:scale-105'
      }`}
    >
      <div className="relative">
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="h-16 w-auto object-contain"
        />
        {children}
      </div>
    </button>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const { pathname: rutaActual } = useLocation();
  if(useLocation().pathname.includes('paciente')) {
 
 const rachaActual = useRacha();
  
    // localStorage no disponible: usamos el valor por defecto
  return (
    <header
      className="w-full bg-[#87C9D6] border-b-2 border-[#18243A]/20 px-4 py-3 flex items-center justify-center shrink-0 shadow-sm select-none"
    >
      <nav className="flex items-center justify-center gap-8 sm:gap-12 md:gap-16 max-w-4xl w-full">
        <NavItem
          src={inicioImg}
          alt="Inicio"
          activo={rutaActual === '/pendientespaciente' || rutaActual === '/'}
          onClick={() => navigate('/pendientespaciente')}
        />

        <NavItem
          src={usuarioImg}
          alt="Usuario"
          activo={rutaActual.includes('inicioSesion') || rutaActual.includes('registro')}
          onClick={() => navigate('/inicioSesionPaciente')}
        />
         <NavItem
          src={rachaImg}
          alt="Racha"
          activo={rutaActual === '/racha'}
          onClick={() => navigate('/paciente/racha')}
        >
         <span
  className="absolute left-[11px] top-[20.93px] w-[27px] h-[27px] flex items-center justify-center whitespace-nowrap text-[#F2C94C] font-['Inter'] font-bold text-[22.36px] leading-none tracking-normal"
  style={{
    WebkitTextStroke: '3.78px #18243A',
    paintOrder: 'stroke fill',
  }}
>
  {rachaActual.rachaActual}
</span>
        </NavItem>

        <NavItem
          src={noticiasImg}
          alt="Noticias"
          activo={rutaActual === '/notificaciones'}
          onClick={() => navigate('/notificaciones')}
        />

        <NavItem
          src={tuRedImg}
          alt="Tu red"
          activo={rutaActual.includes('reddecontactos')}
          onClick={() => navigate('/reddecontactosmia')}
        />
      </nav>
    </header>
  );
}}