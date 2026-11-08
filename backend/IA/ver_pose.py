"""
Analiza la fluidez de una elevación de brazo filmada DE COSTADO (la cámara ve el
lado del brazo que se mueve). Funciona con la persona sentada o de pie.

Este script NO usa la cadera, porque en los videos laterales MediaPipe no la
ubica bien. En su lugar:
  - El ángulo del brazo se mide contra la VERTICAL de la imagen.
  - La inclinación del cuerpo se mide con el eje oreja-hombro (su ángulo respecto
    de la vertical): si el cuerpo se tira hacia atrás o adelante, el eje rota.
  - El trapecio (encogimiento del hombro) se mide con la distancia vertical entre
    la oreja y el hombro: si el hombro sube, la distancia se achica.
  Si la oreja no se ve, usa la nariz. Si tampoco, se mide solo cuánto sube el hombro.

Uso:
    python analizar_lateral.py videos/lateral_1.mp4 --brazo derecho
    python analizar_lateral.py videos/lateral_1.mp4 --brazo izquierdo --rom-base 115

--brazo es el brazo que queda del lado de la cámara.

Requisitos:
    pip install mediapipe opencv-python numpy scipy matplotlib

IMPORTANTE: los umbrales de la sección CONFIGURACION son valores de partida, NO
están validados clínicamente. Hay que calibrarlos con videos reales.
"""
import argparse
import csv
import os
import sys

import cv2
import numpy as np
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.signal import butter, filtfilt, find_peaks
from mediapipe import Image, ImageFormat
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision

# ----------------------------- CONFIGURACION -----------------------------
# Índices de MediaPipe: (hombro, codo, oreja, nariz) del lado de la cámara
INDICES = {"derecho": (12, 14, 8, 0), "izquierdo": (11, 13, 7, 0)}

VISIBILIDAD_MIN = 0.5      # por debajo, el punto se considera poco confiable
FRAMES_VALIDOS_MIN = 0.8   # hombro y codo: si hay menos, no se puntúa el video
CABEZA_VALIDA_MIN = 0.6    # oreja/nariz: si hay menos, se mide solo con el hombro
CORTE_HZ = 4.0             # filtro pasa-bajos (el movimiento voluntario del brazo
                           # está por debajo de ~3 Hz; más alto deja pasar ruido)
PROMINENCIA_MIN = 30.0     # grados mínimos para contar una repetición
SEPARACION_MIN_S = 0.5     # segundos mínimos entre repeticiones

# Escala de suavidad (SPARC por fase): 0 puntos en SPARC_PEOR, 100 en SPARC_MEJOR.
# Un movimiento ideal da cerca de -1.55. Se pueden probar otros valores sin editar
# el archivo: --sparc-peor -2.4 --sparc-mejor -1.7
SPARC_PEOR = -2.6
SPARC_MEJOR = -1.6
# La SUBIDA (movimiento activo) pesa PESO_SUBIDA y la bajada el resto, porque en la
# bajada el brazo se "asienta" y mete ruido. Dentro de la subida, el puntaje mezcla
# SPARC con el número de picos de velocidad (1 pico = movimiento limpio); cada pico
# extra resta PENAL_PICO_EXTRA puntos. PESO_PICOS = 0 lo anula.
PESO_SUBIDA = 0.75
PESO_PICOS = 0.5
PENAL_PICO_EXTRA = 25.0

# Variación de duración entre repeticiones (coef. de variación) que da 0 puntos
CV_TEMPO_MAX = 0.4

# Inclinación del cuerpo: oscilación (máx - mín) del ángulo del eje oreja-hombro
# dentro de la repetición. Hasta EJE_TOL_GRADOS no se penaliza; en EJE_MAX_GRADOS o
# más, 0 puntos. Ojo: el cuello también se mueve, así que este ángulo es más
# ruidoso que uno medido con la cadera; si penaliza de más, subí los límites.
EJE_TOL_GRADOS = 5.0
EJE_MAX_GRADOS = 20.0

