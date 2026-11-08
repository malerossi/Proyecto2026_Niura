"""
Niura - motor de evaluación de repetición de sílabas (pa-ta-ka).

Entrada: un .mp3 (o cualquier audio que lea ffmpeg) + el modo de la consigna.
Salida: un dict (registro) con calidad, métricas crudas, penalizaciones,
puntaje 0-100 y confianza. Si el audio no pasa la compuerta, devuelve
estado "no_evaluable" (nunca un 0).

IMPORTANTE: todos los umbrales de CONFIG son valores de ARRANQUE, elegidos
por diseño, SIN validar clínicamente ni contra literatura. Hay que
recalibrarlos (adultos sanos con mp3 de celular) antes de interpretar el
puntaje. El puntaje es una herramienta de seguimiento, no un diagnóstico.

Dependencias: numpy, scipy, ffmpeg instalado en el servidor.
Todo se procesa localmente; no se envía audio a ningún servicio externo.
"""

import hashlib
import json
import subprocess
import sys
import tempfile
import os

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfiltfilt, find_peaks

SR = 16000
VERSION_MOTOR = "silabas-0.1"

MODOS = ("a_comodo", "b_rapido", "c_n_ciclos")

# --------------------------------------------------------------------------
# CONFIGURACIÓN (TODO SIN VALIDAR)
# --------------------------------------------------------------------------
CONFIG = {
    "comun": {
        "dur_min_s": 4.0,
        "dur_max_s": 60.0,
        "tam_max_mb": 20,
        "clip_umbral": 0.98,       # muestras por encima de este valor absoluto
        "clip_max_frac": 0.01,     # más de 1 % => no evaluable
        "snr_min_db": 10.0,
        "dist_min_onsets_s": 0.08, # máx ~12 sílabas/s
        "peso_temporal": 0.7,
        "peso_amplitud": 0.3,
        "pausa_factor": 2.0,       # intervalo > 2 x mediana => pausa larga
        "piso_penalizaciones": 0.5,
        "cv_amp_mejor": 0.20,
        "cv_amp_peor": 0.80,
    },
    "a_comodo": {
        "version_umbrales": "v0-sin-validar-a",
        "n_min": 8, "n_comodo": 20,
        "cv_int_mejor": 0.10, "cv_int_peor": 0.40,
        "vel_lenta": 2.5, "vel_rapida": 7.0,    # sílabas/s
        "fatiga_umbral": 0.20,
    },
    "b_rapido": {
        "version_umbrales": "v0-sin-validar-b",
        "n_min": 12, "n_comodo": 30,
        "cv_int_mejor": 0.15, "cv_int_peor": 0.55,
        "vel_lenta": 4.0, "vel_rapida": None,   # lo rápido no se penaliza
        "fatiga_umbral": 0.30,
    },
    "c_n_ciclos": {
        "version_umbrales": "v0-sin-validar-c",
        "n_min": None, "n_comodo": None,        # dependen de n_ciclos
        "cv_int_mejor": 0.10, "cv_int_peor": 0.40,
        "vel_lenta": None, "vel_rapida": None,  # velocidad solo se reporta
        "fatiga_umbral": None,                  # pocos ciclos: sin fatiga
    },
}


# --------------------------------------------------------------------------
# Decodificación
# --------------------------------------------------------------------------
def _hash_archivo(ruta):
    h = hashlib.sha256()
    with open(ruta, "rb") as f:
        for bloque in iter(lambda: f.read(1 << 20), b""):
            h.update(bloque)
    return h.hexdigest()


def _bitrate_original(ruta):
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=bit_rate",
             "-of", "default=noprint_wrappers=1:nokey=1", ruta],
            capture_output=True, text=True, timeout=30)
        return int(out.stdout.strip())
    except Exception:
        return None


def decodificar(ruta):
    """mp3 -> señal float32 mono a 16 kHz en [-1, 1]."""
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, "x.wav")
        r = subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-i", ruta, "-ac", "1",
             "-ar", str(SR), "-sample_fmt", "s16", wav],
            capture_output=True, text=True, timeout=120)
        if r.returncode != 0:
            raise ValueError("No se pudo decodificar el audio: " + r.stderr[:200])
        sr, x = wavfile.read(wav)
    return x.astype(np.float32) / 32768.0


