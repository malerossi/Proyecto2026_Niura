import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IniciodeSesion from './frontend/InicioSesionPaciente/inicioPaciente'

import { ListaRacha } from './racha'; // 👈 Importas la pieza
function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
        {/* Ruta principal: Muestra el formulario */}
        <Route path="/" element={<IniciodeSesion />} />
        
        {/* Ruta destino: A donde te lleva el navigate('/inicioPaciente') */}
        <Route path="/racha" element={<ListaRacha />} />
      </Routes>
    </BrowserRouter>

    </>
  )
}
  


export default App
