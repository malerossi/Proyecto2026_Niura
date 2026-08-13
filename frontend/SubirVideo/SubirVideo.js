const btn = document.getElementById("btnCamara");
const preview = document.getElementById("preview");

let stream = null;
let recorder = null;
let partes = [];

btn.addEventListener("click", async () => {

    if (!recorder || recorder.state === "inactive") {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            preview.srcObject = stream;

            partes = [];

            recorder = new MediaRecorder(stream);

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    partes.push(event.data);
                }
            };

            recorder.onstop = () => {

                const video = new Blob(partes, {
                    type: "video/webm"
                });

                const url = URL.createObjectURL(video);

                const a = document.createElement("a");
                a.href = url;
                a.download = "mi-video.webm";
                a.click();

                URL.revokeObjectURL(url);
            };

            recorder.start();

            btn.textContent = "⏹️ Terminar grabación";

        } catch (error) {
            console.error(error);
            alert("No se pudo acceder a la cámara.");
        }
    }

    else if (recorder.state === "recording") {

        recorder.stop();

        stream.getTracks().forEach(track => track.stop());

        preview.srcObject = null;

        btn.textContent = "🎥 Empezar a grabar";
    }
});