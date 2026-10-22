# SISicoplem

Migración de SICOPLEM (Laravel) a **Angular 22 + NestJS 11 + Sequelize + MySQL/MariaDB + Docker**, con el
estilo y formato de SIPresupuesto. Conserva la base de datos actual (mismas tablas y columnas).

## Módulos (equivalentes al sistema Laravel)

| Antes (Laravel)                         | Ahora                                      |
|-----------------------------------------|--------------------------------------------|
| `/licitaciones`, `/adquisiciones`, `/arrendamiento`, `/licitaciones/:id` (landing pública) | mismas rutas en Angular, datos de `GET /publico/*` |
| `/login`, logout                        | `/login` (correo + contraseña, JWT, límite de 5 intentos/min) |
| `/registro` (CRUD de procedimientos)    | `/registro`, `/registro/crear`, `/registro/:id/editar` |
| `/documentos` (programas y catálogo)    | `/documentos`, `/documentos/crear`          |
| `/cambiopassword`                       | `/cambio-password` (cierra sesión al guardar) |
| Manual de usuario                       | `public/assets/archivos/manual-sicoplem.pdf` |

Reglas por tipo de procedimiento (`licitacions.id`): 1, 2, 6 → 4 fases; 4 → 2 fases; 3, 5, 7, 8 → solo documento.
Contrato solo en tipos 1–4; varios archivos se comprimen en un `.zip`.

## Arrancar (desarrollo)

```bash
cp backend/.env.example backend/.env      # captura DB_* y JWT_SECRET
docker compose up                          # frontend :4220, backend :3065, MariaDB :3316
```

## Base de datos actual

* Pon el volcado `.sql` de producción en `backend/database-dump/` antes del primer `docker compose up`
  (o apunta `DB_HOST` de `backend/.env` al servidor existente y quita el servicio `db`).
* `npm run migrate` es idempotente: solo crea las tablas que falten, nunca toca las existentes.
* `npm run seed` agrega roles / tipos de procedimiento faltantes. Para una base vacía:
  `SEED_ADMIN_PASSWORD=... npm run seed` crea un administrador.
* Las contraseñas de Laravel (`$2y$`) siguen funcionando.

## Archivos subidos

Copia `storage/app/public/Documentos` y `storage/app/public/Convocatorias` de Laravel a
`backend/uploads/`. La base guarda rutas relativas (`Documentos/<uuid>/<archivo>`) y el backend las sirve en `/uploads/...`.

## Producción

`docker compose -f docker-compose.prod.yml up -d --build` (frontend nginx en :8094 con `BASE_HREF=/sicoplem/`;
ajusta el proxy de nginx para `/api` → backend y `/uploads`).
