const NOMBRE_TIENDA = import.meta.env.VITE_NOMBRE_TIENDA || "Mi Tienda";

export default function Menu({ onVolver }) {
  return (
    <div className="tarjeta-formulario tarjeta-ancha">
      <header className="franja-marca">
        <span className="franja-marca__tienda">{NOMBRE_TIENDA}</span>
        <span className="franja-marca__tipo">Catálogo</span>
      </header>

      <div className="cuerpo-formulario">
        <h1>El catálogo está en camino</h1>
        <p className="texto-ayuda">
          Aquí va a ir el menú de productos, con categorías, precios y el carrito de pedido —
          lo construimos en la próxima fase.
        </p>

        <button type="button" className="boton-secundario" onClick={onVolver}>
          Volver a mi cuenta
        </button>
      </div>
    </div>
  );
}
