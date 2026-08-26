import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InicioSesionMedico() {
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
    const [matricula, setMatricula] = useState<File | null>(null);

    const handleImageChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        const archivo = e.target.files?.[0];
        if (archivo) {
            setMatricula(archivo);
        }
    }

    const dominiosGmail = ["gmail.com", "yahoo.com.ar", "hotmail.com", "outlook.com"]

    const usuarioMail = mail.includes("@")? mail.split("@")[0] : mail;

    return (
        <form className="Datos" onSubmit={handleSubmit}>
            <input type="text" required placeholder="Nombre" id="nombreMedico" className="nombreMedico" value= {nombre} onChange= {(e) => setNombre(e.target.value)} />
            <input type="text" required placeholder="Apellido" id="apellidoMedico" className="nombreApellido" value={apellido} onChange={(e) => setApellido(e.target.value)} />
            <input type="email" list="listaDominios" required placeholder="Mail" id="mailMedico" className="mailMedico" value={mail} onChange={(e) => setMail(e.target.value)} />
            <datalist id='listaDominios'>{usuarioMail && dominiosGmail.map((dominio) => (
            <option key={dominio} value={`${usuarioMail}@${dominio}`}></option>
            ))}</datalist>
            <input type="text" required placeholder="DNI" id="dniMedico" className="dniMedico" value={dni} onChange={(e) => setDni(e.target.value)} />
            <input type="password" required placeholder="Contraseña" id="contraseñaMedico" className="contraseñaMedico" value={contraseña} onChange={(e) => setContraseña(e.target.value)} />
            <input type="file" required placeholder="Matricula" id="matriculaMedico" className="matriculaMedico" accept="image/*" onChange={handleImageChange} />

        </form>
    )
}