# Trapecio: cuánto se achica la distancia oreja-hombro respecto del inicio de la
# repetición, en % del largo del brazo (hombro-codo). Valores SIN calibrar: mirá la
# columna trap.% en un video limpio y en uno con compensación.
HOMBRO_SUBE_TOL_PCT = 10.0
HOMBRO_SUBE_MAX_PCT = 30.0

# La compensación y el tempo NO suman puntos: solo penalizan, multiplicando al
# puntaje base. Con compensación 0, el base se multiplica por
# (1 - PENALIZACION_COMPENSACION_MAX); análogo con el tempo.
PENALIZACION_COMPENSACION_MAX = 0.5
PENALIZACION_TEMPO_MAX = 0.25

# Pesos del puntaje base (se renormalizan según lo que esté disponible)
PESOS = {"suavidad": 0.75, "rango": 0.25}
# -------------------------------------------------------------------------


def extraer_pose(ruta_video, ruta_modelo, brazo):
    """Devuelve (fps, puntos[n,4,2] en píxeles, visibilidad[n,4]).
    Los 4 puntos son: hombro, codo, oreja y nariz (del lado de la cámara)."""
    idx = INDICES[brazo]
    opciones = vision.PoseLandmarkerOptions(
        base_options=mp_python.BaseOptions(model_asset_path=ruta_modelo),
        running_mode=vision.RunningMode.VIDEO,
        num_poses=1,
    )
    cap = cv2.VideoCapture(ruta_video)
    if not cap.isOpened():
        sys.exit(f"No pude abrir el video: {ruta_video}")
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0

    puntos, visibilidad = [], []
    with vision.PoseLandmarker.create_from_options(opciones) as landmarker:
        n = 0
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            alto, ancho = frame.shape[:2]
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            imagen = Image(image_format=ImageFormat.SRGB, data=rgb)
            res = landmarker.detect_for_video(imagen, int(n * 1000 / fps))
            n += 1
            if not res.pose_landmarks:
                puntos.append(np.full((4, 2), np.nan))
                visibilidad.append(np.zeros(4))
                continue
            lm = res.pose_landmarks[0]
            sel = [lm[i] for i in idx]
            puntos.append(np.array([[p.x * ancho, p.y * alto] for p in sel]))
            visibilidad.append([p.visibility for p in sel])
    cap.release()
    return fps, np.array(puntos), np.array(visibilidad)


def limpiar_senal(x, valido, fs):
    """Descarta frames poco confiables, interpola los huecos y filtra."""
    x = x.astype(float).copy()
    x[~valido] = np.nan
    idx = np.arange(len(x))
    buenos = ~np.isnan(x)
    x = np.interp(idx, idx[buenos], x[buenos])
    corte = min(CORTE_HZ, 0.4 * fs)
    b, a = butter(4, corte / (fs / 2), btype="low")
    return filtfilt(b, a, x)


def angulo_brazo(hombro, codo):
    """Ángulo del brazo (hombro->codo) respecto de la vertical hacia abajo, en grados.
    0° = brazo colgando, 90° = horizontal, 180° = arriba."""
    v = codo - hombro
    return np.degrees(np.abs(np.arctan2(v[:, 0], v[:, 1])))


def eje_cabeza_hombro(hombro, cabeza):
    """Ángulo del eje hombro->cabeza respecto de la vertical hacia arriba, en grados.
    0° = cabeza justo encima del hombro. El signo depende de hacia dónde mira la
    persona; lo que se usa es la oscilación (máx - mín)."""
    v = cabeza - hombro
    return np.degrees(np.arctan2(v[:, 0], -v[:, 1]))


def sparc(velocidad, fs, relleno=4, fc=10.0, umbral=0.05):
    """SPARC (Balasubramanian et al., 2015). Más negativo = menos suave."""
    nfft = int(2 ** (np.ceil(np.log2(len(velocidad))) + relleno))
    f = np.arange(nfft) * fs / nfft
    mag = np.abs(np.fft.fft(velocidad, nfft))
    mag = mag / mag.max()
    k = np.where(f <= fc)[0]
    f, mag = f[k], mag[k]
    sobre = np.where(mag >= umbral)[0]
    if len(sobre) < 2:
        return np.nan
    f, mag = f[sobre[0]: sobre[-1] + 1], mag[sobre[0]: sobre[-1] + 1]
    return -np.sum(np.sqrt((np.diff(f) / (f[-1] - f[0])) ** 2 + np.diff(mag) ** 2))


