import { useState } from "react";
import { authAPI } from "../services/api.js";
import logo from "../assets/logo.png";

const INK = "#0A0A0A";

export default function LoginForm({ onLoginSuccess }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState(null);
  const [showPwd, setShowPwd]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { token, admin } = response.data;
      onLoginSuccess(email, token, admin);
    } catch (err) {
      setError(err.response?.data?.error || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name) => ({
    display: "block", width: "100%",
    padding: "0.75rem 0.9rem",
    background: focused === name ? "#fff" : "#f9fafb",
    border: `1.5px solid ${focused === name ? INK : "#e5e7eb"}`,
    borderRadius: 4,
    fontSize: "0.9rem",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 400, color: INK, outline: "none",
    transition: "border-color 0.15s, background 0.15s",
    boxSizing: "border-box",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', system-ui, sans-serif; }
        .lp-wrap { display: flex; flex-direction: column; min-height: 100vh; font-family: 'DM Sans', system-ui, sans-serif; }
        .lp-brand {
          position: relative; width: 100%; min-height: 300px;
          background: #ffb800; overflow: hidden; flex-shrink: 0;
          display: flex; flex-direction: column; justify-content: space-between; padding: 2rem 2rem 2.5rem;
        }
        .lp-brand::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(0,0,0,0.11) 1px, transparent 1px);
          background-size: 20px 20px; pointer-events: none;
        }
        .lp-brand::after {
          content: ''; position: absolute; bottom: 0; right: 0;
          width: 50%; height: 40%; background: rgba(0,0,0,0.055);
          clip-path: polygon(100% 0, 100% 100%, 0 100%);
        }
        .lp-brand-inner { position: relative; z-index: 2; }
        .lp-form-panel { flex: 1; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2.5rem 1.75rem 3rem; }
        @media (min-width: 768px) {
          .lp-wrap       { flex-direction: row; }
          .lp-brand      { width: 46%; min-height: 100vh; padding: 2.75rem 3rem 3.5rem; }
          .lp-form-panel { width: 54%; padding: 3rem 5rem; }
        }
        @media (min-width: 1200px) {
          .lp-brand      { width: 42%; }
          .lp-form-panel { width: 58%; padding: 3rem 8rem; }
        }
        .lp-label { display: block; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #6b7280; margin-bottom: 0.4rem; }
        .lp-field { margin-bottom: 1.2rem; }
        .lp-btn { width: 100%; padding: 0.85rem; background: #0A0A0A; color: #fff; border: none; border-radius: 4px; font-family: 'DM Sans', system-ui, sans-serif; font-size: 0.88rem; font-weight: 700; letter-spacing: 0.03em; cursor: pointer; transition: background 0.15s; margin-top: 0.75rem; }
        .lp-btn:hover:not(:disabled) { background: #1f2937; }
        .lp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .lp-tagline { font-size: clamp(2.2rem, 5vw, 3.4rem); font-weight: 800; line-height: 0.95; letter-spacing: -0.03em; color: #0A0A0A; }
        @media (max-width: 767px) {
          .lp-brand { min-height: 260px; padding: 1.75rem 1.75rem 2rem; }
          .lp-form-panel { padding: 2rem 1.5rem 2.5rem; }
        }
      `}</style>

      <div className="lp-wrap">

        <div className="lp-brand">
          <div className="lp-brand-inner">
            <img src={logo} alt="Pazzi Buns" style={{ height: 56, display: "block", maxWidth: 180, objectFit: "contain" }} />
          </div>
          <div className="lp-brand-inner">
            <p style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(0,0,0,0.38)", marginBottom: "0.7rem" }}>
              Panel de administración
            </p>
            <div className="lp-tagline">GESTION<br />TOTAL.</div>
            <p style={{ marginTop: "1rem", fontSize: "0.78rem", lineHeight: 1.7, color: "rgba(0,0,0,0.45)", maxWidth: 270 }}>
              Controlá cada punto de venta desde un solo lugar. Rápido, seguro y siempre disponible.
            </p>
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.4rem", alignItems: "center" }}>
              <div style={{ width: 28, height: 2, background: "rgba(0,0,0,0.25)" }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(0,0,0,0.18)" }} />
            </div>
          </div>
        </div>

        <div className="lp-form-panel">
          <div style={{ width: "100%", maxWidth: 360 }}>
            <div style={{ marginBottom: "2rem" }}>
              <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2rem)", fontWeight: 800, color: "#0A0A0A", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "0.45rem" }}>
                Bienvenido de vuelta.
              </h1>
              <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                Ingresa tus credenciales para continuar.
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="lp-field">
                <label className="lp-label">Correo electrónico</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} placeholder="usuario@pazzi.com" required style={inputStyle("email")} />
              </div>
              <div className="lp-field">
                <label className="lp-label">Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setFocused("password")} onBlur={() => setFocused(null)} placeholder="••••••••" required style={{ ...inputStyle("password"), paddingRight: '2.5rem' }} />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      color: '#9ca3af', display: 'flex', alignItems: 'center', lineHeight: 1,
                    }}
                    tabIndex={-1}
                    aria-label={showPwd ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: '1.1rem', fontWeight: 'normal', fontStyle: 'normal' }}>
                      {showPwd ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
              {error && (
                <div style={{ marginBottom: "1rem", padding: "0.7rem 0.9rem", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 4, fontSize: "0.78rem", color: "#dc2626", fontWeight: 500 }}>
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading} className="lp-btn">
                {loading ? "Ingresando..." : "Ingresar al panel"}
              </button>
            </form>
            <p style={{ marginTop: "1.75rem", fontSize: "0.68rem", color: "#9ca3af", textAlign: "center", lineHeight: 1.6 }}>
              Problemas para ingresar?{" "}
              <a href="https://wa.me/5492214400536" target="_blank" rel="noopener noreferrer" style={{ color: "#0A0A0A", fontWeight: 600, textDecoration: "none" }}>
                Contactar soporte
              </a>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
