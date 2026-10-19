import Video from "./subirVideo";
import SeleccionarArchivo from "./seleccionarArchivo";

export default function SeleccionVideo () {
    const handleNavigateSubirVideo = () => {
        <Video />
    }
    const handleNavigateSeleccionarArchivo = () => {
        <SeleccionarArchivo />
    }
    return (
        <div>
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
    )
}