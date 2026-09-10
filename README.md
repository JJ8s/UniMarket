# UniMarket - Documentación del proyecto

Marketplace estudiantil hecho con HTML + Tailwind (CDN) + JavaScript
puro (sin frameworks ni build step). Todavía **no tiene backend real**:
todo lo que normalmente viviría en una base de datos (usuarios,
artículos, carrito, sesión, fotos) se guarda en el `localStorage` del
navegador.

Esto significa, en concreto:
- No hay servidor, no hay API, no hay base de datos.
- Los datos son **por navegador**: si abres el sitio en otro navegador
  o en modo incógnito, no vas a ver lo que publicaste antes.
- Las "contraseñas" se guardan en texto plano en `localStorage`. Esto
  es aceptable para un MVP/demo, pero **no debe usarse así en
  producción** con datos reales de personas.

---

## 1. Cómo ejecutar el proyecto

No requiere instalación ni `npm install`. Basta con servir la carpeta
`dashboard/` con cualquier servidor estático (o la extensión **Live
Server** de VS Code) y abrir `index.html`.

> Abrir los archivos con doble click (`file:///...`) puede fallar,
> porque algunos navegadores bloquean `fetch`/módulos bajo el
> protocolo `file://`. Usa un servidor local.

### Cuenta de prueba

El proyecto arranca con un usuario ya registrado, para poder probar
todo sin pasar por el registro:

```
Correo:      juan.perez@unimarket.edu
Contraseña:  123456
```

---

## 2. Estructura de carpetas

```
dashboard/
├── css/
│   ├── auth.css              Estilos de login.html y registro.html
│   ├── base.css               Modal generico + menu de perfil (compartido)
│   ├── bolsa.css              Estilos propios de bolsa.html
│   ├── catalogo.css            Estilos propios de index.html (y reusado en panel-vendedor.html)
│   ├── pago.css                Estilos propios de pago.html
│   ├── panel-vendedor.css      Estilos propios de panel-vendedor.html
│   ├── perfil.css              Estilos de perfil.html, y tambien de bolsa.html/pedidos.html/pago.html (ver seccion 4)
│   └── publicar.css            Estilos propios de publicar.html
├── img/                        Logos, iconos e imagenes del proyecto
├── js/
│   ├── datos.js                 Capa de datos: articulos, usuarios, sesion, carrito, fotos de perfil
│   ├── interfaz.js               Componente compartido: menu de perfil (clase MenuPerfil)
│   ├── catalogo.js               Logica de index.html (catalogo de articulos)
│   └── publicar.js               Logica de publicar.html (formulario de publicacion)
├── index.html                  Catalogo / dashboard principal
├── login.html                  Iniciar sesion
├── registro.html               Crear cuenta
├── publicar.html               Crear una publicacion nueva
├── panel-vendedor.html         Panel del vendedor: metricas e inventario propio
├── bolsa.html                  Carrito de compras
├── pago.html                   Pasarela de pago simulada (checkout)
├── pedidos.html                Lista de tus propias publicaciones, con opcion de borrar
└── perfil.html                 Ver y editar los datos de tu cuenta
```

**Nota sobre `login.html`, `registro.html`, `perfil.html`, `bolsa.html`,
`pago.html`, `panel-vendedor.html` y `pedidos.html`:** a diferencia de
`index.html` y `publicar.html`, estas páginas **no usan** `catalogo.js`
ni `interfaz.js` (excepto `panel-vendedor.html`, que sí las usa). Cada
una tiene su propio `<script>` con la lógica escrita directamente
dentro del `.html`. Esto funciona, pero es inconsistente con el patrón
de módulos compartidos del resto del proyecto — ver la sección
"Deuda técnica" al final de este documento.

---

## 3. Mapa de navegación

