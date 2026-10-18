"""
apps/reports/recommendations.py — Catálogo y servicio generador de sugerencias
de intervención pedagógica y protocolos de convivencia escolar (HU-15).

Fundamentado en la Ley 1620 de 2013 (Colombia) y el Decreto 1965 de 2013 sobre
el Sistema Nacional de Convivencia Escolar y Formación para los Derechos Humanos,
la Educación para la Sexualidad y la Prevención y Mitigación de la Violencia Escolar.
"""

from typing import Any, Dict, List
import logging

logger = logging.getLogger(__name__)

# ── Catálogo por Nivel de Riesgo (Situaciones Tipo I, II y III de la Ley 1620) ───

CATALOGO_RIESGO: Dict[str, Dict[str, Any]] = {
    "CRITICO": {
        "tipo_situacion": "Situación Tipo III (Presuntos Delitos / Riesgo Vital / Violencia Severa)",
        "urgencia": "Inmediata (< 2 horas)",
        "color": "rose",
        "nivel": "CRITICO",
        "protocolo_principal": "Activación de Ruta de Atención Integral en Salud, Protección y Justicia",
        "acciones_clave": [
            "Brindar atención médica de urgencias o primeros auxilios psicológicos si hay afectación física, heridas o ideación suicida.",
            "Garantizar la protección física y contención emocional inmediata del estudiante en un espacio seguro y confidencial.",
            "Notificar de inmediato a Rectoría y citar con carácter urgente a padres o acudientes de las partes por separado.",
            "Efectuar la remisión obligatoria e inmediata a autoridades competentes: Policía de Infancia y Adolescencia (123), ICBF (141) o Fiscalía.",
            "Convocar sesión extraordinaria del Comité Escolar de Convivencia y registrar el caso en el aplicativo oficial SIUCE dentro de las 48 horas.",
        ],
        "lineas_ayuda": [
            {"nombre": "Policía de Infancia y Adolescencia / Emergencias Nacional", "contacto": "123"},
            {"nombre": "Línea 141 ICBF (Protección de Niñas, Niños y Adolescentes)", "contacto": "141"},
            {"nombre": "Línea 106 (Salud Mental y Prevención del Suicidio)", "contacto": "106"},
            {"nombre": "Línea 155 (Orientación a Mujeres Víctimas de Violencia)", "contacto": "155"},
        ],
    },
    "ALTO": {
        "tipo_situacion": "Situación Tipo II (Acoso Escolar Sistemático / Daño Físico o Psicológico)",
        "urgencia": "Alta (< 24 horas hábiles)",
        "color": "orange",
        "nivel": "ALTO",
        "protocolo_principal": "Protocolo de Intervención Tipo II - Contención, Protección Activa y Comité de Convivencia",
        "acciones_clave": [
            "Garantizar medidas cautelares de protección para evitar coincidencias de las partes en recesos, baños o trabajos grupales.",
            "Citar de forma individual a los padres o acudientes de la víctima y de los agresores para informar y formalizar acuerdos por escrito.",
            "Brindar espacio de escucha individual y acompañamiento socioemocional inmediato desde Orientación Escolar.",
            "Remitir el caso al Comité Escolar de Convivencia para estructurar el plan de acción pedagógico y compromisos de no repetición.",
            "Establecer monitoreo semanal documentado del clima en el aula y de la seguridad del estudiante reportante.",
        ],
        "lineas_ayuda": [
            {"nombre": "Línea 106 (Acompañamiento Psicológico Escolar)", "contacto": "106"},
            {"nombre": "Comité Escolar de Convivencia", "contacto": "Orientación Escolar / Rectoría"},
            {"nombre": "Comisaría de Familia Local", "contacto": "Inspección de Convivencia"},
        ],
    },
    "MEDIO": {
        "tipo_situacion": "Situación Tipo I Reiterada (Frecuencia Continua / Hostigamiento Incipiente)",
        "urgencia": "Media (< 48 horas)",
        "color": "yellow",
        "nivel": "MEDIO",
        "protocolo_principal": "Estrategia Pedagógica Formativa y Mediación Asistida",
        "acciones_clave": [
            "Realizar entrevistas diagnósticas individuales con cada estudiante para clarificar la dinámica relacional sin revictimizar.",
            "Establecer acuerdos restaurativos claros y compromisos firmados de buen trato y respeto mutuo.",
            "Involucrar al docente titular o director de grupo en la supervisión preventiva durante clases y descansos.",
            "Desarrollar talleres grupales en el aula sobre empatía, prevención del acoso y resolución asertiva de conflictos.",
            "Realizar seguimiento quincenal con el estudiante reportante para verificar el cese definitivo de la conducta.",
        ],
        "lineas_ayuda": [
            {"nombre": "Orientación Escolar y Docencia Titular", "contacto": "Equipo de Convivencia"},
            {"nombre": "Línea Amiga Pedagógica", "contacto": "106"},
        ],
    },
    "BAJO": {
        "tipo_situacion": "Situación Tipo I (Conflictos Esporádicos / Roce Convivencial Menor)",
        "urgencia": "Normal (< 72 horas)",
        "color": "emerald",
        "nivel": "BAJO",
        "protocolo_principal": "Mediación Escolar y Diálogo Restaurativo",
        "acciones_clave": [
            "Facilitar un espacio pedagógico de diálogo constructivo guiado por el docente de grupo u orientador.",
            "Fomentar el reconocimiento del impacto de los actos y acordar compromisos voluntarios de respeto y armonía.",
            "Monitoreo pedagógico discreto en el salón de clases durante las siguientes dos semanas.",
            "Reforzar pautas de convivencia positiva en las horas de dirección de grupo.",
        ],
        "lineas_ayuda": [
            {"nombre": "Docente Director de Grupo", "contacto": "Aula de Clases"},
        ],
    },
}

