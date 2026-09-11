import { useRef } from "react";

export default function PinInput({ id, label, value, onChange, autoFocus = false }) {
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const digitos = value.padEnd(4, " ").slice(0, 4).split("");

  function actualizarPosicion(indice, nuevoTexto) {
    const soloDigito = nuevoTexto.replace(/\D/g, "").slice(-1);
    const siguientes = [...digitos];
    siguientes[indice] = soloDigito || " ";
    const resultado = siguientes.join("").trimEnd();
    onChange(resultado);

    if (soloDigito && indice < 3) {
      refs[indice + 1].current?.focus();
    }
  }

  function manejarTeclaAbajo(indice, evento) {
    if (evento.key === "Backspace" && !digitos[indice].trim() && indice > 0) {
      refs[indice - 1].current?.focus();
    }
  }

  function manejarPegado(evento) {
    const pegado = evento.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pegado) return;
    evento.preventDefault();
    onChange(pegado);
    const ultimoIndice = Math.min(pegado.length - 1, 3);
    refs[ultimoIndice].current?.focus();
  }

  return (
    <div className="campo-pin">
      {label && <span className="etiqueta-pin">{label}</span>}
      <div className="cajas-pin" role="group" aria-label={label}>
        {[0, 1, 2, 3].map((indice) => (
          <input
            key={indice}
            id={`${id}-${indice}`}
            ref={refs[indice]}
            className="caja-pin"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={1}
            autoFocus={autoFocus && indice === 0}
            value={digitos[indice].trim()}
            onChange={(e) => actualizarPosicion(indice, e.target.value)}
            onKeyDown={(e) => manejarTeclaAbajo(indice, e)}
            onPaste={manejarPegado}
          />
        ))}
      </div>
    </div>
  );
}
