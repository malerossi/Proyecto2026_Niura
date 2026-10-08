import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function AccionEjercitar() {
    const { id } = useParams<{ id: string }>();
    const [ejercicio, setEjercicio] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`api/ejercicio/${id}`)
            .then((res) => res.json())
            .then((data) => setEjercicio(data))
            .catch((err) => console.error(`Error fetching ejercicio: ${err}`));
    }, [id]);

    const handleNavigate = () => {
        navigate(`/confirmarArchivoSeleccionado/${id}`);
    };

    return (
        <div>
            
        </div>
    );
}