```
login.html ──(sin cuenta)──> registro.html
    │
    │ (login correcto)
    ▼
index.html (catalogo) ──────────────────────────────┐
    │  │                                             │
    │  ├─ click en tarjeta ──> modal de detalle       │
    │  │                         └─ "Agregar a la bolsa" (carrito)
    │  │
    │  ├─ boton "Publicar articulo" ──> publicar.html ─(publicar)─> index.html
    │  │
    │  └─ menu de perfil:
    │        ├─ "Ver mi perfil"     ──> perfil.html
    │        ├─ "Mis pedidos"       ──> pedidos.html
    │        ├─ "Panel vendedor"    ──> panel-vendedor.html
    │        └─ "Salir de la sesion" ──> login.html
    │
    └─ icono del carrito ──> bolsa.html ──"Proceder al pago"──> pago.html ──(compra)──> boleta + vacía la bolsa
```

Todas las páginas excepto `login.html` y `registro.html` verifican que
haya una sesión activa (`haySesionActiva()` de `datos.js`) al cargar; si
no la hay, redirigen a `login.html`.

---

## 4. Páginas, una por una

### `index.html` — Catálogo
- **Requiere sesión:** sí.
- **CSS:** `base.css`, `catalogo.css`.
- **JS:** `datos.js`, `interfaz.js`, `catalogo.js`.
- Grilla de artículos con filtros por categoría, por universidad, por
  radio de distancia (simulado, no usa GPS real salvo que el usuario
  presione "Detectar ubicación", que sí pide el permiso de
  geolocalización del navegador) y buscador de texto libre.
- Al hacer click en una tarjeta se abre un modal con el detalle
  completo (precio, universidad, distancia, calificación, punto de
  entrega) y el botón "Agregar a la bolsa".

### `login.html` — Iniciar sesión
- **Requiere sesión:** no (si ya hay una activa, no se valida ni se
  redirige automáticamente salvo lo que haga el propio script; ver
  código para el detalle exacto).
- **CSS:** `auth.css`.
- **JS:** `datos.js` + script inline.
- Formulario con correo y contraseña. Valida contra
  `validarCredenciales()` de `datos.js`. Si es correcto, llama a
  `iniciarSesion()` y redirige a `index.html`.

### `registro.html` — Crear cuenta
- **CSS:** `auth.css`.
- **JS:** `datos.js` + script inline.
- Campos: nombre, nombre de usuario, correo, universidad (selector
  llenado desde `UNIVERSIDADES_DISPONIBLES` de `datos.js`), contraseña
  y repetir contraseña (mínimo 6 caracteres).
- Llama a `registrarUsuario()`; si el correo ya existe, muestra error.
  Si el registro es exitoso, inicia sesión automáticamente
  (`iniciarSesion()`) y entra al dashboard.

### `publicar.html` — Crear publicación
- **Requiere sesión:** sí.
- **CSS:** `base.css`, `publicar.css`.
- **JS:** `datos.js`, `interfaz.js`, `publicar.js`.
- Formulario dividido en secciones: Fotos del producto (hasta 4,
  comprimidas en el navegador antes de guardarse), Información del
  producto (título opcional, descripción, categoría, estado — estos
  dos últimos vía un selector tipo modal), Precio e Inventario (precio,
  cantidad; el **SKU ya no se escribe a mano, lo genera la web sola**),
  Punto de Entrega (texto libre, máx. 300 caracteres) y Universidades
  donde vende (checklist opcional; si no se marca ninguna, se vende a
  "todas").
- Ver la sección 6 para el detalle de las clases que usa
  (`SelectorModal`, `CargadorFotos`, `FormularioPublicacion`).

### `panel-vendedor.html` — Panel del vendedor
- **Requiere sesión:** sí.
- **CSS:** `base.css`, `catalogo.css`, `panel-vendedor.css`.
- **JS:** `datos.js`, `interfaz.js` + script inline.
- Métricas ilustrativas ("Ventas del mes", "Pedidos por entregar hoy":
  el proyecto todavía no tiene un sistema de pedidos/compras real
  entre distintos usuarios, así que estos números son de ejemplo, no
  datos reales).