# --------------------------------------------------------------------------
# Envolvente y detección de onsets
# --------------------------------------------------------------------------
def _envolvente(x):
    """RMS en ventanas de 25 ms con salto de 10 ms, tras pasa-banda de voz."""
    sos = butter(4, [100, 4000], btype="bandpass", fs=SR, output="sos")
    y = sosfiltfilt(sos, x)
    ventana, salto = int(0.025 * SR), int(0.010 * SR)
    n = 1 + max(0, (len(y) - ventana) // salto)
    env = np.empty(n, dtype=np.float32)
    for i in range(n):
        seg = y[i * salto:i * salto + ventana]
        env[i] = np.sqrt(np.mean(seg ** 2))
    # suavizado ~30 ms
    k = 3
    env = np.convolve(env, np.ones(k) / k, mode="same")
    return env, salto / SR


def _detectar(env, dt, dist_min_s):
    piso = np.percentile(env, 10)
    techo = np.percentile(env, 95)
    rango = techo - piso
    if rango <= 1e-6:
        return np.array([], dtype=int), piso, techo
    picos, _ = find_peaks(
        env,
        height=piso + 0.25 * rango,
        prominence=0.15 * rango,
        distance=max(1, int(dist_min_s / dt)),
    )
    return picos, piso, techo


def _snr_db(env, piso, techo):
    return float(20 * np.log10((techo + 1e-9) / (piso + 1e-9)))


# --------------------------------------------------------------------------
# Métricas
# --------------------------------------------------------------------------
def _cv(v):
    v = np.asarray(v, dtype=float)
    if len(v) < 2 or np.mean(v) == 0:
        return None
    return float(np.std(v) / np.mean(v))


def _metricas(picos, env, dt, cfg_c):
    t = picos * dt
    amp = env[picos]
    intervalos = np.diff(t)
    med = float(np.median(intervalos))
    dur = float(t[-1] - t[0]) if len(t) > 1 else 0.0

    # pausas largas
    largas = intervalos > cfg_c["pausa_factor"] * med
    t_pausa = float(np.sum(intervalos[largas] - med)) if largas.any() else 0.0

    # fatiga: primera vs segunda mitad (por tiempo)
    mitad = t[0] + dur / 2
    p1, p2 = t <= mitad, t > mitad
    fatiga_vel = fatiga_amp = None
    if p1.sum() >= 3 and p2.sum() >= 3:
        v1 = (p1.sum() - 1) / max(t[p1][-1] - t[p1][0], 1e-6)
        v2 = (p2.sum() - 1) / max(t[p2][-1] - t[p2][0], 1e-6)
        fatiga_vel = float((v1 - v2) / v1)                       # >0 = se enlentece
        a1, a2 = float(np.mean(amp[p1])), float(np.mean(amp[p2]))
        fatiga_amp = float((a1 - a2) / a1) if a1 > 0 else None   # >0 = pierde fuerza

    return {
        "n_silabas": int(len(picos)),
        "duracion_tramo_s": round(dur, 3),
        "sil_por_seg": round(1.0 / med, 3),
        "cv_intervalos": _redondear(_cv(intervalos)),
        "cv_amplitud": _redondear(_cv(amp)),
        "pausas_largas": int(largas.sum()),
        "frac_pausa": round(t_pausa / dur, 3) if dur > 0 else 0.0,
        "fatiga_vel": _redondear(fatiga_vel),
        "fatiga_amp": _redondear(fatiga_amp),
    }


def _redondear(v, n=3):
    return None if v is None else round(float(v), n)


# --------------------------------------------------------------------------
# Puntaje
# --------------------------------------------------------------------------
def _norm(x, mejor, peor):
    """100 si x <= mejor, 0 si x >= peor, lineal entre medio (menos es mejor)."""
    return float(np.clip(100.0 * (peor - x) / (peor - mejor), 0.0, 100.0))


def _parametros_modo(modo, n_ciclos):
    cfg = dict(CONFIG[modo])
    if modo == "c_n_ciclos":
        if not n_ciclos or n_ciclos < 3:
            raise ValueError("El modo c requiere n_ciclos >= 3")
        cfg["n_comodo"] = 3 * n_ciclos
        cfg["n_min"] = max(6, int(0.6 * 3 * n_ciclos))
    return cfg


def _penalizaciones(m, cfg, cfg_c):
    pen = {"pocas_silabas": 1.0, "velocidad": 1.0, "pausas": 1.0, "fatiga": 1.0}

    # pocas sílabas: interpola entre el mínimo y el número "cómodo"
    n, nmin, ncom = m["n_silabas"], cfg["n_min"], cfg["n_comodo"]
    if n < ncom:
        pen["pocas_silabas"] = 0.8 + 0.2 * (n - nmin) / max(ncom - nmin, 1)

    # velocidad: solo extremos, y solo los que el modo define
    v = m["sil_por_seg"]
    if cfg["vel_lenta"] and v < cfg["vel_lenta"]:
        pen["velocidad"] = max(0.7, v / cfg["vel_lenta"])
    elif cfg["vel_rapida"] and v > cfg["vel_rapida"]:
        pen["velocidad"] = max(0.7, cfg["vel_rapida"] / v)

    # pausas largas: proporcional al tiempo en pausa
    pen["pausas"] = max(0.7, 1.0 - m["frac_pausa"])

    # fatiga: solo si hay umbral para el modo y se supera
    umbral = cfg["fatiga_umbral"]
    if umbral is not None and m["fatiga_vel"] is not None:
        exceso = max(0.0, m["fatiga_vel"] - umbral)
        pen["fatiga"] = max(0.7, 1.0 - exceso)

    return {k: round(v, 3) for k, v in pen.items()}


def _puntuar(m, cfg, cfg_c):
    if m["cv_intervalos"] is None or m["cv_amplitud"] is None:
        return None, None, None
    temporal = _norm(m["cv_intervalos"], cfg["cv_int_mejor"], cfg["cv_int_peor"])
    amplitud = _norm(m["cv_amplitud"], cfg_c["cv_amp_mejor"], cfg_c["cv_amp_peor"])
    base = cfg_c["peso_temporal"] * temporal + cfg_c["peso_amplitud"] * amplitud
    pen = _penalizaciones(m, cfg, cfg_c)
    prod = max(cfg_c["piso_penalizaciones"], float(np.prod(list(pen.values()))))
    final = int(round(base * prod))
    return base, pen, final, temporal, amplitud


# --------------------------------------------------------------------------
# API principal
# --------------------------------------------------------------------------
def evaluar_senal(x, modo, n_ciclos=None, meta=None):
    """Evalúa una señal ya decodificada (float32 mono 16 kHz)."""
    if modo not in MODOS:
        raise ValueError(f"modo inválido: {modo}. Opciones: {MODOS}")
    cfg_c = CONFIG["comun"]
    cfg = _parametros_modo(modo, n_ciclos)

    registro = {
        "ejercicio": "silabas_pataka",
        "modo": modo,
        "parametros_consigna": {"n_ciclos": n_ciclos},
        "version_motor": VERSION_MOTOR,
        "version_umbrales": cfg["version_umbrales"],
        "decodificacion": {"sr": SR, **(meta or {})},
        "estado": None,
        "motivos_rechazo": [],
        "calidad": {},
        "metricas": None,
        "base": None,
        "penalizaciones": None,
        "puntaje": None,
        "confianza": "baja",   # techo mientras los umbrales no estén validados
        "etiqueta": "orientativo - umbrales sin validar",
    }

    motivos = []
    dur = len(x) / SR
    if dur < cfg_c["dur_min_s"]:
        motivos.append(f"audio muy corto ({dur:.1f} s)")
    if dur > cfg_c["dur_max_s"]:
        motivos.append(f"audio muy largo ({dur:.1f} s)")
    clip = float(np.mean(np.abs(x) > cfg_c["clip_umbral"]))
    if clip > cfg_c["clip_max_frac"]:
        motivos.append(f"saturación excesiva ({clip:.1%} de muestras)")

    env, dt = _envolvente(x)
    picos, piso, techo = _detectar(env, dt, cfg_c["dist_min_onsets_s"])
    snr = _snr_db(env, piso, techo)
    if snr < cfg_c["snr_min_db"]:
        motivos.append(f"relación señal/ruido estimada baja ({snr:.1f} dB)")
    if len(picos) < cfg["n_min"]:
        motivos.append(
            f"se detectaron {len(picos)} sílabas (mínimo {cfg['n_min']})")

    registro["calidad"] = {
        "duracion_s": round(dur, 2),
        "snr_est_db": round(snr, 1),
        "clipping_frac": round(clip, 4),
        "n_onsets": int(len(picos)),
        "aprobada": not motivos,
    }

    if motivos:
        registro["estado"] = "no_evaluable"
        registro["motivos_rechazo"] = motivos
        return registro

    m = _metricas(picos, env, dt, cfg_c)
    resultado = _puntuar(m, cfg, cfg_c)
    registro["metricas"] = m
    if resultado[0] is None:
        registro["estado"] = "no_evaluable"
        registro["motivos_rechazo"] = ["no se pudo calcular la regularidad"]
        return registro

    base, pen, final, temporal, amplitud = resultado
    registro["estado"] = "evaluado"
    registro["base"] = {"total": round(base, 1),
                        "regularidad_temporal": round(temporal, 1),
                        "regularidad_amplitud": round(amplitud, 1)}
    registro["penalizaciones"] = pen
    registro["puntaje"] = final
    return registro


def evaluar(ruta_mp3, modo, n_ciclos=None):
    """Evalúa un archivo de audio. Devuelve el registro completo."""
    if os.path.getsize(ruta_mp3) > CONFIG["comun"]["tam_max_mb"] * 1024 * 1024:
        return {"estado": "no_evaluable", "modo": modo,
                "motivos_rechazo": ["archivo demasiado grande"]}
    meta = {"hash_archivo": _hash_archivo(ruta_mp3),
            "bitrate_original": _bitrate_original(ruta_mp3)}
    try:
        x = decodificar(ruta_mp3)
    except ValueError as e:
        return {"estado": "no_evaluable", "modo": modo,
                "motivos_rechazo": [str(e)], "decodificacion": meta}
    return evaluar_senal(x, modo, n_ciclos, meta)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("uso: python evaluar_silabas.py audio.mp3 <a_comodo|b_rapido|c_n_ciclos> [n_ciclos]")
        sys.exit(1)
    nc = int(sys.argv[3]) if len(sys.argv) > 3 else None
    print(json.dumps(evaluar(sys.argv[1], sys.argv[2], nc),
                     indent=2, ensure_ascii=False))
