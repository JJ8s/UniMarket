# Documentación técnica — UniMarket (React)

Este documento complementa el `README.md` (que explica el *qué* migró de HTML a React)
con el *cómo* está armado el proyecto, qué se revisó en la migración y qué quedó
pendiente. Pensado para alguien del equipo que no participó en la migración y
necesita entender la base de código rápido.

---

## 1. Arquitectura general

```
src/
├── main.jsx              # punto de entrada: Providers + BrowserRouter
├── App.jsx                # arbol de rutas
├── context/
│   ├── AuthContext.jsx     # sesion del usuario (login/logout)
│   └── CarritoContext.jsx  # carrito de compras
├── hooks/
│   ├── useBodyClass.js     # clase CSS por pagina (equivalente a <body class="...">)
│   └── useMisArticulos.js  # articulos publicados por el vendedor actual
├── data/
│   └── datos.js            # unica capa que toca localStorage
├── utils/
│   └── utilidades.js       # helpers compartidos (formato, imagenes, carrito, etc.)
├── components/              # piezas reutilizables (10 componentes, ver README.md)
└── pages/                   # una pagina por ruta (9 paginas, ver README.md)
```

No hay backend: todo el estado persistente (usuarios, artículos, carrito, sesión,
fotos) vive en `localStorage` del navegador, tal como en la versión HTML original.
Esto significa que los datos **no se comparten entre navegadores ni dispositivos**,
y que cualquier panel de administración real necesitaría un servidor — ver la
sección 6 para más detalle sobre esta limitación.

### Flujo de datos

1. `src/data/datos.js` es la única puerta de entrada a `localStorage`. Ningún
   componente o página llama a `localStorage` directamente.
2. `AuthContext` y `CarritoContext` envuelven la app en `main.jsx` y exponen el
   estado de sesión y carrito a cualquier componente vía `useAuth()` / `useCarrito()`.
3. Las páginas leen artículos con `cargarArticulos()` (normalmente dentro de un
   `useState(() => ...)` o `useMemo`, para no releer en cada render) y escriben
   con `guardarArticulos()`.
4. `GuardiaRuta` decide, antes de renderizar cualquier página, si la ruta
   requiere sesión o no, usando el valor de `AuthContext`.

---

## 2. Rutas y protección

```jsx
<Route element={<GuardiaRuta requiereSesion={false} />}>
  <Route path="/login" element={<Login />} />
  <Route path="/registro" element={<Registro />} />
</Route>

<Route element={<GuardiaRuta requiereSesion />}>
  <Route path="/" element={<Catalogo />} />
  <Route path="/publicar" element={<Publicar />} />
  <Route path="/panel-vendedor" element={<PanelVendedor />} />
  <Route path="/bolsa" element={<Bolsa />} />
  <Route path="/pago" element={<Pago />} />
  <Route path="/pedidos" element={<Pedidos />} />
  <Route path="/perfil" element={<Perfil />} />
</Route>

<Route element={<GuardiaRuta requiereSesion rol="admin" />}>
  {rutasAdmin()}   {/* /admin/* , ver src/admin/rutasAdmin.jsx */}
</Route>

<Route path="*" element={<Navigate to="/" replace />} />
```

Con `rol="admin"`, `GuardiaRuta` verifica con `esAdmin(correo)` contra la base
de usuarios; si no es admin redirige a `/`. Un admin con sesión que visita
`/login` es enviado a `/admin`.

`GuardiaRuta` usa `<Outlet />` de React Router: es un componente "paraguas" que
envuelve un grupo de rutas y decide si se renderiza el contenido real o se
redirige. Con sesión activa no se puede volver a `/login` ni `/registro`
(redirige a `/`); sin sesión, no se puede entrar a ninguna ruta protegida
(redirige a `/login`). Cualquier ruta no reconocida cae al catálogo.

---

## 3. Modelo de datos (localStorage)

