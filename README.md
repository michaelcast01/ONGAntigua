
## Objetivo

Centralizar la administracion de beneficiarios, colaboradores, ciudades, regiones y entregas de ayuda en una sola plataforma.

## Alcance funcional

- Registro de beneficiarios.
- Clasificacion por ciudad y tipo de poblacion.
- Gestion de colaboradores y cargos.
- Catalogo de tipos de ayuda.
- Registro historico de entregas de ayuda.
- Consultas por region, ciudad, colaborador y beneficiario.

## Modelo de datos principal

- `region`: catalogo geografico principal.
- `ciudad`: ciudades asociadas a una region.
- `tipo_poblacion`: clasificacion poblacional del beneficiario.
- `beneficiario`: personas que reciben apoyo.
- `cargo`: roles operativos de los colaboradores.
- `colaborador`: personal que participa en el proceso de entrega.
- `tipo_ayuda`: clases de ayuda entregada.
- `entrega_ayuda`: historial de entregas realizadas.
- `nombres_base` y `apellidos_base`: tablas auxiliares para datos base.

## Estructura base

```text
AYUDAS_SOCIALES_APP/
├── README.md
├── backend/
│   └── README.md
├── frontend/
│   └── README.md
└── database/
    └── ayudas_sociales_schema.sql
```

## Stack propuesto

- Frontend: Vue 3 + Vite
- Backend: Node.js + Express
- Base de datos: MariaDB 10.4+
- Autenticacion sugerida: JWT

## Estado actual

El proyecto ya incluye una primera version funcional de:

- Script SQL de base de datos con carga masiva.
- Backend Express con rutas principales.
- Frontend Vue con login y dashboard.

## Modulos implementados

- `POST /api/auth/login`
- `GET /api/health`
- `GET /api/dashboard/summary`
- `GET /api/catalogos/regiones`
- `GET /api/catalogos/ciudades`
- `GET /api/catalogos/tipos-poblacion`
- `GET /api/catalogos/tipos-ayuda`
- `GET /api/catalogos/cargos`
- CRUD de `beneficiarios`
- CRUD de `colaboradores`
- CRUD de `entregas`

## Instalacion de la base de datos

1. Crear o conectarse a una instancia MariaDB.
2. Ejecutar el script `database/ayudas_sociales_schema.sql`.

Ejemplo:

```bash
mysql -u root -p < database/ayudas_sociales_schema.sql
```

El script crea:

- La base de datos `ayudas_sociales`.
- Todas las tablas principales.
- Claves primarias, foraneas e indices basicos.
- Catalogos iniciales.
- Un cargue masivo alineado con el volumen del dump recibido.
- `1200` beneficiarios de prueba.
- `1202` registros de `entrega_ayuda`.

## Flujo general del aplicativo

1. El operador registra o consulta un beneficiario.
2. El sistema identifica ciudad, region y tipo de poblacion.
3. Un colaborador registra la entrega de ayuda.
4. La entrega queda asociada al beneficiario, al colaborador, a la ciudad y al tipo de ayuda.
5. El sistema permite generar seguimiento y consultas historicas.

## Ejecucion del proyecto

1. Copiar `.env.example` a `.env` y ajustar credenciales.
2. Importar `database/ayudas_sociales_schema.sql` en MariaDB.
3. Instalar dependencias en la raiz y en `frontend/`.
4. Ejecutar el proyecto desde la raiz.

Comandos:

```bash
npm install
npm --prefix frontend install
npm run dev
```

Servicios esperados:

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

## Credenciales iniciales

- Usuario: `admin`
- Contrasena: `admin123`

Estas credenciales se pueden cambiar desde el archivo `.env`.

## Endpoints sugeridos para una API futura

- `POST /api/auth/login`
- `GET /api/beneficiarios`
- `POST /api/beneficiarios`
- `GET /api/colaboradores`
- `GET /api/catalogos/ciudades`
- `GET /api/catalogos/tipos-ayuda`
- `GET /api/entregas`
- `POST /api/entregas`
- `GET /api/reportes/entregas-por-ciudad`

## Observaciones

- El volcado recibido incluye referencias a `nombres_base` y `apellidos_base`, pero no trae su definicion completa. En este proyecto se crearon versiones minimas funcionales para conservar consistencia.
- El archivo SQL incluido deja listo el esquema principal y genera un volumen grande de datos para pruebas funcionales y reportes.
- El cargue SQL genera `1200` beneficiarios y `1202` entregas con la misma estructura del dump compartido, para dejar la aplicacion lista para pruebas desde el primer arranque.
