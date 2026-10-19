import { useNavigate, useParams } from "react-router-dom";

export default function SeleccionVideo() {
  const { type } = useParams(); 
  const navigate = useNavigate();

  const handleNavigateSubirVideo = () => {
    navigate(`/subirVideo/${type}`);
  };

  const handleNavigateSeleccionarArchivo = () => {
    navigate(`/seleccionarArchivo/${type}`);
  };

  return (
    <div>
      <h2>Entrenamiento Video: {type}</h2>
      <div>
        <button className="btnSubir" onClick={handleNavigateSubirVideo}>
          Subir
          <img src="" alt="picSUBIR" />
        </button>
      </div>
      <div>
        <button className="btnSeleccionar" onClick={handleNavigateSeleccionarArchivo}>
          Seleccionar archivo
          <img src="" alt="picSELECCIONARCHIVO" />
        </button>
      </div>
    </div>
  );
}