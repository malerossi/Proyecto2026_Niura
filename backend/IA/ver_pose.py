"""
Muestra como "ve" MediaPipe a la persona: dibuja los puntos sobre el video.

  - Punto VERDE  = el modelo esta seguro (visibilidad >= 0.5)
  - Punto ROJO   = el modelo no esta seguro (visibilidad < 0.5)
  - Los puntos grandes con numero son hombro, codo y cadera del brazo elegido.

Al final imprime, para hombros y caderas de AMBOS lados, en que porcentaje de
frames se vieron bien. Sirve para detectar si en los videos laterales el modelo
pierde la cadera o confunde el lado.

Uso:
    python ver_pose.py videos/lateral_1.mp4 --brazo derecho
    python ver_pose.py videos/lateral_1.mp4 --brazo derecho --ventana

Genera resultados/<nombre>_pose.mp4 para que lo mires con cualquier reproductor.
Con --ventana ademas lo muestra en vivo (apreta q para cerrar).
"""
import argparse
import os
import sys

import cv2
import numpy as np
from mediapipe import Image, ImageFormat
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision

INDICES = {"derecho": (12, 14, 24), "izquierdo": (11, 13, 23)}  # hombro, codo, cadera
NOMBRES = {
    11: "hombro izq", 12: "hombro der",
    13: "codo izq", 14: "codo der",
    23: "cadera izq", 24: "cadera der",
}
CONEXIONES = [
    (11, 12), (11, 13), (13, 15), (12, 14), (14, 16),
    (11, 23), (12, 24), (23, 24),
    (23, 25), (25, 27), (24, 26), (26, 28),
]
VISIBILIDAD_MIN = 0.5
VERDE, ROJO, GRIS, BLANCO = (0, 200, 0), (0, 0, 230), (160, 160, 160), (255, 255, 255)


def dibujar(frame, landmarks, brazo, n_frame):
    alto, ancho = frame.shape[:2]
    clave = INDICES[brazo]

    def pt(i):
        return int(landmarks[i].x * ancho), int(landmarks[i].y * alto)

    for a, b in CONEXIONES:
        cv2.line(frame, pt(a), pt(b), GRIS, 2)

    # Los 33 puntos, pequenos, coloreados por visibilidad
    for i, lm in enumerate(landmarks):
        color = VERDE if lm.visibility >= VISIBILIDAD_MIN else ROJO
        cv2.circle(frame, pt(i), 3, color, -1)

    # Los 3 puntos clave del brazo elegido, grandes y con su visibilidad
    for i in clave:
        vis = landmarks[i].visibility
        color = VERDE if vis >= VISIBILIDAD_MIN else ROJO
        x, y = pt(i)
        cv2.circle(frame, (x, y), 9, color, 2)
        cv2.putText(frame, f"{NOMBRES[i].split()[0]} {vis:.2f}", (x + 12, y - 6),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 2)

    # Lineas que usa analizar.py: tronco (hombro-cadera) y brazo (hombro-codo)
    hombro, codo, cadera = clave
    cv2.line(frame, pt(hombro), pt(cadera), (255, 120, 0), 3)
    cv2.line(frame, pt(hombro), pt(codo), (0, 160, 255), 3)


def texto(frame, msg, y, color=BLANCO):
    cv2.putText(frame, msg, (10, y), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 0, 0), 4)
    cv2.putText(frame, msg, (10, y), cv2.FONT_HERSHEY_SIMPLEX, 0.65, color, 2)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--brazo", choices=["derecho", "izquierdo"], default="derecho")
    ap.add_argument("--modelo", default="pose_landmarker_heavy.task")
    ap.add_argument("--ventana", action="store_true", help="mostrar en vivo")
    args = ap.parse_args()

    carpeta_script = os.path.dirname(os.path.abspath(__file__))
    ruta_modelo = args.modelo
    if not os.path.isabs(ruta_modelo) and not os.path.exists(ruta_modelo):
        ruta_modelo = os.path.join(carpeta_script, args.modelo)
    if not os.path.exists(ruta_modelo):
        sys.exit(f"No encuentro el modelo: {args.modelo}. Ponelo en {carpeta_script}")

    cap = cv2.VideoCapture(args.video)
    if not cap.isOpened():
        sys.exit(f"No pude abrir el video: {args.video}")
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0

    nombre = os.path.splitext(os.path.basename(args.video))[0]
    os.makedirs("resultados", exist_ok=True)
    ruta_salida = f"resultados/{nombre}_pose.mp4"
    escritor = None

    opciones = vision.PoseLandmarkerOptions(
        base_options=mp_python.BaseOptions(model_asset_path=ruta_modelo),
        running_mode=vision.RunningMode.VIDEO,
        num_poses=1,
    )
    vis_por_punto = {i: [] for i in NOMBRES}
    sin_pose = 0
    n = 0
    clave = INDICES[args.brazo]

    print("Procesando (puede tardar)...")
    with vision.PoseLandmarker.create_from_options(opciones) as landmarker:
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            alto, ancho = frame.shape[:2]
            if escritor is None:
                escritor = cv2.VideoWriter(
                    ruta_salida, cv2.VideoWriter_fourcc(*"mp4v"), fps, (ancho, alto))
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            imagen = Image(image_format=ImageFormat.SRGB, data=rgb)
            res = landmarker.detect_for_video(imagen, int(n * 1000 / fps))

            if res.pose_landmarks:
                lms = res.pose_landmarks[0]
                dibujar(frame, lms, args.brazo, n)
                for i in NOMBRES:
                    vis_por_punto[i].append(lms[i].visibility)
                visibles = all(lms[i].visibility >= VISIBILIDAD_MIN for i in clave)
                if visibles:
                    texto(frame, f"frame {n} | brazo {args.brazo}: OK", 25, VERDE)
                else:
                    texto(frame, f"frame {n} | brazo {args.brazo}: NO CONFIABLE", 25, ROJO)
            else:
                sin_pose += 1
                for i in NOMBRES:
                    vis_por_punto[i].append(0.0)
                texto(frame, f"frame {n} | POSE NO DETECTADA", 25, ROJO)

            escritor.write(frame)
            if args.ventana:
                cv2.imshow("MediaPipe (q para cerrar)", frame)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break
            n += 1

    cap.release()
    if escritor is not None:
        escritor.release()
    if args.ventana:
        cv2.destroyAllWindows()

    print(f"\nFrames procesados: {n} | sin pose detectada: {sin_pose}")
    print(f"\n{'punto':<12} {'% frames bien vistos':>21} {'visibilidad media':>19}")
    for i, nombre_punto in NOMBRES.items():
        v = np.array(vis_por_punto[i]) if vis_por_punto[i] else np.array([0.0])
        marca = " <- usado" if i in clave else ""
        print(f"{nombre_punto:<12} {(v >= VISIBILIDAD_MIN).mean():>20.0%} "
              f"{v.mean():>19.2f}{marca}")
    print(f"\nVideo con los puntos dibujados: {ruta_salida}")
    print("Mira si los puntos 'usado' caen sobre el cuerpo y si cambian a rojo en algun momento.")


if __name__ == "__main__":
    main()
