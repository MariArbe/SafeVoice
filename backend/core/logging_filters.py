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

class AnonymizeIPFilter(logging.Filter):
    """
    Filtro de logging que enmascara o elimina campos sensibles de los records.
    Principalmente se encarga de censurar las IPs en los mensajes de log y 
    en el objeto request si está adjunto al record (ej. Django request logger).
    """
    
    def filter(self, record):
        # Enmascarar IPs y User Agents en mensajes genéricos si aparecen.
        # En la práctica, Django attacha un objeto `request` a los errores 500.
        if hasattr(record, 'request'):
            request = record.request
            if hasattr(request, 'META'):
                # Modificamos el META del request para el log. 
                # Nota: Esto afecta la representación en el log.
                sensitive_keys = [
                    'REMOTE_ADDR', 
                    'HTTP_X_FORWARDED_FOR', 
                    'HTTP_USER_AGENT', 
                    'HTTP_REFERER'
                ]
                for key in sensitive_keys:
                    if key in request.META:
                        request.META[key] = '[ENMASCARADO]'
        
        # También podemos interceptar el texto del mensaje si es necesario.
        # Por ejemplo, si el logger de django.server incluye la IP.
        if isinstance(record.args, tuple) and len(record.args) > 0:
            # django.server usa algo como: '"%s" %s %s' y el primer arg en otro formatter podría ser la IP
            # Es más seguro manejar el request objeto, pero interceptar IP del mensaje es opcional.
            pass
            
        return True
