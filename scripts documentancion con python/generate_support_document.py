from pathlib import Path
import subprocess
import sys
import shutil

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
from docx.shared import Inches, Pt, RGBColor


PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = PROJECT_ROOT / "documentacion"
DOCX_PATH = OUTPUT_DIR / "Documento_Soporte_Final_Sitial.docx"

NAVY = "17324D"
TEAL = "3A9AA3"
LIGHT_TEAL = "EAF4F5"
CORAL = "E97868"
GRAY = "5F6B73"
LIGHT_GRAY = "F3F6F7"
WHITE = "FFFFFF"


DIAGRAMS = {
    "secuencia": """sequenceDiagram
    autonumber
    actor U as Usuario
    participant D as Dashboard.jsp
    participant PC as PlacesController
    participant GS as GoogleMapsService
    participant GAPI as Google Places API
    participant DB as MySQL

    U->>+D: Clic en el mapa (lat, lng)
    Note over D: Captura coordenadas y valida categoría
    D->>+PC: GET /api/places/nearby
    PC->>+GS: buscarCercanos(lat, lng, tipo, radio)
    GS->>+GAPI: POST Places:searchText
    GAPI-->>-GS: Lista de competidores
    GS-->>-PC: JSON estructurado
    PC-->>-D: HTTP 200 OK
    Note over D: Renderiza marcadores y calcula score
    D-->>U: Visualiza el análisis
    U->>+D: Confirma guardar análisis
    D->>+PC: POST /api/analisis
    PC->>+DB: Persiste mediante JPA/Hibernate
    DB-->>-PC: ID generado
    PC-->>-D: HTTP 201 Created
    D-->>-U: Confirmación visual""",
    "clases": """classDiagram
    direction TB
    class Usuario {
        +Long idUsuario
        +String email
        +String password
        +String fullName
        +Boolean isActive
    }
    class Analisis {
        +Long idAnalisis
        +String label
        +Double latitude
        +Double longitude
        +String businessType
        +Integer overallScore
        +String verdict
        +String metrics
    }
    class Capa {
        +Long idCapa
        +String nombre
        +String descripcion
        +String color
    }
    class Ubicacion {
        +Long idUbicacion
        +String nombre
        +String direccion
        +Double latitude
        +Double longitude
        +String categoria
    }
    class Competidor {
        +Long idCompetidor
        +String nombre
        +Double rating
        +Integer reviewCount
        +String threatLevel
    }
    class GenericDAO {
        +guardar(entity)
        +buscarPorId(id)
        +listarTodos()
        +eliminar(entity)
    }
    class UsuarioDAO
    class AnalisisDAO
    class CapaDAO
    class UbicacionDAO
    class GoogleMapsService {
        +buscarCercanos()
    }

    GenericDAO <|-- UsuarioDAO
    GenericDAO <|-- AnalisisDAO
    GenericDAO <|-- CapaDAO
    GenericDAO <|-- UbicacionDAO
    Usuario "1" --> "*" Analisis : posee
    Usuario "1" --> "*" Capa : crea
    Capa "1" --> "*" Ubicacion : contiene
    Analisis "1" --> "*" Competidor : detecta""",
    "entidad_relacion": """erDiagram
    USUARIOS ||--o{ ANALISIS : posee
    USUARIOS ||--o{ CAPAS : crea
    ANALISIS ||--o{ COMPETIDORES : detecta
    CAPAS ||--o{ UBICACIONES : contiene

    USUARIOS {
        bigint id_usuario PK
        varchar email UK
        varchar password
        varchar full_name
        boolean is_active
    }
    ANALISIS {
        bigint id_analisis PK
        bigint id_usuario FK
        varchar label
        double latitude
        double longitude
        varchar business_type
        int radius_meters
        int overall_score
        varchar verdict
        text metrics
    }
    CAPAS {
        bigint id_capa PK
        bigint id_usuario FK
        varchar nombre
        varchar descripcion
        varchar color
    }
    UBICACIONES {
        bigint id_ubicacion PK
        bigint id_capa FK
        varchar nombre
        varchar direccion
        double latitude
        double longitude
        varchar categoria
    }
    COMPETIDORES {
        bigint id_competidor PK
        bigint id_analisis FK
        varchar nombre
        varchar categoria
        int distancia_metros
        double rating
        int review_count
        varchar threat_level
    }""",
    "arquitectura": """flowchart LR
    A[Usuario] --> B[Interfaz JSP/JavaScript]
    B --> C[API REST Jakarta JAX-RS]
    C --> D[Servicios]
    D --> E[Google Places API]
    D --> F[DAO/JPA]
    F --> G[(MySQL)]
    C --> H[Mapas JavaScript API]""",
    "casos_uso": """flowchart TB
    U((Usuario autenticado))
    U --> A[Registrarse]
    U --> B[Iniciar sesión]
    U --> C[Seleccionar ubicación]
    C --> D[Consultar competidores]
    C --> E[Visualizar afluencia]
    C --> F[Generar score]
    F --> G[Guardar análisis]
    U --> H[Crear capa]
    H --> I[Agregar ubicaciones]
    U --> J[Consultar historial]""",
}


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}shd")
    if shd is None:
        from docx.oxml import OxmlElement
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}fill", fill)


