# Registro e inicio de sesión de clientes

Proyecto de arranque: página de registro/login de clientes para una tienda.
Campos de registro: **cédula dominicana** (con validación real del dígito
verificador), **nombre**, **número de teléfono** (809/829/849) y **PIN de 4
dígitos**.

## Cómo funciona el flujo

- La primera vez que se abre la página en un navegador/dispositivo, se
  muestra el formulario de **registro**.
- Una vez que alguien se registra en ese dispositivo, las próximas veces se
  muestra la pantalla de **login** (cédula + PIN). Desde ahí hay un enlace
  "Cliente nuevo" para registrar otra cuenta en el mismo dispositivo.
- Después de registrarse (o de iniciar sesión, si esa cuenta todavía no
  tiene ubicación guardada), se muestra un mapa interactivo de Google Maps
  para confirmar la dirección exacta de entrega con un pin arrastrable.
- Con la ubicación guardada, se pasa a la pantalla de bienvenida, que
  muestra los datos del cliente y su dirección de entrega.
- Esto se controla con una bandera en `localStorage` del navegador, así que
  es por dispositivo, no por usuario. Si prefieres otro comportamiento (por
  ejemplo, que el registro solo dependa de si existen clientes en la base de
  datos, sin importar el dispositivo), lo puedo ajustar.

## Ubicación del cliente (Google Maps)

- El frontend necesita una clave de API de Google Maps en la variable de
  entorno `VITE_GOOGLE_MAPS_API_KEY` (ver `frontend/.env.example`).
- En Google Cloud Console, esa clave debe tener habilitadas: **Maps
  JavaScript API** y **Geocoding API**, y debe estar restringida por
  dominio (tu dominio de producción + `localhost` para pruebas) para que
  nadie más pueda usarla.
- **Nunca subas la clave real a GitHub ni la pegues en un chat.** Va solo en
  tu archivo `.env` local (ya está en `.gitignore`) y en las variables de
  entorno del proyecto en Vercel.
- El backend guarda `lat`, `lng`, la dirección, una referencia opcional y
  una etiqueta (Casa/Trabajo/Otro) en el registro del cliente, en la ruta
  protegida `PUT /api/clientes/ubicacion` (requiere el token que se recibe
  al registrarse o iniciar sesión).
- Por seguridad, el backend rechaza coordenadas fuera de una caja
  aproximada de República Dominicana (ver `LIMITES_RD` en
  `backend/src/routes/clientes.js`) — ajústalo si en algún momento entregas
  fuera del país.


## Estructura

```
backend/     API en Node.js + Express (registro, login, validaciones)
frontend/    App en React + Vite (formularios, validación en vivo)
```

## Poner a correr el backend

```bash
cd backend
cp .env.example .env      # cambia JWT_SECRET y agrega tu DATABASE_URL
npm install
npm start                  # http://localhost:4000
```

Los clientes, categorías y productos se guardan en Postgres (recomendamos
Supabase — ver la sección "Base de datos" más abajo para configurarla antes
de correr el backend por primera vez).

## Poner a correr el frontend

```bash
cd frontend
cp .env.example .env      # cambia VITE_NOMBRE_TIENDA por el nombre real
npm install
npm run dev                # http://localhost:5173
```

## Seguridad del PIN

- El PIN nunca se guarda en texto plano: se guarda con `bcrypt`.
- El login bloquea temporalmente (60 segundos) después de 5 intentos
  fallidos con la misma cédula, para dificultar que alguien adivine el PIN
  por fuerza bruta.
- Al iniciar sesión se entrega un token (JWT) que puedes usar para proteger
  rutas futuras del cliente (por ejemplo, "mis pedidos", "mis puntos", etc.).

## Validación de cédula

El algoritmo (`backend/src/utils/cedula.js` y su copia en el frontend)
implementa el dígito verificador oficial de la cédula dominicana: para
cada uno de los primeros 10 dígitos se multiplica por la secuencia de pesos
`1,2,1,2,1,2,1,2,1,2`; si el resultado tiene dos dígitos, se restan 9; se
suman los 10 resultados y el dígito verificador esperado es
`(10 - suma % 10) % 10`, que debe coincidir con el dígito 11 de la cédula.

