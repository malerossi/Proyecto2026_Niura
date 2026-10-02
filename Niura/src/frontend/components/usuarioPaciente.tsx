import { useNavigate } from 'react-router-dom'

export default function UsuarioPaciente() {
    const navigate = useNavigate();
    return (
        <div className="usuarioPaciente">
            <button
                className="btnUsuarioPaciente"
                onClick={() => navigate('./frontend/usuarioPaciente/usuarioPaciente')}
            >
                Home
            </button>
        </div>
    )
}