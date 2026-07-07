import { useState, useEffect } from 'react';
import { puntosAPI } from '../services/api.js';
import { useCallback } from 'react';

const T = {
  ink:     '#111827',
  muted:   '#6b7280',
  border:  '#e5e7eb',
  surface: '#f9fafb',
  yellow:  '#ffb800',
  blue:    '#2563eb',
  red:     '#dc2626',
  green:   '#16a34a',
};

const ESTADO = {
  aprobado:  { bg: '#f0fdf4', color: '#15803d', label: 'Aprobado'  },
  pendiente: { bg: '#fefce8', color: '#a16207', label: 'Pendiente' },
  inactivo:  { bg: '#fef2f2', color: '#b91c1c', label: 'Inactivo'  },
};

const LINEAS = [
  { key: 'vende_hamburguesa', label: 'Hamburguesa', icon: '🍔' },
  { key: 'vende_pancho',      label: 'Pancho',       icon: '🌭' },
  { key: 'vende_sanguches',   label: 'Sanguches',    icon: '🥪' },
];

const countLineas = (p) => LINEAS.reduce((n, { key }) => n + (p[key] ? 1 : 0), 0);

export default function PuntosTable({ refresh, onEdit, onDelete, setPuntos, emptySlot, isAdmin }) {
  const [puntos, setPuntosLocal] = useState([]);
  const [loading, setLoading]    = useState(true);
  const [search, setSearch]      = useState('');
  const [hovered, setHovered]    = useState(null);
  const [lineaFilter, setLineaFilter] = useState([]);   // keys de LINEAS activos como filtro
  const [sort, setSort]          = useState({ key: null, dir: 'desc' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = isAdmin ? await puntosAPI.getAllAdmin() : await puntosAPI.getAll();
      setPuntosLocal(res.data);
      if (setPuntos) setPuntos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, refresh]);

  useEffect(() => { load(); }, [load]);

  const toggleLineaFilter = (key) => {
    setLineaFilter(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const toggleSort = (key) => {
    setSort(prev => prev.key === key ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' });
  };

  const filtered = puntos
    .filter(p =>
      !search ||
      p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      p.zona?.toLowerCase().includes(search.toLowerCase()) ||
      p.direccion?.toLowerCase().includes(search.toLowerCase())
    )
    .filter(p => lineaFilter.length === 0 || lineaFilter.every(key => p[key]))
    .sort((a, b) => {
      if (sort.key !== 'lineas') return 0;
      const diff = countLineas(a) - countLineas(b);
      return sort.dir === 'desc' ? -diff : diff;
    });

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: T.muted }}>
        <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: '2rem', display: 'block', marginBottom: '0.5rem', opacity: 0.4 }}>
          hourglass_top
        </span>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Cargando...
        </span>
      </div>
    );
  }

  /* ── Empty ── */
  if (puntos.length === 0) {
    if (emptySlot) return emptySlot;
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: T.muted }}>
        <span style={{ fontSize: '0.78rem' }}>No hay puntos registrados.</span>
      </div>
    );
  }

  const thStyle = {
    padding: '0.6rem 1rem',
    fontSize: '0.59rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: T.muted,
    background: T.surface,
    borderBottom: `1px solid ${T.border}`,
    whiteSpace: 'nowrap',
    textAlign: 'left',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  };

  const tdStyle = {
    padding: '0.7rem 1rem',
    fontSize: '0.78rem',
    color: T.muted,
    borderBottom: `1px solid ${T.border}`,
    whiteSpace: 'nowrap',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  };

  return (
    <div>
      {/* Search bar */}
      <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: '1rem', color: T.muted }}>search</span>
        <input
          type="text"
          placeholder="Buscar por nombre, zona o dirección..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: '0.76rem',
            fontFamily: "'DM Sans', system-ui, sans-serif",
            color: T.ink,
          }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.muted, fontFamily: 'Material Symbols Outlined', fontSize: '0.9rem' }}>
            close
          </button>
        )}
      </div>

      {/* Filtro por líneas */}
      <div style={{ padding: '0.6rem 1rem', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.muted }}>Filtrar por línea:</span>
        {LINEAS.map(({ key, label: lineaLabel, icon }) => {
          const active = lineaFilter.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggleLineaFilter(key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.25rem 0.6rem', borderRadius: 99,
                border: `1.5px solid ${active ? T.yellow : T.border}`,
                background: active ? '#fffbeb' : 'transparent',
                fontSize: '0.68rem', fontWeight: 700, color: T.ink,
                cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif",
                transition: 'border-color 0.12s, background 0.12s',
              }}
            >
              <span>{icon}</span>{lineaLabel}
            </button>
          );
        })}
        {lineaFilter.length > 0 && (
          <button onClick={() => setLineaFilter([])} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.muted, fontSize: '0.65rem', fontWeight: 700, textDecoration: 'underline' }}>
            Limpiar
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Zona</th>
              <th style={thStyle}>Dirección</th>
              <th style={thStyle}>Teléfono</th>
              <th
                style={{ ...thStyle, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleSort('lineas')}
                title="Ordenar por cantidad de líneas"
              >
                Líneas {sort.key === 'lineas' && (sort.dir === 'desc' ? '▼' : '▲')}
              </th>
              <th style={thStyle}>Estado</th>
              {isAdmin && <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: 'center', padding: '2rem' }}>
                  Sin resultados para "{search}"
                </td>
              </tr>
            ) : filtered.map(punto => {
              const estado = ESTADO[punto.estado] || ESTADO.inactivo;
              const isHov  = hovered === punto.id;
              return (
                <tr
                  key={punto.id}
                  onMouseEnter={() => setHovered(punto.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ background: isHov ? '#fff7ed' : 'transparent', transition: 'background 0.1s' }}
                >
                  <td style={{ ...tdStyle, color: T.ink, fontWeight: 600 }}>{punto.nombre}</td>
                  <td style={tdStyle}>{punto.zona || '—'}</td>
                  <td style={{ ...tdStyle, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{punto.direccion || '—'}</td>
                  <td style={tdStyle}>{punto.telefono || '—'}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {LINEAS.map(({ key, icon, label: lineaLabel }) => (
                        <span
                          key={key}
                          title={lineaLabel}
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 22, height: 22, borderRadius: '50%', fontSize: '0.75rem',
                            background: punto[key] ? '#fffbeb' : T.surface,
                            border: `1px solid ${punto[key] ? T.yellow : T.border}`,
                            opacity: punto[key] ? 1 : 0.3,
                          }}
                        >
                          {icon}
                        </span>
                      ))}
                      <span style={{
                        marginLeft: '0.2rem', fontSize: '0.6rem', fontWeight: 800,
                        color: countLineas(punto) === 3 ? '#b91c1c' : countLineas(punto) === 2 ? '#c2410c' : T.muted,
                      }}>
                        {countLineas(punto)}/3
                      </span>
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '0.18rem 0.55rem', borderRadius: 3,
                      fontSize: '0.6rem', fontWeight: 700,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      background: estado.bg, color: estado.color,
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                    }}>
                      {estado.label}
                    </span>
                  </td>
                  {isAdmin && (
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button
                        onClick={() => onEdit(punto)}
                        title="Editar"
                        style={{
                          width: 30, height: 30, border: `1px solid ${T.border}`,
                          borderRadius: 7, background: 'transparent', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: T.muted, fontFamily: 'Material Symbols Outlined', fontSize: '0.9rem',
                          transition: 'background 0.1s, color 0.1s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.muted; e.currentTarget.style.borderColor = T.border; }}
                      >
                        edit
                      </button>
                      <button
                        onClick={() => onDelete(punto.id)}
                        title="Eliminar"
                        style={{
                          width: 30, height: 30, border: `1px solid ${T.border}`,
                          borderRadius: 7, background: 'transparent', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: T.muted, fontFamily: 'Material Symbols Outlined', fontSize: '0.9rem',
                          transition: 'background 0.1s, color 0.1s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = T.red; e.currentTarget.style.borderColor = '#fecaca'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.muted; e.currentTarget.style.borderColor = T.border; }}
                      >
                        delete
                      </button>
                    </div>
                  </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div style={{ padding: '0.6rem 1rem', borderTop: `1px solid ${T.border}`, fontSize: '0.65rem', color: T.muted, fontWeight: 600, letterSpacing: '0.05em' }}>
        {filtered.length} de {puntos.length} punto{puntos.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
