import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SeleccionDeEjercicios() {
    useEffect(() => {
        fetch('igottawaitformrsmilesmorales')
            .then(response => response.json())
            .then(data => {console.log(data)})
            .catch(error => {console.error('Error fetching ejercicios:', error)});
    }, []);

}