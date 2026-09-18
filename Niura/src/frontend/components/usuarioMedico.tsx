import { useNavigate } from 'react-router-dom'

export default function UsuarioMedico() {
    const navigate = useNavigate();
    return (
        <div className="usuarioMedico">
            <button
                className="btnUsuarioMedico"
                onClick={() => navigate('./frontend/usuarioMedico/usuarioMedico')}
            >
                Home
            </button>
        </div>
    )
}