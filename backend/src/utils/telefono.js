// Numeros dominicanos: codigo de area 809 / 829 / 849 + 7 digitos = 10 digitos.

const CODIGOS_VALIDOS = ["809", "829", "849"];

function limpiarTelefono(valor) {
  return (valor || "").toString().replace(/\D/g, "").slice(0, 10);
}

function formatearTelefono(valor) {
  const digitos = limpiarTelefono(valor);
  let salida = "";
  if (digitos.length > 0) salida += "(" + digitos.slice(0, 3);
  if (digitos.length >= 3) salida += ") ";
  if (digitos.length > 3) salida += digitos.slice(3, 6);
  if (digitos.length > 6) salida += "-" + digitos.slice(6, 10);
  return salida.trim();
}

function validarTelefono(valor) {
  const digitos = limpiarTelefono(valor);
  if (digitos.length !== 10) return false;
  return CODIGOS_VALIDOS.includes(digitos.slice(0, 3));
}

module.exports = { limpiarTelefono, formatearTelefono, validarTelefono };
