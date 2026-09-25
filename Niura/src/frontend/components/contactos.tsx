import { useNavigate } from 'react-router-dom'

export default function Contactos() {
    const navigate = useNavigate();
    return (
        <div className="contactos">
            <button
                className="btnContactos"
                onClick={() => navigate('./frontend/reddecontactos/reddecontactos')}
            >
                Home
            </button>
        </div>
    )
}