const CODIGOS_VALIDOS = ["809", "829", "849"];

export function limpiarTelefono(valor) {
  return (valor || "").toString().replace(/\D/g, "").slice(0, 10);
}

export function formatearTelefono(valor) {
  const digitos = limpiarTelefono(valor);
  let salida = "";
  if (digitos.length > 0) salida += "(" + digitos.slice(0, 3);
  if (digitos.length >= 3) salida += ") ";
  if (digitos.length > 3) salida += digitos.slice(3, 6);
  if (digitos.length > 6) salida += "-" + digitos.slice(6, 10);
  return salida.trim();
}

export function validarTelefono(valor) {
  const digitos = limpiarTelefono(valor);
  if (digitos.length !== 10) return false;
  return CODIGOS_VALIDOS.includes(digitos.slice(0, 3));
}
