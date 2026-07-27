import { useState, useEffect, useCallback } from 'react';
import { puntosAPI } from '../services/api.js';
import PuntoForm from './PuntoForm.jsx';

const T = {
  ink:    '#111827',
  muted:  '#6b7280',
  border: '#e5e7eb',
  bg:     '#f9fafb',
  card:   '#ffffff',
  yellow: '#ffb800',
  yHover: '#e6a500',
  green:  '#16a34a',
  red:    '#dc2626',
};

export default function SolicitudesView({ refresh, onRefresh }) {
  const [puntos, setPuntos]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [working, setWorking]     = useState(null);
  const [reviewPunto, setReviewPunto] = useState(null); // punto abierto en modal

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await puntosAPI.getAllAdmin();
      setPuntos(res.data.filter(p => p.estado === 'pendiente'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  useEffect(() => { load(); }, [load]);

  // Se llama cuando PuntoForm guarda exitosamente → luego aprueba
  const handleFormSuccess = async () => {
    if (!reviewPunto) return;
    const id = reviewPunto.id;
    setReviewPunto(null);
    setWorking(id);
    try {
      await puntosAPI.updateEstado(id, 'aprobado');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setWorking(null);
    }
  };

  const handleReject = async (id) => {
    setWorking(id);
    try {
      await puntosAPI.updateEstado(id, 'inactivo');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setWorking(null);
    }
  };

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
        <p style={{ fontSize: '0.68rem', color: T.muted, maxWidth: 260, lineHeight: 1.65 }}>
          Cuando un vendedor registre un nuevo punto de venta aparecerá aquí para su aprobación.
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: T.ink }}>Solicitudes pendientes</div>
            <div style={{ fontSize: '0.62rem', color: T.muted, marginTop: 2 }}>
              {puntos.length} solicitud{puntos.length !== 1 ? 'es' : ''} esperando revisión
            </div>
          </div>
          <span style={{
            fontFamily: 'Material Symbols Outlined', fontSize: '1.1rem',
            color: '#a16207', background: '#fefce8', padding: '0.3rem', borderRadius: 4
          }}>pending_actions</span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
            <thead>
              <tr style={{ background: T.bg }}>
                {['Nombre', 'Zona', 'Dirección', 'Acciones'].map(col => (
                  <th key={col} style={{
                    padding: '0.55rem 0.9rem', textAlign: 'left',
                    fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.07em',
                    textTransform: 'uppercase', color: T.muted,
                    borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap'
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {puntos.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < puntos.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <td style={{ padding: '0.7rem 0.9rem', fontWeight: 600, color: T.ink }}>{p.nombre}</td>
                  <td style={{ padding: '0.7rem 0.9rem', color: T.muted }}>{p.zona || '—'}</td>
                  <td style={{ padding: '0.7rem 0.9rem', color: T.muted, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.direccion || '—'}
                  </td>
                  <td style={{ padding: '0.7rem 0.9rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {/* Aprobar → abre formulario de revisión */}
                      <button
                        disabled={working === p.id}
                        onClick={() => setReviewPunto(p)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                          padding: '0.3rem 0.65rem', borderRadius: 4,
                          background: working === p.id ? '#d1d5db' : '#f0fdf4',
                          color: working === p.id ? '#9ca3af' : T.green,
                          border: `1px solid ${working === p.id ? '#e5e7eb' : '#bbf7d0'}`,
                          fontSize: '0.63rem', fontWeight: 700, cursor: working === p.id ? 'not-allowed' : 'pointer',
                          fontFamily: 'DM Sans, system-ui, sans-serif',
                        }}
                      >
                        <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: '0.85rem', lineHeight: 1 }}>check_circle</span>
                        Revisar y aprobar
                      </button>
                      {/* Rechazar → inmediato */}
                      <button
                        disabled={working === p.id}
                        onClick={() => handleReject(p.id)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                          padding: '0.3rem 0.65rem', borderRadius: 4,
                          background: working === p.id ? '#d1d5db' : '#fef2f2',
                          color: working === p.id ? '#9ca3af' : T.red,
                          border: `1px solid ${working === p.id ? '#e5e7eb' : '#fecaca'}`,
                          fontSize: '0.63rem', fontWeight: 700, cursor: working === p.id ? 'not-allowed' : 'pointer',
                          fontFamily: 'DM Sans, system-ui, sans-serif',
                        }}
                      >
                        <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: '0.85rem', lineHeight: 1 }}>cancel</span>
                        Rechazar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de revisión */}
      {reviewPunto && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(17,24,39,0.5)', backdropFilter: 'blur(3px)',
            zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem',
          }}
          onClick={e => e.target === e.currentTarget && setReviewPunto(null)}
        >
          <div style={{
            background: T.card, borderRadius: 6,
            width: '100%', maxWidth: 720, maxHeight: '92vh', overflowY: 'auto',
            border: `1px solid ${T.border}`,
          }}>
            {/* Banner de revisión */}
            <div style={{
              padding: '0.65rem 1.25rem',
              background: '#fefce8', borderBottom: `1px solid #fde68a`,
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: '1rem', color: '#a16207' }}>pending_actions</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#92400e' }}>
                Revisión de solicitud — corregí los datos si es necesario y guardá para aprobar el punto
              </span>
            </div>
            <PuntoForm
              punto={reviewPunto}
              isAdmin={true}
              onSuccess={handleFormSuccess}
              onCancel={() => setReviewPunto(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
