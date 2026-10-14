import type { CSSProperties, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRacha } from '../Contexts/contextracha';
import inicioImg from '../images/inicio_icono.png';
import usuarioImg from '../images/usuario_icono.png';
import rachaImg from '../images/racha_icono.png';
import noticiasImg from '../images/notificaciones_icono.png';
import tuRedImg from '../images/reddecontactos_icono.png';
import { Icon } from '@iconify/react';

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

/**
 * Escala del header de médico: 1 unidad (--u) = 1px del diseño original de 1366x768.
 * Crece y se achica de forma continua con la ventana (igual que la pantalla de Registrate).
 */
const ESCALA = 1;

const estiloEscala = {
  '--u': `max(0.55px, calc(min(100vw / 1366, 100vh / 768) * ${ESCALA}))`,
} as CSSProperties;

interface NavItemMedicoProps {
  activo: boolean;
  onClick: () => void;
  icono: string;
  label: string;
}

function NavItemMedico({ activo, onClick, icono, label }: NavItemMedicoProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex items-center gap-[calc(var(--u)*8)] text-[length:max(12px,calc(var(--u)*16))] leading-none transition-all cursor-pointer ${
        activo ? 'scale-105' : 'opacity-90 hover:opacity-100 hover:scale-105'
      }`}
    >
      <Icon
        icon={icono}
        aria-hidden="true"
        className="h-[max(16px,calc(var(--u)*20))] w-[max(16px,calc(var(--u)*20))]"
      />
      {label}
    </button>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const { pathname: rutaActual } = useLocation();
  // Los hooks tienen que llamarse siempre, fuera de los if (regla de hooks de React).
  const rachaActual = useRacha();

  if (rutaActual.includes('paciente')) {
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
  }

  if (rutaActual.includes('medico')) {
    return (
      <header
        style={estiloEscala}
        className="w-full min-h-[calc(var(--u)*97)] bg-[#a1cfdb]/[0.52] px-4 py-2 flex items-center justify-center shrink-0 select-none font-[Helvetica,Arial,sans-serif] text-[#18243a]"
      >
        <nav className="flex flex-wrap items-center justify-center gap-x-[calc(var(--u)*150)] gap-y-2 w-full">
          <NavItemMedico
            icono="mdi:home"
            label="inicio"
            activo={rutaActual === '/pendientesmedico'}
            onClick={() => navigate('/pendientesmedico')}
          />

          <NavItemMedico
            icono="mdi:account"
            label="tu usuario"
            activo={rutaActual.includes('inicioSesion') || rutaActual.includes('registro')}
            onClick={() => navigate('/inicioSesionMedico')}
          />

          <NavItemMedico
            icono="mdi:bell"
            label="notificaciones"
            activo={rutaActual === '/notificaciones'}
            onClick={() => navigate('/notificaciones')}
          />

          <NavItemMedico
            icono="mdi:share-variant-outline"
            label="red de contactos"
            activo={rutaActual.includes('reddecontactos')}
            onClick={() => navigate('/reddecontactosmia')}
          />
        </nav>
      </header>
    );
  }

  // Cualquier otra ruta: sin header
  return null;
}