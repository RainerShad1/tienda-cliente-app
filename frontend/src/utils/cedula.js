// Misma logica que el backend (utils/cedula.js), para dar feedback inmediato
// en el formulario sin esperar la respuesta del servidor.

export function limpiarCedula(valor) {
  return (valor || "").toString().replace(/\D/g, "").slice(0, 11);
}

export function formatearCedula(valor) {
  const digitos = limpiarCedula(valor);
  let salida = digitos.slice(0, 3);
  if (digitos.length > 3) salida += "-" + digitos.slice(3, 10);
  if (digitos.length > 10) salida += "-" + digitos.slice(10, 11);
  return salida;
}

export function validarCedula(valor) {
  const digitos = limpiarCedula(valor);
  if (digitos.length !== 11) return false;
  if (digitos.slice(0, 3) === "000") return false;

  const pesos = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 10; i++) {
    let parcial = parseInt(digitos[i], 10) * pesos[i];
    if (parcial > 9) parcial -= 9;
    suma += parcial;
  }

  const digitoVerificador = (10 - (suma % 10)) % 10;
  return digitoVerificador === parseInt(digitos[10], 10);
}
