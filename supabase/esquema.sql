-- TABLAS

create table if not exists public.perfiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  nombre         text not null default '',
  nombre_usuario text not null default '',
  correo         text not null unique,
  universidad    text not null default '',
  rol            text not null default 'cliente' check (rol in ('admin', 'cliente')),
  foto           text,
  creado_en      timestamptz not null default now()
);

create table if not exists public.categorias (
  valor       text primary key,
  etiqueta    text not null unique,
  descripcion text not null default ''
);

create table if not exists public.articulos (
  id                  bigint generated always as identity primary key,
  nombre              text not null,
  descripcion         text not null default '',
  precio              numeric(12, 2) not null check (precio >= 0),
  calificacion        numeric(2, 1) not null default 0 check (calificacion between 0 and 5),
  categoria           text not null references public.categorias (valor) on update cascade on delete restrict,
  universidad         text not null default '',
  vendedor            text not null default 'UniMarket',
  vendedor_id         uuid references public.perfiles (id) on delete set null,
  distancia           numeric(6, 2) not null default 0,
  condicion           text not null default 'Nuevo (Sellado)',
  stock               integer not null default 0 check (stock >= 0),
  stock_guardado      integer,
  sku                 text not null default '',
  entrega             text not null default 'A convenir',
  universidades_venta text[] not null default '{}',
  fotos               text[] not null default '{}',
  creado_en           timestamptz not null default now()
);
create index if not exists articulos_categoria_idx on public.articulos (categoria);
create index if not exists articulos_vendedor_idx on public.articulos (vendedor_id);

create sequence if not exists public.folio_seq start 100001;

create table if not exists public.ordenes (
  folio           text primary key default ('BOL-' || nextval('public.folio_seq')),
  user_id         uuid references public.perfiles (id) on delete set null,
  cliente_nombre  text not null default '',
  cliente_correo  text not null,
  estado          text not null default 'Pagada' check (estado in ('Pagada', 'Pendiente', 'Anulada')),
  metodo_pago     text not null default '',
  ultimos_digitos text not null default '',
  autorizacion    text not null default '',
  lineas          jsonb not null default '[]',
  total           numeric(12, 2) not null default 0,
  creada_en       timestamptz not null default now()
);
create index if not exists ordenes_correo_idx on public.ordenes (lower(cliente_correo));

-- FUNCIONES Y TRIGGERS

create or replace function public.es_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin');
$$;

create or replace function public.crear_perfil_al_registrarse()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre, nombre_usuario, correo, universidad, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', ''),
    coalesce(new.raw_user_meta_data ->> 'nombre_usuario', ''),
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'universidad', ''),
    'cliente'
  );
  return new;
end;
$$;

drop trigger if exists al_registrarse on auth.users;
create trigger al_registrarse
  after insert on auth.users
  for each row execute function public.crear_perfil_al_registrarse();

create or replace function public.proteger_perfiles()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  admins integer;
begin
  if tg_op = 'UPDATE' then
    if new.rol is distinct from old.rol and auth.uid() is not null and not public.es_admin() then
      raise exception 'Solo un administrador puede cambiar roles.';
    end if;
    if new.correo is distinct from old.correo then
      new.correo := old.correo;
    end if;
    if old.rol = 'admin' and new.rol <> 'admin' then
      select count(*) into admins from public.perfiles where rol = 'admin';
      if admins <= 1 then
        raise exception 'No puedes quitar el rol al unico administrador.';
      end if;
    end if;
    return new;
  end if;

  if old.rol = 'admin' then
    select count(*) into admins from public.perfiles where rol = 'admin';
    if admins <= 1 then
      raise exception 'No puedes eliminar al unico administrador.';
    end if;
  end if;
  return old;
end;
$$;

drop trigger if exists proteger_perfiles_trg on public.perfiles;
create trigger proteger_perfiles_trg
  before update or delete on public.perfiles
  for each row execute function public.proteger_perfiles();

create or replace function public.eliminar_usuario(p_id uuid)
returns void
language plpgsql security definer set search_path = public, auth
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo un administrador puede eliminar cuentas.';
  end if;
  delete from auth.users where id = p_id;
end;
$$;

-- SEGURIDAD A NIVEL DE FILA
alter table public.perfiles   enable row level security;
alter table public.categorias enable row level security;
alter table public.articulos  enable row level security;
alter table public.ordenes    enable row level security;

-- Politicas de perfiles
drop policy if exists perfiles_ver on public.perfiles;
create policy perfiles_ver on public.perfiles for select to authenticated
  using (id = auth.uid() or public.es_admin());

