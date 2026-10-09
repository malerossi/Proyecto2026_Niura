import { useNavigate } from "react-router-dom";
import Header from "../../components/header";

export default function Ejercitar () {
    const navigate = useNavigate();

    const handleNavigateSeleccionEjercicio = () => {
        navigate('/eleccionEjercicio');
    }

    return (
        <div>
            <Header/>
            <button className="btnEjercitar" onClick={handleNavigateSeleccionEjercicio}>EJERCITAR</button>
        </div>
    )
}