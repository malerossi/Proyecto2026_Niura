import type { Notificaciones } from "../types/notificacion";
import { useNavigate } from "react-router-dom";

type Props = {
    noticia: Notificaciones;
    onResponderSolicitud?: (id: string, aceptado: boolean) => void;
};

export default function TarjetaNotificaciones({noticia, onResponderSolicitud}: Props) {
    const navigate = useNavigate();
    return (
        <div className="NotificacionTarjeta">
            <p className="emisor">{noticia.emisor}</p>

            <p className="cuerpoNoticia">{noticia.mensaje}</p>
        </div>
    )
}