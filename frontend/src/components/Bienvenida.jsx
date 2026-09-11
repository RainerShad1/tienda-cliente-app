const NOMBRE_TIENDA = import.meta.env.VITE_NOMBRE_TIENDA || "Mi Tienda";

export default function Bienvenida({ cliente, onCerrarSesion }) {
  const primerNombre = cliente.nombre.split(" ")[0];

  return (
    <div className="tarjeta-formulario">
      <header className="franja-marca">
        <span className="franja-marca__tienda">{NOMBRE_TIENDA}</span>
        <span className="franja-marca__tipo">Cuenta de cliente</span>
      </header>

      <div className="cuerpo-formulario cuerpo-bienvenida">
        <h1>Hola, {primerNombre}</h1>
        <p className="texto-ayuda">Tu cuenta quedó lista. Aquí es donde irá el resto de tu experiencia como cliente.</p>

        <dl className="lista-datos">
          <div>
            <dt>Cédula</dt>
            <dd>{cliente.cedula.replace(/(\d{3})(\d{7})(\d{1})/, "$1-$2-$3")}</dd>
          </div>
          <div>
            <dt>Teléfono</dt>
            <dd>{cliente.telefono.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}</dd>
          </div>
        </dl>

        <button type="button" className="boton-secundario" onClick={onCerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
