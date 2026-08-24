import React, { useState, type ReactHTMLElement } from 'react';
import { useNavigate } from 'react-router-dom';


export default function IniciodeSesion (){

    const navigate = useNavigate()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (nombre !== "" && apellido !== "" && mail !== "" && dni !== "" && contraseña !== ""){
            navigate ('/inicioPaciente')
        }
        else {
            alert ('Porfavor, llenar sus datos.')
        }
    }

    const [nombre, setNombre] = useState<string>("");
    const [apellido, setApellido] = useState<string>("");
    const [mail, setMail] = useState<string>("");
    const [dni, setDni] = useState<string>("");
    const [contraseña, setContraseña] = useState<string>("");
    const [imagen, setImagen] = useState<File | null>(null);
    const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);

    const handleImageChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        const archivo = e.target.files?.[0];
        if (archivo) {
            setImagen(archivo);
            setVistaPrevia(URL.createObjectURL(archivo))
        }
    }

    const dominiosGmail = ["gmail.com", "yahoo.com.ar", "hotmail.com", "outlook.com"]

    const usuarioMail = mail.includes("@")? mail.split("@")[0] : mail;

    return (
        <form className="Datos" onSubmit={handleSubmit}>
        <input type="text" required placeholder="Nombre" id="nombrePaciente" className="nombrePaciente" value= {nombre} onChange= {(e) => setNombre(e.target.value)} />
        <input type="text" required placeholder="Apellido" id="apellidoPaciente" className="apellidoPaciente" value= {apellido} onChange= {(e) => setApellido(e.target.value)} />
        <input type="email" list='listaDominios' required placeholder="Mail" id="mailPaciente" className="mailPaciente" value= {mail} onChange= {(e) => setMail(e.target.value)} />
        <datalist id='listaDominios'>{usuarioMail && dominiosGmail.map((dominio) => (
            <option key={dominio} value={`${usuarioMail}@${dominio}`}></option>
        ))}</datalist>
        <input type="text" required placeholder="DNI" id="dniPaciente" className="dniPaciente" value= {dni} onChange= {(e) => setDni(e.target.value)} />
        <input type="password" required placeholder="Contraseña" id="contraseñaPaciente" className="contraseñaPaciente" value= {contraseña} onChange= {(e) => setContraseña(e.target.value)} />
        <input type="file" accept='image/*' onChange={handleImageChange} />
        <button type="submit" id='Enviar' className='Enviar'> Enviar </button>
        </form>
    )

}