- Tabla/lista de inventario: solo los artículos publicados por el
  usuario con sesión activa (`obtenerMisArticulos()`). Permite:
  - Alternar disponibilidad ("Disponible" ↔ "Agotado")
    (`alternarDisponibilidad()`).
  - Borrar un artículo (`borrarArticuloInventario()`).
  - Ver la calificación promedio de sus artículos
    (`pintarCalificacionPromedio()`).

### `bolsa.html` — Carrito de compras
- **Requiere sesión:** sí.
- **CSS:** `perfil.css`, `bolsa.css`.
- **JS:** `datos.js` + script inline.
- Lee el carrito (`cargarCarrito()`, array de ids) y lo cruza con
  `cargarArticulos()` para armar las líneas a mostrar
  (`obtenerLineasDeBolsa()`). Si un artículo del carrito ya no existe
  (el vendedor lo borró), se limpia solo de la bolsa en vez de romper
  la pantalla.
- Calcula el resumen (subtotal, total) y tiene el botón "Proceder al
  pago", que solo aparece si la bolsa tiene artículos.

### `pago.html` — Pasarela de pago (simulada)
- **Requiere sesión:** sí (implícito: si la bolsa está vacía, no tiene
  sentido estar acá, y la página lo controla).
- **CSS:** `perfil.css` (solo por la clase `.hidden` compartida),
  `auth.css` (reutiliza `.form-group`, `.btn-submit`, `.form-error`),
  `pago.css`.
- **JS:** `datos.js` + script inline.
- Flujo en 4 pasos (`irAlPaso()`):
  1. Elegir método de pago.
  2. Datos de la tarjeta, con formato en vivo (espacios cada 4
     dígitos, vencimiento `MM/AA`) y una vista previa visual de la
     tarjeta.
  3. "Procesando" — un delay simulado de 4.5 segundos (no hay pasarela
     real conectada).
  4. Boleta: se genera con `generarBoleta()` mostrando lo comprado, y
     se vacía la bolsa (`guardarCarrito([])`) porque la "compra" quedó
     confirmada.

### `pedidos.html` — Mis publicaciones
- **Requiere sesión:** sí.
- **CSS:** `perfil.css`.
- **JS:** `datos.js` + script inline.
- A pesar del nombre "Mis Pedidos", el subtítulo de la propia página
  aclara que en realidad muestra **"Publicaciones que has creado en
  UniMarket"** — es decir, los artículos que tú publicaste (filtrando
  `cargarArticulos()` por `vendedor === nombre de la sesión`), con la
  opción de borrarlos. **Esto se superpone bastante con la sección de
  inventario de `panel-vendedor.html`** (ver "Deuda técnica" más
  abajo): esta página es la versión simple (lista + borrar), mientras
  que el panel de vendedor además permite alternar disponibilidad y
  ver la calificación promedio.

### `perfil.html` — Mi perfil
- **Requiere sesión:** sí.
- **CSS:** `perfil.css`.
- **JS:** `datos.js` + script inline.
- Muestra los datos de la sesión activa (nunca datos de otra cuenta:
  antes había un bug donde el correo mostrado quedaba fijo con un
  valor de ejemplo, ya corregido).
- Foto de perfil opcional: se puede subir una, se comprime/redimensiona
  en el navegador antes de guardarla (para no llenar `localStorage`), y
  se guarda con `guardarFotoPerfil()` bajo una llave propia por correo
  (así no se mezclan fotos entre cuentas).
- Modo edición (`entrarModoEdicion()` / `salirModoEdicion()`): permite
  cambiar nombre, universidad y correo (el nombre de usuario **no** se
  puede editar). Al guardar:
  - Si cambió el nombre, actualiza el campo `vendedor` de los
    artículos que esa persona ya había publicado (para que
    `pedidos.html` y `panel-vendedor.html` los sigan reconociendo como
    propios).
  - Si cambió el correo, traslada la foto de perfil guardada al correo
    nuevo.
  - Refresca la sesión y recarga la página.

---

## 5. Módulos JavaScript compartidos

