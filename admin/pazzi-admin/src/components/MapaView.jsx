import { useEffect, useRef, useState } from 'react';
import { puntosAPI } from '../services/api.js';
import { TODAS, getRegion } from '../utils/localidades.js';

const T = {
  yellow: '#ffb800',
  ink:    '#0f172a',
  muted:  '#64748b',
  border: '#e2e8f0',
  card:   '#ffffff',
  bg:     '#f8fafc',
};

const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const LINEAS = [
  { key: 'vende_hamburguesa', label: 'Hamburguesa', icon: '\ud83c\udf54' },
  { key: 'vende_pancho',      label: 'Pancho',       icon: '\ud83c\udf2d' },
  { key: 'vende_sanguches',   label: 'Sanguches',    icon: '\ud83e\udd6a' },
];

const countLineas = (p) => LINEAS.reduce((n, { key }) => n + (p[key] ? 1 : 0), 0);

// Jerarqu\u00eda visual: a m\u00e1s l\u00edneas vendidas, marcador m\u00e1s grande y de color m\u00e1s intenso
const TIER = {
  3: { size: 38, color: '#c1121f', ring: '#7f0d13' },
  2: { size: 29, color: '#ff8f00', ring: '#b35f00' },
  1: { size: 23, color: '#ffd54f', ring: '#c9a227' },
  0: { size: 18, color: '#cbd5e1', ring: '#94a3b8' },
};