# ── Catálogo de Medidas Específicas por Tipo de Agresión ───────────────────────

RECOMENDACIONES_POR_TIPO: Dict[str, Dict[str, Any]] = {
    "CIBERACOSO": {
        "titulo": "Protocolo para Ciberacoso y Convivencia Digital",
        "icono": "🌐",
        "pautas": [
            "Instruir a la víctima y a su familia para NO eliminar mensajes, capturas o audios (preservar evidencia con fecha, hora y perfiles).",
            "Solicitar formalmente la eliminación o bloqueo del contenido abusivo dentro de la plataforma digital o red social.",
            "Realizar taller de ciudadanía digital y consecuencias del hostigamiento virtual con el grupo escolar involucrado.",
            "Si involucra difusión de material íntimo de menores sin consentimiento, activar de inmediato ruta con CAI Virtual de la Policía.",
        ],
    },
    "FISICA": {
        "titulo": "Protocolo ante Agresión Física",
        "icono": "⚠️",
        "pautas": [
            "Remitir inmediatamente a valoración por enfermería escolar o centro de salud y registrar el parte de lesiones.",
            "Garantizar la separación física estricta entre las partes en descansos, cambios de clase y actividades recreativas.",
            "Intensificar la supervisión docente en áreas críticas detectadas (patios, pasillos y salidas).",
        ],
    },
    "VERBAL": {
        "titulo": "Protocolo ante Agresión Verbal (Insultos, Burlas o Apodos)",
        "icono": "🗣️",
        "pautas": [
            "Intervención docente directa para desnaturalizar el uso de apodos o burlas normalizadas en el salón.",
            "Fortalecer la postura de los compañeros observadores para que no celebren ni repliquen agresiones verbales.",
            "Construir un acuerdo grupal de aula sobre lenguaje respetuoso y comunicación asertiva.",
        ],
    },
    "SOCIAL": {
        "titulo": "Protocolo ante Exclusión Social y Aislamiento",
        "icono": "👥",
        "pautas": [
            "Reorganizar las dinámicas de conformación de equipos de trabajo pedagógico para garantizar la inclusión activa.",
            "Asignar un 'estudiante tutor' o grupo de acogida que acompañe a la víctima durante los descansos escolares.",
            "Desarrollar actividades de integración comunitaria enfocadas en valorar la diversidad y pertenencia grupal.",
        ],
    },
    "MATERIAL": {
        "titulo": "Protocolo ante Daño Material, Hurto o Extorsión",
        "icono": "🎒",
        "pautas": [
            "Acordar mecanismos pedagógicos de restitución o reparación del material afectado entre las familias.",
            "Verificar que no existan cobros intimidatorios continuos ni exigencias de dinero para ingresar a ciertas áreas del colegio.",
        ],
    },
}


