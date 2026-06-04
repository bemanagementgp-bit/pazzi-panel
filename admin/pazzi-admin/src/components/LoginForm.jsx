import { useState } from "react";
import { authAPI } from "../services/api.js";
import logo from "../assets/logo.png";

const INK = "#0D0700";

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
    padding: "0.72rem 0.9rem",
    background: focused === name ? "#fff" : "#fafafa",
    border: `1px solid ${focused === name ? INK : "#d1d5db"}`,
    borderRadius: 3,
    fontSize: "0.875rem",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 400, color: INK, outline: "none",
    transition: "border-color 0.12s, background 0.12s",
    boxSizing: "border-box",
    letterSpacing: "0.01em",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body { font-family: 'DM Sans', system-ui, sans-serif; background: #f5f5f3; }

        .lp-wrap {
          display: flex; flex-direction: column; min-height: 100vh;
          font-family: 'DM Sans', system-ui, sans-serif;
        }

        /* ── Panel izquierdo (marca) ── */
        .lp-brand {
          position: relative; width: 100%; min-height: 280px;
          background: #FABE08; overflow: hidden; flex-shrink: 0;
          display: flex; flex-direction: column;
          justify-content: space-between; padding: 2rem 2rem 2.5rem;
        }
        .lp-brand::before {
          content: ''; position: absolute; inset: 0;
          background-image: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 18px,
            rgba(0,0,0,0.028) 18px,
            rgba(0,0,0,0.028) 19px
          );
          pointer-events: none;
        }
        .lp-brand::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          background: rgba(0,0,0,0.12);
        }
        .lp-brand-inner { position: relative; z-index: 2; }

        /* ── Panel derecho (formulario) ── */
        .lp-form-panel {
          flex: 1; background: #f5f5f3;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 3rem 1.5rem;
        }

        /* ── Card ── */
        .lp-card {
          width: 100%; max-width: 390px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-top: 3px solid #FABE08;
          border-radius: 6px;
          padding: 2.5rem 2.25rem 2.25rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05);
        }
        .lp-divider {
          height: 1px; background: #f0f0ee; margin: 1.5rem 0;
        }

        /* ── Inputs ── */
        .lp-label {
          display: block; font-size: 0.65rem; font-weight: 600;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: #6b7280; margin-bottom: 0.4rem;
        }
        .lp-field { margin-bottom: 1.1rem; }
        .lp-input-dark {
          display: block; width: 100%;
          padding: 0.72rem 0.9rem;
          background: #fafafa;
          border: 1px solid #d1d5db;
          border-radius: 3px;
          font-size: 0.875rem;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-weight: 400; color: #0D0700; outline: none;
          transition: border-color 0.12s, background 0.12s;
          box-sizing: border-box; letter-spacing: 0.01em;
        }
        .lp-input-dark:focus { border-color: #0D0700; background: #fff; }
        .lp-input-dark::placeholder { color: #9ca3af; }

        /* ── Botón ── */
        .lp-btn {
          width: 100%; padding: 0.82rem;
          background: #0D0700; color: #FABE08;
          border: none; border-radius: 3px;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 0.83rem; font-weight: 800;
          letter-spacing: 0.06em; text-transform: uppercase;
          cursor: pointer; transition: opacity 0.12s; margin-top: 0.5rem;
        }
        .lp-btn:hover:not(:disabled) { opacity: 0.82; }
        .lp-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        /* ── Tagline ── */
        .lp-tagline {
          font-size: clamp(2.4rem, 5.5vw, 3.6rem);
          font-weight: 800; line-height: 0.93;
          letter-spacing: -0.04em; color: #0D0700;
        }

        @media (min-width: 768px) {
          .lp-wrap       { flex-direction: row; }
          .lp-brand      { width: 44%; min-height: 100vh; padding: 2.75rem 3rem 3.5rem; }
          .lp-form-panel { width: 56%; padding: 3rem 4rem; }
        }
        @media (min-width: 1200px) {
          .lp-brand      { width: 40%; }
          .lp-form-panel { width: 60%; }
        }
        @media (max-width: 767px) {
          .lp-brand { min-height: 240px; padding: 1.75rem 1.75rem 2rem; }
          .lp-card  { padding: 2rem 1.5rem 1.75rem; }
        }
      `}</style>

      <div className="lp-wrap">

        {/* ── Marca ── */}
        <div className="lp-brand">
          <div className="lp-brand-inner">
            <img src={logo} alt="Pazzi Buns" style={{ height: 52, display: "block", maxWidth: 170, objectFit: "contain" }} />
          </div>
          <div className="lp-brand-inner">
            <p style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(0,0,0,0.32)", marginBottom: "0.75rem" }}>
              Sistema de gestión
            </p>
            <div className="lp-tagline">GESTIÓN<br />DE<br />LOCALES.</div>
            <div style={{ marginTop: "1.6rem", width: 32, height: 2, background: "rgba(0,0,0,0.2)" }} />
            <p style={{ marginTop: "0.85rem", fontSize: "0.75rem", lineHeight: 1.75, color: "rgba(0,0,0,0.42)", maxWidth: 250 }}>
              Administrá puntos de venta, solicitudes y accesos desde un único panel.
            </p>
          </div>
        </div>

        {/* ── Formulario ── */}
        <div className="lp-form-panel">
          <div className="lp-card">

            {/* Encabezado */}
            <div style={{ marginBottom: "1.75rem" }}>
              <p style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9ca3af", marginBottom: "0.65rem" }}>
                Pazzi Buns · Acceso restringido
              </p>
              <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0D0700", lineHeight: 1.2, letterSpacing: "-0.01em", display: "inline-block", borderBottom: "2px solid #FABE08", paddingBottom: "0.2rem" }}>
                Iniciar sesión
              </h1>
            </div>

            <div className="lp-divider" />

            {/* Formulario */}
            <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
              <div className="lp-field">
                <label className="lp-label">Correo electrónico</label>
                <input
                  className="lp-input-dark"
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@pazzi.com" required
                />
              </div>
              <div className="lp-field">
                <label className="lp-label">Contraseña</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="lp-input-dark"
                    type={showPwd ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    style={{ paddingRight: "2.5rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    style={{
                      position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", padding: 0,
                      color: "#9ca3af", display: "flex", alignItems: "center", lineHeight: 1,
                    }}
                    tabIndex={-1}
                    aria-label={showPwd ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    <span style={{ fontFamily: "Material Symbols Outlined", fontSize: "1rem", fontWeight: "normal", fontStyle: "normal" }}>
                      {showPwd ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ marginBottom: "1rem", padding: "0.65rem 0.85rem", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 3, fontSize: "0.775rem", color: "#dc2626", fontWeight: 500 }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="lp-btn">
                {loading ? "Verificando..." : "Ingresar"}
              </button>
            </form>

            {/* Footer */}
            <p style={{ marginTop: "1.5rem", fontSize: "0.65rem", color: "#9ca3af", textAlign: "center", lineHeight: 1.6 }}>
              ¿Problemas para ingresar?{" "}
              <a href="https://wa.me/5492214400536" target="_blank" rel="noopener noreferrer"
                style={{ color: "#0D0700", fontWeight: 600, textDecoration: "none" }}>
                Contactar soporte
              </a>
            </p>

          </div>
        </div>

      </div>
    </>
  );
}
