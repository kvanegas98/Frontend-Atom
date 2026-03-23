# Frontend Challenge — ATOM

Aplicación de gestión de tareas desarrollada como prueba técnica para **ATOM**. Implementa autenticación por email, CRUD completo de tareas y una arquitectura Angular moderna con cobertura de tests unitarios.

---

## Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Angular | 21 (standalone) | Framework principal |
| Angular Material | 21 | Componentes UI (Material 3) |
| SCSS | — | Estilos con variables y mixins globales |
| TypeScript | 5.9 | Tipado estricto en todo el proyecto |
| RxJS | 7.8 | Manejo de asincronía y streams |
| Vitest | 4.1 | Runner de tests unitarios |

---

## Requisitos previos

- Node.js **18+**
- npm **9+**

---

## Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd Frontend-Atom

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo
npm start
# → http://localhost:4200
```

```bash
# Build de producción
npm run build
# → carpeta dist/

# Ejecutar todos los tests
npm test
```

---

## CI/CD

El proyecto usa **GitHub Actions** con dos workflows:

| Workflow | Archivo | Cuándo se ejecuta |
|---|---|---|
| **CI** | `.github/workflows/ci.yml` | Todo push a `main`/`develop` y PRs |
| **Deploy** | `.github/workflows/deploy.yml` | Solo push a `main` |

**Flujo CI** (en cada PR):
```
push/PR → instalar deps → ejecutar tests → build de producción
```

**Flujo Deploy** (en cada merge a main):
```
push main → tests → build → Firebase Hosting (atom-e2ad4)
```

Para activar el deploy automático, agregar el secret `FIREBASE_SERVICE_ACCOUNT` en la configuración del repositorio de GitHub (Settings → Secrets → Actions). Ver sección [Deploy manual](#deploy-manual) para obtenerlo.

---

## Deploy manual

```bash
# Instalar Firebase CLI (una vez)
npm install -g firebase-tools

# Login
firebase login

# Build de producción
npm run build

# Deploy
firebase deploy --only hosting
```

La app queda publicada en: `https://atom-e2ad4.web.app`

---

## Variables de entorno

La URL de la API se configura en `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:5001/backend-atom-eeffc/us-central1/api',
};
```

> Para producción, editar `src/environments/environment.prod.ts` con la URL del servidor real. **Nunca** subir tokens, claves ni URLs privadas al repositorio.

---

## Estructura del proyecto

```
src/
├── environments/              # Configuración por entorno
├── styles/
│   ├── _variables.scss        # Colores, tipografía, spacing, breakpoints
│   └── _mixins.scss           # Helpers responsive y flex
└── app/
    ├── app.config.ts          # Bootstrap: router, HttpClient, animaciones
    ├── app.routes.ts          # Rutas con lazy loading por feature
    ├── core/
    │   ├── models/            # Interfaces TypeScript (User, Task, ApiError)
    │   ├── services/          # AuthService · TaskService · StorageService
    │   ├── interceptors/      # AuthInterceptor — agrega Bearer token en /tasks
    │   └── guards/            # authGuard · guestGuard
    ├── features/
    │   ├── auth/login/        # Formulario email + flujo registro automático
    │   └── tasks/
    │       ├── containers/tasks-page/   # Contenedor — estado y lógica
    │       └── components/
    │           ├── task-item/           # Card presentacional de tarea
    │           ├── task-form/           # Formulario nueva tarea
    │           ├── edit-task-dialog/    # Dialog edición con form prellenado
    │           └── confirm-dialog/      # Dialog de confirmación genérico
    └── shared/
        └── pipes/format-date.pipe.ts   # Fecha en formato "15 ene 2024"
```

---

## Flujos principales

### Autenticación

```
Visita /tasks
    └── AuthGuard verifica localStorage
            ├── Token presente  →  carga TasksPage
            └── Sin token       →  redirige a /auth/login
```

### Login / Registro

```
Ingresa email → GET /users/:email
    ├── 200  →  guarda token → /tasks
    └── 404  →  Dialog "¿Crear cuenta?"
                    ├── Confirmar  →  POST /users → guarda token → /tasks
                    └── Cancelar   →  vuelve al formulario
```