def segmentar(ang, fs):
    """Devuelve lista de (inicio, pico, fin) por repetición."""
    picos, _ = find_peaks(
        ang, prominence=PROMINENCIA_MIN, distance=max(1, int(SEPARACION_MIN_S * fs)))
    reps = []
    for i, p in enumerate(picos):
        ant = picos[i - 1] if i > 0 else 0
        sig = picos[i + 1] if i < len(picos) - 1 else len(ang) - 1
        inicio = ant + int(np.argmin(ang[ant:p + 1]))
        fin = p + int(np.argmin(ang[p:sig + 1]))
        reps.append((inicio, p, fin))
    return reps


def suavidad_fase(seg, fs):
    """SPARC y picos de velocidad de UNA fase (subida o bajada). Cada fase tiene una
    sola campana de velocidad, que es la forma para la que está pensada la escala."""
    if len(seg) < 8:
        return np.nan, None
    vel = np.abs(np.gradient(seg, 1 / fs))  # grados/segundo
    if vel.max() <= 0:
        return np.nan, None
    picos_vel, _ = find_peaks(vel, prominence=0.10 * vel.max())
    return float(sparc(vel, fs)), int(len(picos_vel))


def metricas_repeticion(ang, fs, inicio, pico, fin):
    seg = ang[inicio:fin + 1]
    if len(seg) < 8:
        return None
    s_sub, p_sub = suavidad_fase(ang[inicio:pico + 1], fs)  # subida
    s_baj, p_baj = suavidad_fase(ang[pico:fin + 1], fs)     # bajada
    validos = [x for x in (s_sub, s_baj) if not np.isnan(x)]
    if not validos:
        return None
    return {
        "duracion_s": (fin - inicio) / fs,
        "rango_grados": float(ang[pico] - seg.min()),
        "sparc": float(np.mean(validos)),
        "sparc_subida": s_sub,
        "sparc_bajada": s_baj,
        "picos_subida": p_sub,
        "picos_bajada": p_baj,
    }


def metricas_compensacion(eje, dist, cabeza_ok, hombro_f, escala, inicio, fin):
    """Compensación en una repetición.
    Con cabeza confiable: oscilación del eje oreja-hombro (inclinación) y cuánto se
    achica la distancia oreja-hombro (trapecio). Sin cabeza: solo cuánto sube el
    hombro respecto de su posición inicial."""
    seg = slice(inicio, fin + 1)
    if eje is not None:
        ok = cabeza_ok[seg]
        if ok.mean() >= CABEZA_VALIDA_MIN and ok.sum() >= 5:
            e = eje[seg][ok]
            ref = np.median(dist[inicio:inicio + 4])
            trap = max(0.0, float(ref - dist[seg][ok].min())) / escala * 100
            return {
                "eje_min": float(e.min()), "eje_max": float(e.max()),
                "eje_osc": float(e.max() - e.min()),
                "trapecio_pct": float(trap), "fuente": "cabeza+hombro",
            }
    ref_y = np.median(hombro_f[inicio:inicio + 4, 1])
    sube = max(0.0, float(ref_y - hombro_f[seg, 1].min())) / escala * 100  # y crece hacia abajo
    return {
        "eje_min": float("nan"), "eje_max": float("nan"), "eje_osc": float("nan"),
        "trapecio_pct": float(sube), "fuente": "solo hombro",
    }


def _lineal(x, tol, maximo):
    """100 hasta 'tol', baja linealmente hasta 0 en 'maximo'."""
    return float(np.clip((maximo - x) / (maximo - tol), 0, 1) * 100)