def set_repeat_table_header(row):
    from docx.oxml import OxmlElement
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val", "true")
    tr_pr.append(tbl_header)


def set_table_borders(table, color="D7E0E3", size="6"):
    from docx.oxml import OxmlElement
    tbl_pr = table._tbl.tblPr
    borders = tbl_pr.find("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}tblBorders")
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tbl_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        element = borders.find(f"{{http://schemas.openxmlformats.org/wordprocessingml/2006/main}}{edge}")
        if element is None:
            element = OxmlElement(f"w:{edge}")
            borders.append(element)
        element.set("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val", "single")
        element.set("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}sz", size)
        element.set("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}color", color)


def add_field(paragraph, instruction):
    from docx.oxml import OxmlElement
    run = paragraph.add_run()
    fld_begin = OxmlElement("w:fldChar")
    fld_begin.set("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}fldCharType", "begin")
    instr = OxmlElement("w:instrText")
    instr.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    instr.text = instruction
    fld_end = OxmlElement("w:fldChar")
    fld_end.set("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}fldCharType", "end")
    run._r.append(fld_begin)
    run._r.append(instr)
    run._r.append(fld_end)


def add_heading(doc, text, level=1):
    p = doc.add_heading(text, level=level)
    p.style = doc.styles[f"Heading {level}"]
    return p


def add_bullets(doc, items, level=0):
    for item in items:
        p = doc.add_paragraph(item, style="List Bullet" if level == 0 else "List Bullet 2")
        p.paragraph_format.space_after = Pt(3)


def add_numbered(doc, items):
    for item in items:
        p = doc.add_paragraph(item, style="List Number")
        p.paragraph_format.space_after = Pt(4)


