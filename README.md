# UniMarket (React)

Marketplace estudiantil migrado de HTML + JS puro a **React + Vite + React Router + Tailwind**.
Sigue sin backend: usuarios, artículos, carrito, sesión y fotos viven en `localStorage`.

## Cómo ejecutarlo

```bash
npm install
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # build de producción en /dist
```

Cuenta de prueba: `juan.perez@unimarket.edu` / `123456`

## Equivalencias HTML -> React

| Antes | Ahora (ruta) | Archivo |
|---|---|---|
| `index.html` | `/` | `src/pages/Catalogo.jsx` |
| `login.html` | `/login` | `src/pages/Login.jsx` |
| `registro.html` | `/registro` | `src/pages/Registro.jsx` |
| `publicar.html` | `/publicar` | `src/pages/Publicar.jsx` |
| `panel-vendedor.html` | `/panel-vendedor` | `src/pages/PanelVendedor.jsx` |
| `bolsa.html` | `/bolsa` | `src/pages/Bolsa.jsx` |
| `pago.html` | `/pago` | `src/pages/Pago.jsx` |
| `pedidos.html` | `/pedidos` | `src/pages/Pedidos.jsx` |
| `perfil.html` | `/perfil` | `src/pages/Perfil.jsx` |

| Antes | Ahora |
|---|---|
| `js/datos.js` (funciones en `window`) | `src/data/datos.js` (módulo ES, se importa) |
| `js/interfaz.js` (clase `MenuPerfil`) | `src/components/MenuPerfil.jsx` |
| `js/publicar.js` (`SelectorModal`, `CargadorFotos`, `FormularioPublicacion`) | `SelectorModal.jsx` + estado dentro de `Publicar.jsx` |
| `js/catalogo.js` | estado + `useMemo` dentro de `Catalogo.jsx` |
| funciones repetidas en cada `<script>` (`escaparHtml`, `obtenerColorImagen`, `obtenerLineasDeBolsa`...) | `src/utils/utilidades.js` (una sola vez) |
| `haySesionActiva()` + redirección manual en cada página | `AuthContext` + `components/Rutas.jsx` |
| carrito leído/escrito en cada página | `CarritoContext` (el contador del header se actualiza solo) |
| header copiado en 3 páginas | `src/components/Header.jsx` |
| `css/*.css` | `src/styles/*.css` (sin cambios, salvo 2 clases renombradas) |

## Cambios a tener en cuenta

- **Tailwind** ya no va por CDN: se instala con npm (`tailwind.config.js` conserva los colores `primary`, `accent`, `surface`).
- **Font Awesome** sigue cargándose por CDN desde `index.html`.
- Como ahora todo el CSS convive en una sola app, se renombraron 2 clases que chocaban:
  `.form-hint` -> `.auth-hint` (solo login) y `.card` -> `.perfil-card` (solo perfil).
- Cada página agrega su clase al `<body>` (`auth-body`, `perfil-body`...) con el hook `useBodyClass`.
- `escaparHtml()` desapareció: React escapa el texto automáticamente.
- `USUARIO_ACTUAL` (usuario de ejemplo de respaldo) se eliminó: las rutas protegidas ya garantizan que hay sesión.
- Al guardar el perfil ya no se recarga la página: la sesión se actualiza y toda la app se refresca sola.
- Las contraseñas siguen en texto plano en `localStorage` (solo válido para demo).

## Componentes (`src/components/`): 10

| # | Componente | Qué hace | Dónde se usa |
|---|---|---|---|
| 1 | `Header` | Barra superior: logo, buscador, perfil y carrito | Catálogo, Publicar, Panel vendedor |
| 2 | `Footer` | Pie de página con beneficios, filtros rápidos y copyright | Catálogo |
| 3 | `Logo` | Logo que lleva al inicio | Header, Footer, Login, Registro, Perfil, Pedidos, Bolsa, Pago |
| 4 | `MenuPerfil` | Botón de perfil con menú desplegable | Header |
| 5 | `SelectorModal` | Selector de una opción dentro de un modal | Publicar |
| 6 | `GuardiaRuta` | Controla quién puede entrar a cada página | App |
| 7 | `TarjetaArticulo` | Tarjeta de un producto en la grilla | Catálogo |
| 8 | `ModalProducto` | Detalle del producto y botón "Agregar a la bolsa" | Catálogo |
| 9 | `BannerPagina` | Banner azul con título y botón de volver | Bolsa, Pedidos |
| 10 | `EstadoVacio` | Mensaje "no hay nada" con botón de acción | Bolsa, Pedidos |

Las páginas (`src/pages/`) arman estos componentes y manejan el estado de cada pantalla.

## Panel de administración

Cuenta de administrador de ejemplo: `admin@unimarket.edu` / `admin123`
(al iniciar sesión entra directo a `/admin`; un cliente también lo ve en el
menú de perfil como "Administración" solo si es admin).

| Ruta | Vista |
|---|---|
| `/admin` | Dashboard (métricas, módulos, últimas órdenes) |
| `/admin/ordenes`, `/admin/ordenes/:folio` | Órdenes y boleta (cambio de estado, imprimir) |
| `/admin/productos`, `/nuevo`, `/:id`, `/:id/editar`, `/criticos` | CRUD de productos y stock crítico |
| `/admin/categorias`, `/nueva`, `/:valor/editar` | CRUD de categorías (alimentan catálogo y publicar) |
| `/admin/usuarios`, `/nuevo`, `/:correo`, `/:correo/editar`, `/:correo/historial` | CRUD de usuarios e historial de compras |
| `/admin/reportes` | Ventas por categoría y mes, más vendidos, stock crítico, CSV |
| `/admin/perfil` | Perfil del administrador |

Usa Bootstrap 5 solo dentro de `/admin` (se carga y se quita al entrar/salir)
para no chocar con Tailwind de la tienda. Los datos viven en `src/data/datos.js`.

## Pruebas

```bash
npm run test            # Vitest (75 pruebas)
npm run test:coverage   # Vitest + cobertura
npm run test:karma      # Jasmine + Karma (las mismas 75 pruebas, en Chrome real)
```

Detalle y guía paso a paso en `TESTING.md`.

[Ver PDF de pruebas unitarias](https://github.com/JJ8s/UniMarket/blob/main/Pruebas_Unitarias_UniMarket.pdf)
