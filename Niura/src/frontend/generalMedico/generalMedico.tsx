import { useNavigate } from 'react-router-dom'

export default function GeneralMedico () {
    const navigate = useNavigate();

    const redirigirPaginaGeneral = () => {
        navigate ('/paginaGeneralMedico')
    }

    const redirigirPaginaUsuario = () => {
        navigate ('/usuarioMedico')
    }

    const redirigirPaginaNotificaciones = () => {
        navigate ('/notificaciones')
    }

    const redirigirPaginaContactos = () => {
        navigate ('/reddecontactos')
    }

    const redirigirPaginaPacientes = () => {
        navigate ('/pacientesMedico')
    }

    return (
        <div className='botonesMedico'>
            <div className='botonesBarra'>
                <button className='btnHome' onChange={redirigirPaginaGeneral}></button>
                <button className='btnUsuario' onChange={redirigirPaginaUsuario}></button>
                <button className='btnNotificaciones' onChange={redirigirPaginaNotificaciones}></button>
                <button className='btnContactos' onChange={redirigirPaginaContactos}></button>
            </div>
            <button className='btnPacientes' onChange={redirigirPaginaPacientes}></button>
        </div>
    )
}