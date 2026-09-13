import { useEffect, useState } from "react";
import { obtenerMisPedidos } from "../api";
import { formatearPrecio } from "../utils/moneda";

const NOMBRE_TIENDA = import.meta.env.VITE_NOMBRE_TIENDA || "Mi Tienda";

const ETIQUETAS_ESTADO = {
  pendiente: { texto: "Pendiente", clase: "menu-estado--pendiente" },
  confirmado: { texto: "Confirmado", clase: "menu-estado--confirmado" },
  en_camino: { texto: "En camino", clase: "menu-estado--en-camino" },
  entregado: { texto: "Entregado", clase: "menu-estado--entregado" },
  cancelado: { texto: "Cancelado", clase: "menu-estado--cancelado" },
};

function formatearFecha(iso) {
  return new Date(iso).toLocaleString("es-DO", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MisPedidos({ token, onVolver }) {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerMisPedidos(token)
      .then((datos) => setPedidos(datos.pedidos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [token]);

  return (
    <div className="pantalla-menu">
      <div className="menu-cabecera">
        <div>
          <span className="menu-cabecera__tienda">{NOMBRE_TIENDA}</span>
          <span className="menu-cabecera__estado">Mis pedidos</span>
        </div>
        <button type="button" className="menu-boton-volver" onClick={onVolver}>
          Volver al menú
        </button>
      </div>

      {cargando && <p className="menu-mensaje">Cargando tus pedidos…</p>}
      {error && <p className="menu-mensaje menu-mensaje--error">{error}</p>}

      {!cargando && !error && pedidos.length === 0 && (
        <p className="menu-mensaje">Todavía no has hecho ningún pedido.</p>
      )}

      <div className="menu-lista-pedidos">
        {pedidos.map((pedido) => {
          const estado = ETIQUETAS_ESTADO[pedido.estado] || ETIQUETAS_ESTADO.pendiente;
          return (
            <div className="menu-tarjeta-pedido" key={pedido.id}>
              <div className="menu-tarjeta-pedido__cabecera">
                <span>{formatearFecha(pedido.creadoEn)}</span>
                <span className={`menu-estado ${estado.clase}`}>{estado.texto}</span>
              </div>

              <ul className="menu-tarjeta-pedido__items">
                {pedido.items.map((item) => (
                  <li key={item.productoId}>
                    {item.cantidad}× {item.nombre}
                  </li>
                ))}
              </ul>

              {pedido.notas && <p className="menu-tarjeta-pedido__notas">"{pedido.notas}"</p>}

              <div className="menu-tarjeta-pedido__pie">
                <span>Efectivo contra entrega</span>
                <strong>{formatearPrecio(pedido.total)}</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
