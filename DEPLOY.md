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

## Datos en tiempo real — Firebase Firestore

Los datos (participantes y resultados) se almacenan en **Firebase Firestore** y
se sincronizan en tiempo real entre todos los dispositivos.

- Cualquier participante puede registrarse desde su propio dispositivo
- El admin actualiza resultados y **todos los usuarios ven los cambios en segundos**
- No es necesario recargar la página

### Flujo de uso:

1. El organizador comparte la URL de Netlify
2. Cada participante abre la URL en su dispositivo y se registra en `/registro`
3. El admin va a `#admin` → contraseña `quiniela2026` → actualiza resultados
4. Todos ven la tabla de posiciones actualizada en tiempo real

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
    ├── firebase.js     ← Configuración y helpers de Firebase Firestore
    ├── data.js         ← Equipos, partidos, localStorage helpers
    ├── app.js          ← Router SPA, vistas, lógica de puntos
    ├── admin.js        ← Panel de administración
    └── registro.js     ← Lógica del formulario de registro
```
