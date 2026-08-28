import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function InicioCuidador () {

    const navigate = useNavigate()

    const [nombre, setNombre] = useState<string>('');
    const [apellido, setApellido] = useState<string>('');
    const [mail, setMail] = useState<string>('');
    const [contraseña, setContraseña] = useState<string>('');
    const [dni, setDni] = useState<string>('');
    const [imagen, setImagen] = useState<File | null>(null);
    const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault()
            if (nombre !== "" && apellido !== "" && mail !== "" && dni !== "" && contraseña !== ""){
                navigate ('/registroCuidador');
            }
            else {
                alert ('Porfavor, llenar sus datos.')
            }
        }

    const handleImageChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        const archivo = e.target.files?.[0];
        if (archivo) {
            setImagen (archivo);
            setVistaPrevia(URL.createObjectURL(archivo));
        }
    }

    const dominiosGmail = ['@gmail.com', "yahoo.com.ar", "hotmail.com", "outlook.com"];
    const gmailUser = mail.includes('@')? mail.split('@')[0] : mail;

    return (
        <form onSubmit={handleSubmit} className='FormCuidador'>
            <input type="text" required placeholder='Nombre' id='nombreCuidador' className='nombreCuidador' value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <input type="text" required placeholder='Apellido' id='apellidoCuidador' className='apellidoCuidador' value={apellido} onChange={(e) => setApellido(e.target.value)} />
            <input type="text" list='opcionesGmail' required placeholder='Gmail' id='gmailCuidador' className='gmailCuidador' value={mail} onChange={(e) => setMail(e.target.value)} />
            <datalist id='opcionesGmail'>{gmailUser && dominiosGmail.map((dominio) => (
                <option key={dominio} value={`${gmailUser}@${dominio}`}></option>
            ))}</datalist>
            <input type="text" required placeholder='Dni' id='dniCuidador' className='dniCuidador' value={dni} onChange={(e) => setDni(e.target.value)} />
            <input type="password" required placeholder='Contraseña' id='contraseñaCuidador' className='contraseñaCuidador' value={contraseña} onChange={(e) => setContraseña(e.target.value)} />
            <input type='file' accept='image/*' className='imagenCuidador' id='imagenCuidador' onChange={handleImageChange} />
            <button type='submit' id='Enviar' className='Enviar'>Enviar</button>
        </form>
    )
}