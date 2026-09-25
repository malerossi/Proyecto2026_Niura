import { useNavigate } from 'react-router-dom'

export default function Home() {
    const navigate = useNavigate();
    return (
        <div className="home">
            <button
                className="btnHome"
                onClick={() => navigate('./frontend/paginageneralisima/paginageneralisima')}
            >
                Home
            </button>
        </div>
    )
}