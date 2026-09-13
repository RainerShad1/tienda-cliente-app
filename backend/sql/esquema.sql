-- Esquema de la base de datos. Corre esto una vez en el editor SQL de
-- Supabase (Project → SQL Editor → New query → pega esto → Run).

create table if not exists clientes (
  cedula text primary key,
  nombre text not null,
  telefono text not null,
  pin_hash text not null,
  ubicacion jsonb,
  creado_en timestamptz not null default now()
);

create table if not exists categorias (
  id text primary key,
  nombre text not null,
  icono text,
  orden integer not null default 0
);

create table if not exists productos (
  id text primary key,
  categoria_id text not null references categorias(id),
  nombre text not null,
  descripcion text,
  precio numeric not null,
  precio_antes numeric,
  icono text,
  destacado boolean not null default false
);

create index if not exists idx_productos_categoria on productos(categoria_id);