export default function MapaView({ puntos: puntosExternal, refresh, setPuntos }) {
  const mapRef      = useRef(null);
  const leafletRef  = useRef(null);
  const markersRef  = useRef([]);
  const markerMapRef = useRef({});   // id → marker
  const searchRef   = useRef(null);

  const [puntos, setPLocal]       = useState(puntosExternal || []);
  const [mapReady, setMapReady]   = useState(false);
  const [search, setSearch]       = useState('');
  const [dropOpen, setDropOpen]   = useState(false);
  const [selected, setSelected]   = useState(null);   // highlighted in sidebar
  const [userPos, setUserPos]     = useState(null);   // { lat, lng }
  const [locating, setLocating]   = useState(false);
  const userMarkerRef = useRef(null);

  // Sync external puntos
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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = e => { if (searchRef.current && !searchRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Init map
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;
    import('leaflet').then(L => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
      const map = L.map(mapRef.current, { center: [-38, -63], zoom: 5 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors', maxZoom: 19,
      }).addTo(map);
      leafletRef.current = { map, L };
      setMapReady(true);
    });
    return () => {
      if (leafletRef.current?.map) { leafletRef.current.map.remove(); leafletRef.current = null; }
    };
  }, []);

  // Compute filtered list
  const filtered = (() => {
    const q = normalize(search);
    const RADIO_KM = 10;
    let list = puntos.filter(p => p.lat && p.lng);
    if (q) {
      list = list.filter(p =>
        normalize(p.zona || '').includes(q) ||
        normalize(getRegion(p.zona) || '').includes(q) ||
        normalize(p.nombre || '').includes(q)
      );
    }
    if (userPos) {
      list = list
        .map(p => ({ ...p, _dist: haversineKm(userPos.lat, userPos.lng, p.lat, p.lng) }))
        .filter(p => p._dist <= RADIO_KM)
        .sort((a, b) => a._dist - b._dist);
    } else {
      list = [...list].sort((a, b) => countLineas(b) - countLineas(a));
    }
    return list;
  })();

  // Dropdown suggestions from localidades
  const suggestions = (() => {
    const q = normalize(search);
    if (!q) return [];
    const seen = new Set();
    const out = [];
    for (const { localidad, region } of TODAS) {
      if (normalize(localidad).includes(q) || normalize(region).includes(q)) {
        const key = region;
        if (!seen.has(key)) { seen.add(key); out.push({ type: 'region', label: region }); }
        out.push({ type: 'localidad', label: localidad, region });
      }
      if (out.length > 30) break;
    }
    return out;
  })();

  // Update map markers
  useEffect(() => {
    if (!leafletRef.current) return;
    const { map, L } = leafletRef.current;
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    markerMapRef.current = {};

    const makeIcon = (p, highlight) => {
      const tier = TIER[countLineas(p)] ?? TIER[0];
      const size = highlight ? tier.size + 8 : tier.size;
      return L.divIcon({
        html: `<div style="width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;background:${tier.color};border:2.5px solid ${tier.ring};transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.35)${countLineas(p) === 3 ? ',0 0 0 3px rgba(193,18,31,0.18)' : ''}"></div>`,
        className: '', iconSize: [size, size], iconAnchor: [size / 2, size], popupAnchor: [0, -size - 6],
      });
    };

    const lineasChips = (p) => LINEAS
      .map(({ key, icon, label: lineaLabel }) => `<span title="${lineaLabel}" style="opacity:${p[key] ? 1 : 0.25};font-size:0.85rem;margin-right:3px">${icon}</span>`)
      .join('');

    filtered.forEach(p => {
      const marker = L.marker([p.lat, p.lng], { icon: makeIcon(p, false) })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:'DM Sans',sans-serif;min-width:190px;padding:4px 0">
            <div style="font-weight:800;font-size:0.82rem;color:#0f172a;margin-bottom:4px">${p.nombre}</div>
            <div style="font-size:0.7rem;color:#64748b;margin-bottom:2px">📍 ${p.direccion}</div>
            <div style="font-size:0.7rem;color:#64748b;margin-bottom:6px">📞 ${p.telefono}</div>
            <div style="margin-bottom:6px">${lineasChips(p)}<span style="font-size:0.6rem;font-weight:700;color:#0f172a;margin-left:4px">${countLineas(p)}/3 líneas</span></div>
            ${p._dist != null ? `<div style="font-size:0.65rem;color:#0f172a;font-weight:700;margin-bottom:6px">🚶 ${p._dist < 1 ? (p._dist*1000).toFixed(0)+' m' : p._dist.toFixed(1)+' km'}</div>` : ''}
            <span style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:0.58rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;background:#fef9c3;color:#92400e">${p.zona}</span>
          </div>
        `);
      marker.on('click', () => setSelected(p));
      markersRef.current.push(marker);
      markerMapRef.current[p.id] = marker;
    });

    if (filtered.length > 0) {
      try {
        const bounds = L.latLngBounds(filtered.map(p => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      } catch (_) {}
    }
  }, [puntos, search, mapReady, userPos]);

  // Fly to selected punto
  const flyTo = (p) => {
    setSelected(p);
    if (!leafletRef.current) return;
    const { map } = leafletRef.current;
    map.flyTo([p.lat, p.lng], 16, { duration: 0.8 });
    const marker = markerMapRef.current[p.id];
    if (marker) setTimeout(() => marker.openPopup(), 850);
  };

  // Geolocation
  const locateMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserPos({ lat, lng });
        setSearch('');
        setLocating(false);
        if (leafletRef.current) {
          const { map, L } = leafletRef.current;
          if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
          userMarkerRef.current = L.circleMarker([lat, lng], {
            radius: 10, fillColor: '#3b82f6', fillOpacity: 0.9, color: '#fff', weight: 2,
          }).addTo(map).bindPopup('<b style="font-family:DM Sans">Tu ubicación</b>').openPopup();
          map.flyTo([lat, lng], 14, { duration: 1 });
        }
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const clearFilter = () => { setSearch(''); setUserPos(null); setSelected(null); if (userMarkerRef.current && leafletRef.current) { leafletRef.current.map.removeLayer(userMarkerRef.current); userMarkerRef.current = null; } };

  const showSidebar = search.trim() || userPos;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>

      {/* Controls bar */}
      <div style={{
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 8,
        padding: '0.65rem 1rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div ref={searchRef} style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: `1px solid ${T.border}`, borderRadius: 6, padding: '0.38rem 0.7rem', background: T.bg }}>
            <span style={{ fontFamily: 'Material Symbols Outlined', fontStyle: 'normal', fontWeight: 'normal', lineHeight: 1, fontSize: '0.9rem', color: T.muted }}>search</span>
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setUserPos(null); if (userMarkerRef.current && leafletRef.current) { leafletRef.current.map.removeLayer(userMarkerRef.current); userMarkerRef.current = null; } setDropOpen(true); }}
              onFocus={() => setDropOpen(true)}
              placeholder="Buscar por zona, barrio o nombre..."
              autoComplete="off"
              style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '0.78rem', color: T.ink, width: '100%' }}
            />
            {search && (
              <button onClick={clearFilter} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.muted, padding: 0, fontSize: '0.75rem', lineHeight: 1 }}>✕</button>
            )}
          </div>
          {/* Dropdown suggestions */}
          {dropOpen && suggestions.length > 0 && (
            <div style={{ position: 'absolute', zIndex: 1000, top: '100%', left: 0, right: 0, marginTop: 2, background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, boxShadow: '0 8px 24px rgba(15,23,42,0.12)', maxHeight: 240, overflowY: 'auto' }}>
              {suggestions.map((s, i) => s.type === 'region' ? (
                <div key={i} style={{ padding: '0.3rem 0.75rem 0.15rem', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, background: '#f8fafc', borderTop: i > 0 ? `1px solid ${T.border}` : 'none' }}>{s.label}</div>
              ) : (
                <div key={i} onMouseDown={() => { setSearch(s.label); setDropOpen(false); }} style={{ padding: '0.4rem 0.75rem 0.4rem 1.1rem', fontSize: '0.74rem', fontWeight: 500, color: T.ink, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >{s.label}</div>
              ))}
            </div>
          )}
        </div>

        {/* Mi ubicación */}
        <button
          onClick={locateMe}
          disabled={locating}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.38rem 0.85rem',
            background: userPos ? T.yellow : T.bg,
            border: `1px solid ${userPos ? T.yellow : T.border}`,
            borderRadius: 6, cursor: locating ? 'wait' : 'pointer',
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: '0.72rem', fontWeight: 700, color: T.ink,
            transition: 'all 0.15s',
          }}
        >
          <span style={{ fontFamily: 'Material Symbols Outlined', fontStyle: 'normal', fontWeight: 'normal', lineHeight: 1, fontSize: '0.9rem' }}>my_location</span>
          {locating ? 'Buscando...' : 'Mi ubicación'}
        </button>

        {/* Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: 'auto' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 24, height: 24, borderRadius: 6, background: T.yellow, color: T.ink, fontSize: '0.65rem', fontWeight: 800, padding: '0 6px' }}>{filtered.length}</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: T.muted }}>punto{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Map + Sidebar */}
      <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minHeight: 500 }}>

        {/* Map */}
        <div style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 500 }} />
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div style={{
            width: 270, background: T.card, border: `1px solid ${T.border}`, borderRadius: 8,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
          }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${T.border}`, background: T.bg }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.muted }}>
                {userPos ? 'Puntos cercanos' : `Resultados para "${search}"`}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '1.5rem 1rem', textAlign: 'center', fontSize: '0.75rem', color: T.muted }}>
                  Sin resultados
                </div>
              ) : filtered.map((p, i) => (
                <div
                  key={p.id}
                  onClick={() => flyTo(p)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: `1px solid ${T.border}`,
                    cursor: 'pointer',
                    background: selected?.id === p.id ? '#fef9c3' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (selected?.id !== p.id) e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = selected?.id === p.id ? '#fef9c3' : 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{
                      flexShrink: 0, width: TIER[countLineas(p)]?.size * 0.7 || 14, height: TIER[countLineas(p)]?.size * 0.7 || 14,
                      borderRadius: '50% 50% 50% 0',
                      background: TIER[countLineas(p)]?.color || T.yellow, border: `1.5px solid ${TIER[countLineas(p)]?.ring || '#1a1714'}`,
                      transform: 'rotate(-45deg)', display: 'inline-block', marginTop: 2,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 800, color: T.ink, marginBottom: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nombre}</div>
                      <div style={{ fontSize: '0.67rem', color: T.muted, marginBottom: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.direccion}</div>
                      <div style={{ marginTop: '0.15rem' }}>
                        {LINEAS.map(({ key, icon, label: lineaLabel }) => (
                          <span key={key} title={lineaLabel} style={{ opacity: p[key] ? 1 : 0.25, fontSize: '0.72rem', marginRight: 3 }}>{icon}</span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                        <span style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: '#fef9c3', color: '#92400e', padding: '1px 6px', borderRadius: 99 }}>{p.zona}</span>
                        {p._dist != null && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: T.ink }}>
                            {p._dist < 1 ? `${(p._dist*1000).toFixed(0)} m` : `${p._dist.toFixed(1)} km`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
