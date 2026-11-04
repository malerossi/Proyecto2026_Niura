"""
Analiza la fluidez de un ejercicio de elevación de brazo (flexión de hombro).

Uso:
    python analizar.py videos/prueba1.mp4 --brazo derecho
    python analizar.py videos/prueba1.mp4 --brazo izquierdo --rom-base 120

Requisitos:
    pip install mediapipe opencv-python numpy scipy matplotlib
    + el modelo pose_landmarker_full.task en la misma carpeta

IMPORTANTE: los umbrales de la sección CONFIGURACION son valores de partida,
NO están validados clínicamente. Hay que calibrarlos con tus videos y con la
opinión de un terapeuta.
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
# Índices de MediaPipe: (hombro, codo, cadera)
INDICES = {"derecho": (12, 14, 24), "izquierdo": (11, 13, 23)}
# Cadera del lado contrario: se usa si la del lado elegido no se ve
OPUESTA = {"derecho": 23, "izquierdo": 24}

VISIBILIDAD_MIN = 0.5      # por debajo, el punto se considera poco confiable
FRAMES_VALIDOS_MIN = 0.8   # si hay menos, no se puntúa el video
CORTE_HZ = 4.0             # filtro pasa-bajos (6 deja pasar más ruido de MediaPipe;
                           # el movimiento voluntario del brazo está por debajo de ~3 Hz)
PROMINENCIA_MIN = 30.0     # grados mínimos para contar una repetición
SEPARACION_MIN_S = 0.5     # segundos mínimos entre repeticiones

# Escala del puntaje de suavidad (SPARC): 0 puntos en SPARC_PEOR, 100 en SPARC_MEJOR.
# Se mide por fase (subida / bajada). Un movimiento ideal da cerca de -1.55.
# Cuanto más cerca estén PEOR y MEJOR, más sensible es el puntaje. Se pueden
# probar otros valores sin editar el archivo: --sparc-peor -2.4 --sparc-mejor -1.7
SPARC_PEOR = -2.6
SPARC_MEJOR = -1.6
# Variación de duración entre repeticiones (coef. de variación) que da 0 puntos
CV_TEMPO_MAX = 0.4

# Compensación de tronco: se mide como (ángulo máximo - ángulo mínimo) del tronco
# dentro de cada repetición. Hasta TRONCO_TOL_GRADOS no se penaliza (un poco de
# movimiento es normal); en TRONCO_MAX_GRADOS o más, el puntaje de tronco es 0.
TRONCO_TOL_GRADOS = 5.0
TRONCO_MAX_GRADOS = 20.0

# El ángulo del tronco solo se mide donde la cadera se ve bien. Si en una
# repetición (o en el video) hay menos de esta fracción de frames confiables,
# el ángulo se considera "no medible" y no se usa.
TRONCO_VALIDO_MIN = 0.6

# Segunda medida de compensación, que NO depende de la cadera: cuánto se aleja el
# hombro de su posición al empezar la repetición, en % del largo del brazo
# (hombro-codo). Hasta HOMBRO_TOL_PCT no se penaliza; en HOMBRO_MAX_PCT o más el
# puntaje de tronco es 0. Son valores de partida: calibralos con un video limpio
# y uno con compensación (columna hom.% de la tabla).
HOMBRO_TOL_PCT = 15.0
HOMBRO_MAX_PCT = 45.0

# El tronco NO suma puntos: solo penaliza. Con tronco perfecto (100) el puntaje
# base queda intacto; con tronco en 0 el puntaje base se multiplica por
# (1 - PENALIZACION_TRONCO_MAX). Ej.: 0.5 => compensación total resta hasta 50%.
PENALIZACION_TRONCO_MAX = 0.5

# El tempo (qué tan parecida es la duración entre repeticiones) también solo
# penaliza, pero con menos fuerza que el tronco. Con tempo perfecto no cambia
# nada; con tempo en 0 el puntaje se multiplica por (1 - PENALIZACION_TEMPO_MAX).
PENALIZACION_TEMPO_MAX = 0.25

# Pesos del puntaje base (se renormalizan según lo que esté disponible)
PESOS = {"suavidad": 0.75, "rango": 0.25}
# -------------------------------------------------------------------------


def extraer_pose(ruta_video, ruta_modelo, brazo):
    """Devuelve (fps, puntos[n,4,2] en píxeles, visibilidad[n,4]).
    Los 4 puntos son: hombro, codo, cadera (lado elegido) y cadera del lado opuesto."""
    i_hombro, i_codo, i_cadera = INDICES[brazo]
    i_opuesta = OPUESTA[brazo]
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
            sel = [lm[i_hombro], lm[i_codo], lm[i_cadera], lm[i_opuesta]]
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


def angulo_elevacion(puntos):
    """Ángulo entre tronco (hombro->cadera) y brazo (hombro->codo), en grados.
    0° = brazo colgando junto al cuerpo, 90° = horizontal, 180° = arriba."""
    hombro, codo, cadera = puntos[:, 0], puntos[:, 1], puntos[:, 2]
    v_tronco = cadera - hombro
    v_brazo = codo - hombro
    dot = np.sum(v_tronco * v_brazo, axis=1)
    cruz = v_tronco[:, 0] * v_brazo[:, 1] - v_tronco[:, 1] * v_brazo[:, 0]
    return np.degrees(np.abs(np.arctan2(cruz, dot)))


def inclinacion_tronco(puntos):
    """Ángulo del tronco respecto de la vertical (indicador de compensación)."""
    v = puntos[:, 2] - puntos[:, 0]  # hombro -> cadera
    return np.degrees(np.arctan2(v[:, 0], v[:, 1]))


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
        ang, prominence=PROMINENCIA_MIN, distance=max(1, int(SEPARACION_MIN_S * fs))
    )
    reps = []
    for i, p in enumerate(picos):
        ant = picos[i - 1] if i > 0 else 0
        sig = picos[i + 1] if i < len(picos) - 1 else len(ang) - 1
        inicio = ant + int(np.argmin(ang[ant:p + 1]))
        fin = p + int(np.argmin(ang[p:sig + 1]))
        reps.append((inicio, p, fin))
    return reps


def suavidad_fase(seg, fs):
    """SPARC y picos de velocidad de UNA fase (subida o bajada).
    Cada fase tiene una sola campana de velocidad, que es la forma para la que
    está pensada la escala SPARC_PEOR / SPARC_MEJOR."""
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


def metricas_tronco(tronco, tronco_ok, hombro, escala, inicio, fin):
    """Compensación de tronco en una repetición, por dos vías:
    (a) ángulo del tronco: mínimo, máximo y oscilación, SOLO con los frames donde
        la cadera se ve bien (NaN si no hay suficientes);
    (b) desplazamiento del hombro respecto de su posición inicial, en % del largo
        del brazo. No necesita la cadera."""
    ok = tronco_ok[inicio:fin + 1]
    tr = tronco[inicio:fin + 1]
    if ok.mean() >= TRONCO_VALIDO_MIN and ok.sum() >= 5:
        tmin, tmax = float(tr[ok].min()), float(tr[ok].max())
        osc = tmax - tmin
    else:
        tmin = tmax = osc = float("nan")
    ref = np.median(hombro[inicio:inicio + 4], axis=0)
    desp = np.linalg.norm(hombro[inicio:fin + 1] - ref, axis=1).max() / escala * 100
    return {
        "tronco_min": tmin,
        "tronco_max": tmax,
        "oscilacion_tronco_grados": osc,
        "desplazamiento_hombro_pct": float(desp),
    }


def puntaje_tronco(oscilacion, desplazamiento_pct):
    """0-100. Toma la PEOR de las dos medidas disponibles, para que una
    compensación no pase desapercibida si una de ellas falla."""
    puntajes = []
    if not np.isnan(oscilacion):
        t = (TRONCO_MAX_GRADOS - oscilacion) / (TRONCO_MAX_GRADOS - TRONCO_TOL_GRADOS)
        puntajes.append(float(np.clip(t, 0, 1) * 100))
    t = (HOMBRO_MAX_PCT - desplazamiento_pct) / (HOMBRO_MAX_PCT - HOMBRO_TOL_PCT)
    puntajes.append(float(np.clip(t, 0, 1) * 100))
    return min(puntajes)


def puntaje_suavidad(valor_sparc):
    t = (valor_sparc - SPARC_PEOR) / (SPARC_MEJOR - SPARC_PEOR)
    return float(np.clip(t, 0, 1) * 100)


def main():
    global SPARC_PEOR, SPARC_MEJOR
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--brazo", choices=["derecho", "izquierdo"], default="derecho")
    ap.add_argument("--modelo", default="pose_landmarker_full.task")
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

    # Validez de cada punto por separado: 0 hombro, 1 codo, 2 cadera, 3 cadera opuesta
    ok = (vis >= VISIBILIDAD_MIN) & ~np.isnan(puntos).any(axis=2)
    brazo_ok = ok[:, 0] & ok[:, 1]

    # Cadera efectiva: la del lado elegido y, si no se ve, la del lado opuesto
    # (de costado las dos caderas se superponen en la imagen, sirve igual).
    cadera = np.where((~ok[:, 2] & ok[:, 3])[:, None], puntos[:, 3], puntos[:, 2])
    cadera_ok = ok[:, 2] | ok[:, 3]
    tronco_ok = ok[:, 0] & cadera_ok

    print(f"FPS: {fps:.1f} | frames: {len(vis)} | brazo confiable: "
          f"{brazo_ok.mean():.0%} | tronco medible: {tronco_ok.mean():.0%}")

    if brazo_ok.mean() < FRAMES_VALIDOS_MIN:
        print("\nVideo de baja calidad: el hombro o el codo no se ven bien en "
              "suficientes frames. No se calcula puntaje. Revisá encuadre, luz "
              "y que el brazo no salga del cuadro.")
        return
    if tronco_ok.mean() < TRONCO_VALIDO_MIN:
        print("\nAVISO: la cadera no se ve bien en este video, así que el ángulo del "
              "tronco NO es confiable. La compensación se evalúa solo con el "
              "desplazamiento del hombro (columna hom.%). Probá ver_pose.py para ver "
              "qué está pasando con la cadera.")

    # Rellenar huecos y filtrar cada punto con SU propia validez
    hombro_f = np.column_stack([limpiar_senal(puntos[:, 0, c], ok[:, 0], fps) for c in range(2)])
    codo_f = np.column_stack([limpiar_senal(puntos[:, 1, c], ok[:, 1], fps) for c in range(2)])
    escala = float(np.median(np.linalg.norm(codo_f - hombro_f, axis=1)[brazo_ok]))
    if cadera_ok.sum() >= 10:
        cadera_f = np.column_stack([limpiar_senal(cadera[:, c], cadera_ok, fps) for c in range(2)])
    else:  # sin cadera en todo el video: se asume el tronco vertical
        cadera_f = hombro_f + np.array([0.0, 2.0 * escala])
    puntos_f = np.stack([hombro_f, codo_f, cadera_f], axis=1)

    ang = angulo_elevacion(puntos_f)
    tronco = inclinacion_tronco(puntos_f)

    reps = segmentar(ang, fps)
    resultados = []
    for n, (i, p, f) in enumerate(reps, 1):
        m = metricas_repeticion(ang, fps, i, p, f)
        if m is None or np.isnan(m["sparc"]):
            continue
        m.update(metricas_tronco(tronco, tronco_ok, hombro_f, escala, i, f))
        m["rep"] = n
        m["puntaje_suavidad"] = puntaje_suavidad(m["sparc"])
        m["puntaje_tronco"] = puntaje_tronco(
            m["oscilacion_tronco_grados"], m["desplazamiento_hombro_pct"])
        resultados.append(m)

    if not resultados:
        print("\nNo se detectaron repeticiones. Probá bajar PROMINENCIA_MIN o "
              "revisá que el brazo suba lo suficiente.")
        return
    if len(resultados) < 3:
        print("\nAviso: se detectaron menos de 3 repeticiones; el puntaje es poco confiable.")

    # Puntaje global combinando componentes disponibles
    comp = {"suavidad": np.mean([r["puntaje_suavidad"] for r in resultados])}
    duraciones = np.array([r["duracion_s"] for r in resultados])
    puntaje_tempo = None
    if len(duraciones) >= 2:
        cv = duraciones.std() / duraciones.mean()
        puntaje_tempo = float(np.clip(1 - cv / CV_TEMPO_MAX, 0, 1) * 100)
    if args.rom_base:
        rom = np.mean([r["rango_grados"] for r in resultados])
        comp["rango"] = float(min(rom / args.rom_base, 1) * 100)
    peso_total = sum(PESOS[k] for k in comp)
    base = sum(PESOS[k] * v for k, v in comp.items()) / peso_total

    # El tronco actúa como factor de penalización (no suma puntos)
    tronco_prom = float(np.mean([r["puntaje_tronco"] for r in resultados]))
    factor_tronco = 1 - PENALIZACION_TRONCO_MAX * (1 - tronco_prom / 100)

    # El tempo también es un factor de penalización (más suave que el tronco).
    # Con una sola repetición no se puede calcular y no penaliza.
    if puntaje_tempo is None:
        factor_tempo = 1.0
    else:
        factor_tempo = 1 - PENALIZACION_TEMPO_MAX * (1 - puntaje_tempo / 100)
    global_ = base * factor_tronco * factor_tempo

    print(f"\nRepeticiones analizadas: {len(resultados)}")

    def _p(x):
        return "-" if x is None else str(x)

    print(f"{'rep':>3} {'dur(s)':>7} {'rango°':>7} {'SPARC↑':>7} {'SPARC↓':>7} "
          f"{'picos↑/↓':>9} {'tr.min°':>8} {'tr.max°':>8} {'tr.osc°':>8} "
          f"{'hom.%':>6} {'suav.':>6} {'tron.':>6}")
    for r in resultados:
        print(f"{r['rep']:>3} {r['duracion_s']:>7.2f} {r['rango_grados']:>7.1f} "
              f"{r['sparc_subida']:>7.2f} {r['sparc_bajada']:>7.2f} "
              f"{_p(r['picos_subida']) + '/' + _p(r['picos_bajada']):>9} "
              f"{r['tronco_min']:>8.1f} {r['tronco_max']:>8.1f} "
              f"{r['oscilacion_tronco_grados']:>8.1f} "
              f"{r['desplazamiento_hombro_pct']:>6.0f} "
              f"{r['puntaje_suavidad']:>6.0f} {r['puntaje_tronco']:>6.0f}")
    print("\nComponentes: " + ", ".join(f"{k} {v:.0f}" for k, v in comp.items()))
    print(f"Puntaje base (sin tronco ni tempo): {base:.0f}")
    print(f"Tronco: puntaje {tronco_prom:.0f} -> factor x{factor_tronco:.2f}")
    if puntaje_tempo is None:
        print("Tempo: no calculable (menos de 2 repeticiones) -> factor x1.00")
    else:
        print(f"Tempo: puntaje {puntaje_tempo:.0f} -> factor x{factor_tempo:.2f}")
    print(f"PUNTAJE GLOBAL: {global_:.0f} / 100")

    # CSV y gráfico para revisar a ojo
    ruta_csv = f"resultados/{nombre}_reps.csv"
    with open(ruta_csv, "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(resultados[0].keys()))
        w.writeheader()
        w.writerows(resultados)

    t = np.arange(len(ang)) / fps
    fig, (ax1, ax2) = plt.subplots(
        2, 1, figsize=(11, 6.5), sharex=True, gridspec_kw={"height_ratios": [2, 1]})
    ax1.plot(t, ang, label="ángulo de elevación")
    for i, p, f in reps:
        ax1.axvspan(t[i], t[f], alpha=0.1)
        ax1.plot(t[p], ang[p], "ro")
    ax1.set_ylabel("grados")
    ax1.set_title(f"{nombre} | puntaje global {global_:.0f}")
    ax1.legend()
    ax2.plot(t, np.where(tronco_ok, tronco, np.nan), color="tab:orange",
             label="inclinación del tronco (solo frames confiables)")
    ax2.set_xlabel("tiempo (s)")
    ax2.set_ylabel("grados")
    ax2.legend()
    fig.tight_layout()
    fig.savefig(f"resultados/{nombre}_angulo.png", dpi=120)
    plt.close(fig)
    print(f"\nGuardado: {ruta_csv} y resultados/{nombre}_angulo.png")


if __name__ == "__main__":
    main()