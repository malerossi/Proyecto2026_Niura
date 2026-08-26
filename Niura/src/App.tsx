import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IniciodeSesion from './frontend/InicioSesionPaciente/inicioPaciente';
import InicioSesionMedico from './frontend/InicioSesionMedico/inicioMedico';
import { ListaRacha } from './frontend/racha/racha';
import { StreakIcon } from './frontend/racha/StreakIcon';

import SubirVideo from './frontend/SubirVideo/SubirVideo'



function App() {
  return (
    <BrowserRouter>
      {/* Encabezado con el icono integrado */}
      <header className="flex items-center justify-between p-4 bg-slate-900">
        <h1 className="text-lg font-bold text-white">Mi App</h1>
        
        {/* Pasa el número como tipo 'number' */}
        <StreakIcon count={Number(localStorage.getItem("rachaActual"))} />
      </header>

      <Routes>
        <Route path="/inicioPaciente" element={<IniciodeSesion />} />
        <Route path="/racha" element={<ListaRacha />} />
        <Route path="/subirvideo" element={<SubirVideo />} />
        <Route path='/inicioMedico' element={<InicioSesionMedico />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;