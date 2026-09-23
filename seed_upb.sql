USE safevoice_db;
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET NOCOUNT ON;

-- 1. Limpiar datos previos si existen para evitar conflictos de claves únicas
DELETE FROM seguimiento_casos;
DELETE FROM reportes_tipos_agresion;
DELETE FROM reportes;
DELETE FROM tipos_agresion;
DELETE FROM usuarios WHERE email IN ('directivo@upb.edu.co', 'orientacion@upb.edu.co');
DELETE FROM instituciones WHERE codigo_dane = '105001001234' OR nombre LIKE '%UPB%';
GO

-- 2. Insertar Institución: UPB
INSERT INTO instituciones (nombre, codigo_dane, ciudad, fecha_creacion, is_active)
VALUES (
    N'Universidad Pontificia Bolivariana - Colegio UPB',
    '105001001801',
    N'Medellín',
    SYSDATETIMEOFFSET(),
    1
);

DECLARE @InstId BIGINT = SCOPE_IDENTITY();

-- 3. Insertar Usuarios para la UPB (Password: SafeVoice2026!)
DECLARE @PassHash NVARCHAR(255) = N'pbkdf2_sha256$600000$safevoicesalt123$Z6N38RECSeyNDFSH/HUgRQ5DC0duMs87xh5gE7F0xGs=';

INSERT INTO usuarios (
    password, is_superuser, username, first_name, last_name,
    is_staff, is_active, date_joined, email, rol, institucion_id
)
VALUES 
(
    @PassHash, 0, N'directivo_upb', N'Carlos', N'Restrepo',
    1, 1, SYSDATETIMEOFFSET(), N'directivo@upb.edu.co', N'DIRECTIVO', @InstId
),
(
    @PassHash, 0, N'orientadora_upb', N'Elena', N'Gómez',
    1, 1, SYSDATETIMEOFFSET(), N'orientacion@upb.edu.co', N'ORIENTADOR', @InstId
);

DECLARE @OrientadorId BIGINT = (SELECT id FROM usuarios WHERE email = 'orientacion@upb.edu.co');

-- 4. Insertar Catálogo de Tipos de Agresión
INSERT INTO tipos_agresion (codigo, nombre, descripcion)
VALUES 
(N'VERBAL', N'Agresión Verbal', N'Insultos, apodos denigrantes, burlas ofensivas o amenazas verbales reiteradas.'),
(N'FISICA', N'Agresión Física', N'Golpes, empujones, zancadillas o daño deliberado a pertenencias personales.'),
(N'CIBERBULLYING', N'Ciberacoso / Digital', N'Hostigamiento en redes sociales, difusión de memes denigrantes, stickers o exclusión digital.'),
(N'EXCLUSION', N'Exclusión Social', N'Aislamiento deliberado, ley del hielo o propagación de rumores difamatorios.'),
(N'PSICOLOGICA', N'Intimidación Psicológica', N'Chantaje, amenazas veladas, manipulación y hostigamiento emocional.');

DECLARE @TipoVerbal BIGINT = (SELECT id FROM tipos_agresion WHERE codigo = 'VERBAL');
DECLARE @TipoFisica BIGINT = (SELECT id FROM tipos_agresion WHERE codigo = 'FISICA');
DECLARE @TipoCiber BIGINT = (SELECT id FROM tipos_agresion WHERE codigo = 'CIBERBULLYING');
DECLARE @TipoExclusion BIGINT = (SELECT id FROM tipos_agresion WHERE codigo = 'EXCLUSION');
DECLARE @TipoPsicologica BIGINT = (SELECT id FROM tipos_agresion WHERE codigo = 'PSICOLOGICA');