def add_caption(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(9)
    r.font.color.rgb = RGBColor.from_string(GRAY)
    return p


def add_callout(doc, title, text):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    set_cell_shading(cell, LIGHT_TEAL)
    cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    p = cell.paragraphs[0]
    r = p.add_run(title + ". ")
    r.bold = True
    r.font.color.rgb = RGBColor.from_string(NAVY)
    p.add_run(text)
    set_table_borders(table, TEAL)
    doc.add_paragraph()


def add_table(doc, headers, rows, widths=None):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = "Table Grid"
    set_table_borders(table)
    set_repeat_table_header(table.rows[0])
    for i, header in enumerate(headers):
        cell = table.rows[0].cells[i]
        set_cell_shading(cell, NAVY)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(header)
        r.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        r.font.size = Pt(9)
        if widths:
            cell.width = Inches(widths[i])
    for row_index, row in enumerate(rows):
        cells = table.add_row().cells
        for i, value in enumerate(row):
            if row_index % 2:
                set_cell_shading(cells[i], "F7F9FA")
            p = cells[i].paragraphs[0]
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(str(value))
            r.font.size = Pt(8.5)
            if widths:
                cells[i].width = Inches(widths[i])
    doc.add_paragraph()
    return table


def add_mermaid_image(doc, name, title, caption, width=6.7):
    image_path = OUTPUT_DIR / f"{name}.png"
    add_heading(doc, title, level=2)
    doc.add_picture(str(image_path), width=Inches(width))
    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_caption(doc, caption)
    code_heading = doc.add_paragraph()
    code_heading.paragraph_format.space_before = Pt(6)
    r = code_heading.add_run("Código Mermaid")
    r.bold = True
    r.font.color.rgb = RGBColor.from_string(TEAL)
    code = doc.add_table(rows=1, cols=1)
    code.style = "Table Grid"
    set_table_borders(code, "C9D5D8")
    set_cell_shading(code.cell(0, 0), "F7F9FA")
    p = code.cell(0, 0).paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run(DIAGRAMS[name])
    r.font.name = "Consolas"
    r.font.size = Pt(7.5)
    doc.add_paragraph()


def render_mermaid_diagrams():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    npx = shutil.which("npx.cmd") or shutil.which("npx")
    if not npx:
        raise RuntimeError("No se encontró npx/npx.cmd en el PATH del sistema.")
    for name, code in DIAGRAMS.items():
        mmd_path = OUTPUT_DIR / f"{name}.mmd"
        png_path = OUTPUT_DIR / f"{name}.png"
        mmd_path.write_text(code, encoding="utf-8")
        command = [
            npx, "--yes", "@mermaid-js/mermaid-cli",
            "-i", str(mmd_path),
            "-o", str(png_path),
            "-b", "white",
            "-s", "2",
        ]
        result = subprocess.run(command, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(
                "No fue posible renderizar Mermaid.\n"
                f"{result.stdout}\n{result.stderr}"
            )


def build_document():
    render_mermaid_diagrams()

    doc = Document()
    section = doc.sections[0]
    section.top_margin = Inches(0.75)
    section.bottom_margin = Inches(0.75)
    section.left_margin = Inches(0.85)
    section.right_margin = Inches(0.85)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Aptos"
    normal.font.size = Pt(10.5)
    normal.font.color.rgb = RGBColor.from_string("26343B")
    normal.paragraph_format.line_spacing = 1.15
    normal.paragraph_format.space_after = Pt(6)

    for level, size in ((1, 18), (2, 14), (3, 12)):
        style = styles[f"Heading {level}"]
        style.font.name = "Aptos Display"
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = RGBColor.from_string(NAVY)
        style.paragraph_format.keep_with_next = True
        style.paragraph_format.space_before = Pt(12 if level == 1 else 8)
        style.paragraph_format.space_after = Pt(6)

    for section in doc.sections:
        header = section.header
        p = header.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r = p.add_run("SITIAL  |  Documento técnico final")
        r.font.name = "Aptos"
        r.font.size = Pt(8)
        r.font.color.rgb = RGBColor.from_string(GRAY)
        footer = section.footer
        p = footer.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run("Universidad Ucompensar  •  ")
        r.font.size = Pt(8)
        r.font.color.rgb = RGBColor.from_string(GRAY)
        add_field(p, "PAGE")

    # Cover page
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(100)
    r = p.add_run("SITIAL")
    r.font.name = "Aptos Display"
    r.font.size = Pt(34)
    r.bold = True
    r.font.color.rgb = RGBColor.from_string(NAVY)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("Documento de soporte y entrega final")
    r.font.name = "Aptos Display"
    r.font.size = Pt(20)
    r.bold = True
    r.font.color.rgb = RGBColor.from_string(TEAL)

    doc.add_paragraph()
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("Aplicación de análisis geoespacial para evaluación de oportunidades comerciales")
    r.font.size = Pt(12)
    r.font.color.rgb = RGBColor.from_string(GRAY)

    doc.add_paragraph()
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("Entrega académica — Tercer momento")
    r.bold = True
    r.font.size = Pt(11)
    r.font.color.rgb = RGBColor.from_string(CORAL)

    doc.add_paragraph()
    table = doc.add_table(rows=5, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = "Table Grid"
    set_table_borders(table, "D9E2E5")
    labels = [
        ("Institución", "Universidad Ucompensar"),
        ("Asignatura", "[NOMBRE DE LA ASIGNATURA]"),
        ("Integrantes", "[NOMBRES COMPLETOS DEL EQUIPO]"),
        ("Docente", "[NOMBRE DEL DOCENTE]"),
        ("Fecha", "17 de noviembre de 2026"),
    ]
    for i, (label, value) in enumerate(labels):
        set_cell_shading(table.cell(i, 0), LIGHT_TEAL)
        table.cell(i, 0).width = Inches(1.6)
        table.cell(i, 1).width = Inches(4.5)
        p = table.cell(i, 0).paragraphs[0]
        r = p.add_run(label)
        r.bold = True
        r.font.color.rgb = RGBColor.from_string(NAVY)
        table.cell(i, 1).paragraphs[0].add_run(value)

    doc.add_page_break()

    add_heading(doc, "Control del documento", 1)
    add_table(doc,
        ["Versión", "Fecha", "Estado", "Descripción"],
        [
            ("1.0", "17/11/2026", "Final", "Documento consolidado para sustentación y entrega"),
            ("", "", "", "Los campos entre corchetes deben completarse antes de presentar"),
        ],
        widths=[0.9, 1.1, 1.2, 3.5])

    add_heading(doc, "Tabla de contenido", 1)
    p = doc.add_paragraph()
    add_field(p, 'TOC \\o "1-3" \\h \\z \\u')
    p = doc.add_paragraph(
        "Nota: en Microsoft Word, haga clic derecho sobre la tabla y seleccione "
        "\"Actualizar campo\" para mostrar los títulos y números de página."
    )
    p.runs[0].italic = True
    p.runs[0].font.size = Pt(9)
    p.runs[0].font.color.rgb = RGBColor.from_string(GRAY)
    doc.add_page_break()

    add_heading(doc, "1. Introducción", 1)
    doc.add_paragraph(
        "Sitial es una aplicación web diseñada para apoyar la evaluación preliminar de "
        "ubicaciones comerciales. El sistema integra un mapa interactivo, información de "
        "competidores obtenida a través de Google Places y reglas de análisis geoespacial "
        "para calcular una puntuación de idoneidad y mostrar el nivel de oportunidad o riesgo "
        "de una zona."
    )
    doc.add_paragraph(
        "La solución fue desarrollada como una aplicación Java/Jakarta EE con JSP, JavaScript "
        "y MySQL. Su propósito principal es reducir la subjetividad inicial de decisiones "
        "comerciales mediante visualización geográfica, comparación de establecimientos "
        "cercanos y almacenamiento de resultados para consultas posteriores."
    )
    add_callout(doc, "Resultado esperado", "Entregar una herramienta funcional que permita seleccionar un punto, consultar la competencia, visualizar afluencia y conservar los análisis realizados.")

    add_heading(doc, "2. Planteamiento del problema", 1)
    doc.add_paragraph(
        "Antes de instalar un establecimiento, emprendedores y empresas deben estimar la "
        "afluencia esperada, identificar competidores cercanos y considerar el costo de una "
        "inversión mal ubicada. Estas decisiones suelen basarse en visitas físicas dispersas, "
        "información limitada o herramientas que no integran datos visuales y históricos."
    )
    doc.add_paragraph(
        "Sitial responde a esta necesidad mediante una interfaz centralizada que relaciona "
        "coordenadas geográficas, categorías de negocio, radio de análisis y competencia "
        "identificada en tiempo real. El sistema permite analizar una ubicación, guardar sus "
        "métricas y organizar puntos de interés en capas personalizadas."
    )
    add_heading(doc, "Preguntas de investigación", 2)
    add_bullets(doc, [
        "¿Cómo representar de forma comprensible la idoneidad comercial de una ubicación?",
        "¿Qué datos permiten evaluar la intensidad competitiva alrededor de un punto?",
        "¿Cómo conservar y recuperar los análisis realizados por un usuario?",
    ])

    add_heading(doc, "3. Objetivos", 1)
    add_heading(doc, "3.1 Objetivo general", 2)
    doc.add_paragraph(
        "Desarrollar una aplicación web geoespacial que permita analizar ubicaciones "
        "comerciales, visualizar competidores y apoyar decisiones de inversión mediante "
        "puntuaciones y métricas almacenadas."
    )
    add_heading(doc, "3.2 Objetivos específicos", 2)
    add_numbered(doc, [
        "Implementar autenticación y administración de usuarios.",
        "Integrar Google Maps JavaScript API y Google Places API para representación geográfica y consulta de establecimientos.",
        "Diseñar análisis visual de afluencia, radio de influencia y competencia.",
        "Calcular y presentar una puntuación de idoneidad junto con su diagnóstico.",
        "Persistir análisis, capas y ubicaciones mediante JPA/Hibernate y MySQL.",
        "Validar los flujos principales y preparar la aplicación para su demostración.",
    ])

    add_heading(doc, "4. Alcance y delimitaciones", 1)
    add_heading(doc, "4.1 Alcance", 2)
    add_bullets(doc, [
        "Registro e inicio de sesión de usuarios.",
        "Selección de coordenadas por clic sobre el mapa o búsqueda de dirección.",
        "Consulta de establecimientos cercanos según categoría y radio.",
        "Visualización de marcadores, isócrona, zonas de afluencia y competencia.",
        "Cálculo y presentación de score, nivel de amenaza y métricas.",
        "Registro de análisis, creación de capas y administración de ubicaciones.",
    ])
    add_heading(doc, "4.2 Delimitaciones", 2)
    add_bullets(doc, [
        "El funcionamiento de Google Places depende de claves válidas y permisos configurados en Google Cloud.",
        "La disponibilidad de datos comerciales está sujeta a la cobertura de la API.",
        "La búsqueda de direcciones utiliza el servicio público de OpenStreetMap/Nominatim.",
        "La aplicación trabaja inicialmente para Bogotá y admite configuraciones adicionales.",
        "El score actual es una estimación de apoyo y no constituye una certificación financiera o inmobiliaria.",
        "El alcance no incluye facturación ni procesamiento de pagos reales.",
    ])

    add_heading(doc, "5. Diseño de software", 1)
    add_heading(doc, "5.1 Requerimientos funcionales", 2)
    add_table(doc,
        ["ID", "Requerimiento", "Prioridad", "Criterio de aceptación"],
        [
            ("RF-01", "Registrar y autenticar usuarios.", "Alta", "El usuario puede crear una cuenta e iniciar sesión."),
            ("RF-02", "Mostrar un mapa interactivo.", "Alta", "El mapa acepta clics y búsqueda de dirección."),
            ("RF-03", "Seleccionar categoría y radio.", "Alta", "Los parámetros modifican la consulta."),
            ("RF-04", "Consultar competidores cercanos.", "Alta", "La API devuelve establecimientos cercanos o un error explícito."),
            ("RF-05", "Visualizar marcadores y capas.", "Alta", "El dashboard muestra o oculta las capas solicitadas."),
            ("RF-06", "Calcular puntuación de idoneidad.", "Alta", "Se presenta score de 0 a 100 y diagnóstico."),
            ("RF-07", "Guardar un análisis.", "Media", "Se registra el resultado asociado al usuario."),
            ("RF-08", "Crear capas y ubicaciones.", "Media", "Las entidades quedan relacionadas y persistidas."),
            ("RF-09", "Consultar resultados previos.", "Media", "El usuario puede recuperar análisis e información asociada."),
        ],
        widths=[0.65, 2.6, 0.75, 2.7])

    add_heading(doc, "5.2 Requerimientos no funcionales", 2)
    add_table(doc,
        ["ID", "Atributo", "Especificación"],
        [
            ("RNF-01", "Usabilidad", "Interfaz clara, adaptable y orientada a tareas."),
            ("RNF-02", "Seguridad", "Claves externas fuera del código fuente y acceso por usuario."),
            ("RNF-03", "Disponibilidad", "Respuesta explícita ante fallos de servicios o base de datos."),
            ("RNF-04", "Rendimiento", "Consultas asíncronas y paginación limitada en el cliente."),
            ("RNF-05", "Compatibilidad", "Navegadores modernos y entorno Jakarta EE 11."),
            ("RNF-06", "Mantenibilidad", "Arquitectura por controladores, servicios y DAO."),
            ("RNF-07", "Persistencia", "MySQL con JPA/Hibernate."),
        ],
        widths=[0.75, 1.45, 4.5])

    add_heading(doc, "5.3 Casos de uso e historias de usuario", 2)
    add_mermaid_image(doc, "casos_uso", "Diagrama de casos de uso", "Figura 1. Relación principal entre usuario y funciones del sistema.")

    add_table(doc,
        ["Historia", "Aceptación"],
        [
            ("Como usuario, quiero registrarme para guardar mis evaluaciones.", "El sistema valida los datos y crea una cuenta activa."),
            ("Como usuario, quiero seleccionar una ubicación para analizar su entorno.", "El punto queda marcado y activa el radio de análisis."),
            ("Como usuario, quiero consultar competidores cercanos.", "Se muestran marcadores y datos relevantes de establecimientos."),
            ("Como usuario, quiero visualizar el score para decidir.", "Se presenta la puntuación y el diagnóstico asociado."),
            ("Como usuario, quiero organizar ubicaciones en capas.", "La capa contiene ubicaciones relacionadas con el usuario."),
        ],
        widths=[3.5, 3.2])

    add_heading(doc, "5.4 Diagramas de secuencia", 2)
    add_mermaid_image(doc, "secuencia", "Secuencia de análisis geoespacial", "Figura 2. Flujo desde la selección del mapa hasta la persistencia.")

    add_heading(doc, "5.5 Diagrama de clases", 2)
    add_mermaid_image(doc, "clases", "Modelo de clases", "Figura 3. Entidades, DAO y relación con GoogleMapsService.", width=6.9)

    add_heading(doc, "5.6 Modelo entidad–relación", 2)
    add_mermaid_image(doc, "entidad_relacion", "Modelo entidad–relación", "Figura 4. Esquema principal de MySQL.")

    add_heading(doc, "6. Arquitectura Back-End", 1)
    add_mermaid_image(doc, "arquitectura", "Arquitectura lógica", "Figura 5. Interacción entre presentación, API, servicios, persistencia y proveedores externos.")

    add_heading(doc, "6.1 Estructura por capas", 2)
    add_table(doc,
        ["Capa", "Componentes principales", "Responsabilidad"],
        [
            ("Presentación", "JSP y JavaScript", "Renderizado, interacción con el mapa y consumo de API."),
            ("Controladores", "PlacesController, AnalisisController y demás REST controllers", "Validar solicitudes y construir respuestas HTTP/JSON."),
            ("Servicios", "GoogleMapsService, AnalisisService, UsuarioService", "Orquestar reglas y operaciones de negocio."),
            ("Acceso a datos", "GenericDAO y DAO especializados", "Ejecutar operaciones JPA sobre las entidades."),
            ("Modelo", "Usuario, Analisis, Capa, Ubicacion y Competidor", "Representar la información y relaciones persistentes."),
            ("Persistencia", "MySQL + Hibernate", "Almacenamiento físico y generación de esquema."),
            ("Integración", "Google Maps/Places y Nominatim", "Geocodificación y consulta de establecimientos."),
        ],
        widths=[1.2, 2.5, 3.1])

    add_heading(doc, "6.2 API REST", 2)
    add_table(doc,
        ["Método", "Ruta", "Propósito"],
        [
            ("GET", "/api/places/nearby", "Consultar establecimientos cercanos."),
            ("GET", "/api/config/maps-key", "Obtener la clave pública de Google Maps."),
            ("POST", "/api/analisis", "Registrar un análisis."),
            ("GET", "/api/analisis", "Listar análisis."),
            ("GET", "/api/analisis/{id}", "Consultar un análisis específico."),
            ("PUT", "/api/analisis/{id}", "Actualizar un análisis."),
            ("DELETE", "/api/analisis/{id}", "Eliminar un análisis."),
        ],
        widths=[0.8, 2.4, 3.8])

    add_heading(doc, "6.3 Persistencia y configuración", 2)
    doc.add_paragraph(
        "La unidad de persistencia se configura como SitialPU y utiliza MySQL en "
        "localhost:3306, base sitial_db. Hibernate administra el esquema con "
        "hibernate.hbm2ddl.auto=update y utiliza la estrategia CamelCaseToUnderscores "
        "para mapear nombres Java a columnas SQL."
    )
    add_callout(doc, "Recomendación de seguridad", "Las credenciales de MySQL y las claves de Google deben administrarse como variables de entorno o secretos del servidor, y no deben incluirse en entregables.")

    add_heading(doc, "7. Metodología de desarrollo", 1)
    doc.add_paragraph(
        "La aplicación puede documentarse bajo un enfoque incremental. Cada iteración integra "
        "una capacidad visible del sistema: autenticación, mapa, consulta externa, cálculo "
        "de resultados y persistencia. Las pruebas se orientaron a la navegación principal, "
        "los estados de carga, la disponibilidad de APIs y el manejo de errores."
    )
    add_table(doc,
        ["Actividad", "Evidencia esperada"],
        [
            ("Análisis", "Requerimientos y restricciones identificados."),
            ("Diseño", "Diagramas, modelo de datos y arquitectura."),
            ("Implementación", "JSP, JavaScript, controladores, servicios y DAO."),
            ("Pruebas", "Flujos principales y respuestas ante errores."),
            ("Entrega", "WAR, código fuente y documento técnico."),
        ],
        widths=[1.6, 5.1])

    add_heading(doc, "8. Pruebas y validación", 1)
    add_table(doc,
        ["Caso", "Procedimiento", "Resultado esperado"],
        [
            ("Registro", "Completar el formulario con datos válidos.", "Cuenta creada y redirección correcta."),
            ("Inicio de sesión", "Usar credenciales existentes.", "Acceso al dashboard."),
            ("Carga del mapa", "Abrir dashboard con claves configuradas.", "Mapa visible centrado en Bogotá."),
            ("Selección", "Hacer clic sobre el mapa.", "Se actualizan coordenadas y radio."),
            ("Consulta externa", "Seleccionar categoría y ubicación.", "Competidores mostrados o error controlado."),
            ("Análisis", "Confirmar guardar el resultado.", "Registro creado con HTTP 201."),
            ("Capas", "Crear una capa y agregar ubicación.", "Datos persistidos y asociados."),
            ("Servicio no disponible", "Iniciar sin clave o base inaccesible.", "Mensaje explícito sin bloqueo de interfaz."),
        ],
        widths=[1.1, 3.0, 2.7])

    add_heading(doc, "9. Entregables finales", 1)
    add_bullets(doc, [
        "Aplicación web funcional y/o archivo WAR desplegable.",
        "Código fuente completo con estructura Maven.",
        "Documento técnico final en formato DOCX.",
        "Base de datos configurada o script de creación según el entorno.",
        "Presentación y demostración en vivo ante el docente.",
        "Claves de API configuradas únicamente en el entorno de ejecución.",
    ])

    add_heading(doc, "10. Conclusiones", 1)
    doc.add_paragraph(
        "Sitial integra tecnologías web y geoespaciales para apoyar la evaluación preliminar "
        "de una ubicación comercial. El uso de servicios externos permite incorporar datos "
        "actualizados, mientras que la persistencia con JPA conserva los resultados y facilita "
        "el análisis posterior."
    )
    doc.add_paragraph(
        "La arquitectura por capas facilita la mantenibilidad y separación de responsabilidades. "
        "Como mejoras futuras se recomienda incorporar autenticación robusta, control de roles, "
        "pruebas automatizadas, una API pública documentada y métricas de afluencia ampliadas."
    )

    add_heading(doc, "Referencias", 1)
    references = [
        "Google. (s.f.). Places API: Text search. https://developers.google.com/maps/documentation/places/web-service/text-search",
        "Google. (s.f.). Maps JavaScript API. https://developers.google.com/maps/documentation/javascript",
        "Hibernate. (s.f.). Hibernate ORM documentation. https://hibernate.org/orm/documentation/",
        "Jakarta EE. (s.f.). Jakarta EE 11. https://jakarta.ee/specifications/",
        "Mermaid. (s.f.). Mermaid documentation. https://mermaid.js.org/",
        "MySQL. (s.f.). MySQL 8.0 Reference Manual. https://dev.mysql.com/doc/refman/8.0/en/",
        "OpenStreetMap. (s.f.). Nominatim usage policy. https://operations.osmfoundation.org/policies/nominatim/",
    ]
    for ref in references:
        p = doc.add_paragraph(ref)
        p.paragraph_format.left_indent = Inches(0.25)
        p.paragraph_format.first_line_indent = Inches(-0.25)

    doc.save(DOCX_PATH)
    print(DOCX_PATH)


if __name__ == "__main__":
    try:
        build_document()
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        raise
