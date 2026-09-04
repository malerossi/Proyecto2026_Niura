import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContextoInicioPaciente } from '../../App';

const contexto = useContext (ContextoInicioPaciente)

export default function InicioSesionPaciente () {
    const [nombre, setNombre] = useState<string> ('');
    const [dni, setDni] = useState<string> ('');
    const [contraseña, setContraseña] = useState<string>('');

    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (dni == '' && contraseña == '') {
            alert('Porfavor, llenar sus datos.');
        }
        else {
            navigate ('/inicioSesionPaciente');
            contexto?.setNombre(nombre);
        }
    }

    return (
        <form className='DatosInicioPaciente' onSubmit={handleSubmit}>
            <input type="text" className='nombre' value={nombre} onChange={(e) => setNombre(e.target.value)}/>
            <input type="text" className='dni' id='dni' value={dni} onChange={(e) => setDni(e.target.value)}/>
            <input type="password" className='contraseña' id='contraseña' value={contraseña} onChange={(e) => setContraseña(e.target.value)}/>
            <button className='enviar' id='enviar'>Enviar</button>
        </form>
    )
}