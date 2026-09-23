# Criterios de Clasificación de Riesgo - Modelo de IA

Este documento detalla la rúbrica estructurada que el modelo de Machine Learning de SafeVoice utiliza para clasificar el nivel de riesgo de un reporte. Da cumplimiento al requerimiento de la **HU-12 (Clasificación de Riesgo)**.

Esta matriz no solo guía la predicción probabilística del modelo (NLP), sino que estandariza la forma en que los orientadores escolares evalúan la urgencia de los incidentes, alineándose con las directrices de convivencia escolar (como la Ley 1620 en Colombia).

---

## 🟢 1. Nivel de Riesgo: BAJO

**Descripción General (Criterio):** 
Situaciones esporádicas de conflicto, roces menores o faltas leves a las normas de convivencia que no generan daño físico ni un impacto psicológico profundo. Suelen ser eventos de primera vez originados por impulsividad o bromas pesadas. (Equivalente a *Situaciones Tipo I*).

**Variables Características:**
*   **Frecuencia:** `PRIMERA_VEZ`
*   **Involucrados:** `INDIVIDUAL` (1 a 1).
*   **Tipo de Agresión:** Verbal o Psicológica/Social (leve).

**Ejemplos Reales (Insumo para el modelo):**
> *"Hoy un compañero me escondió la cartuchera en el descanso y se burló de mí."*
> *"Me pusieron un apodo feo hoy en el salón y todos se rieron."*
> *"No me quisieron incluir en el grupo de trabajo de sociales a propósito."*

---

## 🟡 2. Nivel de Riesgo: MEDIO

**Descripción General (Criterio):**
Comportamientos de acoso o exclusión que ya muestran un patrón de **recurrencia** y **sistematicidad**. Existe un desbalance de poder y un impacto emocional evidente en la víctima, así como posibles daños materiales. No hay agresiones físicas severas, pero el ambiente escolar ya es hostil para el estudiante.

**Variables Características:**
*   **Frecuencia:** `SEMANAS` o `MESES`.
*   **Involucrados:** Puede ser `INDIVIDUAL` (con mucha asimetría de poder) o en `GRUPO`.
*   **Tipo de Agresión:** Psicológica/Social, Daño Material, Verbal continuo.

**Ejemplos Reales (Insumo para el modelo):**
> *"Llevan varias semanas riéndose de mis zapatos y mi ropa. Ya no quiero salir al descanso para no encontrármelos."*
> *"Me tiran papeles y basura en el salón casi todos los días por la espalda."*
> *"Llevan un mes ignorándome completamente, es como si fuera invisible para todo el salón."*

---

## 🔴 3. Nivel de Riesgo: ALTO

**Descripción General (Criterio):**
Casos consolidados de acoso escolar (Bullying/Ciberbullying) que incluyen agresiones físicas directas, humillación pública masiva o extorsiones menores. Se evidencia un riesgo real para la salud física o emocional de la víctima, requiriendo intervención pedagógica y disciplinaria inmediata. (Equivalente a *Situaciones Tipo II*).

**Variables Características:**
*   **Frecuencia:** `SEMANAS` o `MESES`.
*   **Involucrados:** Usualmente en `GRUPO`.
*   **Tipo de Agresión:** Físico, Ciberbullying severo.

**Ejemplos Reales (Insumo para el modelo):**
> *"Me agarraron entre varios a la salida y me pegaron patadas. Tengo moretones en las piernas."*
> *"Crearon una cuenta falsa en Instagram solo para subir fotos mías humillándome y diciendo mentiras para que todos me odien."*
> *"Me amenazaron con pegarme a la salida si no les daba la plata del almuerzo."*

---

## 🚨 4. Nivel de Riesgo: CRÍTICO

**Descripción General (Criterio):**
Situaciones de emergencia máxima que constituyen presuntos **delitos**. Implican amenaza directa a la vida, integridad personal, libertad u ocurrencia de violencia sexual. Requieren activación de protocolos de emergencia y remisión a autoridades competentes (ICBF, Policía de Infancia). (Equivalente a *Situaciones Tipo III*).

**Variables Características:**
*   **Gatillos deterministas (Palabras clave):** *arma, cuchillo, navaja, matar, muerte, suicidio, violar, abuso, tocar*.
*   *(En estos casos, el sistema omite las variables de frecuencia, ya que un solo evento de esta magnitud es inmediatamente Crítico).*

**Ejemplos Reales (Insumo para el modelo):**
> *"Me amenazaron con una navaja en el baño y me dijeron que si abría la boca me mataban."*
> *"Ya no aguanto más esto, llevan meses haciéndome la vida imposible, he pensado en suicidarme porque nadie me ayuda."*
> *"Un estudiante de once me acorraló y me tocó las partes íntimas a la fuerza en el pasillo."*
> *"Un tipo me mandó fotos de un arma por WhatsApp y dice que me va a matar a mí y a mi familia."*
