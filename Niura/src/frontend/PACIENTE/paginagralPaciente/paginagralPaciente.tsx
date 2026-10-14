import { useNavigate } from "react-router-dom";

export default function PaginaGralPaciente() {
    const navigate = useNavigate();
    const handleNavigateEjercitar = () => {
        navigate('/paciente/ejercitar');
    }

    return (
        <div className="paginaGralPaciente">
            <button className="ejercitar" onClick={handleNavigateEjercitar}>
                <img src="" className="EjercitarPic"/>
                <p className="btnText">EJERCITAR</p>
            </button>
        </div>
    )
}