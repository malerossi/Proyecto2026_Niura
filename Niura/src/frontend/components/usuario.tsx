import { useNavigate } from 'react-router-dom'

export default function Usuario() {
    const navigate = useNavigate();
    return (
        <div className="usuario">
            <button
                className="btnUsuario"
                onClick={() => navigate('./frontend/usuario/usuario')}
            >
                Home
            </button>
        </div>
    )
}