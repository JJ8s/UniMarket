# Pruebas unitarias — UniMarket (React)

Guía paso a paso de cómo se armaron las pruebas unitarias de este proyecto y
cómo mostrarlas en una evaluación de sistema.

## 0. Por qué estas pruebas y no otras

Los datos viven en Supabase (ver `DOCUMENTACION.md`, sección 1), pero las
pruebas **no usan la red**: inyectan un Supabase simulado en memoria
(`src/tests/supabaseFalso.js`) con `usarCliente()`. Ese simulador imita las
tablas, el trigger de perfiles, los folios y las restricciones; las políticas
RLS se verificaron aparte contra un PostgreSQL real. Por eso las pruebas unitarias apuntan a lo que sí es "lógica de
negocio" real en este proyecto:

- **`src/data/datos.js`** — registro, login, actualización de cuenta, lectura
  y escritura de artículos. Es el equivalente más cercano a una capa de
  backend/base de datos que tiene la app.
- **`src/utils/utilidades.js`** — funciones puras de cálculo y formato
  (precio, búsqueda, agrupar el carrito).
- **`src/hooks/useMisArticulos.js`** — lógica con estado (borrar un
  artículo, activar/desactivar disponibilidad).

No se probaron las páginas (`src/pages/`) ni componentes visuales
(`Header`, `Footer`, etc.): son principalmente JSX y maquetación, que se
verifican mejor a ojo (ya se revisaron a mano en la etapa anterior) o con
pruebas de interfaz (E2E), que es un tipo de prueba distinto a la unitaria.

## 1. Elegir y instalar el test runner

Como el proyecto ya usa **Vite**, la elección natural es **Vitest**: es el
test runner oficial del equipo de Vite, reutiliza la misma configuración
(`vite.config.js`) y no hay que levantar un bundler aparte como pasaría con
Jest.

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom @vitest/coverage-v8
```

- `vitest` — corre las pruebas.
- `@testing-library/react` — renderiza componentes/hooks de React dentro de
  una prueba (`renderHook`, `render`).
- `@testing-library/jest-dom` — agrega matchers legibles como
  `toBeInTheDocument()`.
- `jsdom` — simula un navegador (incluye `localStorage`) dentro de Node,
  para que el código que usa `localStorage` funcione en las pruebas sin abrir
  un navegador real.
- `@vitest/coverage-v8` — genera el reporte de cobertura.

## 2. Configurar Vitest

Se agregó un bloque `test` a `vite.config.js` (no se necesita un archivo de
configuración aparte):

```js
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',        // da localStorage, document, etc.
    setupFiles: './src/tests/setup.js',
    globals: true,                 // describe/it/expect sin importarlos
  },
});
```

Y `src/tests/setup.js`, que se ejecuta una vez antes de todas las pruebas:

```js
import '@testing-library/jest-dom';
```

## 3. Elegir qué casos probar por función

Para cada función se cubrieron 3 tipos de caso:

1. **Camino feliz** — la entrada esperada da el resultado esperado.
2. **Bordes/errores** — entrada vacía, `null`, datos corruptos, ids que no
   existen.
3. **Reglas de negocio específicas** — por ejemplo, que el correo no
   distinga mayúsculas al hacer login, o que borrar un artículo pida
   confirmación antes de hacerlo.

Ejemplo de tabla de casos (la que se usó para `validarCredenciales`):

| # | Entrada | Resultado esperado |
|---|---|---|
| 1 | Correo y contraseña correctos de la cuenta de prueba | Devuelve el objeto usuario |
| 2 | Correo correcto, contraseña incorrecta | `null` |
| 3 | Correo que no existe | `null` |
| 4 | Correo correcto pero con mayúsculas y espacios extra | Devuelve el usuario (no debe ser sensible a eso) |

Esta misma tabla, repetida para cada función probada, es lo que conviene
mostrar en la evaluación (ver sección 6).

## 4. Dónde quedó cada archivo de pruebas

**Las 10 pruebas de la evaluación** son de componentes React (anexo, pág. 11) y
viven en `src/tests/`:

```
src/tests/componentes.spec.js    Jasmine + Karma   (npm run test:karma)
src/tests/componentes.test.jsx   Vitest            (npm run test)
```

Los dos archivos tienen el mismo contenido. Son 2 pruebas por cada tipo:

| Tipo | Pruebas |
|---|---|
| Renderizado correcto | 1) `SelectorModal` lista todas las opciones; 2) `TarjetaMetrica` muestra título, valor y detalle |
| Renderizado condicional | 3) `MensajeError` solo aparece si hay error; 4) `InsigniaStock` muestra "Agotado" con stock 0 |
| Props | 5) `EstadoVacio` usa mensaje, texto y destino del enlace; 6) `InsigniaEstadoOrden` cambia de color según `estado` |
| Estado | 7) `FormularioCategoria` actualiza su estado al escribir; 8) `SelectorModal` abre y cierra su modal |
| Eventos | 9) `BuscadorFiltros` llama a `onBusqueda`; 10) `FormularioCategoria` envía los datos y muestra el error devuelto |

**Pruebas adicionales** (capa de datos, reportes y un hook; usan un Supabase
simulado en memoria) están aparte en `src/pruebas-extra/` y no cuentan entre
las 10: `npm run test:extra` (84 pruebas). `npm run test:todo` y
`npm run test:karma:todo` corren las 94 juntas.

Un ejemplo real (`formatearPrecio`, en `utilidades.test.js`):

```js
describe('formatearPrecio', () => {
  it('agrega el simbolo $ y dos decimales', () => {
    expect(formatearPrecio(2.5)).toBe('$2.50');
  });
});
```

Para las pruebas que usan `localStorage` (en `datos.test.js`) se agregó
`beforeEach(() => localStorage.clear())`: sin esto, lo que guarda una
prueba queda disponible para la siguiente y los resultados dejan de ser
confiables (un test podría "pasar" solo porque otro test anterior ya dejó
los datos correctos).

## 5. Correr las pruebas

```bash
npm run test            # corre todas las pruebas una vez y muestra el resultado
npm run test:watch      # las vuelve a correr cada vez que guardas un archivo
npm run test:coverage   # corre las pruebas y muestra el % de código cubierto
```

Resultado actual del proyecto:

```
 ✓ src/data/datos.test.js (15 tests)
 ✓ src/utils/utilidades.test.js (12 tests)
 ✓ src/hooks/useMisArticulos.test.js (6 tests)

 Test Files  3 passed (3)
      Tests  33 passed (33)