## Base de datos (Postgres / Supabase)

Los clientes, categorías y productos ahora viven en una base de datos
Postgres real, no en archivos JSON. Usa **Supabase** para esto (ver por qué
más abajo).

**Configurarla la primera vez:**

1. Crea una cuenta gratis en [supabase.com](https://supabase.com) y un
   proyecto nuevo.
2. En tu proyecto → Settings → Database, copia la "Connection string" (modo
   "Transaction" o "Session", cualquiera sirve para este proyecto).
3. Pégala como `DATABASE_URL` en tu `.env` del backend (nunca la pegues en
   un chat — trátala con el mismo cuidado que la clave de Google Maps).
4. En Supabase → SQL Editor → New query, pega el contenido de
   `backend/sql/esquema.sql` y dale Run. Esto crea las tablas.
5. Corre `cd backend && npm run seed` una vez, para cargar las categorías y
   productos iniciales (empanadas, bebidas, combos).
6. Listo — `npm start` ya debería conectar a Supabase en vez de a un
   archivo local.

**Por qué Supabase y no la base de datos gratis de Render:** la base de
datos Postgres gratuita de Render se borra automáticamente a los 30 días
(con 14 días de gracia para pasarla a un plan pago antes de perder los
datos). Supabase, en cambio, solo "pausa" el proyecto tras 7 días sin
actividad — tus datos nunca se pierden, y se reactiva con un clic o
automáticamente en la primera consulta. Supabase también incluye un panel
visual (como una hoja de cálculo) para ver y editar tus clientes y
productos sin escribir SQL.

**En Render**, agrega la misma `DATABASE_URL` como variable de entorno del
servicio backend (Settings → Environment) y vuelve a desplegar.

## Catálogo (empanadas, bebidas, combos)

- Categorías y productos viven en las tablas `categorias` y `productos` de
  la base de datos (ver sección de arriba). Para agregar, quitar o cambiar
  precios, puedes editarlos directamente desde el panel de Supabase (Table
  Editor) sin tocar código, o volver a correr `npm run seed` con los datos
  que quieras después de editar `backend/scripts/seed.js`.
- El frontend consume `GET /api/catalogo` (pública, sin necesidad de token)
  y arma las categorías, las tarjetas de producto y el carrito en memoria
  (`frontend/src/components/Menu.jsx`).
- El carrito por ahora es solo para armar el pedido y ver el total; el pago
  y la confirmación del pedido son la siguiente fase.


## Pedidos

- Tabla `pedidos` en la base de datos (ver `backend/sql/pedidos.sql` — hay
  que correr este SQL en Supabase igual que se hizo con `esquema.sql`, es
  un archivo aparte porque se agregó después).
- `POST /api/pedidos` (requiere token): recibe la lista de productos y
  cantidades, **recalcula los precios en el servidor** contra la base de
  datos (nunca confía en precios que mande el navegador — así nadie puede
  manipular un pedido para pagar menos), y guarda una foto del pedido (con
  los nombres/precios de ese momento, y la dirección de entrega de ese
  momento) para que quede como historial fiel aunque el catálogo o la
  dirección cambien después.
- `GET /api/pedidos` (requiere token): el cliente ve su propio historial.
- Por ahora solo se acepta pago en **efectivo contra entrega**. El backend
  ya sabe rechazar "tarjeta" con un mensaje claro — cuando quieras activar
  el cobro con tarjeta a través del Verifone del repartidor, solo hay que
  quitar esa restricción y ajustar el frontend (el botón ya está ahí,
  deshabilitado, listo para activarse).
- Estados de un pedido: `pendiente`, `confirmado`, `en_camino`,
  `entregado`, `cancelado`. Por ahora todo pedido nuevo nace en
  `pendiente` — cambiar el estado (por ejemplo, cuando el negocio confirma
  o el repartidor sale) es parte del futuro panel de administración.

## Próximos pasos sugeridos

- Conectar el token JWT a rutas protegidas (perfil, historial de compras).
- Cambiar el almacenamiento en archivo por una base de datos real.
- Agregar recuperación de PIN (por ejemplo, verificando el teléfono con un
  código por SMS).
- Personalizar el nombre de la tienda, colores y logo en `frontend/src/styles.css`.