### `datos.js` — Capa de datos
Es el único archivo que toca `localStorage` directamente. El resto del
proyecto pasa siempre por sus funciones, nunca por
`localStorage.getItem/setItem` directamente (excepto los scripts
inline de las páginas nuevas, que sí llaman a estas funciones, no a
`localStorage` en crudo).

**Llaves de `localStorage` usadas:**

| Llave | Contenido |
|---|---|
| `unimarket_articulos` | Array de todos los artículos publicados |
| `unimarket_carrito` | Array de ids de artículos en la bolsa |
| `unimarket_sesion` | Datos de la sesión activa (o no existe si nadie inició sesión) |
| `unimarket_usuarios` | Array de cuentas registradas (con contraseña en texto plano) |
| `unimarket_foto_<correo>` | Foto de perfil de esa cuenta, en formato data URL |

**Funciones expuestas en `window`:**

- Artículos: `cargarArticulos()`, `guardarArticulos(arr)`,
  `obtenerSiguienteId(arr)`.
- Carrito: `cargarCarrito()`, `guardarCarrito(arr)`.
- Usuarios / sesión: `cargarUsuarios()`, `guardarUsuarios(arr)`,
  `registrarUsuario(datos)`, `validarCredenciales(correo, contrasena)`,
  `iniciarSesion(usuario)`, `cerrarSesion()`, `haySesionActiva()`,
  `obtenerSesion()`, `actualizarUsuario(correoOriginal, datosNuevos)`.
- Foto de perfil: `obtenerFotoPerfil(correo)`,
  `guardarFotoPerfil(correo, dataUrl)`, `borrarFotoPerfil(correo)`.
- Constantes: `ARTICULOS_POR_DEFECTO`, `USUARIO_ACTUAL`,
  `USUARIOS_POR_DEFECTO`, `UNIVERSIDADES_DISPONIBLES`.

### `interfaz.js` — Componentes de UI compartidos
Por ahora solo tiene la clase `MenuPerfil`, usada en el header de
`index.html`, `publicar.html` y `panel-vendedor.html`:
- Pinta nombre / usuario / correo de la sesión activa.
- Abre y cierra el menú (click en el botón, click afuera, tecla
  Escape).
- Engancha el enlace "Salir de la sesión" (`cerrarSesion()` +
  redirección a `login.html`).

### `catalogo.js` — Lógica de `index.html`
Funciones principales: `inicializar()`, `obtenerArticulosFiltrados()`
(categoría + universidad + radio + búsqueda), `renderizarArticulos()`,
`configurarBusqueda()`, `abrirModalDeProducto()` /
`cerrarModalDeProducto()`, `agregarAlCarrito()`,
`actualizarBadgeCarrito()`, `configurarEventosDeFiltros()`.
También define `obtenerColorImagen()` / `obtenerEstiloImagen()` (el
color placeholder o la foto real de cada artículo) y `escaparHtml()`
(para insertar texto del usuario en el HTML de forma segura).

### `publicar.js` — Lógica de `publicar.html`
Tres clases (POO):
- **`SelectorModal`**: selector de una sola opción (Categoría, Estado)
  reutilizando el modal genérico de `base.css`.
- **`CargadorFotos`**: lee, comprime (máx. 480px de lado, JPEG 70%) y
  muestra la vista previa de las fotos subidas.
- **`FormularioPublicacion`**: valida el formulario completo, arma el
  nuevo artículo (con SKU autogenerado) y lo guarda.

---

## 6. Modelo de datos

### Artículo (objeto dentro de `unimarket_articulos`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | number | Identificador único |
| `nombre` | string | Nombre del producto |
| `descripcion` | string | Descripción corta |
| `precio` | number | Precio de venta |
| `calificacion` | number | 0 a 5 |
| `categoria` | string | `'snacks' \| 'ropa' \| 'tecnologia' \| 'libros' \| 'otros'` |
| `universidad` | string | Universidad del vendedor |
| `vendedor` | string | Nombre del vendedor |
| `distancia` | number | Kilómetros hasta el usuario (simulado) |
| `condicion` | string | Ej. `'Nuevo (Sellado)'`, `'Usado - Buen estado'` |
| `stock` | number | Cantidad disponible |
| `sku` | string | Código de inventario, generado automáticamente |
| `entrega` | string | Punto de entrega, texto libre |
| `universidadesVenta` | Array\<string\> | Universidades a las que vende; vacío = todas |
| `fotos` | Array\<string\> | Fotos en formato data URL (opcional) |
| `creadoEn` | number | Timestamp de creación |