drop policy if exists perfiles_editar on public.perfiles;
create policy perfiles_editar on public.perfiles for update to authenticated
  using (id = auth.uid() or public.es_admin())
  with check (id = auth.uid() or public.es_admin());

-- Politicas de categorias
drop policy if exists categorias_ver on public.categorias;
create policy categorias_ver on public.categorias for select using (true);

drop policy if exists categorias_admin on public.categorias;
create policy categorias_admin on public.categorias for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

drop policy if exists articulos_ver on public.articulos;
create policy articulos_ver on public.articulos for select using (true);

drop policy if exists articulos_crear on public.articulos;
create policy articulos_crear on public.articulos for insert to authenticated
  with check (vendedor_id = auth.uid() or public.es_admin());

drop policy if exists articulos_editar on public.articulos;
create policy articulos_editar on public.articulos for update to authenticated
  using (vendedor_id = auth.uid() or public.es_admin())
  with check (vendedor_id = auth.uid() or public.es_admin());

drop policy if exists articulos_borrar on public.articulos;
create policy articulos_borrar on public.articulos for delete to authenticated
  using (vendedor_id = auth.uid() or public.es_admin());

drop policy if exists ordenes_ver on public.ordenes;
create policy ordenes_ver on public.ordenes for select to authenticated
  using (user_id = auth.uid() or public.es_admin());

drop policy if exists ordenes_crear on public.ordenes;
create policy ordenes_crear on public.ordenes for insert to authenticated
  with check (public.es_admin());

drop policy if exists ordenes_admin_editar on public.ordenes;
create policy ordenes_admin_editar on public.ordenes for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- Funcion de compra
create or replace function public.crear_orden(
  p_lineas jsonb, p_metodo_pago text, p_ultimos_digitos text, p_autorizacion text
)
returns public.ordenes
language plpgsql security definer set search_path = public
as $$
declare
  v_perfil public.perfiles;
  v_linea  jsonb;
  v_art    public.articulos;
  v_cant   integer;
  v_total  numeric := 0;
  v_lineas jsonb := '[]';
  v_orden  public.ordenes;
begin
  select * into v_perfil from public.perfiles where id = auth.uid();
  if not found then
    raise exception 'Debes iniciar sesión para comprar.';
  end if;
  if jsonb_typeof(p_lineas) <> 'array' or jsonb_array_length(p_lineas) = 0 then
    raise exception 'La bolsa está vacía.';
  end if;

  for v_linea in select * from jsonb_array_elements(p_lineas) loop
    v_cant := (v_linea ->> 'cantidad')::integer;
    if v_cant is null or v_cant < 1 then
      raise exception 'Cantidad no válida.';
    end if;
    select * into v_art from public.articulos where id = (v_linea ->> 'idArticulo')::bigint for update;
    if not found then
      raise exception 'Un producto de tu bolsa ya no existe.';
    end if;
    if v_art.stock < v_cant then
      raise exception 'Stock insuficiente de "%": quedan %.', v_art.nombre, v_art.stock;
    end if;
    update public.articulos set stock = stock - v_cant where id = v_art.id;
    v_total := v_total + v_art.precio * v_cant;
    v_lineas := v_lineas || jsonb_build_object(
      'idArticulo', v_art.id, 'nombre', v_art.nombre, 'categoria', v_art.categoria,
      'vendedor', v_art.vendedor, 'precio', v_art.precio, 'cantidad', v_cant
    );
  end loop;

  insert into public.ordenes (user_id, cliente_nombre, cliente_correo, metodo_pago, ultimos_digitos, autorizacion, lineas, total)
  values (v_perfil.id, v_perfil.nombre, v_perfil.correo, p_metodo_pago, p_ultimos_digitos, p_autorizacion, v_lineas, v_total)
  returning * into v_orden;
  return v_orden;
end;
$$;

-- Permisos de las funciones
revoke all on function public.eliminar_usuario(uuid) from public;
grant execute on function public.eliminar_usuario(uuid) to authenticated;
grant execute on function public.es_admin() to anon, authenticated;
revoke all on function public.crear_orden(jsonb, text, text, text) from public;
grant execute on function public.crear_orden(jsonb, text, text, text) to authenticated;

-- DATOS DE EJEMPLO
insert into public.categorias (valor, etiqueta, descripcion) values
  ('snacks',     'Snacks & Comida',              'Comida casera, dulces y bebidas.'),
  ('ropa',       'Ropa & Accesorios',            'Ropa de segunda mano y accesorios.'),
  ('tecnologia', 'Tecnología & Electrónica',     'Calculadoras, audífonos, cables y más.'),
  ('libros',     'Libros & Material de Estudio', 'Textos, apuntes y útiles.'),
  ('otros',      'Otros',                        'Todo lo que no entra en otra categoría.')
