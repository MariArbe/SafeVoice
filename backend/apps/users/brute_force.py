"""
apps/users/brute_force.py — Control de intentos fallidos de login y protección anti fuerza bruta.

Implementación de seguridad:
  1. Límite de 5 intentos fallidos consecutivos por cuenta (email) e IP.
  2. Bloqueo temporal de 5 minutos (300 segundos) al alcanzar el límite.
  3. Notificación al usuario con los intentos restantes antes del bloqueo.
  4. Reseteo automático del contador tras un inicio de sesión exitoso.
  5. Respuestas conformes al estándar HTTP (401 para fallos previos y 429 Too Many Requests para bloqueo).
"""

import logging
import time
from typing import Tuple

from django.core.cache import cache
from rest_framework.exceptions import AuthenticationFailed, Throttled

logger = logging.getLogger(__name__)

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_SECONDS = 300  # 5 minutos


def get_client_ip(request) -> str:
    """Extrae la IP real del cliente considerando cabeceras de proxy inverso."""
    if not request:
        return "127.0.0.1"
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.META.get("REMOTE_ADDR", "127.0.0.1")
    return ip


def get_cache_keys(email: str, ip: str) -> Tuple[str, str]:
    """Genera llaves únicas de cache para el contador de intentos y el bloqueo."""
    clean_email = (email or "").strip().lower()
    clean_ip = (ip or "").strip()
    attempts_key = f"bf_attempts_{clean_email}_{clean_ip}"
    lockout_key = f"bf_lockout_{clean_email}_{clean_ip}"
    return attempts_key, lockout_key


def check_login_lockout(email: str, ip: str) -> None:
    """
    Verifica si la combinación email/IP se encuentra en estado de bloqueo temporal.
    Si está bloqueada, calcula el tiempo restante y lanza Throttled (HTTP 429).
    """
    attempts_key, lockout_key = get_cache_keys(email, ip)
    locked_until = cache.get(lockout_key)

    if locked_until:
        remaining = int(locked_until - time.time())
        if remaining > 0:
            minutes = max(1, (remaining + 59) // 60)
            logger.warning(
                "Petición de login rechazada por bloqueo anti fuerza bruta para '%s' desde %s. Faltan %s s.",
                email,
                ip,
                remaining,
            )
            raise Throttled(
                wait=remaining,
                detail=(
                    f"Demasiados intentos fallidos. Por motivos de seguridad, el acceso ha sido "
                    f"bloqueado temporalmente. Intente nuevamente en {minutes} minuto{'s' if minutes > 1 else ''}."
                ),
            )
        else:
            # El tiempo de bloqueo ya expiró
            cache.delete(lockout_key)
            cache.delete(attempts_key)


def record_failed_login(email: str, ip: str) -> None:
    """
    Incrementa el contador de intentos fallidos.
    Si alcanza MAX_FAILED_ATTEMPTS, establece el bloqueo temporal y lanza Throttled (HTTP 429).
    De lo contrario, lanza AuthenticationFailed (HTTP 401) indicando intentos restantes.
    """
    attempts_key, lockout_key = get_cache_keys(email, ip)
    attempts = cache.get(attempts_key, 0) + 1
    cache.set(attempts_key, attempts, timeout=LOCKOUT_DURATION_SECONDS)

    if attempts >= MAX_FAILED_ATTEMPTS:
        lock_until = time.time() + LOCKOUT_DURATION_SECONDS
        cache.set(lockout_key, lock_until, timeout=LOCKOUT_DURATION_SECONDS)
        logger.warning(
            "Cuenta bloqueada temporalmente por fuerza bruta: '%s' desde IP %s tras %s intentos fallidos.",
            email,
            ip,
            attempts,
        )
        raise Throttled(
            wait=LOCKOUT_DURATION_SECONDS,
            detail=(
                "Demasiados intentos fallidos. Por motivos de seguridad, su acceso ha sido bloqueado "
                "temporalmente por 5 minutos."
            ),
        )

    remaining = MAX_FAILED_ATTEMPTS - attempts
    logger.warning(
        "Login fallido para '%s' desde IP %s. Intento %s de %s (restan %s).",
        email,
        ip,
        attempts,
        MAX_FAILED_ATTEMPTS,
        remaining,
    )
    raise AuthenticationFailed(
        f"Correo electrónico o contraseña incorrectos. Intentos restantes antes de bloqueo temporal: {remaining}."
    )


def reset_failed_logins(email: str, ip: str) -> None:
    """Elimina las llaves de intentos fallidos tras una autenticación exitosa."""
    attempts_key, lockout_key = get_cache_keys(email, ip)
    cache.delete(attempts_key)
    cache.delete(lockout_key)
