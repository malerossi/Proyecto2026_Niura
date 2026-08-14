import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { ListaRacha } from './racha'; // 👈 Importas la pieza
function App() {
  const [count, setCount] = useState(0)

  return (

    <div>
      <ListaRacha /> {/* 👈 La usas como si fuera HTML */}
    </div>
  );
}
  


export default App
