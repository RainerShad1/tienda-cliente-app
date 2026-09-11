import { useState } from "react";
import { formatearCedula, validarCedula, limpiarCedula } from "../utils/cedula";
import { formatearTelefono, validarTelefono } from "../utils/telefono";
import { registrarCliente } from "../api";
import PinInput from "./PinInput";

const NOMBRE_TIENDA = import.meta.env.VITE_NOMBRE_TIENDA || "Mi Tienda";

export default function RegisterForm({ onExito, onIrALogin, mostrarEnlaceLogin }) {
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [pin, setPin] = useState("");
  const [confirmarPin, setConfirmarPin] = useState("");
  const [tocado, setTocado] = useState({});
  const [errorServidor, setErrorServidor] = useState("");
  const [enviando, setEnviando] = useState(false);

  const cedulaValida = validarCedula(cedula);
  const nombreValido = nombre.trim().length >= 3;
  const telefonoValido = validarTelefono(telefono);
  const pinValido = /^\d{4}$/.test(pin);
  const pinsCoinciden = pin === confirmarPin && pinValido;
  const formularioValido = cedulaValida && nombreValido && telefonoValido && pinsCoinciden;

  function marcarTocado(campo) {
    setTocado((actual) => ({ ...actual, [campo]: true }));
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setErrorServidor("");
    setTocado({ cedula: true, nombre: true, telefono: true, pin: true, confirmarPin: true });

    if (!formularioValido) return;

    setEnviando(true);
    try {
      const datos = await registrarCliente({
        cedula: limpiarCedula(cedula),
        nombre,
        telefono,
        pin,
        confirmarPin,
      });
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
        <h1>Crea tu cuenta</h1>
        <p className="texto-ayuda">
          Regístrate una sola vez con tu cédula. La próxima vez que entres aquí, solo necesitarás tu PIN.
        </p>

        <div className="campo">
          <label htmlFor="reg-cedula">Cédula</label>
          <input
            id="reg-cedula"
            type="text"
            inputMode="numeric"
            placeholder="000-0000000-0"
            value={formatearCedula(cedula)}
            onChange={(e) => setCedula(limpiarCedula(e.target.value))}
            onBlur={() => marcarTocado("cedula")}
            maxLength={13}
            autoComplete="off"
          />
          {tocado.cedula && !cedulaValida && (
            <span className="mensaje-error">Escribe una cédula dominicana válida.</span>
          )}
        </div>

        <div className="campo">
          <label htmlFor="reg-nombre">Nombre completo</label>
          <input
            id="reg-nombre"
            type="text"
            placeholder="Como aparece en tu cédula"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onBlur={() => marcarTocado("nombre")}
            autoComplete="name"
          />
          {tocado.nombre && !nombreValido && (
            <span className="mensaje-error">Escribe tu nombre completo.</span>
          )}
        </div>

        <div className="campo">
          <label htmlFor="reg-telefono">Número de teléfono</label>
          <input
            id="reg-telefono"
            type="tel"
            inputMode="numeric"
            placeholder="(809) 000-0000"
            value={formatearTelefono(telefono)}
            onChange={(e) => setTelefono(e.target.value)}
            onBlur={() => marcarTocado("telefono")}
            maxLength={14}
            autoComplete="tel-national"
          />
          {tocado.telefono && !telefonoValido && (
            <span className="mensaje-error">Usa un número dominicano válido (809, 829 u 849).</span>
          )}
        </div>

        <div className="fila-pines">
          <PinInput id="reg-pin" label="Crea un PIN de 4 dígitos" value={pin} onChange={setPin} />
          <PinInput id="reg-confirmar-pin" label="Confirma tu PIN" value={confirmarPin} onChange={setConfirmarPin} />
        </div>
        {tocado.confirmarPin && pinValido && confirmarPin.length === 4 && pin !== confirmarPin && (
          <span className="mensaje-error">Los dos PIN no coinciden.</span>
        )}

        {errorServidor && <div className="alerta-error">{errorServidor}</div>}

        <button type="submit" className="boton-principal" disabled={enviando}>
          {enviando ? "Creando cuenta…" : "Crear cuenta"}
        </button>

        {mostrarEnlaceLogin && (
          <p className="texto-enlace">
            ¿Ya tienes cuenta?{" "}
            <button type="button" className="enlace" onClick={onIrALogin}>
              Inicia sesión
            </button>
          </p>
        )}
      </div>
    </form>
  );
}
