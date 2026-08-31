#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    # El módulo de settings por defecto es local; puede sobreescribirse
    # con la variable de entorno DJANGO_SETTINGS_MODULE.
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "No se pudo importar Django. Asegúrate de que esté instalado y "
            "de que el entorno virtual esté activado. "
            "Consulta el README.md para instrucciones de configuración."
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