| Llave | Contenido |
|---|---|
| `unimarket_articulos` | array de artículos publicados (ver estructura abajo) |
| `unimarket_carrito` | array plano de ids de artículo, uno por unidad en la bolsa |
| `unimarket_sesion` | el usuario actualmente conectado (o ausente si no hay sesión) |
| `unimarket_usuarios` | array de cuentas registradas |
| `unimarket_foto_<correo>` | foto de perfil del usuario, en base64 (una llave por usuario) |
| `unimarket_categorias` | categorías editables (`valor`, `etiqueta`, `descripcion`); antes estaban fijas en el código |
| `unimarket_ordenes` | órdenes/boletas (`folio` BOL-######, estado Pagada/Pendiente/Anulada, cliente, líneas, total); se crean al pagar |

Cada usuario tiene además `rol` (`admin` o `cliente`). Si los datos guardados no
traen administrador, `cargarUsuarios()` agrega el de por defecto.

### Panel de administración

- Código en `src/admin/` (layout, rutas, `components/` de una sola responsabilidad, `pages/`).
- Reglas de integridad en `datos.js`: no se puede borrar ni quitar el rol al
  último admin, no se puede borrar una categoría con productos, el correo no
  puede repetirse.
- Los reportes son funciones puras en `src/utils/reportes.js` (solo cuentan
  órdenes Pagadas).
- Bootstrap 5 se inyecta como `<link>` solo en `/admin` (`?url` de Vite).
- Seguridad: el control de rol es solo del lado del cliente y las contraseñas
  están en texto plano en localStorage; es suficiente para la evaluación, no
  para producción (requeriría backend).
- Los iconos usan Font Awesome por CDN: sin internet no se ven.


### Artículo

```
id, nombre, descripcion, precio, calificacion, categoria, universidad,
vendedor, distancia, condicion, stock, sku, entrega, universidadesVenta,
fotos (opcional), creadoEn
```

`universidadesVenta` vacío significa "vende a todas las universidades" — esta
convención se repite en varios lugares (`Catalogo.jsx`, `Publicar.jsx`) y está
comentada en el código, pero no está validada en ningún punto central; si se
agrega una nueva pantalla que filtre por universidad hay que recordar
replicar la misma regla.

### Carrito

El carrito se guarda como un **array plano de ids** (no como `{id, cantidad}`):
si hay 3 unidades del artículo 7, el array contiene `[7, 7, 7]`. Las funciones
`agruparCarrito()` / `lineasAIds()` en `utilidades.js` convierten entre esta
forma y la forma agrupada `{articulo, cantidad}` que usan las páginas. Esta
elección de diseño es la misma que tenía la versión HTML original.

---

## 4. Componentes y hooks clave

- **`GuardiaRuta`** — ver sección 2.
- **`useBodyClass(clase)`** — agrega una clase al `<body>` al montar la página y
  la quita al desmontar. Reemplaza el `<body class="...">` que cada página HTML
  tenía escrito a mano; necesario porque ahora todas las páginas comparten el
  mismo `index.html`.
- **`useMisArticulos(nombreVendedor)`** — filtra `cargarArticulos()` por
  `vendedor === nombreVendedor` y expone `misArticulos`, `borrarArticulo` (pide
  confirmación con `window.confirm`) y `alternarDisponibilidad` (pone el stock
  en 0 o lo restaura, guardando el valor anterior en un campo `stockGuardado`
  para no perderlo). Lo usan `PanelVendedor.jsx` y `Pedidos.jsx`.
- **`comprimirImagen(archivo, tamanoMaximo, calidad)`** en `utilidades.js` — lee
  un archivo de imagen, lo redimensiona con un `<canvas>` oculto y devuelve un
  data URL JPEG comprimido. Se usa tanto para fotos de producto (`Publicar.jsx`,
  480px / 70%) como para la foto de perfil (`Perfil.jsx`, 240px / 75%). Es
  necesario porque `localStorage` tiene un límite de tamaño (~5MB) y las fotos
  sin comprimir lo agotarían rápido.

---

## 5. Problemas encontrados y corregidos

Durante la revisión se encontraron 4 inconsistencias. Las primeras tres se
corrigieron directamente porque el arreglo era seguro y no cambiaba
comportamiento visible salvo para corregir el bug:

1. **Enlace "volver" roto en `Publicar.jsx`.** El botón decía
   "Volver al panel de vendedor" pero apuntaba a `/` (el catálogo). Se corrigió
   el destino a `/panel-vendedor` para que coincida con el texto.

2. **`target="_blank"` inconsistente en `MenuPerfil.jsx`.** Los enlaces
   "Ver mi perfil" y "Mis pedidos" abrían una pestaña nueva, pero "Panel
   vendedor" no. No hay ninguna razón funcional para que unos abran en pestaña
   nueva y otro no (los tres son páginas internas de la misma app), así que se
   quitó `target="_blank"` de los tres para que el menú se comporte de forma
   consistente y la navegación sea la esperada dentro de una SPA.

3. **Etiquetas de categoría duplicadas en 3 lugares.** `utilidades.js` ya
   exportaba `OPCIONES_CATEGORIA` (la fuente de verdad, usada en el formulario
   de `Publicar.jsx`), pero `Footer.jsx` y `Catalogo.jsx` tenían cada uno su
   propia copia local de la misma lista (`CATEGORIAS` y `FILTROS_CATEGORIA`).
   Si alguien agregaba o renombraba una categoría, era fácil actualizar un
   lugar y olvidar los otros dos, dejando el catálogo, el formulario de
   publicar y el pie de página desincronizados. Se cambiaron ambos para
   importar `OPCIONES_CATEGORIA` de `utilidades.js`; `Catalogo.jsx` sigue
   agregando la opción `"Todos"` al principio de la lista, que es la única
   diferencia real que tenía.

4. **`ETIQUETAS_CATEGORIA_LARGA` no se usa en ningún lado.** `utilidades.js`
   exporta dos juegos de etiquetas de categoría: `ETIQUETAS_CATEGORIA_CORTA`
   (usada en la tarjeta de producto, el modal y la búsqueda) y
   `ETIQUETAS_CATEGORIA_LARGA`, comentada como "para los botones de filtro de
   categoría" — pero ningún componente la importa; los botones de filtro usan
   `OPCIONES_CATEGORIA`, que a su vez deriva de la versión corta. Es código
   muerto, probablemente un resabio de una versión anterior del filtro. No se
   borró porque no afecta el comportamiento y borrar código "por las dudas"
   agrega riesgo sin necesidad; queda anotado acá para que el equipo decida si
   quiere limpiarlo.

Ningún otro archivo de componentes, páginas, hooks o estilos mostró
comportamiento incorrecto. Las dos renombradas de clases CSS que menciona el
`README.md` (`.form-hint` → `.auth-hint` en login, `.card` → `.perfil-card`
en perfil) se verificaron contra los 9 archivos de `src/styles/` y están
aplicadas correctamente — no quedó ningún `.form-hint` ni `.card` sin
renombrar donde debían estarlo, y las clases que comparten nombre pero están
en páginas distintas (el `.card` de la grilla de productos en `catalogo.css`,
siempre dentro de `#product-grid`) no chocan entre sí.

El proyecto compila sin errores ni advertencias después de estas
correcciones (`npm run build`).

---

## 6. Limitaciones conocidas (no se tocaron, son decisiones de diseño)

Estas no son bugs: son simplificaciones intencionales de un proyecto sin
backend, ya señaladas con comentarios en el propio código, pero vale
dejarlas explícitas acá para quien planifique los próximos pasos:

- **No hay sistema real de pedidos/compras.** `PanelVendedor.jsx` muestra
  "Ventas del mes" y "Pedidos por entregar hoy" con datos de ejemplo
  (`PEDIDOS_EJEMPLO`), y lo dice explícitamente en un texto bajo las
  estadísticas. Solo "Calificación promedio" se calcula con datos reales
  (el promedio de los artículos del vendedor). La página `Pedidos.jsx`
  tampoco es un historial de compras: en realidad muestra las publicaciones
  que el usuario creó (mismo dato que usa `PanelVendedor`), porque no existe
  todavía un registro de qué compró cada quien.
- **El pago es simulado.** `Pago.jsx` no se conecta a ninguna pasarela real;
  genera un folio y una autorización falsos tras una demora artificial de
  4.5 segundos, y lo indica en pantalla ("Pago simulado").
- **Sin límite de stock en el carrito.** `Bolsa.jsx` permite subir la
  cantidad de un artículo con el botón "+" sin verificar contra `stock`.
- **Contraseñas en texto plano.** Igual que en la versión HTML: válido solo
  para una demo, nunca para producción.
- **`localStorage` es por navegador.** Como se discutió antes de que llegara
  esta versión, un panel de administrador real (ver histórico de ventas de
  todos los usuarios, chats, etc.) necesita que los datos vivan en un
  servidor compartido, no en el navegador de cada persona. React no cambia
  esta restricción por sí solo; solo ordena el código del front-end.

---

## 7. Convenciones del proyecto

- Comentarios de código en español, sin tildes. Texto visible para el
  usuario (botones, mensajes, esta documentación) en español normal, con
  tildes.
- Nombres de variables, funciones y campos de datos en español
  (`cargarArticulos`, `guardarUsuarios`, `calificacion`, `entrega`...).
- Sin emojis en el código.
- Cada función que toca `localStorage` vive únicamente en `src/data/datos.js`.
- Las etiquetas y listas de opciones que se repiten entre páginas (categorías,
  estados del producto, universidades) viven en `src/utils/utilidades.js` o
  `src/data/datos.js`, nunca copiadas dentro de una página — ver el punto 3
  de la sección 5 sobre por qué esto importa.
