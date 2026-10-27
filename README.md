# UniMarket

Marketplace estudiantil para comprar y vender entre estudiantes de una misma comunidad universitaria.
Hecho con **React + Vite + React Router + Tailwind**, con un panel de administración en **Bootstrap 5**.

## Qué incluye

- **Portada pública** ("Quiénes somos") para quienes aún no inician sesión.
- **Tienda:** catálogo con búsqueda y filtros, detalle de producto, bolsa de compras y pago simulado con boleta.
- **Vendedores:** publicar artículos con fotos, panel de vendedor con inventario.
- **Cuenta:** registro, inicio de sesión, perfil con foto e historial de pedidos.
- **Panel de administración:** órdenes, productos, categorías, usuarios y reportes.

## Cómo ejecutarlo

Requisitos: Node.js 18 o superior.

1. Instala las dependencias:

```bash
npm install
```

2. Copia `.env.example` a `.env` y completa los valores de conexión que te entregue el equipo.
   El archivo `.env` es privado: no se sube a GitHub.
3. Arranca la aplicación:

```bash
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # build de producción en /dist
```

Sin el archivo `.env` la aplicación muestra un aviso de configuración.

## Rutas

| Ruta | Página | Acceso |
|---|---|---|
| `/` | Portada "Quiénes somos" (sin sesión) o catálogo (con sesión) | Público |
| `/quienes-somos` | Quiénes somos | Público |
| `/login`, `/registro` | Inicio de sesión y registro | Sin sesión |
| `/publicar` | Publicar un artículo | Con sesión |
| `/panel-vendedor` | Panel de vendedor | Con sesión |
| `/bolsa`, `/pago` | Bolsa de compras y pago | Con sesión |
| `/pedidos` | Mis pedidos | Con sesión |
| `/perfil` | Mi perfil | Con sesión |
| `/admin/...` | Panel de administración | Solo administradores |

## Panel de administración

Los administradores entran directo a `/admin` al iniciar sesión.

| Ruta | Vista |
|---|---|
| `/admin` | Dashboard con métricas, módulos y últimas órdenes |
| `/admin/ordenes`, `/admin/ordenes/:folio` | Órdenes y boleta (cambio de estado, imprimir) |
| `/admin/productos` | CRUD de productos y stock crítico |
| `/admin/categorias` | CRUD de categorías |
| `/admin/usuarios` | CRUD de usuarios e historial de compras |
| `/admin/reportes` | Ventas por categoría y mes, más vendidos, exportación a CSV |
| `/admin/perfil` | Perfil del administrador |

Bootstrap 5 se carga solo dentro de `/admin` para no chocar con Tailwind de la tienda.

## Estructura del proyecto

```text
src/
  pages/        páginas de la tienda
  components/   componentes reutilizables (Header, Footer, Logo, MenuPerfil...)
  admin/        panel de administración (páginas, componentes y estilos propios)
  context/      sesión, carrito y categorías
  data/         acceso a datos (único archivo que habla con el servicio externo)
  hooks/        hooks compartidos
  utils/        funciones de apoyo (formatos, reportes, descargas)
  styles/       estilos de la tienda
  tests/        las 10 pruebas unitarias de componentes
```

## Componentes principales

| Componente | Qué hace |
|---|---|
| `Header` | Barra superior: logo, buscador, perfil y carrito |
| `HeaderPublico` | Barra superior para visitantes, con botones de entrar y registrarse |
| `Footer` | Pie de página con beneficios, filtros rápidos y copyright |
| `Logo` | Logo que lleva al inicio |
| `MenuPerfil` | Botón de perfil con menú desplegable |
| `SelectorModal` | Selector de una opción dentro de un modal |
| `GuardiaRuta` | Controla quién puede entrar a cada página |
| `TarjetaArticulo` | Tarjeta de un producto en la grilla |
| `ModalProducto` | Detalle del producto y botón "Agregar a la bolsa" |
| `BannerPagina` | Banner azul con título y botón de volver |
| `EstadoVacio` | Mensaje "no hay nada" con botón de acción |

## Pruebas unitarias

Las 10 pruebas de componentes cubren renderizado correcto, renderizado condicional, props, estado y eventos.
Corren con dos herramientas:

```bash
npm run test            # Vitest + Testing Library
npm run test:coverage   # Vitest con cobertura
npm run test:karma      # Jasmine + Karma en Chrome real
```

Las pruebas usan datos simulados en memoria: no necesitan conexión ni credenciales.

## Tecnologías

React 18, Vite, React Router, Tailwind CSS, Bootstrap 5 (solo admin), Font Awesome, Vitest, Jasmine y Karma.

## Seguridad

- Las credenciales van en `.env`, que está en `.gitignore`. Nunca las escribas en el código ni en el README.
- La aplicación solo usa la clave pública del servicio; las claves privadas no deben usarse nunca en el navegador.