def _detectar_claves_tipo_agresion(reporte) -> List[str]:
    """
    Identifica las claves normalizadas de agresión presentes en el reporte.
    Analiza tanto la relación ManyToMany `tipos_agresion` como el texto descriptivo.
    """
    claves_encontradas = set()

    # 1. Analizar tipos_agresion asociados
    try:
        tipos_relacionados = reporte.tipos_agresion.all()
        for t in tipos_relacionados:
            nombre = (t.nombre or "").lower()
            codigo = (getattr(t, "codigo", "") or "").lower()
            if any(k in nombre or k in codigo for k in ["ciber", "digital", "redes", "virtual", "internet"]):
                claves_encontradas.add("CIBERACOSO")
            if any(k in nombre or k in codigo for k in ["físic", "fisic", "golp", "empuj"]):
                claves_encontradas.add("FISICA")
            if any(k in nombre or k in codigo for k in ["verbal", "insult", "apod", "grit"]):
                claves_encontradas.add("VERBAL")
            if any(k in nombre or k in codigo for k in ["exclus", "social", "chisme", "ignor"]):
                claves_encontradas.add("SOCIAL")
            if any(k in nombre or k in codigo for k in ["material", "daño", "roba", "quit", "escond"]):
                claves_encontradas.add("MATERIAL")
    except Exception as e:
        logger.debug("No se pudieron consultar tipos_agresion relacionados: %s", e)

    # 2. Analizar ubicación o descripción para complementar
    desc = ((reporte.descripcion or "") + " " + (reporte.ubicacion or "")).lower()
    if any(k in desc for k in ["whatsapp", "instagram", "tiktok", "redes", "facebook", "foto", "celular", "internet"]):
        claves_encontradas.add("CIBERACOSO")
    if any(k in desc for k in ["pegar", "pegó", "golpe", "patada", "empuj", "moretón", "moreton"]):
        claves_encontradas.add("FISICA")
    if any(k in desc for k in ["apodo", "insult", "grito", "burla", "reírse"]):
        claves_encontradas.add("VERBAL")
    if any(k in desc for k in ["ignoran", "excluy", "chisme", "nadie me habla", "solo"]):
        claves_encontradas.add("SOCIAL")
    if any(k in desc for k in ["plata", "dinero", "cartuchera", "dañaron", "escondieron", "cuaderno"]):
        claves_encontradas.add("MATERIAL")

    # Si no detectó nada específico, agregar verbal por defecto
    if not claves_encontradas:
        claves_encontradas.add("VERBAL")

    return list(claves_encontradas)


def generar_recomendaciones_reporte(reporte) -> Dict[str, Any]:
    """
    Genera el paquete estructurado de sugerencias de intervención y protocolos
    según la clasificación de riesgo (HU-12) y las características del caso (HU-15).
    """
    # Determinar nivel de riesgo efectivo (confirmado tiene prioridad sobre predicho)
    nivel = (
        getattr(reporte, "nivel_riesgo_confirmado", None)
        or getattr(reporte, "nivel_riesgo_predicho", None)
        or "MEDIO"
    ).upper()

    if nivel not in CATALOGO_RIESGO:
        nivel = "MEDIO"

    info_nivel = CATALOGO_RIESGO[nivel]
    claves_tipos = _detectar_claves_tipo_agresion(reporte)

    recomendaciones_especificas = []
    for clave in claves_tipos:
        if clave in RECOMENDACIONES_POR_TIPO:
            item = RECOMENDACIONES_POR_TIPO[clave]
            recomendaciones_especificas.append({
                "clave": clave,
                "titulo": item["titulo"],
                "icono": item["icono"],
                "pautas": item["pautas"],
            })

    return {
        "reporte_id": getattr(reporte, "id", None),
        "codigo_seguimiento": str(getattr(reporte, "codigo_seguimiento", "")),
        "nivel_riesgo": nivel,
        "tipo_situacion": info_nivel["tipo_situacion"],
        "urgencia": info_nivel["urgencia"],
        "color": info_nivel["color"],
        "protocolo_principal": info_nivel["protocolo_principal"],
        "acciones_clave": info_nivel["acciones_clave"],
        "recomendaciones_especificas": recomendaciones_especificas,
        "lineas_ayuda": info_nivel.get("lineas_ayuda", []),
    }