-- 5. Insertar Reportes de Prueba vinculados a la UPB
-- Reporte 1: Agresión verbal y exclusión en patio
INSERT INTO reportes (
    codigo_seguimiento, ubicacion, frecuencia, grado_victima,
    involucrados_tipo, involucrados_grado, descripcion, evidencia_url,
    nivel_riesgo_predicho, nivel_riesgo_confirmado, estado,
    acepta_revelar_identidad, nombre_contacto_victima, medio_contacto_victima,
    fecha_creacion, fecha_actualizacion, institucion_id
)
VALUES (
    'a1b2c3d4e5f67890123456789abcdef0', N'PATIO_DESCANSO', N'SEMANAS', N'8° Básico',
    N'GRUPO', N'MISMO_GRADO',
    N'Durante los descansos en el patio principal, varios estudiantes acorralan y se burlan sistemáticamente de un compañero, escondiéndole su morral y pertenencias.',
    NULL, N'ALTO', N'ALTO', N'EN_SEGUIMIENTO',
    0, NULL, NULL,
    SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET(), @InstId
);

DECLARE @Reporte1Id BIGINT = SCOPE_IDENTITY();

-- Relacionar tipos de agresión con Reporte 1
INSERT INTO reportes_tipos_agresion (reporte_id, tipoagresion_id)
VALUES (@Reporte1Id, @TipoVerbal), (@Reporte1Id, @TipoExclusion);

-- Bitácora de seguimiento para Reporte 1
INSERT INTO seguimiento_casos (
    estado_anterior, estado_nuevo, observaciones, fecha_atencion, orientador_id, reporte_id
)
VALUES (
    N'NUEVO', N'EN_SEGUIMIENTO',
    N'Se activó ruta de convivencia escolar UPB. Se citó a orientación para entrevista de valoración y acompañamiento.',
    SYSDATETIMEOFFSET(), @OrientadorId, @Reporte1Id
);

-- Reporte 2: Ciberacoso grave (revelación voluntaria de identidad)
INSERT INTO reportes (
    codigo_seguimiento, ubicacion, frecuencia, grado_victima,
    involucrados_tipo, involucrados_grado, descripcion, evidencia_url,
    nivel_riesgo_predicho, nivel_riesgo_confirmado, estado,
    acepta_revelar_identidad, nombre_contacto_victima, medio_contacto_victima,
    fecha_creacion, fecha_actualizacion, institucion_id
)
VALUES (
    'b2c3d4e5f6a7890123456789abcdef01', N'INTERNET', N'DIARIO', N'10° Medio',
    N'INDIVIDUAL', N'OTRO_GRADO',
    N'Creación y difusión de stickers ofensivos y difamatorios en grupos de WhatsApp escolares con burlas hacia una alumna.',
    N'https://storage.safevoice.internal/evidencias/upb/captura_wa_01.png',
    N'CRITICO', N'CRITICO', N'NUEVO',
    1, N'Estudiante Acompañada', N'estudiante.upb@upb.edu.co',
    SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET(), @InstId
);

DECLARE @Reporte2Id BIGINT = SCOPE_IDENTITY();

INSERT INTO reportes_tipos_agresion (reporte_id, tipoagresion_id)
VALUES (@Reporte2Id, @TipoCiber), (@Reporte2Id, @TipoPsicologica);

-- Reporte 3: Agresión física reciente
INSERT INTO reportes (
    codigo_seguimiento, ubicacion, frecuencia, grado_victima,
    involucrados_tipo, involucrados_grado, descripcion, evidencia_url,
    nivel_riesgo_predicho, nivel_riesgo_confirmado, estado,
    acepta_revelar_identidad, nombre_contacto_victima, medio_contacto_victima,
    fecha_creacion, fecha_actualizacion, institucion_id
)
VALUES (
    'c3d4e5f6a7b890123456789abcdef012', N'PASILLOS', N'PRIMERA_VEZ', N'6° Básico',
    N'INDIVIDUAL', N'MISMO_SALON',
    N'Empujones y amenazas directas en el pasillo hacia el salón de clase tras una discusión.',
    NULL, N'MEDIO', NULL, N'NUEVO',
    0, NULL, NULL,
    SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET(), @InstId
);

DECLARE @Reporte3Id BIGINT = SCOPE_IDENTITY();

INSERT INTO reportes_tipos_agresion (reporte_id, tipoagresion_id)
VALUES (@Reporte3Id, @TipoFisica), (@Reporte3Id, @TipoVerbal);

PRINT 'Datos de prueba de la UPB insertados correctamente.';
GO
