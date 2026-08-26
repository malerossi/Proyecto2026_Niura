import React from 'react';
import { Link } from 'react-router-dom';

interface StreakIconProps {
  count?: number;
}

export const StreakIcon: React.FC<StreakIconProps> = ({ count = 27 }) => {
  return (
    <Link 
      to="/racha" 
      className="relative block w-16 h-16 transition-transform hover:scale-105 active:scale-95"
      title="Ver Racha"
    >
      <div className="relative w-full h-full overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 to-purple-900 ring-2 ring-orange-500/80 shadow-md shadow-orange-500/20">
        
        {/* Imagen del fueguito */}
        <img 
          src="../imagenes/Racha_prendida.png" 
          alt="Fuego de racha" 
          className="absolute inset-0 object-contain w-full h-full pointer-events-none"
        />

        {/* Número modificable */}
        <div className="absolute inset-0 flex items-center justify-center -translate-y-0.5 pointer-events-none">
          <span className="text-2xl font-black text-cyan-100 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]">
            {count}
          </span>
        </div>

      </div>
    </Link>
  );
};