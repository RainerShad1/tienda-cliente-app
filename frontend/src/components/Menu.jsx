import { useEffect, useMemo, useState } from "react";
import { obtenerCatalogo } from "../api";
import { formatearPrecio } from "../utils/moneda";

const NOMBRE_TIENDA = import.meta.env.VITE_NOMBRE_TIENDA || "Mi Tienda";

export default function Menu({ onVolver }) {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [carrito, setCarrito] = useState({}); // { [productoId]: cantidad }
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  useEffect(() => {
    obtenerCatalogo()
      .then((datos) => {
        setCategorias(datos.categorias);
        setProductos(datos.productos);
        setCategoriaActiva(datos.categorias[0]?.id || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  const productosDeCategoria = useMemo(
    () => productos.filter((p) => p.categoriaId === categoriaActiva),
    [productos, categoriaActiva]
  );

  const productosPorId = useMemo(() => {
    const mapa = {};
    productos.forEach((p) => (mapa[p.id] = p));
    return mapa;
  }, [productos]);

  const totalItems = Object.values(carrito).reduce((suma, cantidad) => suma + cantidad, 0);
  const totalPrecio = Object.entries(carrito).reduce((suma, [id, cantidad]) => {
    const producto = productosPorId[id];
    return producto ? suma + producto.precio * cantidad : suma;
  }, 0);

  function cambiarCantidad(productoId, delta) {
    setCarrito((actual) => {
      const cantidadActual = actual[productoId] || 0;
      const nuevaCantidad = Math.max(0, cantidadActual + delta);
      const siguiente = { ...actual };
      if (nuevaCantidad === 0) {
        delete siguiente[productoId];
      } else {
        siguiente[productoId] = nuevaCantidad;
      }
      return siguiente;
    });
  }

  return (
    <div className="pantalla-menu">
      <div className="menu-cabecera">
        <div>
          <span className="menu-cabecera__tienda">{NOMBRE_TIENDA}</span>
          <span className="menu-cabecera__estado">🟢 Abierto ahora</span>
        </div>
        <button type="button" className="menu-boton-volver" onClick={onVolver}>
          Mi cuenta
        </button>
      </div>

      {cargando && <p className="menu-mensaje">Cargando el menú…</p>}
      {error && <p className="menu-mensaje menu-mensaje--error">{error}</p>}

      {!cargando && !error && (
        <>
          <div className="menu-categorias">
            {categorias.map((categoria) => (
              <button
                key={categoria.id}
                type="button"
                className={`menu-chip-categoria ${categoriaActiva === categoria.id ? "menu-chip-categoria--activa" : ""}`}
                onClick={() => setCategoriaActiva(categoria.id)}
              >
                <span className="menu-chip-categoria__icono">{categoria.icono}</span>
                {categoria.nombre}
              </button>
            ))}
          </div>

          <div className="menu-lista-productos">
            {productosDeCategoria.map((producto) => (
              <div className="menu-tarjeta-producto" key={producto.id}>
                <div className="menu-tarjeta-producto__icono">{producto.icono}</div>

                <div className="menu-tarjeta-producto__info">
                  <h3>{producto.nombre}</h3>
                  <p>{producto.descripcion}</p>
                  <div className="menu-tarjeta-producto__precios">
                    <span className="menu-precio">{formatearPrecio(producto.precio)}</span>
                    {producto.precioAntes && (
                      <span className="menu-precio-antes">{formatearPrecio(producto.precioAntes)}</span>
                    )}
                  </div>
                </div>

                <div className="menu-tarjeta-producto__control">
                  {carrito[producto.id] ? (
                    <div className="menu-contador">
                      <button type="button" onClick={() => cambiarCantidad(producto.id, -1)} aria-label="Quitar uno">
                        −
                      </button>
                      <span>{carrito[producto.id]}</span>
                      <button type="button" onClick={() => cambiarCantidad(producto.id, 1)} aria-label="Agregar uno">
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="menu-boton-agregar"
                      onClick={() => cambiarCantidad(producto.id, 1)}
                      aria-label={`Agregar ${producto.nombre}`}
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {totalItems > 0 && (
        <button type="button" className="menu-barra-carrito" onClick={() => setMostrarCarrito(true)}>
          <span className="menu-barra-carrito__cantidad">
            🛒 {totalItems} {totalItems === 1 ? "producto" : "productos"}
          </span>
          <span className="menu-barra-carrito__total">{formatearPrecio(totalPrecio)} ›</span>
        </button>
      )}

      {mostrarCarrito && (
        <div className="menu-superposicion" onClick={() => setMostrarCarrito(false)}>
          <div className="menu-hoja-carrito" onClick={(e) => e.stopPropagation()}>
            <h2>Tu pedido</h2>

            <div className="menu-hoja-carrito__lista">
              {Object.entries(carrito).map(([id, cantidad]) => {
                const producto = productosPorId[id];
                if (!producto) return null;
                return (
                  <div className="menu-hoja-carrito__item" key={id}>
                    <span className="menu-hoja-carrito__icono">{producto.icono}</span>
                    <div className="menu-hoja-carrito__info">
                      <strong>{producto.nombre}</strong>
                      <span>{formatearPrecio(producto.precio)} c/u</span>
                    </div>
                    <div className="menu-contador">
                      <button type="button" onClick={() => cambiarCantidad(id, -1)} aria-label="Quitar uno">
                        −
                      </button>
                      <span>{cantidad}</span>
                      <button type="button" onClick={() => cambiarCantidad(id, 1)} aria-label="Agregar uno">
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="menu-hoja-carrito__total">
              <span>Total</span>
              <strong>{formatearPrecio(totalPrecio)}</strong>
            </div>

            <p className="menu-hoja-carrito__nota">
              El pago y la confirmación del pedido los agregamos en la próxima fase. Por ahora puedes armar tu
              pedido para probar el catálogo.
            </p>

            <button type="button" className="menu-boton-cerrar-hoja" onClick={() => setMostrarCarrito(false)}>
              Seguir viendo el menú
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
