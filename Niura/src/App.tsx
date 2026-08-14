import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IniciodeSesion from './frontend/InicioSesionPaciente/inicioPaciente'

function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
        {/* Ruta principal: Muestra el formulario */}
        <Route path="/" element={<IniciodeSesion />} />
        
        {/* Ruta destino: A donde te lleva el navigate('/inicioPaciente') */}
        <Route path="/inicioPaciente" element={< />} />
      </Routes>
    </BrowserRouter>
    <IniciodeSesion />
    </>
  )
}

export default App