def puntaje_compensacion(eje_osc, trapecio_pct):
    """0-100. Toma la PEOR de las medidas disponibles, para que una compensación no
    pase desapercibida si una de ellas falla."""
    puntajes = [_lineal(trapecio_pct, HOMBRO_SUBE_TOL_PCT, HOMBRO_SUBE_MAX_PCT)]
    if not np.isnan(eje_osc):
        puntajes.append(_lineal(eje_osc, EJE_TOL_GRADOS, EJE_MAX_GRADOS))
    return min(puntajes)


def puntaje_suavidad(valor_sparc):
    t = (valor_sparc - SPARC_PEOR) / (SPARC_MEJOR - SPARC_PEOR)
    return float(np.clip(t, 0, 1) * 100)


def puntaje_suavidad_rep(m):
    """Suavidad de una repetición (0-100): la subida manda, la bajada pesa menos."""
    sub = None
    if not np.isnan(m["sparc_subida"]):
        sub = puntaje_suavidad(m["sparc_subida"])
        if m["picos_subida"] is not None:
            pk = float(np.clip(100 - PENAL_PICO_EXTRA * (m["picos_subida"] - 1), 0, 100))
            sub = (1 - PESO_PICOS) * sub + PESO_PICOS * pk
    baj = None if np.isnan(m["sparc_bajada"]) else puntaje_suavidad(m["sparc_bajada"])
    if sub is not None and baj is not None:
        return PESO_SUBIDA * sub + (1 - PESO_SUBIDA) * baj
    return sub if sub is not None else baj


