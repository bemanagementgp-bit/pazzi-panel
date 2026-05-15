import { useEffect, useRef, useState } from 'react';
import { puntosAPI } from '../services/api.js';
import { NOMBRES_REGIONES, getRegion } from '../utils/localidades.js';

const T = {
  yellow: '#ffb800',
  ink:    '#0f172a',
  muted:  '#64748b',
  border: '#e2e8f0',
  card:   '#ffffff',
  bg:     '#f1f5f9',
};

// NOMBRES_REGIONES imported from localidades.js

export default function MapaView({ puntos: puntosExternal, refresh, setPuntos }) {
  const mapRef     = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef([]);
  const [zona, setZona]     = useState('Todas');
  const [puntos, setPLocal] = useState(puntosExternal || []);
  const [selected, setSelected] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // Sync with external puntos
  useEffect(() => {
    if (puntosExternal && puntosExternal.length > 0) {
      setPLocal(puntosExternal);
    } else {
      puntosAPI.getAll().then(res => {
        setPLocal(res.data);
        if (setPuntos) setPuntos(res.data);
      }).catch(console.error);
    }
  }, [refresh, puntosExternal]);

  // Init map
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;
    import('leaflet').then(L => {
      // Fix default icon issue with Vite
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center: [-38, -63],
        zoom: 5,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      leafletRef.current = { map, L };
      setMapReady(true);
    });

    return () => {
      if (leafletRef.current?.map) {
        leafletRef.current.map.remove();
        leafletRef.current = null;
      }
    };
  }, []);

  // Update markers when puntos or zona changes
  useEffect(() => {
    if (!leafletRef.current) return;
    const { map, L } = leafletRef.current;

    // Clear existing markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const filtered = zona === 'Todas'
      ? puntos
      : puntos.filter(p => getRegion(p.zona) === zona || p.zona === zona);

    const yellowIcon = L.divIcon({
      html: `<div style="
        width:28px;height:28px;border-radius:50% 50% 50% 0;
        background:#ffb800;border:2px solid #1a1714;
        transform:rotate(-45deg);
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
      "></div>`,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -30],
    });

    filtered.forEach(p => {
      if (!p.lat || !p.lng) return;
      const marker = L.marker([p.lat, p.lng], { icon: yellowIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:Montserrat,sans-serif;min-width:180px;padding:4px 0">
            <div style="font-weight:800;font-size:0.82rem;color:#1a1714;margin-bottom:4px">${p.nombre}</div>
            <div style="font-size:0.7rem;color:#7a6a55;margin-bottom:2px">?? ${p.direccion}</div>
            <div style="font-size:0.7rem;color:#7a6a55;margin-bottom:2px">?? ${p.telefono}</div>
            ${p.horario ? `<div style="font-size:0.7rem;color:#7a6a55">?? ${p.horario}</div>` : ''}
            <div style="margin-top:6px">
              <span style="
                display:inline-block;padding:2px 8px;border-radius:99px;
                font-size:0.58rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;
                background:#dcfce7;color:#166534;
              ">${p.zona}</span>
            </div>
          </div>
        `);
      marker.on('click', () => setSelected(p));
      markersRef.current.push(marker);
    });

    if (filtered.length > 0) {
      try {
        const bounds = L.latLngBounds(filtered.filter(p => p.lat && p.lng).map(p => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
      } catch (_) {}
    }
  }, [puntos, zona, mapReady]);

  const filtered = zona === 'Todas'
    ? puntos
    : puntos.filter(p => getRegion(p.zona) === zona || p.zona === zona);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>

      {/* Controls */}
      <div style={{
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 4,
        padding: '0.75rem 1rem',
        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
      }}>
        <span style={{ fontFamily: 'Material Symbols Outlined', fontStyle: 'normal', fontWeight: 'normal', lineHeight: 1, fontSize: '1rem', color: T.muted }}>filter_list</span>
        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Zona</span>
        <select
          value={zona}
          onChange={e => setZona(e.target.value)}
          style={{
            border: `1px solid ${T.border}`, borderRadius: 6,
            padding: '0.35rem 0.65rem',
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: '0.72rem', fontWeight: 600, color: T.ink,
            background: T.bg, cursor: 'pointer', outline: 'none',
          }}
        >
          {NOMBRES_REGIONES.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            minWidth: 24, height: 24, borderRadius: 6,
            background: T.yellow, color: T.ink,
            fontSize: '0.65rem', fontWeight: 800,
            padding: '0 6px',
          }}>{filtered.length}</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: T.muted }}>punto{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Map container */}
      <div style={{
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 4,
        overflow: 'hidden', flex: 1, minHeight: 520,
        position: 'relative',
        boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
      }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 520 }} />
      </div>

    </div>
  );
}
