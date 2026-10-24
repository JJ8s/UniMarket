# Puesta en marcha de Supabase

## 1. Crear el proyecto
1. Entra a https://supabase.com, crea una cuenta y pulsa **New project**.
2. Elige nombre, contraseña de la base de datos y región. Espera a que termine de crearse.

## 2. Crear las tablas y las reglas de seguridad
1. En el proyecto abre **SQL Editor -> New query**.
2. Pega todo el contenido de `supabase/esquema.sql` y pulsa **Run**.
   El script se puede ejecutar más de una vez sin duplicar datos.
3. Crea las tablas `perfiles`, `categorias`, `articulos` y `ordenes`, el trigger que crea un perfil al
   registrarse, las políticas RLS y los datos de ejemplo (5 categorías, 4 artículos y 6 órdenes).

## 3. Configurar el inicio de sesión
En **Authentication -> Providers -> Email**:
- Para desarrollo y la evaluación, **desactiva "Confirm email"**: así las cuentas nuevas entran
  directo. Si lo dejas activo, la app avisa que hay que confirmar el correo antes de iniciar sesión.

## 4. Conectar la app
1. En **Project Settings -> API** copia la **Project URL** y la clave **anon / publishable**.
2. Copia `.env.example` a `.env` y pega los valores:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```
3. **Nunca** uses la clave `service_role` en la app ni la subas a GitHub. `.env` ya está en `.gitignore`.
4. Reinicia `npm run dev` (Vite solo lee `.env` al arrancar).

## 5. Crear el primer administrador
1. Regístrate en la app (`/registro`) con el correo que será admin, por ejemplo `admin@unimarket.edu`.
2. En **SQL Editor** ejecuta:
   ```sql
   update public.perfiles set rol = 'admin' where correo = 'admin@unimarket.edu';
   ```
3. Cierra sesión y vuelve a entrar: te llevará a `/admin`. Desde ahí puedes crear más usuarios y cambiar roles.

## Notas
- Las órdenes de ejemplo no están ligadas a ninguna cuenta (`user_id` vacío): el admin las ve en Órdenes y Reportes; en el historial de un usuario solo aparecen si su correo coincide con el de la orden.
- Cuando el admin crea una cuenta desde el panel, si "Confirm email" está activo la persona debe confirmar su correo.
- Para volver a empezar: en el SQL Editor ejecuta `drop table public.ordenes, public.articulos, public.categorias, public.perfiles cascade;` y vuelve al paso 2.
