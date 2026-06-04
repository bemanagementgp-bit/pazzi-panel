import { useState, useEffect, useRef } from 'react';
import { puntosAPI } from '../services/api.js';
import { TODAS, getRegion } from '../utils/localidades.js';
import { normalizeArgPhone } from '../utils/phone.js';

const T = {
  yellow: '#ffb800',
  yHover: '#e6a500',
  ink:    '#111827',
  muted:  '#6b7280',
  border: '#e5e7eb',
  red:    '#dc2626',
  surface:'#f9fafb',
  white:  '#ffffff',
};

const ZONAS = [];

export default function PuntoForm({ punto, onSuccess, onCancel, isAdmin }) {
  const [formData, setFormData] = useState({
    nombre: '', zona: '', direccion: '', telefono: '', lat: '', lng: '',
  });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [geoMsg, setGeoMsg]     = useState('');
  const [zonaSearch, setZonaSearch]   = useState('');
  const [zonaOpen, setZonaOpen]       = useState(false);
  const zonaRef = useRef(null);
  const miniMapRef   = useRef(null);
  const miniLeafRef  = useRef(null);
  const miniMarkerRef = useRef(null);

  useEffect(() => {
    if (punto) {
      setFormData({ ...punto, lat: punto.lat ?? '', lng: punto.lng ?? '' });
      setZonaSearch(punto.zona ?? '');
    }
  }, [punto]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (zonaRef.current && !zonaRef.current.contains(e.target)) setZonaOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Init mini-map
  useEffect(() => {
    if (!miniMapRef.current || miniLeafRef.current) return;
    import('leaflet').then(L => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
      const initLat = parseFloat(formData.lat) || -34.6037;
      const initLng = parseFloat(formData.lng) || -58.3816;
      const map = L.map(miniMapRef.current, { center: [initLat, initLng], zoom: 13 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ' © OpenStreetMap contributors', maxZoom: 19,
      }).addTo(map);

      const yellowIcon = L.divIcon({
        html: `<div style="width:20px;height:20px;border-radius:50% 50% 50% 0;background:#ffb800;border:2px solid #1a1714;transform:rotate(-45deg);box-shadow:0 2px 5px rgba(0,0,0,0.3)"></div>`,
        className: '', iconSize: [20, 20], iconAnchor: [10, 20], popupAnchor: [0, -22],
      });

      // If editing, place existing marker
      if (formData.lat && formData.lng) {
        miniMarkerRef.current = L.marker([initLat, initLng], { icon: yellowIcon, draggable: true }).addTo(map);
        miniMarkerRef.current.on('dragend', e => {
          const { lat, lng } = e.target.getLatLng();
          setFormData(prev => ({ ...prev, lat: lat.toFixed(7), lng: lng.toFixed(7) }));
        });
      }

      map.on('click', e => {
        const { lat, lng } = e.latlng;
        setFormData(prev => ({ ...prev, lat: lat.toFixed(7), lng: lng.toFixed(7) }));
        if (miniMarkerRef.current) {
          miniMarkerRef.current.setLatLng([lat, lng]);
        } else {
          miniMarkerRef.current = L.marker([lat, lng], { icon: yellowIcon, draggable: true }).addTo(map);
          miniMarkerRef.current.on('dragend', ev => {
            const p = ev.target.getLatLng();
            setFormData(prev => ({ ...prev, lat: p.lat.toFixed(7), lng: p.lng.toFixed(7) }));
          });
        }
      });

      miniLeafRef.current = { map, L, yellowIcon };
    });
    return () => {
      if (miniLeafRef.current?.map) { miniLeafRef.current.map.remove(); miniLeafRef.current = null; }
    };
  }, []);

  // Sync marker position when lat/lng inputs change manually
  useEffect(() => {
    if (!miniLeafRef.current) return;
    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);
    if (isNaN(lat) || isNaN(lng)) return;
    const { map, L, yellowIcon } = miniLeafRef.current;
    if (miniMarkerRef.current) {
      miniMarkerRef.current.setLatLng([lat, lng]);
    } else {
      miniMarkerRef.current = L.marker([lat, lng], { icon: yellowIcon, draggable: true }).addTo(map);
      miniMarkerRef.current.on('dragend', e => {
        const p = e.target.getLatLng();
        setFormData(prev => ({ ...prev, lat: p.lat.toFixed(7), lng: p.lng.toFixed(7) }));
      });
    }
    map.panTo([lat, lng]);
  }, [formData.lat, formData.lng]);

  const geocodeAddress = async () => {
    const query = [formData.direccion, formData.zona || zonaSearch].filter(Boolean).join(', ');
    if (!query.trim()) return;
    setGeocoding(true);
    setGeoMsg('');
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'es', 'User-Agent': 'PazziPanel/1.0' } });
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setFormData(prev => ({ ...prev, lat: parseFloat(lat).toFixed(7), lng: parseFloat(lon).toFixed(7) }));
        setGeoMsg('✓ Ubicación encontrada');
      } else {
        setGeoMsg('No se encontró la dirección. Intentá ser más específico.');
      }
    } catch {
      setGeoMsg('Error al buscar. Verificá tu conexión.');
    } finally {
      setGeocoding(false);
    }
  };

  const zonaFiltered = (() => {
    const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const q = normalize(zonaSearch);
    if (!q) return TODAS;
    return TODAS.filter(x =>
      normalize(x.localidad).includes(q) ||
      normalize(x.region).includes(q)
    );
  })();

  const selectZona = (localidad) => {
    setFormData(prev => ({ ...prev, zona: localidad }));
    setZonaSearch(localidad);
    setZonaOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: (name === 'lat' || name === 'lng') ? value : value }));
  };

  // Normaliza el teléfono al perder foco. Si la entrada es válida queda
  // como `+54 9 <area> XXXX-XXX(X)`; si no, se deja como está y la validación
  // del servidor (que usa el mismo algoritmo) devolverá el error.
  const handleTelefonoBlur = (e) => {
    const raw = e.target.value;
    if (!raw?.trim()) return;
    const normalized = normalizeArgPhone(raw);
    if (normalized) {
      setFormData(prev => ({ ...prev, telefono: normalized }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Si el usuario escribió algo en zona pero no seleccionó del dropdown, usarlo igual
    const zonaFinal = formData.zona || zonaSearch.trim();
    // Normalización final del teléfono antes de enviar.
    const telefonoNormalizado = normalizeArgPhone(formData.telefono);
    if (!telefonoNormalizado) {
      setError('Teléfono inválido. Formato esperado: +54 9 11 1234-5678');
      setLoading(false);
      return;
    }
    try {
      const payload = { ...formData, zona: zonaFinal, telefono: telefonoNormalizado };
      if (isAdmin) {
        payload.lat = parseFloat(formData.lat) || null;
        payload.lng = parseFloat(formData.lng) || null;
      } else {
        delete payload.lat;
        delete payload.lng;
      }
      if (punto?.id) await puntosAPI.update(punto.id, payload);
      else await puntosAPI.create(payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = {
    width: '100%', boxSizing: 'border-box',
    padding: '0.6rem 0.75rem',
    border: `1px solid ${T.border}`,
    borderRadius: 4,
    background: T.white,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: '0.8rem', color: T.ink,
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  const label = (text, required) => (
    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginBottom: '0.4rem' }}>
      {text}{required && <span style={{ color: T.red, marginLeft: 2 }}>*</span>}
    </label>
  );

  const field = (labelText, required, children) => (
    <div>
      {label(labelText, required)}
      {children}
    </div>
  );

  const onFocus = e => { e.target.style.borderColor = T.yellow; };
  const onBlur  = e => { e.target.style.borderColor = T.border; };

  return (
    <div style={{ padding: '1.75rem' }}>
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: T.ink, letterSpacing: '-0.01em' }}>
          {punto?.id ? 'Editar punto de venta' : 'Nuevo punto de venta'}
        </div>
        <div style={{ fontSize: '0.65rem', color: T.muted, marginTop: '0.2rem', fontWeight: 500 }}>
          Los campos marcados con * son obligatorios
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Nombre + Zona */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {field('Nombre', true,
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange}
              onFocus={onFocus} onBlur={onBlur}
              required placeholder="Ej: Pazzi Palermo" style={inputBase} />
          )}
          <div ref={zonaRef} style={{ position: 'relative' }}>
            {label('Localidad / zona', true)}
            <input
              type="text"
              value={zonaSearch}
              onChange={e => { setZonaSearch(e.target.value); setFormData(prev => ({ ...prev, zona: '' })); setZonaOpen(true); }}
              onFocus={() => setZonaOpen(true)}
              placeholder="Buscar localidad..."
              autoComplete="off"
              required
              style={inputBase}
            />
            {zonaOpen && zonaFiltered.length > 0 && (
              <div style={{
                position: 'absolute', zIndex: 999, top: '100%', left: 0, right: 0,
                background: '#fff', border: `1px solid ${T.border}`, borderTop: 'none',
                borderRadius: '0 0 8px 8px', maxHeight: 220, overflowY: 'auto',
                boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
              }}>
                {(() => {
                  let lastRegion = null;
                  return zonaFiltered.map(({ localidad, region }) => {
                    const showHeader = region !== lastRegion;
                    lastRegion = region;
                    return (
                      <div key={localidad}>
                        {showHeader && (
                          <div style={{
                            padding: '0.35rem 0.75rem 0.2rem',
                            fontSize: '0.55rem', fontWeight: 700,
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                            color: T.muted, background: '#f8fafc',
                            borderTop: `1px solid ${T.border}`,
                            position: 'sticky', top: 0,
                          }}>{region}</div>
                        )}
                        <div
                          onMouseDown={() => selectZona(localidad)}
                          style={{
                            padding: '0.45rem 0.75rem',
                            fontSize: '0.74rem', fontWeight: 500, color: T.ink,
                            cursor: 'pointer',
                            background: formData.zona === localidad ? '#fef9c3' : 'transparent',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                          onMouseLeave={e => e.currentTarget.style.background = formData.zona === localidad ? '#fef9c3' : 'transparent'}
                        >{localidad}</div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Dirección */}
        <div>
          {label('Dirección', true)}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="text" name="direccion" value={formData.direccion} onChange={handleChange}
              onFocus={onFocus} onBlur={onBlur}
              required placeholder="Calle, número y barrio" style={{ ...inputBase, flex: 1 }} />
            {isAdmin && (
              <button
                type="button"
                onClick={geocodeAddress}
                disabled={geocoding || !formData.direccion}
                title="Buscar coordenadas automáticamente"
                style={{
                  padding: '0.5rem 0.85rem',
                  background: geocoding ? '#e5e7eb' : T.yellow,
                  color: T.ink, border: 'none', borderRadius: 4,
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: '0.72rem', fontWeight: 800,
                  cursor: (geocoding || !formData.direccion) ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  opacity: !formData.direccion ? 0.5 : 1,
                  transition: 'background 0.12s',
                }}
              >
                {geocoding ? 'Buscando...' : '📍 Buscar en mapa'}
              </button>
            )}
          </div>
          {isAdmin && geoMsg && (
            <div style={{
              marginTop: '0.3rem', fontSize: '0.66rem', fontWeight: 600,
              color: geoMsg.startsWith('✓') ? '#16a34a' : '#dc2626',
            }}>{geoMsg}</div>
          )}
        </div>

        {/* Teléfono */}
        {field('Teléfono', true,
          <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange}
            onFocus={onFocus}
            onBlur={(e) => { handleTelefonoBlur(e); onBlur(e); }}
            required placeholder="+54 9 11 1234-5678" style={inputBase} />
        )}

        {/* Lat + Lng (solo admin) */}
        {isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {field('Latitud', true,
            <input type="number" name="lat" value={formData.lat} onChange={handleChange}
              onFocus={onFocus} onBlur={onBlur}
              step="0.000001" required placeholder="-34.603683" style={inputBase} />
          )}
          {field('Longitud', true,
            <input type="number" name="lng" value={formData.lng} onChange={handleChange}
              onFocus={onFocus} onBlur={onBlur}
              step="0.000001" required placeholder="-58.381557" style={inputBase} />
          )}
        </div>
        )}

        {/* Mini-map (solo admin) */}
        {isAdmin && (
        <div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.muted, marginBottom: '0.4rem' }}>
            Ubicación en el mapa <span style={{ fontWeight: 500, fontSize: '0.6rem', textTransform: 'none', letterSpacing: 0, color: T.muted }}>clic para fijar coordenadas</span>
          </div>
          <div ref={miniMapRef} style={{ width: '100%', height: 210, borderRadius: 4, border: `1px solid ${T.border}`, overflow: 'hidden' }} />
        </div>
        )}

        {error && (
          <div style={{ padding: '0.65rem 0.9rem', background: '#fef2f2', border: `1px solid #fca5a5`, borderRadius: 4, fontSize: '0.75rem', color: T.red, fontWeight: 600 }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.65rem', paddingTop: '0.75rem', borderTop: `1px solid ${T.border}`, marginTop: '0.25rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1, padding: '0.65rem',
              background: T.yellow, color: T.ink,
              border: 'none', borderRadius: 4,
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: '0.78rem', fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.12s',
            }}
          >
            {loading ? 'Guardando...' : punto?.id ? 'Guardar cambios' : 'Registrar punto'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1, padding: '0.65rem',
              background: 'transparent', color: T.muted,
              border: `1px solid ${T.border}`, borderRadius: 4,
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: '0.78rem', fontWeight: 700,
              cursor: 'pointer',
              transition: 'border-color 0.12s, color 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.ink; e.currentTarget.style.color = T.ink; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
