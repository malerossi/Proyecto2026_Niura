import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IniciodeSesion from './frontend/InicioSesionPaciente/inicioPaciente';
import { ListaRacha } from './racha';
import { StreakIcon } from './StreakIcon';

import SubirVideo from './frontend/SubirVideo/SubirVideo'



function App() {
  return (
    <BrowserRouter>
      {/* Encabezado con el icono integrado */}
      <header className="flex items-center justify-between p-4 bg-slate-900">
        <h1 className="text-lg font-bold text-white">Mi App</h1>
        
        {/* Pasa el número como tipo 'number' */}
        <StreakIcon count={27} />
      </header>

      <Routes>
        <Route path="/" element={<IniciodeSesion />} />
        <Route path="/racha" element={<ListaRacha />} />
        <Route path="/subirvideo" element={<SubirVideo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;