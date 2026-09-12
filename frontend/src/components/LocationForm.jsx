import { useEffect, useRef, useState } from "react";
import { cargarGoogleMaps } from "../utils/googleMaps";
import { guardarUbicacion } from "../api";

const NOMBRE_TIENDA = import.meta.env.VITE_NOMBRE_TIENDA || "Mi Tienda";
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Santo Domingo como centro por defecto mientras se obtiene el GPS del cliente.
const CENTRO_POR_DEFECTO = { lat: 18.4861, lng: -69.9312 };
const ETIQUETAS = ["Casa", "Trabajo", "Otro"];

export default function LocationForm({ token, onExito, onOmitir }) {
  const contenedorMapaRef = useRef(null);
  const mapaRef = useRef(null);
  const marcadorRef = useRef(null);
  const geocoderRef = useRef(null);

  const [cargandoMapa, setCargandoMapa] = useState(true);
  const [errorMapa, setErrorMapa] = useState("");
  const [direccion, setDireccion] = useState("");
  const [coordenadas, setCoordenadas] = useState(null);
  const [buscandoDireccion, setBuscandoDireccion] = useState(false);
  const [referencia, setReferencia] = useState("");
  const [etiqueta, setEtiqueta] = useState("Casa");
  const [errorGuardado, setErrorGuardado] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let cancelado = false;

    if (!API_KEY) {
      setErrorMapa(
        "Falta configurar la clave de Google Maps (VITE_GOOGLE_MAPS_API_KEY) para poder mostrar el mapa."
      );
      setCargandoMapa(false);
      return;
    }

    cargarGoogleMaps(API_KEY)
      .then((maps) => {
        if (cancelado || !contenedorMapaRef.current) return;

        geocoderRef.current = new maps.Geocoder();

        const mapa = new maps.Map(contenedorMapaRef.current, {
          center: CENTRO_POR_DEFECTO,
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
        });
        mapaRef.current = mapa;

        const marcador = new maps.Marker({
          position: CENTRO_POR_DEFECTO,
          map: mapa,
          draggable: true,
        });
        marcadorRef.current = marcador;

        marcador.addListener("dragend", () => {
          const posicion = marcador.getPosition();
          actualizarDesdeCoordenadas(posicion.lat(), posicion.lng());
        });

        mapa.addListener("click", (evento) => {
          marcador.setPosition(evento.latLng);
          actualizarDesdeCoordenadas(evento.latLng.lat(), evento.latLng.lng());
        });

        setCargandoMapa(false);
        centrarEnUbicacionActual(mapa, marcador);
      })
      .catch((err) => {
        if (!cancelado) {
          setErrorMapa(err.message);
          setCargandoMapa(false);
        }
      });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function centrarEnUbicacionActual(mapa, marcador) {
    if (!navigator.geolocation) {
      actualizarDesdeCoordenadas(CENTRO_POR_DEFECTO.lat, CENTRO_POR_DEFECTO.lng);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        const punto = { lat: posicion.coords.latitude, lng: posicion.coords.longitude };
        mapa.setCenter(punto);
        marcador.setPosition(punto);
        actualizarDesdeCoordenadas(punto.lat, punto.lng);
      },
      () => {
        // El cliente no dio permiso de ubicacion: se queda el pin en el
        // centro por defecto y el mismo lo puede mover a mano.
        actualizarDesdeCoordenadas(CENTRO_POR_DEFECTO.lat, CENTRO_POR_DEFECTO.lng);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function actualizarDesdeCoordenadas(lat, lng) {
    setCoordenadas({ lat, lng });

    if (!geocoderRef.current) return;

    setBuscandoDireccion(true);
    geocoderRef.current.geocode({ location: { lat, lng } }, (resultados, estado) => {
      setBuscandoDireccion(false);
      if (estado === "OK" && resultados && resultados[0]) {
        setDireccion(resultados[0].formatted_address);
      }
    });
  }

  async function manejarConfirmar() {
    setErrorGuardado("");

    if (!coordenadas) {
      setErrorGuardado("Ajusta el pin en el mapa antes de continuar.");
      return;
    }
    if (!direccion || direccion.trim().length < 5) {
      setErrorGuardado("Escribe o confirma una dirección.");
      return;
    }

    setGuardando(true);
    try {
      const datos = await guardarUbicacion(token, {
        lat: coordenadas.lat,
        lng: coordenadas.lng,
        direccion,
        referencia,
        etiqueta,
      });
      onExito(datos);
    } catch (err) {
      setErrorGuardado(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="tarjeta-formulario tarjeta-ancha">
      <header className="franja-marca">
        <span className="franja-marca__tienda">{NOMBRE_TIENDA}</span>
        <span className="franja-marca__tipo">Ubicación de entrega</span>
      </header>

      <div className="cuerpo-formulario">
        <h1>¿Dónde te entregamos?</h1>
        <p className="texto-ayuda">
          Ajusta el pin en el mapa hasta que quede exactamente en tu casa o punto de entrega.
        </p>

        {errorMapa ? (
          <div className="alerta-error">{errorMapa}</div>
        ) : (
          <div className="contenedor-mapa">
            <div ref={contenedorMapaRef} className="mapa" />
            {cargandoMapa && <div className="mapa-cargando">Cargando mapa…</div>}
          </div>
        )}

        <div className="campo">
          <label htmlFor="direccion-detectada">Dirección</label>
          <input
            id="direccion-detectada"
            type="text"
            value={buscandoDireccion ? "Buscando dirección…" : direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Se completa al mover el pin, o escríbela tú mismo"
            disabled={buscandoDireccion}
          />
        </div>

        <div className="campo">
          <label htmlFor="referencia">Referencia (opcional)</label>
          <input
            id="referencia"
            type="text"
            placeholder="Ej: casa color azul, portón negro, al lado del colmado"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
          />
        </div>

        <div className="campo">
          <span className="etiqueta-pin">Guardar como</span>
          <div className="chips-etiqueta">
            {ETIQUETAS.map((opcion) => (
              <button
                key={opcion}
                type="button"
                className={`chip ${etiqueta === opcion ? "chip--activo" : ""}`}
                onClick={() => setEtiqueta(opcion)}
              >
                {opcion}
              </button>
            ))}
          </div>
        </div>

        {errorGuardado && <div className="alerta-error">{errorGuardado}</div>}

        <button type="button" className="boton-principal" onClick={manejarConfirmar} disabled={guardando}>
          {guardando ? "Guardando…" : "Confirmar ubicación"}
        </button>

        {onOmitir && (
          <p className="texto-enlace">
            <button type="button" className="enlace" onClick={onOmitir}>
              Hacerlo más tarde
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