### Usuario (objeto dentro de `unimarket_usuarios`)

| Campo | Tipo |
|---|---|
| `nombre` | string |
| `nombreUsuario` | string |
| `correo` | string |
| `universidad` | string |
| `contrasena` | string (texto plano — ver advertencia arriba) |

### Sesión (`unimarket_sesion`)

Copia de los datos públicos del usuario (`nombre`, `nombreUsuario`,
`correo`, `universidad`) más `iniciadaEn` (timestamp). No incluye la
contraseña.

---

## 7. Convenciones de código

- Los **comentarios** del código van sin tildes a propósito (evita
  problemas de codificación en algunos editores/entornos). El texto
  que ve el usuario (nombres, mensajes, placeholders) sí mantiene
  tildes normales.
- No se usan emojis en el código nuevo.
- Los nombres de variables, funciones y campos de datos están en
  español.
- Se usa POO (clases) donde tiene sentido reusar comportamiento
  (`MenuPerfil`, `SelectorModal`, `CargadorFotos`,
  `FormularioPublicacion`); el resto del código usa funciones sueltas.
- El CSS está separado por página/componente en vez de un solo archivo
  gigante, para que sea más fácil ubicar qué estilo pertenece a qué
  parte del sitio.

---

## 8. Deuda técnica / pendientes conocidos

Esto **no está roto**, pero vale la pena tenerlo en cuenta para el
siguiente paso del proyecto:

1. **Páginas nuevas sin módulos compartidos.** `login.html`,
   `registro.html`, `perfil.html`, `bolsa.html`, `pago.html` y
   `pedidos.html` no usan `catalogo.js` ni (salvo `panel-vendedor.html`)
   `interfaz.js`; cada una reescribe su propio `escaparHtml()`,
   `obtenerColorImagen()`, etc. en un `<script>` inline. Convendría
   mover esas funciones repetidas a `datos.js` o a un nuevo archivo
   `utilidades.js` compartido.
2. **`pedidos.html` se superpone con la sección de inventario de
   `panel-vendedor.html`.** Ambas muestran "mis publicaciones" con
   opción de borrar; `panel-vendedor.html` además permite alternar
   disponibilidad. Vale la pena decidir si `pedidos.html` debería
   pasar a mostrar compras reales (lo que su nombre sugiere) y dejar
   la gestión de publicaciones solo en el panel de vendedor.
3. **"Ventas del mes" y "Pedidos por entregar hoy"** en
   `panel-vendedor.html` son datos ilustrativos: no hay todavía un
   sistema de pedidos/compras real entre distintos usuarios (cuando
   alguien "compra" en `pago.html`, no se genera ningún registro de
   pedido asociado al vendedor).
4. **Contraseñas en texto plano.** Aceptable para una demo local, pero
   se debe resolver (hashing, backend real) antes de manejar datos de
   usuarios reales.
5. **Lista de universidades de ejemplo.** El array
   `UNIVERSIDADES_DISPONIBLES` en `datos.js` tiene nombres
   representativos de sedes DUOC UC, pero no fue verificado contra el
   listado oficial — hay que confirmarlo antes de usarlo en algo real.
6. **Límite de `localStorage`.** Las fotos (de productos y de perfil)
   se guardan como data URLs comprimidas, pero `localStorage` tiene un
   límite típico de 5-10MB por sitio. Con uso intensivo (muchas
   publicaciones con fotos) se puede llegar a ese límite; `publicar.js`
   ya captura el error de cuota excedida y avisa al usuario en vez de
   romperse en silencio.
