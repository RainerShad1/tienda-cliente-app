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
cp .env.example .env      # y cambia JWT_SECRET por un valor propio
npm install
npm start                  # http://localhost:4000
```

Los clientes se guardan en `backend/data/clients.json` (un archivo, no una
base de datos real). Es suficiente para probar y para un volumen pequeño.
Cuando quieras pasar a producción con muchos clientes concurrentes, cambia
`backend/src/db.js` por Postgres, MySQL o SQLite — el resto del código no
tiene que cambiar porque solo usa las funciones de ese archivo.

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

## Catálogo (empanadas, bebidas, combos)

- Los datos viven en `backend/data/catalogo.json` (categorías y productos).
  Es el mismo enfoque de archivo simple que usamos para los clientes: fácil
  de editar a mano por ahora, y fácil de migrar a una base de datos real más
  adelante sin tocar el resto del código.
- Para agregar, quitar o cambiar precios de productos, edita ese archivo
  directamente — no hace falta tocar código.
- El frontend consume `GET /api/catalogo` (pública, sin necesidad de token)
  y arma las categorías, las tarjetas de producto y el carrito en memoria
  (`frontend/src/components/Menu.jsx`).
- El carrito por ahora es solo para armar el pedido y ver el total; el pago
  y la confirmación del pedido son la siguiente fase.

## Próximos pasos sugeridos

- Conectar el token JWT a rutas protegidas (perfil, historial de compras).
- Cambiar el almacenamiento en archivo por una base de datos real.
- Agregar recuperación de PIN (por ejemplo, verificando el teléfono con un
  código por SMS).
- Personalizar el nombre de la tienda, colores y logo en `frontend/src/styles.css`.
