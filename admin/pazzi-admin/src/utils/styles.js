// ─── Design tokens ───────────────────────────────────────────────
const C = {
  ink:    '#0A0A0A',
  cream:  '#FFFEF5',
  paper:  '#FFFFFF',
  yellow: '#FABE08',
  yellowDark: '#E0A800',
  red:    '#DC2626',
  redDark:'#B91C1C',
  green:  '#16A34A',
  blue:   '#2563EB',
  muted:  'rgba(10,10,10,0.5)',
  border: 'rgba(10,10,10,0.10)',
};

// ─── Shared style objects ─────────────────────────────────────────
export const S = {
  // Layout
  card: {
    background: C.paper,
    borderRadius: 20,
    border: `1.5px solid ${C.border}`,
  },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.65)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 50, padding: '1rem',
  },

  // Buttons base
  _btnBase: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.5rem',
    fontFamily: "'Montserrat', system-ui, sans-serif",
    fontWeight: 900,
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    borderRadius: 999,
    cursor: 'pointer',
    border: 'none',
    transition: 'transform 0.15s ease, background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
    whiteSpace: 'nowrap',
  },
  btnPrimary: {
    padding: '0.75rem 1.5rem',
    background: C.yellow,
    color: C.ink,
    border: `2px solid ${C.ink}`,
    boxShadow: '0 6px 0 rgba(10,10,10,0.12)',
  },
  btnGhost: {
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    color: C.ink,
    border: `2px solid ${C.ink}`,
  },
  btnDark: {
    padding: '0.75rem 1.5rem',
    background: C.ink,
    color: C.yellow,
    border: `2px solid ${C.ink}`,
    boxShadow: '0 6px 0 rgba(10,10,10,0.12)',
  },
  btnDanger: {
    padding: '0.75rem 1.5rem',
    background: C.red,
    color: '#fff',
    border: `2px solid ${C.red}`,
    boxShadow: '0 6px 0 rgba(10,10,10,0.12)',
  },
  btnSmDark: {
    padding: '0.35rem 0.875rem',
    background: C.ink,
    color: C.yellow,
    border: `2px solid ${C.ink}`,
  },
  btnSmDanger: {
    padding: '0.35rem 0.875rem',
    background: C.red,
    color: '#fff',
    border: `2px solid ${C.red}`,
  },

  // Input
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: C.paper,
    border: `1.5px solid rgba(10,10,10,0.20)`,
    fontSize: '0.875rem',
    fontFamily: "'Montserrat', system-ui, sans-serif",
    color: C.ink,
    outline: 'none',
    borderRadius: 14,
  },
  inputFocus: {
    borderColor: C.yellow,
    boxShadow: '0 0 0 2px rgba(250,190,8,0.3)',
  },
  label: {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '0.4rem',
    color: C.ink,
  },

  // Typography
  eyebrow: {
    fontSize: '0.68rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    color: C.muted,
  },
};

// Merge base + variant for buttons
export function btn(variant) {
  return { ...S._btnBase, ...S[variant] };
}

export { C };
