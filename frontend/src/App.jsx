import { useEffect, useState } from "react";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import LocationForm from "./components/LocationForm";
import Bienvenida from "./components/Bienvenida";
import Menu from "./components/Menu";
import MisPedidos from "./components/MisPedidos";

const CLAVE_DISPOSITIVO_REGISTRADO = "tienda_dispositivo_ya_registro_cliente";
const CLAVE_SESION = "tienda_sesion_cliente";

export default function App() {
  // vista: "registro" | "login" | "ubicacion" | "bienvenida" | "menu" | "pedidos"
  const [vista, setVista] = useState(null);
  const [sesion, setSesion] = useState(null); // { token, cliente }

  useEffect(() => {
    const sesionGuardada = localStorage.getItem(CLAVE_SESION);
    if (sesionGuardada) {
      try {
        const datosGuardados = JSON.parse(sesionGuardada);
        setSesion(datosGuardados);
        setVista(datosGuardados.cliente.ubicacion ? "bienvenida" : "ubicacion");
        return;
      } catch {
        localStorage.removeItem(CLAVE_SESION);
      }
    }

    const yaHuboRegistro = localStorage.getItem(CLAVE_DISPOSITIVO_REGISTRADO) === "true";
    setVista(yaHuboRegistro ? "login" : "registro");
  }, []);

  function guardarSesion(datos) {
    localStorage.setItem(CLAVE_DISPOSITIVO_REGISTRADO, "true");
    localStorage.setItem(CLAVE_SESION, JSON.stringify(datos));
    setSesion(datos);
  }

  function manejarExitoRegistro(datos) {
    guardarSesion(datos);
    setVista("ubicacion");
  }

  function manejarExitoLogin(datos) {
    guardarSesion(datos);
    setVista(datos.cliente.ubicacion ? "bienvenida" : "ubicacion");
  }

  function manejarExitoUbicacion({ cliente: clienteActualizado }) {
    const nuevaSesion = { ...sesion, cliente: clienteActualizado };
    guardarSesion(nuevaSesion);
    setVista("bienvenida");
  }

  function cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
    setSesion(null);
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

      {vista === "ubicacion" && sesion && (
        <LocationForm
          token={sesion.token}
          onExito={manejarExitoUbicacion}
          onOmitir={() => setVista("bienvenida")}
        />
      )}

      {vista === "bienvenida" && sesion && (
        <Bienvenida
          cliente={sesion.cliente}
          onCerrarSesion={cerrarSesion}
          onEditarUbicacion={() => setVista("ubicacion")}
          onVerMenu={() => setVista("menu")}
        />
      )}

      {vista === "menu" && sesion && (
        <Menu
          token={sesion.token}
          tieneUbicacion={Boolean(sesion.cliente.ubicacion)}
          onVolver={() => setVista("bienvenida")}
          onIrAUbicacion={() => setVista("ubicacion")}
          onVerPedidos={() => setVista("pedidos")}
        />
      )}

      {vista === "pedidos" && sesion && (
        <MisPedidos token={sesion.token} onVolver={() => setVista("menu")} />
      )}
    </main>
  );
}