```

## 6. Cómo mostrarlo en la evaluación de sistema

Qué llevar y en qué orden, para que quede claro que hay un proceso y no
solo un resultado:

1. **El plan de pruebas** — la tabla de casos (como la de la sección 3),
   una por función importante. No hace falta mostrar las 33 completas, con
   2 o 3 ejemplos representativos (uno con camino feliz, uno con error, uno
   con una regla de negocio) se entiende el criterio.
2. **El código de una prueba** — mostrar un `describe`/`it` real y explicar
   en una frase qué verifica (ej: "este test registra un usuario con el
   mismo correo dos veces y comprueba que la segunda vez se rechaza").
3. **Correr `npm run test` en vivo** — lo más convincente para una
   evaluación es que las pruebas corran delante del evaluador, no una
   captura vieja. Si piden evidencia para el informe, una captura de la
   terminal con el resumen final (`Tests 33 passed (33)`) sirve como
   respaldo.
4. **El reporte de cobertura** (`npm run test:coverage`) — muestra qué
   porcentaje del código probado quedó cubierto. En este proyecto la
   cobertura es alta en `datos.js` y `utilidades.js` (lo que sí se probó) y
   0% en páginas y componentes (intencional: no son el objetivo de estas
   pruebas unitarias). Vale la pena explicar esa diferencia si preguntan por
   qué no es 100% global, en vez de que parezca una omisión.
5. **Qué pasa si se rompe algo** — un buen cierre para la evaluación es
   provocar a propósito un error (por ejemplo, comentar una línea de
   `validarCredenciales` que compara la contraseña) y mostrar que
   `npm run test` falla y dice exactamente qué prueba y por qué. Eso
   demuestra que las pruebas realmente verifican el comportamiento y no son
   solo decorativas.

---

# Anexo: pruebas con Jasmine + Karma

El proyecto tiene **dos juegos de pruebas equivalentes** (mismos 33 casos):

| | Vitest | Jasmine + Karma |
|---|---|---|
| Archivos | `src/**/*.test.js` | `src/**/*.spec.js` |
| Comando | `npm run test` | `npm run test:karma` |
| Dónde corre | Node + jsdom (navegador simulado) | Chrome real (headless) |
| Cobertura | `npm run test:coverage` | no incluida |

## Qué es cada pieza

- **Jasmine**: el framework. Aporta `describe`, `it`, `expect`, `beforeEach` y `spyOn`.
- **Karma**: el ejecutor. Abre un navegador real, carga las pruebas y reporta.
- **karma-esbuild**: empaqueta los módulos ES (`import`/`export`), que Karma no entiende solo.
- **karma-spec-reporter**: lista cada prueba por nombre en la consola.
- **karma.conf.cjs**: configuración (es `.cjs` porque `package.json` usa `"type": "module"`).

## Cómo correrlo

```bash
npm install
npm run test:karma
```

Necesita Chrome o Chromium instalado. Si Karma no lo encuentra, indica la ruta:

```bash
# Linux / macOS
export CHROME_BIN=/ruta/a/chrome
# Windows (PowerShell)
$env:CHROME_BIN="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

Para ver el navegador abrirse con el resultado en pantalla, en `karma.conf.cjs`
cambia `browsers` a `['Chrome']` y `singleRun` a `false`.

## Diferencias de sintaxis (Vitest -> Jasmine)

| Vitest | Jasmine |
|---|---|
| `import { describe, it, expect } from 'vitest'` | se quita (son globales) |
| `vi.spyOn(window, 'confirm').mockReturnValue(true)` | `spyOn(window, 'confirm').and.returnValue(true)` |
| `expect(x).toHaveLength(2)` | `expect(x.length).toBe(2)` |

## Trampa conocida: aislamiento entre archivos

En Karma todos los `.spec.js` se cargan en la misma página. Un `beforeEach`
escrito fuera de un `describe` se aplica a **todas** las pruebas del proyecto,
no solo a las de su archivo. Al portar las pruebas, el `beforeEach` de
`useMisArticulos.spec.js` guardaba artículos de prueba para todos y rompía
`cargarArticulos`; se corrigió metiéndolo dentro de su `describe`. Además,
Jasmine ejecuta las pruebas en orden aleatorio, así que cada una debe partir
de un estado limpio (`localStorage.clear()`).

## Nota

Karma está marcado como obsoleto (deprecated) por el equipo de Angular desde
2023. Funciona sin problemas, pero para proyectos nuevos se recomienda
Vitest, que es el que se usa por defecto en este proyecto.
