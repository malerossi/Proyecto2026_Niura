import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IniciodeSesion from './frontend/InicioSesionPaciente/inicioPaciente'
import SubirVideo from './frontend/SubirVideo/SubirVideo'

import { ListaRacha } from './frontend/racha/racha';
function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
        {/* Ruta principal: Muestra el formulario */}
        <Route path="/" element={<IniciodeSesion />} />
        
        {/* Ruta destino: A donde te lleva el navigate('/inicioPaciente') */}
        <Route path="/racha" element={<ListaRacha />} />
        <Route path="/subirvideo" element={<SubirVideo />} />
      </Routes>
    </BrowserRouter>
    
    </>
  )
}
  


export default App
