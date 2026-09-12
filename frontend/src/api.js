const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function manejarRespuesta(res) {
  const datos = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(datos.error || "Algo salio mal. Intenta de nuevo.");
  }
  return datos;
}

export async function registrarCliente({ cedula, nombre, telefono, pin, confirmarPin }) {
  const res = await fetch(`${API_URL}/auth/registro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cedula, nombre, telefono, pin, confirmarPin }),
  });
  return manejarRespuesta(res);
}

export async function iniciarSesion({ cedula, pin }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cedula, pin }),
  });
  return manejarRespuesta(res);
}

export async function guardarUbicacion(token, { lat, lng, direccion, referencia, etiqueta }) {
  const res = await fetch(`${API_URL}/clientes/ubicacion`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ lat, lng, direccion, referencia, etiqueta }),
  });
  return manejarRespuesta(res);
}
