import React, { useState } from "react";

export default function Pendientes () {
    const [tareaMotriz, setMotriz] = useState <boolean>(false);
    const [tareaCognitiva, setCognitiva] = useState <boolean>(false);

    return (
        <div className="Pendientes">
            <div className="PendientesMotriz">
                <input className="pendiente1MOTRIZ" type="checkbox" checked={tareaMotriz} onChange={(e) => setMotriz(e.target.checked)} />
            </div>
            <div className="PendientesCognitiva">
                <input className="pendiente1COGNITIVO" type="checkbox" checked={tareaCognitiva} onChange={(e) => setCognitiva(e.target.checked)} />
            </div>
            <div className="PendientesCognitiva"></div>
        </div>
    )
}