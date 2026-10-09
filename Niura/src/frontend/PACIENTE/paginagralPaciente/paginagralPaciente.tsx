import Pacientes from "../../components/pacientes";
import Contactos from "../../components/contactos";
import Home from "../../components/home";
import UsuarioPaciente from "../../components/usuarioPaciente";
import { useNavigate } from "react-router-dom";

export default function PaginaGralPaciente() {
    const navigate = useNavigate();
    const handleNavigateEjercitar = () => {
        navigate('/EleccionEjercicio');
    }

    return (
        <div className="paginaGralPaciente">
            <div className="header">
                <Home />
                <Pacientes />
                <Contactos />
                <UsuarioPaciente />
            </div>
            <button className="ejercitar" onClick={handleNavigateEjercitar}>
                <img src="" className="EjercitarPic"/>
                EJERCITAR
            </button>
        </div>
    )
}