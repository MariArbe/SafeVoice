"""
apps/reports/transitions.py — Definición centralizada de estados y transiciones permitidas.
HU-08 — Actualizar estado.
"""

from typing import Dict, List


# ── Mapa de transiciones permitidas entre estados ──────────────────────────────
# Fuente de verdad única para transiciones válidas.
#
# Para permitir más transiciones en el futuro (por ejemplo, permitir cerrar directo
# desde 'en_revision' sin pasar por 'en_seguimiento'), simplemente añade el nuevo
# estado a la lista respectiva. Ejemplo:
#   "en_revision": ["en_seguimiento", "cerrado"],
TRANSICIONES_PERMITIDAS: Dict[str, List[str]] = {
    "nuevo": ["en_revision"],
    "en_revision": ["en_seguimiento"],
    "en_seguimiento": ["cerrado"],
    "cerrado": [],  # Estado terminal: no admite más cambios
}


# ── Mapeo de compatibilidad hacia atrás para estados preexistentes ─────────────
ALIAS_ESTADOS: Dict[str, str] = {
    "pendiente": "nuevo",
    "atendido": "en_seguimiento",
    "descartado": "cerrado",
}


def normalizar_estado(estado: str | None) -> str:
    """
    Normaliza el identificador de estado:
    - Convierte a minúsculas y elimina espacios.
    - Resuelve nombres de estados antiguos (ej: 'PENDIENTE' -> 'nuevo').
    """
    if not estado:
        return ""
    limpio = str(estado).strip().lower()
    return ALIAS_ESTADOS.get(limpio, limpio)


def validar_transicion(estado_actual: str, nuevo_estado: str) -> None:
    """
    Valida si una transición de estado es válida según las reglas de negocio.

    Raises:
        ValueError: Si el nuevo estado es igual al actual, si el estado actual es desconocido,
                    o si la transición entre ambos estados no está permitida.
    """
    actual = normalizar_estado(estado_actual)
    nuevo = normalizar_estado(nuevo_estado)

    if actual == nuevo:
        raise ValueError(
            f"El nuevo estado ('{nuevo}') es igual al estado actual. No se realizaron cambios."
        )

    permitidos = TRANSICIONES_PERMITIDAS.get(actual)
    if permitidos is None:
        raise ValueError(f"El estado actual '{actual}' no es un estado válido del sistema.")

    if not permitidos:
        raise ValueError(
            f"El reporte se encuentra en estado '{actual}' (terminal) y no admite más transiciones."
        )

    if nuevo not in permitidos:
        permitidos_str = ", ".join(f"'{p}'" for p in permitidos)
        raise ValueError(
            f"Transición no permitida: no se puede cambiar de '{actual}' a '{nuevo}'. "
            f"Estados permitidos desde '{actual}': [{permitidos_str}]."
        )