### Interceptor HTTP

```
Request a /tasks/*  →  agrega "Authorization: Bearer <token>"
Respuesta 401       →  limpia token → redirige a /auth/login
```

---

## API

Base URL: `http://127.0.0.1:5001/backend-atom-eeffc/us-central1/api`

| Método | Endpoint | Descripción | Autenticación |
|---|---|---|---|
| `GET` | `/users/:email` | Buscar usuario por email | No |
| `POST` | `/users` | Crear usuario nuevo | No |
| `GET` | `/tasks` | Listar tareas del usuario | Bearer |
| `POST` | `/tasks` | Crear tarea | Bearer |
| `PUT` | `/tasks/:id` | Actualizar título, descripción o estado | Bearer |
| `DELETE` | `/tasks/:id` | Eliminar tarea | Bearer |

---

## Tests

```bash
npm test                        # Ejecutar una vez (CI)
npx ng test --watch             # Modo watch (desarrollo)
```

**Cobertura actual: 45 tests — 7 suites — 100% passing**

| Suite | Tests | Descripción |
|---|---|---|
| `storage.service.spec.ts` | 7 | CRUD en localStorage |
| `auth.service.spec.ts` | 7 | HTTP mocks con HttpTestingController |
| `task.service.spec.ts` | 6 | Métodos GET/POST/PUT/DELETE con params |
| `auth.guard.spec.ts` | 4 | Redirección con/sin token |
| `format-date.pipe.spec.ts` | 6 | Pipe — casos válidos, null, inválidos |
| `login.component.spec.ts` | 6 | Formulario, 404, creación, errores 5xx |
| `tasks-page.component.spec.ts` | 9 | CRUD, ordenamiento, contadores, logout |

Los tests de componentes usan observables síncronos (`of()`) — sin `fakeAsync` ni Zone.js en modo aislado.

---

## Decisiones de arquitectura

### Signals en lugar de BehaviorSubject
`signal()` para estado local en componentes. API más simple, compatible con el roadmap Zoneless de Angular 18+.

### Guards y Interceptors funcionales
`CanActivateFn` + `HttpInterceptorFn` en lugar de clases. Menos boilerplate, más fácil de testear con `TestBed.runInInjectionContext`.

### Lazy loading por feature
Cada feature carga su propio chunk. El bundle inicial solo contiene el router y la configuración.

### Interceptor selectivo
El token solo se adjunta en requests a `/tasks`. Los endpoints públicos (`/users`) reciben requests limpios.

### Patrón Contenedor / Presentacional
- **Contenedores** (`tasks-page`): estado, servicios, dialogs.
- **Presentacionales** (`task-item`, `task-form`): solo `@Input()` / `@Output()`, sin lógica de negocio.

### ConfirmDialog genérico (DRY)
Un único componente de confirmación reutilizado en login (crear cuenta) y tasks (eliminar tarea). Recibe título, mensaje HTML y etiquetas de botones via `MAT_DIALOG_DATA`.

### Seguridad XSS en ConfirmDialog
`DomSanitizer.bypassSecurityTrustHtml()` solo se usa con strings generados internamente por el código de la aplicación — nunca con input del usuario.

---

## Buenas prácticas aplicadas

- **SOLID** — cada servicio tiene una sola responsabilidad.
- **DRY** — `ConfirmDialogComponent` reutilizado en múltiples flujos.
- **KISS** — lógica de negocio en servicios, componentes solo coordinan.
- `"private": true` en `package.json` — evita publicación accidental en npm.
- `node_modules/`, `dist/` y `.angular/cache/` excluidos del repositorio.
- Sin credenciales ni URLs privadas en el código fuente.

---

## Accesibilidad

- `aria-label` dinámicos por tarea (incluye título y estado actual).
- `role="alert"` en mensajes de error de validación.
- `aria-hidden="true"` en íconos decorativos.
- `<time datetime="...">` en fechas de creación.
- Navegación por teclado soportada nativamente por Angular Material.
