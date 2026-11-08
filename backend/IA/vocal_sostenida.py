"""
Niura - motor de evaluación de vocal sostenida ("aaaa").

Misma estructura de registro que evaluar_silabas.py: compuerta de calidad,
métricas crudas, penalizaciones multiplicativas, puntaje 0-100 y confianza.
Si el audio no pasa la compuerta, devuelve estado "no_evaluable" (no un 0).

Qué puntúa (base):   estabilidad del tono (desvío en semitonos) y
                     estabilidad del volumen (desvío en dB dentro de la grabación).
Qué penaliza:        duración muy corta y cortes de voz (multiplican el base).
Qué solo se reporta: duración, F0 mediana, derivas de tono y volumen.
                     No dependen de la escala del paciente ni del celular,
                     o no se pueden interpretar sin línea base.

IMPORTANTE: los umbrales de CONFIG son valores de ARRANQUE míos, SIN validar
(ni clínicamente ni contra literatura). Recalibrar con adultos sanos grabados
en mp3 de celular antes de interpretar el puntaje. Es una herramienta de
seguimiento, no un diagnóstico.

Dependencias: numpy, scipy, ffmpeg y, para el tono, parselmouth (Praat).
Si parselmouth no está instalado se usa un tracker de respaldo por
autocorrelación (menos fiable) y el registro lo declara en "tracker_f0".
Todo se procesa localmente.
"""

import json
import os
import sys

import numpy as np
from scipy.signal import butter, medfilt, sosfiltfilt

# Se reutiliza la decodificación y utilidades del módulo de sílabas
from evaluar_silabas import SR, _bitrate_original, _hash_archivo, _norm, decodificar

VERSION_MOTOR = "vocal-0.1"
DT = 0.010  # paso de análisis (10 ms)

# --------------------------------------------------------------------------
# CONFIGURACIÓN (TODO SIN VALIDAR)
# --------------------------------------------------------------------------
CONFIG = {
    "version_umbrales": "v0-sin-validar-vocal",
    # compuerta
    "dur_min_audio_s": 2.0,
    "dur_max_audio_s": 60.0,
    "tam_max_mb": 20,
    "clip_umbral": 0.98,
    "clip_max_frac": 0.01,
    "snr_min_db": 10.0,
    "tramo_min_s": 1.6,          # tramo sonoro continuo mínimo (antes de recortar)
    "frac_outliers_max": 0.15,   # más => tracker de tono poco fiable
    # análisis
    "pitch_floor_hz": 75,
    "pitch_ceiling_hz": 500,
    "recorte_borde_s": 0.30,     # se descarta ataque y cierre de la vocal
    "puente_s": 0.10,            # huecos sonoros más cortos se consideran continuos
    "run_min_s": 0.10,           # tramos sonoros más cortos se consideran ruido
    "run_significativo_s": 0.30, # tramos que cuentan para contar cortes
    "outlier_st": 6.0,           # |desvío| mayor a esto (semitonos) = error del tracker
    # puntaje base
    "peso_tono": 0.6,
    "peso_volumen": 0.4,
    "sd_f0_mejor_st": 0.25, "sd_f0_peor_st": 1.5,     # semitonos
    "sd_int_mejor_db": 1.0, "sd_int_peor_db": 5.0,    # dB
    # penalizaciones
    "dur_comoda_s": 3.0,         # por debajo, penalización suave
    "pen_por_corte": 0.1,
    "pen_min_individual": 0.7,
    "piso_penalizaciones": 0.5,
}


# --------------------------------------------------------------------------
# Tono (F0) e intensidad
# --------------------------------------------------------------------------
def _f0_parselmouth(x, cfg):
    import parselmouth  # noqa: import local para permitir el respaldo
    snd = parselmouth.Sound(x.astype(np.float64), sampling_frequency=SR)
    p = snd.to_pitch_ac(time_step=DT, pitch_floor=cfg["pitch_floor_hz"],
                        pitch_ceiling=cfg["pitch_ceiling_hz"])
    return p.xs(), p.selected_array["frequency"], "parselmouth"


