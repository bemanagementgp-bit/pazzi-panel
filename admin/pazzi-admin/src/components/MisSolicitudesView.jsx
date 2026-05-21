import { useState, useEffect, useCallback } from 'react';
import { puntosAPI } from '../services/api.js';
import ExcelImportExport from './ExcelImportExport.jsx';

const T = {
  ink:    '#111827',
  muted:  '#6b7280',
  border: '#e5e7eb',
  bg:     '#f9fafb',
  card:   '#ffffff',
  yellow: '#ffb800',
};

export default function MisSolicitudesView({ refresh }) {
  const [puntos, setPuntos] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await puntosAPI.getVendedorPendientes();
      setPuntos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: T.muted }}>
        <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: '2rem', display: 'block', marginBottom: '0.5rem', opacity: 0.4 }}>hourglass_top</span>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Cargando...</span>
      </div>
    );
  }

  if (puntos.length === 0) {
    return (
      <div style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: '2.4rem', color: '#d1d5db', marginBottom: '0.7rem', display: 'block' }}>task_alt</span>
        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: T.ink, marginBottom: '0.3rem' }}>Sin solicitudes pendientes</div>
        <p style={{ fontSize: '0.68rem', color: T.muted, maxWidth: 280, lineHeight: 1.65 }}>
          Cuando registres un nuevo punto de venta aparecerá aquí mientras el administrador lo revisa.
        </p>
      </div>
    );
  }

  const thStyle = {
    padding: '0.55rem 0.85rem',
    fontSize: '0.6rem', fontWeight: 700,
    letterSpacing: '0.08em', textTransform: 'uppercase',
    color: T.muted, textAlign: 'left',
    borderBottom: `1px solid ${T.border}`,
    whiteSpace: 'nowrap',
  };
  const tdStyle = {
    padding: '0.7rem 0.85rem',
    fontSize: '0.74rem', color: T.muted,
    borderBottom: `1px solid ${T.border}`,
    verticalAlign: 'middle',
  };

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: T.ink }}>Puntos enviados</div>
          <div style={{ fontSize: '0.62rem', color: T.muted, marginTop: 2 }}>
            {puntos.length} solicitud{puntos.length !== 1 ? 'es' : ''} esperando aprobación del administrador
          </div>
        </div>
        <ExcelImportExport isAdmin={false} onImportDone={load} />
      </div>

      {/* Info banner */}
      <div style={{
        padding: '0.65rem 1rem',
        background: '#fefce8', borderBottom: `1px solid #fef08a`,
        fontSize: '0.68rem', color: '#92400e', fontWeight: 500,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
      }}>
        <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: '0.9rem', fontStyle: 'normal', fontWeight: 'normal', lineHeight: 1 }}>info</span>
        El administrador revisará tus solicitudes y las aprobará o rechazará. Te aparecerán en "Puntos Activos" una vez aprobadas.
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: T.bg }}>
            <tr>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Zona</th>
              <th style={thStyle}>Dirección</th>
              <th style={thStyle}>Teléfono</th>
              <th style={thStyle}>Enviado</th>
              <th style={thStyle}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {puntos.map(p => (
              <tr key={p.id} style={{ transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fff7ed'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ ...tdStyle, color: T.ink, fontWeight: 600 }}>{p.nombre}</td>
                <td style={tdStyle}>{p.zona || '—'}</td>
                <td style={{ ...tdStyle, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.direccion || '—'}</td>
                <td style={tdStyle}>{p.telefono || '—'}</td>
                <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                  {p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td style={tdStyle}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    padding: '0.18rem 0.55rem', borderRadius: 3,
                    fontSize: '0.6rem', fontWeight: 700,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    background: '#fefce8', color: '#a16207',
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ca8a04', display: 'inline-block' }} />
                    Pendiente
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
