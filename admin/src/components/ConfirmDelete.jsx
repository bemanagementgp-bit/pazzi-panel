import { C, S, btn } from '../utils/styles.js';

export default function ConfirmDelete({ nombre, onConfirm, onCancel }) {
  return (
    <div style={S.overlay}>
      <div style={{ ...S.card, padding: '2rem', maxWidth: 420, width: '100%' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', color: C.red }}>
          Confirmar Eliminación
        </h2>

        <p style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: C.ink }}>
          ¿Estás seguro de que querés eliminar <strong>"{nombre}"</strong>?
        </p>

        <p style={{
          margin: '0 0 1.5rem',
          padding: '0.75rem 1rem',
          background: 'rgba(250,190,8,0.12)',
          border: `1.5px solid rgba(250,190,8,0.5)`,
          borderRadius: 12,
          fontSize: '0.82rem',
          color: C.ink,
        }}>
          Esta acción <strong>no puede ser deshecha</strong>.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onConfirm} style={{ ...btn('btnDanger'), flex: 1 }}>Sí, eliminar</button>
          <button onClick={onCancel}  style={{ ...btn('btnGhost'),  flex: 1 }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

