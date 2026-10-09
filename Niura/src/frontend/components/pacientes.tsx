import { useNavigate } from 'react-router-dom'

export default function Pacientes() {
    const navigate = useNavigate();
    return (
        <div className="pacientes">
            <button
                className="btnPacientes"
                onClick={() => navigate('./frontend/pacientes/pacientes')}
            >
                Pacientes
            </button>
        </div>
    )
}