def _f0_autocorr(x, cfg):
    """Tracker de respaldo (numpy). Menos robusto que Praat."""
    n_ven, salto = int(0.050 * SR), int(DT * SR)
    lag_min = int(SR / cfg["pitch_ceiling_hz"])
    lag_max = int(SR / cfg["pitch_floor_hz"])
    n = 1 + max(0, (len(x) - n_ven) // salto)
    rms = np.array([np.sqrt(np.mean(x[i * salto:i * salto + n_ven] ** 2))
                    for i in range(n)])
    umbral = 0.1 * np.percentile(rms, 95)
    f0 = np.zeros(n)
    for i in range(n):
        if rms[i] < umbral:
            continue
        seg = x[i * salto:i * salto + n_ven]
        seg = seg - np.mean(seg)
        r = np.correlate(seg, seg, mode="full")[len(seg) - 1:]
        if r[0] <= 0:
            continue
        r = r / r[0]
        rango = r[lag_min:lag_max + 1]
        loc = np.where((rango[1:-1] > rango[:-2]) & (rango[1:-1] >= rango[2:]))[0] + 1
        if len(loc) == 0:
            continue
        mx = rango[loc].max()
        if mx < 0.5:
            continue
        lag = loc[np.argmax(rango[loc] >= 0.9 * mx)] + lag_min  # primer pico fuerte
        a, b, c = r[lag - 1], r[lag], r[lag + 1]
        den = a - 2 * b + c
        corr = 0.5 * (a - c) / den if den != 0 else 0.0
        f0[i] = SR / (lag + corr)
    tiempos = (np.arange(n) * salto + n_ven / 2) / SR
    return tiempos, f0, "autocorr_numpy"


def _f0(x, cfg):
    try:
        return _f0_parselmouth(x, cfg)
    except ImportError:
        return _f0_autocorr(x, cfg)


def _intensidad_db(x, tiempos):
    """Intensidad en dB (RMS, 40 ms) interpolada a los tiempos del tono."""
    sos = butter(2, 60, btype="highpass", fs=SR, output="sos")
    y = sosfiltfilt(sos, x)
    centros = (tiempos * SR).astype(int)
    m = int(0.020 * SR)
    rms = np.array([
        np.sqrt(np.mean(y[max(0, c - m):c + m] ** 2) + 1e-12) for c in centros])
    db = 20 * np.log10(rms + 1e-9)
    return np.convolve(db, np.ones(5) / 5, mode="same")  # suavizado ~50 ms


# --------------------------------------------------------------------------
# Tramos sonoros
# --------------------------------------------------------------------------
def _runs(mask):
    d = np.diff(np.concatenate(([0], mask.astype(int), [0])))
    return list(zip(np.where(d == 1)[0], np.where(d == -1)[0]))  # [ini, fin)


def _unir(runs, max_hueco):
    if not runs:
        return []
    out = [list(runs[0])]
    for ini, fin in runs[1:]:
        if ini - out[-1][1] <= max_hueco:
            out[-1][1] = fin
        else:
            out.append([ini, fin])
    return [tuple(r) for r in out]


def _pendiente(y, dt):
    if len(y) < 3:
        return None
    t = np.arange(len(y)) * dt
    return float(np.polyfit(t, y, 1)[0])


def _r(v, n=3):
    return None if v is None else round(float(v), n)


# --------------------------------------------------------------------------
# API principal
# --------------------------------------------------------------------------
def evaluar_senal(x, meta=None):
    """Evalúa una señal ya decodificada (float32 mono 16 kHz)."""
    cfg = CONFIG
    reg = {
        "ejercicio": "vocal_sostenida",
        "modo": None,
        "version_motor": VERSION_MOTOR,
        "version_umbrales": cfg["version_umbrales"],
        "decodificacion": {"sr": SR, **(meta or {})},
        "estado": None,
        "motivos_rechazo": [],
        "avisos": [],
        "calidad": {},
        "metricas": None,
        "base": None,
        "penalizaciones": None,
        "puntaje": None,
        "confianza": "baja",   # techo mientras los umbrales no estén validados
        "etiqueta": "orientativo - umbrales sin validar",
    }

    def rechazar(*motivos):
        reg["estado"] = "no_evaluable"
        reg["motivos_rechazo"] = list(motivos)
        return reg

    dur = len(x) / SR
    clip = float(np.mean(np.abs(x) > cfg["clip_umbral"]))
    reg["calidad"] = {"duracion_audio_s": round(dur, 2),
                      "clipping_frac": round(clip, 4)}
    motivos = []
    if dur < cfg["dur_min_audio_s"]:
        motivos.append(f"audio muy corto ({dur:.1f} s)")
    if dur > cfg["dur_max_audio_s"]:
        motivos.append(f"audio muy largo ({dur:.1f} s)")
    if clip > cfg["clip_max_frac"]:
        motivos.append(f"saturación excesiva ({clip:.1%} de muestras)")
    if motivos:
        reg["calidad"]["aprobada"] = False
        return rechazar(*motivos)

    # --- tono e intensidad -------------------------------------------------
    tiempos, f0, tracker = _f0(x, cfg)
    reg["calidad"]["tracker_f0"] = tracker
    if tracker != "parselmouth":
        reg["avisos"].append("tracker de respaldo (instalar parselmouth para mayor fiabilidad)")
    db = _intensidad_db(x, tiempos)
    voz = f0 > 0

    # --- tramos sonoros ----------------------------------------------------
    n_run_min = int(cfg["run_min_s"] / DT)
    runs = [r for r in _runs(voz) if r[1] - r[0] >= n_run_min]
    voz = np.zeros_like(voz)
    for ini, fin in runs:
        voz[ini:fin] = True
    runs_u = _unir(runs, int(cfg["puente_s"] / DT))
    if not runs_u:
        reg["calidad"]["aprobada"] = False
        return rechazar("no se detectó voz sostenida")

    ini_m, fin_m = max(runs_u, key=lambda r: r[1] - r[0])
    dur_main = (fin_m - ini_m) * DT

    # SNR estimada: frames con voz vs. frames sin voz (si hay suficientes)
    sin_voz = ~voz
    snr = None
    if sin_voz.sum() * DT >= 0.3:
        snr = float(np.median(db[voz]) - np.median(db[sin_voz]))
        reg["calidad"]["snr_est_db"] = round(snr, 1)
    else:
        reg["calidad"]["snr_est_db"] = None
        reg["avisos"].append("sin silencio en la grabación: no se pudo estimar la SNR")

    motivos = []
    if snr is not None and snr < cfg["snr_min_db"]:
        motivos.append(f"relación señal/ruido estimada baja ({snr:.1f} dB)")
    if dur_main < cfg["tramo_min_s"]:
        motivos.append(
            f"tramo sonoro continuo muy corto ({dur_main:.1f} s; mínimo {cfg['tramo_min_s']} s)")

    # --- tramo útil (se descarta ataque y cierre) --------------------------
    rec = int(cfg["recorte_borde_s"] / DT)
    ini_u, fin_u = ini_m + rec, fin_m - rec
    util = np.zeros_like(voz)
    util[max(ini_u, 0):max(fin_u, 0)] = True
    sel = util & voz
    f_util = f0[sel]
    if not motivos and len(f_util) * DT < 1.0:
        motivos.append("tramo útil insuficiente tras recortar ataque y cierre")

    # --- estabilidad de tono ----------------------------------------------
    if not motivos:
        f_filt = medfilt(f_util, 5)
        med_f0 = float(np.median(f_filt))
        st = 12 * np.log2(f_filt / med_f0)
        outl = np.abs(st) > cfg["outlier_st"]
        frac_out = float(np.mean(outl))
        reg["calidad"]["frac_outliers_f0"] = round(frac_out, 3)
        if frac_out > cfg["frac_outliers_max"]:
            motivos.append(
                f"tracker de tono poco fiable ({frac_out:.0%} de saltos > {cfg['outlier_st']:.0f} st)")

    reg["calidad"]["aprobada"] = not motivos
    if motivos:
        return rechazar(*motivos)

    sd_f0 = float(np.std(st[~outl]))
    db_util = db[ini_u:fin_u]
    sd_int = float(np.std(db_util))

    # --- cortes de voz -----------------------------------------------------
    n_sig = int(cfg["run_significativo_s"] / DT)
    sig = [r for r in runs_u if r[1] - r[0] >= n_sig]
    cortes = max(0, len(sig) - 1)
    span = (sig[-1][1] - sig[0][0]) if sig else (fin_m - ini_m)
    inicio_span = sig[0][0] if sig else ini_m
    frac_sonora = float(voz[inicio_span:inicio_span + span].mean())

    m = {
        "duracion_tramo_s": round(dur_main, 2),
        "frac_sonora": round(frac_sonora, 3),
        "cortes_voz": int(cortes),
        "f0_mediana_hz": round(med_f0, 1),            # solo informativo
        "sd_f0_st": round(sd_f0, 3),
        "sd_intensidad_db": round(sd_int, 3),
        "deriva_f0_st_s": _r(_pendiente(st, DT)),     # solo informativo
        "deriva_intensidad_db_s": _r(_pendiente(db_util, DT)),  # solo informativo
    }

    # --- puntaje ----------------------------------------------------------
    s_tono = _norm(sd_f0, cfg["sd_f0_mejor_st"], cfg["sd_f0_peor_st"])
    s_vol = _norm(sd_int, cfg["sd_int_mejor_db"], cfg["sd_int_peor_db"])
    base = cfg["peso_tono"] * s_tono + cfg["peso_volumen"] * s_vol

    pen = {"duracion_corta": 1.0, "cortes": 1.0}
    if dur_main < cfg["dur_comoda_s"]:
        pen["duracion_corta"] = 0.8 + 0.2 * (dur_main - cfg["tramo_min_s"]) / (
            cfg["dur_comoda_s"] - cfg["tramo_min_s"])
    pen["cortes"] = max(cfg["pen_min_individual"], 1.0 - cfg["pen_por_corte"] * cortes)
    pen = {k: round(float(np.clip(v, cfg["pen_min_individual"], 1.0)), 3)
           for k, v in pen.items()}
    prod = max(cfg["piso_penalizaciones"], float(np.prod(list(pen.values()))))

    reg["estado"] = "evaluado"
    reg["metricas"] = m
    reg["base"] = {"total": round(base, 1), "estabilidad_tono": round(s_tono, 1),
                   "estabilidad_volumen": round(s_vol, 1)}
    reg["penalizaciones"] = pen
    reg["puntaje"] = int(round(base * prod))
    return reg


def evaluar(ruta_audio):
    """Evalúa un archivo de audio (mp3, wav...). Devuelve el registro completo."""
    if os.path.getsize(ruta_audio) > CONFIG["tam_max_mb"] * 1024 * 1024:
        return {"estado": "no_evaluable", "ejercicio": "vocal_sostenida",
                "motivos_rechazo": ["archivo demasiado grande"]}
    meta = {"hash_archivo": _hash_archivo(ruta_audio),
            "bitrate_original": _bitrate_original(ruta_audio)}
    try:
        x = decodificar(ruta_audio)
    except ValueError as e:
        return {"estado": "no_evaluable", "ejercicio": "vocal_sostenida",
                "motivos_rechazo": [str(e)], "decodificacion": meta}
    return evaluar_senal(x, meta)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("uso: python vocal_sostenida.py audio.mp3")
        sys.exit(1)
    print(json.dumps(evaluar(sys.argv[1]), indent=2, ensure_ascii=False))
