-- Tabla de pedidos. Corre esto en el SQL Editor de Supabase (igual que
-- hiciste con esquema.sql) despues de tener ya las tablas de clientes,
-- categorias y productos.

create extension if not exists pgcrypto;

create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente_cedula text not null references clientes(cedula),
  items jsonb not null,
  total numeric not null,
  metodo_pago text not null default 'efectivo',
  notas text,
  direccion jsonb not null,
  estado text not null default 'pendiente',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists idx_pedidos_cliente on pedidos(cliente_cedula);
create index if not exists idx_pedidos_estado on pedidos(estado);
