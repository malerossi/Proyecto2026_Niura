import { useNavigate } from 'react-router-dom'

export default function Paciente() {
    const navigate = useNavigate();
    return (
        <div className="pacientes">
            <button
                className="btnPacientes"
                onClick={() => navigate('./frontend/pacientes/pacientes')}
            >
                Home
            </button>
        </div>
    )
}