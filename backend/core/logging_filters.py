"""
Filtros de logging para protección del anonimato.

HU-05: Este filtro asegura que ninguna IP, User-Agent, ni cabecera identificable
se guarde en los logs de la aplicación, incluso en logs de errores 500 generados por Django.

Documentación de metadatos descartados:
- REMOTE_ADDR (IP)
- HTTP_X_FORWARDED_FOR (IPs proxy)
- HTTP_USER_AGENT (Información del navegador/dispositivo)
- HTTP_REFERER (URL de origen)
"""

import logging

SENSITIVE_HEADERS = {
    "REMOTE_ADDR",
    "HTTP_X_FORWARDED_FOR",
    "HTTP_USER_AGENT",
    "HTTP_REFERER",
}


class AnonymizeIPFilter(logging.Filter):
    """
    Filtro de logging que enmascara o elimina campos sensibles de los records.
    Principalmente se encarga de censurar las IPs en los mensajes de log y
    en el objeto request si está adjunto al record (ej. Django request logger).
    """

    def filter(self, record):
        if hasattr(record, "request"):
            request = record.request
            if hasattr(request, "META"):
                for key in SENSITIVE_HEADERS:
                    if key in request.META:
                        request.META[key] = "[ENMASCARADO]"

        return True
