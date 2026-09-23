"""
Middleware para la protección del anonimato (HU-05).
"""

SENSITIVE_HEADERS = {
    "REMOTE_ADDR",
    "HTTP_X_FORWARDED_FOR",
    "HTTP_USER_AGENT",
    "HTTP_REFERER",
}


class AnonymizeRequestMiddleware:
    """
    Middleware que intercepta todas las peticiones y limpia las cabeceras
    identificables antes de que lleguen a las vistas.

    Asegura que ni siquiera en memoria se mantenga la IP o el User-Agent
    para endpoints de reportes o en toda la aplicación.

    Metadatos descartados:
    - REMOTE_ADDR (IP del cliente)
    - HTTP_X_FORWARDED_FOR (IPs enviadas por proxys)
    - HTTP_USER_AGENT (Información del navegador y sistema operativo)
    - HTTP_REFERER (URL desde donde se originó la petición)
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Modificar el request.META en sitio para eliminar la información identificable.
        for key in SENSITIVE_HEADERS:
            if key in request.META:
                request.META[key] = "[ENMASCARADO]"

        response = self.get_response(request)
        return response
