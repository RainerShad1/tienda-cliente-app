import { useState } from "react";
import { formatearCedula, validarCedula, limpiarCedula } from "../utils/cedula";
import { iniciarSesion } from "../api";
import PinInput from "./PinInput";

const NOMBRE_TIENDA = import.meta.env.VITE_NOMBRE_TIENDA || "Mi Tienda";

export default function LoginForm({ onExito, onIrARegistro, mensaje }) {
  const [cedula, setCedula] = useState("");
  const [pin, setPin] = useState("");
  const [tocado, setTocado] = useState({});
  const [errorServidor, setErrorServidor] = useState("");
  const [enviando, setEnviando] = useState(false);

  const cedulaValida = validarCedula(cedula);
  const pinValido = /^\d{4}$/.test(pin);
  const formularioValido = cedulaValida && pinValido;

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setErrorServidor("");
    setTocado({ cedula: true, pin: true });

    if (!formularioValido) return;

    setEnviando(true);
    try {
      const datos = await iniciarSesion({ cedula: limpiarCedula(cedula), pin });
      onExito(datos);
    } catch (err) {
      setErrorServidor(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="tarjeta-formulario" onSubmit={manejarEnvio} noValidate>
      <header className="franja-marca">
        <span className="franja-marca__tienda">{NOMBRE_TIENDA}</span>
        <span className="franja-marca__tipo">Cuenta de cliente</span>
      </header>

      <div className="cuerpo-formulario">
        <h1>Bienvenido de nuevo</h1>
        <p className="texto-ayuda">Ingresa tu cédula y tu PIN para entrar a tu cuenta.</p>

        {mensaje && <div className="aviso-info">{mensaje}</div>}

        <div className="campo">
          <label htmlFor="login-cedula">Cédula</label>
          <input
            id="login-cedula"
            type="text"
            inputMode="numeric"
            placeholder="000-0000000-0"
            value={formatearCedula(cedula)}
            onChange={(e) => setCedula(limpiarCedula(e.target.value))}
            onBlur={() => marcarTocado("cedula")}
            maxLength={13}
            autoComplete="off"
            autoFocus
          />
          {tocado.cedula && !cedulaValida && (
            <span className="mensaje-error">Escribe una cédula dominicana válida.</span>
          )}
        </div>

        <PinInput id="login-pin" label="Tu PIN" value={pin} onChange={setPin} />

        {errorServidor && <div className="alerta-error">{errorServidor}</div>}

        <button type="submit" className="boton-principal" disabled={enviando}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>

        <p className="texto-enlace">
          ¿Cliente nuevo?{" "}
          <button type="button" className="enlace" onClick={onIrARegistro}>
            Crea tu cuenta
          </button>
        </p>
      </div>
    </form>
  );

  function marcarTocado(campo) {
    setTocado((actual) => ({ ...actual, [campo]: true }));
  }
}