on conflict (valor) do nothing;

insert into public.articulos
  (nombre, descripcion, precio, calificacion, categoria, universidad, vendedor, distancia, condicion, stock, sku, entrega)
select * from (values
  ('Brownies de Chocolate Caseros', 'Deliciosos brownies con chispas de chocolate, hechos en casa.', 2.5, 5.0, 'snacks', 'UNAM', 'María G.', 0.5, 'Casero', 10, '', 'Entrada de la Facultad de Ingenieria'),
  ('Calculadora Científica Casio fx-991LA X', 'Como nueva, con estuche para ingeniería.', 15.0, 4.8, 'tecnologia', 'IPN', 'Carlos R.', 1.2, 'Usado', 1, 'CALC-CASIO-991', 'Biblioteca Central - Entrada'),
  ('Chaqueta Denim Vintage', 'Talla M, excelente estado, estilo retro.', 20.0, 4.9, 'ropa', 'Tec de Monterrey', 'Ana V.', 2.5, '2da Mano', 1, '', 'A convenir por chat'),
  ('Bebida Energética Monster Original 473ml', 'Lata fría, directo del kiosco central.', 3.0, 4.5, 'snacks', 'UAM', 'Kiosco Central', 0.2, 'Nuevo', 25, '', 'Kiosco Central')
) as v(nombre, descripcion, precio, calificacion, categoria, universidad, vendedor, distancia, condicion, stock, sku, entrega)
where not exists (select 1 from public.articulos);

insert into public.ordenes
  (cliente_nombre, cliente_correo, estado, metodo_pago, ultimos_digitos, autorizacion, lineas, total, creada_en)
select * from (values
  ('Juan Pérez',    'juan.perez@unimarket.edu', 'Pagada',    'Crédito', '4242', 'EJ0001', '[{"idArticulo":3,"nombre":"Chaqueta Denim Vintage","categoria":"ropa","vendedor":"Ana V.","precio":20,"cantidad":1}]'::jsonb, 20, now() - interval '34 days'),
  ('Camila Rojas',  'camila.rojas@correo.cl',   'Pagada',    'Débito',  '1111', 'EJ0002', '[{"idArticulo":1,"nombre":"Brownies de Chocolate Caseros","categoria":"snacks","vendedor":"María G.","precio":2.5,"cantidad":4},{"idArticulo":4,"nombre":"Bebida Energética Monster Original 473ml","categoria":"snacks","vendedor":"Kiosco Central","precio":3,"cantidad":2}]'::jsonb, 16, now() - interval '21 days'),
  ('Juan Pérez',    'juan.perez@unimarket.edu', 'Pagada',    'Crédito', '4242', 'EJ0003', '[{"idArticulo":2,"nombre":"Calculadora Científica Casio fx-991LA X","categoria":"tecnologia","vendedor":"Carlos R.","precio":15,"cantidad":1},{"idArticulo":1,"nombre":"Brownies de Chocolate Caseros","categoria":"snacks","vendedor":"María G.","precio":2.5,"cantidad":2}]'::jsonb, 20, now() - interval '12 days'),
  ('Pedro Soto',    'pedro.soto@correo.cl',     'Pendiente', 'Débito',  '2222', 'EJ0004', '[{"idArticulo":4,"nombre":"Bebida Energética Monster Original 473ml","categoria":"snacks","vendedor":"Kiosco Central","precio":3,"cantidad":6}]'::jsonb, 18, now() - interval '6 days'),
  ('Juan Pérez',    'juan.perez@unimarket.edu', 'Pagada',    'Crédito', '4242', 'EJ0005', '[{"idArticulo":3,"nombre":"Chaqueta Denim Vintage","categoria":"ropa","vendedor":"Ana V.","precio":20,"cantidad":1},{"idArticulo":4,"nombre":"Bebida Energética Monster Original 473ml","categoria":"snacks","vendedor":"Kiosco Central","precio":3,"cantidad":1}]'::jsonb, 23, now() - interval '2 days'),
  ('Camila Rojas',  'camila.rojas@correo.cl',   'Anulada',   'Débito',  '1111', 'EJ0006', '[{"idArticulo":2,"nombre":"Calculadora Científica Casio fx-991LA X","categoria":"tecnologia","vendedor":"Carlos R.","precio":15,"cantidad":1}]'::jsonb, 15, now() - interval '1 day')
) as v(cliente_nombre, cliente_correo, estado, metodo_pago, ultimos_digitos, autorizacion, lineas, total, creada_en)
where not exists (select 1 from public.ordenes);

