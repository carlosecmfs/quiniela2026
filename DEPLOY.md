# Cómo subir a Netlify

## Opción A — Drag & Drop (más fácil, 2 minutos)

1. Ve a **https://app.netlify.com** y crea cuenta gratis si no tienes
2. En el dashboard, haz clic en **"Add new site" → "Deploy manually"**
3. Arrastra **TODA la carpeta del proyecto** al área de drop
4. Netlify genera una URL tipo `https://abc123.netlify.app`
5. Comparte esa URL con tus amigos

> El archivo `netlify.toml` ya está incluido y configura todo automáticamente.

---

## Opción B — GitHub + deploy automático

1. Sube el proyecto a un repositorio de GitHub (público o privado)
2. En Netlify: **"Add new site" → "Import an existing project" → "Deploy with GitHub"**
3. Conecta el repositorio
4. Configuración de build:
   - **Build command:** *(dejar vacío)*
   - **Publish directory:** `.`
5. Haz clic en **"Deploy site"**

Cada push al repo actualiza el sitio automáticamente.

---

## Notas importantes sobre los datos

Los datos (participantes y resultados) se guardan en **localStorage del navegador**,
no en un servidor. Esto significa:

- Cada usuario ve **sus propios datos** en su propio dispositivo
- Para que todos vean los mismos datos, el admin debe usar **un solo dispositivo**
  como "central" (todos abren la URL y el admin actualiza resultados ahí)

### Flujo recomendado para usar la quiniela en grupo:

1. El organizador comparte la URL de Netlify
2. Cada participante abre la URL en **su propio dispositivo** y se registra
3. El organizador abre la URL en **su dispositivo** y:
   - Va a `#admin` → introduce la contraseña `quiniela2026`
   - Actualiza los resultados de los partidos
4. Todos recargan la página para ver los resultados actualizados

> En el futuro se puede integrar Firebase Firestore para datos compartidos en tiempo real,
> sin cambiar el frontend (solo agregar `firebase.js` y reemplazar las llamadas a localStorage).

---

## Contraseñas

| Función | Contraseña |
|---------|------------|
| Panel de administrador | `quiniela2026` |
| Código de acceso al registro (opcional) | `mundial2026` |

Estas contraseñas están hardcodeadas en `js/admin.js` y `js/registro.js`.
Cámbialas antes de subir a producción si el proyecto es público.

---

## Estructura del proyecto

```
QUINIELA/
├── index.html          ← SPA principal (grupos, bracket, participantes, admin)
├── registro.html       ← Formulario de registro público
├── netlify.toml        ← Configuración de Netlify
├── css/
│   └── styles.css      ← Todos los estilos (~2400 líneas)
└── js/
    ├── data.js         ← Equipos, partidos, localStorage helpers
    ├── app.js          ← Router SPA, vistas, lógica de puntos
    ├── admin.js        ← Panel de administración
    └── registro.js     ← Lógica del formulario de registro
```
