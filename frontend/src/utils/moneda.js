export function formatearPrecio(valor) {
  return `RD$${Number(valor).toLocaleString("es-DO")}`;
}
