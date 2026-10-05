import { useNavigate } from "react-router-dom";

export default function Ejercitar () {
    const navigate = useNavigate();

    const handleNavigateSeleccionEjercicio = () => {
        navigate('/seleccionEjercicio');
    }

    return (
        <div>
            <button className="btnEjercitar" onClick={handleNavigateSeleccionEjercicio}>EJERCITAR</button>
        </div>
    )
}