// Carga el script de Google Maps JavaScript API una sola vez, sin importar
// cuantas veces se monte el componente que lo necesita.

let promesaDeCarga = null;

export function cargarGoogleMaps(apiKey) {
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (promesaDeCarga) {
    return promesaDeCarga;
  }

  promesaDeCarga = new Promise((resolve, reject) => {
    const idScript = "google-maps-script";
    const existente = document.getElementById(idScript);

    if (existente) {
      existente.addEventListener("load", () => resolve(window.google.maps));
      existente.addEventListener("error", () => reject(new Error("No se pudo cargar Google Maps.")));
      return;
    }

    const script = document.createElement("script");
    script.id = idScript;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => {
      promesaDeCarga = null;
      reject(new Error("No se pudo cargar Google Maps. Revisa la clave de API."));
    };

    document.head.appendChild(script);
  });

  return promesaDeCarga;
}
