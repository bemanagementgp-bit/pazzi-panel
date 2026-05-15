import { useEffect } from 'react';
import { puntosAPI } from '../services/api.js';

const T = {
  yellow:      '#ffb800',
  yellowHover: '#e6a500',
  ink:         '#111827',
  muted:       '#6b7280',
  border:      '#e5e7eb',
  card:        '#ffffff',
  bg:          '#f9fafb',
  green:       '#16a34a',
  red:         '#dc2626',
};

const ZONAS = ['CABA','Zona Norte','Zona Oeste','Zona Sur','Costa Atlántica','Mar del Plata','Córdoba','San Luis','Bariloche'];

export default function Dashboard({ puntos, refresh, setPuntos, onGoToPuntos, onGoToMapa }) {
  // Load puntos if empty
  useEffect(() => {
    if (puntos.length === 0) {
      puntosAPI.getAll().then(res => setPuntos(res.data)).catch(console.error);
    }
  }, [refresh]);

  const total    = puntos.length;
  const activos  = puntos.filter(p => p.estado === 'aprobado').length;
  const inactivos = total - activos;

  const byZona = ZONAS.map(z => ({
    zona: z,
    count: puntos.filter(p => p.zona === z).length,
  })).filter(z => z.count > 0).sort((a, b) => b.count - a.count);

  const maxCount = byZona.length ? byZona[0].count : 1;

  const cardStyle = {
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 4,
    padding: '1.1rem 1.25rem',
    display: 'flex', flexDirection: 'column', gap: '0.35rem',
  };

  const statStyle = {
    fontSize: '1.75rem', fontWeight: 700,
    color: T.ink, letterSpacing: '-0.03em', lineHeight: 1,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  };

  const labelStyle = {
    fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.09em',
    textTransform: 'uppercase', color: T.muted,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Summary cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div style={{ ...cardStyle, borderLeft: `3px solid ${T.ink}` }}>
          <div style={labelStyle}>Puntos totales</div>
          <div style={statStyle}>{total}</div>
        </div>
        <div style={{ ...cardStyle, borderLeft: `3px solid ${T.green}` }}>
          <div style={{ ...labelStyle, color: T.green }}>Activos</div>
          <div style={{ ...statStyle, color: T.green }}>{activos}</div>
        </div>
        <div style={{ ...cardStyle, borderLeft: `3px solid ${T.muted}` }}>
          <div style={labelStyle}>Pendientes / inactivos</div>
          <div style={{ ...statStyle, color: T.muted }}>{inactivos}</div>
        </div>
      </div>

      {/* ── By zona ── */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          padding: '0.85rem 1.2rem', borderBottom: `1px solid ${T.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: T.ink }}>Distribución por región</div>
          <div style={{ fontSize: '0.62rem', color: T.muted, fontWeight: 600 }}>{byZona.length} zona{byZona.length !== 1 ? 's' : ''} activa{byZona.length !== 1 ? 's' : ''}</div>
        </div>
        <div style={{ padding: '1.1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {byZona.length === 0 ? (
            <div style={{ fontSize: '0.72rem', color: T.muted, textAlign: 'center', padding: '1rem 0' }}>Sin datos</div>
          ) : byZona.map(({ zona, count }) => (
            <div key={zona} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 120, fontSize: '0.67rem', fontWeight: 500, color: T.ink, flexShrink: 0 }}>{zona}</div>
              <div style={{ flex: 1, height: 5, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(count / maxCount) * 100}%`,
                  background: T.yellow,
                  borderRadius: 99,
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <div style={{ width: 24, fontSize: '0.68rem', fontWeight: 700, color: T.ink, textAlign: 'right', flexShrink: 0 }}>{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <button
          onClick={onGoToPuntos}
          style={{
            background: T.yellow, border: `1px solid ${T.yellowHover}`, borderRadius: 4,
            padding: '0.85rem 1rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            textAlign: 'left', transition: 'background 0.1s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = T.yellowHover}
          onMouseLeave={e => e.currentTarget.style.background = T.yellow}
        >
          <span style={{ fontFamily: 'Material Symbols Outlined', fontStyle: 'normal', fontWeight: 'normal', lineHeight: 1, fontSize: '1.2rem', color: T.ink }}>list_alt</span>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: T.ink }}>Gestionar puntos</div>
            <div style={{ fontSize: '0.59rem', color: 'rgba(17,24,39,0.5)', marginTop: 2 }}>Ver y administrar sucursales</div>
          </div>
        </button>
        <button
          onClick={onGoToMapa}
          style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 4,
            padding: '0.85rem 1rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            textAlign: 'left', transition: 'border-color 0.1s, background 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.yellow; e.currentTarget.style.background = '#fffbeb'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.card; }}
        >
          <span style={{ fontFamily: 'Material Symbols Outlined', fontStyle: 'normal', fontWeight: 'normal', lineHeight: 1, fontSize: '1.2rem', color: T.muted }}>map</span>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: T.ink }}>Ver mapa</div>
            <div style={{ fontSize: '0.59rem', color: T.muted, marginTop: 2 }}>Distribución geográfica</div>
          </div>
        </button>
      </div>

    </div>
  );
}
