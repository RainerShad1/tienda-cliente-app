import { useEffect, useState } from "react";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import Bienvenida from "./components/Bienvenida";

const CLAVE_DISPOSITIVO_REGISTRADO = "tienda_dispositivo_ya_registro_cliente";
const CLAVE_SESION = "tienda_sesion_cliente";

export default function App() {
  // vista: "registro" | "login" | "bienvenida"
  const [vista, setVista] = useState(null);
  const [cliente, setCliente] = useState(null);

  useEffect(() => {
    const sesionGuardada = localStorage.getItem(CLAVE_SESION);
    if (sesionGuardada) {
      try {
        const { cliente: clienteGuardado } = JSON.parse(sesionGuardada);
        setCliente(clienteGuardado);
        setVista("bienvenida");
        return;
      } catch {
        localStorage.removeItem(CLAVE_SESION);
      }
    }

    const yaHuboRegistro = localStorage.getItem(CLAVE_DISPOSITIVO_REGISTRADO) === "true";
    setVista(yaHuboRegistro ? "login" : "registro");
  }, []);

  function manejarExitoRegistro({ token, cliente: clienteNuevo }) {
    localStorage.setItem(CLAVE_DISPOSITIVO_REGISTRADO, "true");
    localStorage.setItem(CLAVE_SESION, JSON.stringify({ token, cliente: clienteNuevo }));
    setCliente(clienteNuevo);
    setVista("bienvenida");
  }

  function manejarExitoLogin({ token, cliente: clienteExistente }) {
    localStorage.setItem(CLAVE_DISPOSITIVO_REGISTRADO, "true");
    localStorage.setItem(CLAVE_SESION, JSON.stringify({ token, cliente: clienteExistente }));
    setCliente(clienteExistente);
    setVista("bienvenida");
  }

  function cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
    setCliente(null);
    setVista("login");
  }

  if (!vista) return null;

  return (
    <main className="pantalla">
      {vista === "registro" && (
        <RegisterForm
          onExito={manejarExitoRegistro}
          onIrALogin={() => setVista("login")}
          mostrarEnlaceLogin={localStorage.getItem(CLAVE_DISPOSITIVO_REGISTRADO) === "true"}
        />
      )}
      {vista === "login" && (
        <LoginForm onExito={manejarExitoLogin} onIrARegistro={() => setVista("registro")} />
      )}
      {vista === "bienvenida" && cliente && (
        <Bienvenida cliente={cliente} onCerrarSesion={cerrarSesion} />
      )}
    </main>
  );
}