def main():
    global SPARC_PEOR, SPARC_MEJOR
    ap = argparse.ArgumentParser(description="Fluidez de elevación de brazo, video lateral")
    ap.add_argument("video")
    ap.add_argument("--brazo", choices=["derecho", "izquierdo"], default="derecho",
                    help="brazo que queda del lado de la cámara")
    ap.add_argument("--modelo", default="pose_landmarker_heavy.task")
    ap.add_argument("--rom-base", type=float, default=None,
                    help="rango de movimiento de referencia del paciente, en grados")
    ap.add_argument("--sparc-peor", type=float, default=None,
                    help="SPARC que vale 0 puntos (por defecto %s)" % SPARC_PEOR)
    ap.add_argument("--sparc-mejor", type=float, default=None,
                    help="SPARC que vale 100 puntos (por defecto %s)" % SPARC_MEJOR)
    args = ap.parse_args()

    if args.sparc_peor is not None:
        SPARC_PEOR = args.sparc_peor
    if args.sparc_mejor is not None:
        SPARC_MEJOR = args.sparc_mejor
    if SPARC_MEJOR <= SPARC_PEOR:
        sys.exit("--sparc-mejor tiene que ser mayor (menos negativo) que --sparc-peor")

    nombre = os.path.splitext(os.path.basename(args.video))[0]
    os.makedirs("resultados", exist_ok=True)

    # Buscar el modelo también en la carpeta del script
    ruta_modelo = args.modelo
    carpeta_script = os.path.dirname(os.path.abspath(__file__))
    if not os.path.isabs(ruta_modelo) and not os.path.exists(ruta_modelo):
        ruta_modelo = os.path.join(carpeta_script, args.modelo)
    if not os.path.exists(ruta_modelo):
        sys.exit(f"No encuentro el modelo: {args.modelo}. "
                 f"Descargalo y ponelo en {carpeta_script}")

    print("Extrayendo pose (puede tardar)...")
    fps, puntos, vis = extraer_pose(args.video, ruta_modelo, args.brazo)

    # Validez por punto: 0 hombro, 1 codo, 2 oreja, 3 nariz
    ok = (vis >= VISIBILIDAD_MIN) & ~np.isnan(puntos).any(axis=2)
    brazo_ok = ok[:, 0] & ok[:, 1]

    # Para la cabeza se usa la oreja o la nariz, la que mejor se vea en TODO el video
    # (no se mezclan, porque la distancia al hombro cambia según el punto).
    ih = 2 if np.median(vis[:, 2]) >= np.median(vis[:, 3]) else 3
    nombre_cabeza = "oreja" if ih == 2 else "nariz"
    cabeza_ok = ok[:, 0] & ok[:, ih]
    usar_cabeza = cabeza_ok.mean() >= CABEZA_VALIDA_MIN

    print(f"FPS: {fps:.1f} | frames: {len(vis)} | brazo confiable: {brazo_ok.mean():.0%} | "
          f"{nombre_cabeza}+hombro confiable: {cabeza_ok.mean():.0%}")

    if brazo_ok.mean() < FRAMES_VALIDOS_MIN:
        print("\nVideo de baja calidad: el hombro o el codo no se ven bien en "
              "suficientes frames. No se calcula puntaje. Revisá encuadre, luz "
              "y que el brazo no salga del cuadro.")
        return
    if not usar_cabeza:
        print("\nAVISO: ni la oreja ni la nariz se ven bien en este video. La "
              "compensación se mide solo con cuánto sube el hombro, y la "
              "inclinación del cuerpo NO se puede medir. Probá ver_pose.py.")
    else:
        print(f"Cabeza: se usa la {nombre_cabeza} para medir inclinación y trapecio.")

    # Rellenar huecos y filtrar cada punto con SU propia validez
    hombro_f = np.column_stack([limpiar_senal(puntos[:, 0, c], ok[:, 0], fps) for c in range(2)])
    codo_f = np.column_stack([limpiar_senal(puntos[:, 1, c], ok[:, 1], fps) for c in range(2)])
    escala = float(np.median(np.linalg.norm(codo_f - hombro_f, axis=1)[brazo_ok]))
    ang = angulo_brazo(hombro_f, codo_f)

    if usar_cabeza:
        cabeza_f = np.column_stack(
            [limpiar_senal(puntos[:, ih, c], cabeza_ok, fps) for c in range(2)])
        eje = eje_cabeza_hombro(hombro_f, cabeza_f)
        dist = hombro_f[:, 1] - cabeza_f[:, 1]   # + cuando el hombro está debajo de la cabeza
    else:
        eje = dist = None

    reps = segmentar(ang, fps)
    resultados = []
    for n, (i, p, f) in enumerate(reps, 1):
        m = metricas_repeticion(ang, fps, i, p, f)
        if m is None or np.isnan(m["sparc"]):
            continue
        m.update(metricas_compensacion(eje, dist, cabeza_ok, hombro_f, escala, i, f))
        m["rep"] = n
        m["puntaje_suavidad"] = puntaje_suavidad_rep(m)
        m["puntaje_compensacion"] = puntaje_compensacion(m["eje_osc"], m["trapecio_pct"])
        resultados.append(m)

    if not resultados:
        print("\nNo se detectaron repeticiones. Probá bajar PROMINENCIA_MIN o "
              "revisá que el brazo suba lo suficiente.")
        return
    if len(resultados) < 3:
        print("\nAviso: se detectaron menos de 3 repeticiones; el puntaje es poco confiable.")

    # Puntaje base: suavidad (+ rango si se pasó --rom-base)
    comp = {"suavidad": np.mean([r["puntaje_suavidad"] for r in resultados])}
    if args.rom_base:
        rom = np.mean([r["rango_grados"] for r in resultados])
        comp["rango"] = float(min(rom / args.rom_base, 1) * 100)
    base = sum(PESOS[k] * v for k, v in comp.items()) / sum(PESOS[k] for k in comp)

    # Compensación y tempo penalizan (no suman puntos)
    comp_prom = float(np.mean([r["puntaje_compensacion"] for r in resultados]))
    factor_comp = 1 - PENALIZACION_COMPENSACION_MAX * (1 - comp_prom / 100)

    duraciones = np.array([r["duracion_s"] for r in resultados])
    puntaje_tempo = None
    if len(duraciones) >= 2:
        cv = duraciones.std() / duraciones.mean()
        puntaje_tempo = float(np.clip(1 - cv / CV_TEMPO_MAX, 0, 1) * 100)
    factor_tempo = 1.0 if puntaje_tempo is None else \
        1 - PENALIZACION_TEMPO_MAX * (1 - puntaje_tempo / 100)
    global_ = base * factor_comp * factor_tempo

    print(f"\nRepeticiones analizadas: {len(resultados)}")

    def _p(x):
        return "-" if x is None else str(x)

    print(f"{'rep':>3} {'dur(s)':>7} {'rango°':>7} {'SPARC↑':>7} {'SPARC↓':>7} "
          f"{'picos↑/↓':>9} {'eje.min°':>9} {'eje.max°':>9} {'eje.osc°':>9} "
          f"{'trap.%':>7} {'suav.':>6} {'comp.':>6}")
    for r in resultados:
        print(f"{r['rep']:>3} {r['duracion_s']:>7.2f} {r['rango_grados']:>7.1f} "
              f"{r['sparc_subida']:>7.2f} {r['sparc_bajada']:>7.2f} "
              f"{_p(r['picos_subida']) + '/' + _p(r['picos_bajada']):>9} "
              f"{r['eje_min']:>9.1f} {r['eje_max']:>9.1f} {r['eje_osc']:>9.1f} "
              f"{r['trapecio_pct']:>7.0f} "
              f"{r['puntaje_suavidad']:>6.0f} {r['puntaje_compensacion']:>6.0f}")
    print("\nComponentes: " + ", ".join(f"{k} {v:.0f}" for k, v in comp.items()))
    print(f"Puntaje base (sin compensación ni tempo): {base:.0f}")
    print(f"Compensación: puntaje {comp_prom:.0f} -> factor x{factor_comp:.2f}")
    if puntaje_tempo is None:
        print("Tempo: no calculable (menos de 2 repeticiones) -> factor x1.00")
    else:
        print(f"Tempo: puntaje {puntaje_tempo:.0f} -> factor x{factor_tempo:.2f}")
    print(f"PUNTAJE GLOBAL: {global_:.0f} / 100")

    # CSV y gráfico para revisar a ojo (el brazo va en el nombre para no pisar corridas)
    base_nombre = f"resultados/{nombre}_{args.brazo}"
    with open(f"{base_nombre}_reps.csv", "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(resultados[0].keys()))
        w.writeheader()
        w.writerows(resultados)

    t = np.arange(len(ang)) / fps
    fig, (ax1, ax2, ax3) = plt.subplots(
        3, 1, figsize=(11, 8.5), sharex=True, gridspec_kw={"height_ratios": [2, 1, 1]})
    ax1.plot(t, ang, label="ángulo del brazo (respecto de la vertical)")
    for i, p, f in reps:
        ax1.axvspan(t[i], t[f], alpha=0.1)
        ax1.plot(t[p], ang[p], "ro")
    ax1.set_ylabel("grados")
    ax1.set_title(f"{nombre} ({args.brazo}, lateral) | puntaje global {global_:.0f}")
    ax1.legend()
    if usar_cabeza:
        ax2.plot(t, np.where(cabeza_ok, eje, np.nan), color="tab:orange",
                 label=f"eje {nombre_cabeza}-hombro (inclinación)")
        ax3.plot(t, np.where(cabeza_ok, dist / escala * 100, np.nan), color="tab:green",
                 label=f"distancia {nombre_cabeza}-hombro (% del brazo): baja si encoge el hombro")
    else:
        ax2.text(0.5, 0.5, "inclinación no medible (cabeza no visible)",
                 ha="center", va="center", transform=ax2.transAxes)
    ax2.set_ylabel("grados")
    ax3.set_ylabel("% del brazo")
    ax3.set_xlabel("tiempo (s)")
    for ax in (ax2, ax3):
        if ax.get_legend_handles_labels()[0]:
            ax.legend()
    fig.tight_layout()
    fig.savefig(f"{base_nombre}_angulo.png", dpi=120)
    plt.close(fig)
    print(f"\nGuardado: {base_nombre}_reps.csv y {base_nombre}_angulo.png")


if __name__ == "__main__":
    main()