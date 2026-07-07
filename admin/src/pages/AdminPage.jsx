import { useState } from 'react';
import { puntosAPI } from '../services/api.js';
import PuntosTable from '../components/PuntosTable.jsx';
import PuntoForm from '../components/PuntoForm.jsx';
import ConfirmDelete from '../components/ConfirmDelete.jsx';
import Dashboard from '../components/Dashboard.jsx';
import MapaView from '../components/MapaView.jsx';
import SolicitudesView from '../components/SolicitudesView.jsx';
import MisSolicitudesView from '../components/MisSolicitudesView.jsx';
import ExcelImportExport from '../components/ExcelImportExport.jsx';
import logo from '../assets/logo.png';

/* -- Design tokens ------------------------------- */
const T = {
  yellow:  '#ffb800',
  yHover:  '#e6a500',
  ink:     '#111827',
  muted:   '#6b7280',
  border:  '#e5e7eb',
  bg:      '#f9fafb',
  card:    '#ffffff',
  red:     '#dc2626',
  sidebar: '#000000',
};

const NAV_ADMIN = [
  { id: 'dashboard',    label: 'Dashboard',       icon: 'dashboard' },
  { id: 'puntos',       label: 'Puntos de Venta', icon: 'storefront' },
  { id: 'mapa',         label: 'Mapa',            icon: 'map' },
  { id: 'solicitudes',  label: 'Solicitudes',     icon: 'pending_actions' },
];
const NAV_VENDEDOR = [
  { id: 'dashboard',    label: 'Dashboard',       icon: 'dashboard' },
  { id: 'puntos',       label: 'Puntos de Venta', icon: 'storefront' },
  { id: 'mapa',         label: 'Mapa',            icon: 'map' },
  { id: 'mis-solic',    label: 'Mis solicitudes', icon: 'pending_actions' },
];

export default function AdminPage({ admin, onLogout, isAdmin }) {
  const [section, setSection]             = useState('dashboard');
  const [showForm, setShowForm]           = useState(false);
  const [selectedPunto, setSelectedPunto] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [refresh, setRefresh]             = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [puntos, setPuntos]               = useState([]);

  const handleEdit   = (punto) => { setSelectedPunto(punto); setShowForm(true); };
  const handleDelete = (id)    => setDeleteConfirm(puntos.find(p => p.id === id));

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await puntosAPI.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      setRefresh(prev => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedPunto(null);
    setRefresh(prev => prev + 1);
  };

  const openNewForm  = () => { setSelectedPunto(null); setShowForm(true); };
  const adminEmail   = admin?.email || '';
  const adminRole    = admin?.role  || 'vendedor';
  const adminInitial = adminEmail[0]?.toUpperCase() || 'U';
  const roleLabel    = adminRole === 'admin' ? 'Administrador' : 'Vendedor';
  const NAV          = adminRole === 'admin' ? NAV_ADMIN : NAV_VENDEDOR;

  const sectionTitle = {
    dashboard:   'Dashboard',
    puntos:      adminRole === 'admin' ? 'Puntos de Venta' : 'Puntos de Venta Activos',
    mapa:        'Mapa de puntos',
    solicitudes: 'Solicitudes',
    'mis-solic': 'Mis solicitudes',
  };
  const sectionSub = {
    dashboard:   'Resumen general de la operación',
    puntos:      adminRole === 'admin' ? 'Gestión de sucursales — incluye pendientes de aprobación' : 'Puntos de venta aprobados y activos',
    mapa:        'Distribución geográfica de puntos',
    solicitudes: 'Puntos de venta enviados por vendedores — aprobá o rechazá cada solicitud',
    'mis-solic': 'Puntos que enviaste y están esperando aprobación',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { font-family: 'DM Sans', system-ui, sans-serif; }

        /* -- APP SHELL -- */
        .pz-app {
          height: 100vh; display: flex; flex-direction: column; overflow: hidden;
          font-family: 'DM Sans', system-ui, sans-serif;
          color: ${T.ink};
        }

        /* -- TOPBAR -- */
        .pz-topbar {
          height: 50px; flex-shrink: 0;
          background: ${T.yellow};
          border-bottom: 1px solid ${T.yHover};
          display: flex; align-items: center; padding: 0 1rem; gap: 0.6rem;
          z-index: 200;
        }
        .pz-tb-brand { display: flex; align-items: center; gap: 0.45rem; flex-shrink: 0; }
        .pz-tb-logo {
          width: 26px; height: 26px; border-radius: 4px;
          background: rgba(0,0,0,0.12);
          display: flex; align-items: center; justify-content: center;
        }
        .pz-tb-logo img { width: 16px; height: 16px; object-fit: contain; }
        .pz-tb-name { font-size: 0.82rem; font-weight: 700; color: ${T.ink}; letter-spacing: -0.01em; }
        .pz-tb-divider { width: 1px; height: 16px; background: rgba(0,0,0,0.18); flex-shrink: 0; }
        .pz-tb-section { font-size: 0.74rem; font-weight: 500; color: rgba(0,0,0,0.5); }
        .pz-tb-right { margin-left: auto; display: flex; align-items: center; gap: 0.4rem; }
        .pz-tb-role {
          font-size: 0.58rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase;
          padding: 0.2rem 0.5rem; border-radius: 3px;
          background: rgba(0,0,0,0.1); color: rgba(0,0,0,0.45);
        }
        .pz-tb-avatar {
          width: 28px; height: 28px; border-radius: 4px;
          background: rgba(0,0,0,0.14); color: ${T.ink};
          font-size: 0.66rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .pz-tb-logout {
          display: flex; align-items: center; gap: 0.2rem;
          padding: 0.28rem 0.55rem;
          border: 1px solid rgba(0,0,0,0.2); border-radius: 4px;
          background: transparent;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 0.66rem; font-weight: 600; color: rgba(0,0,0,0.45);
          cursor: pointer; transition: background 0.1s, color 0.1s;
        }
        .pz-tb-logout:hover { background: rgba(0,0,0,0.1); color: ${T.ink}; }
        .pz-tb-logout .ms {
          font-family: 'Material Symbols Outlined'; font-style: normal;
          font-weight: normal; line-height: 1; font-size: 0.85rem;
        }

        /* -- BODY -- */
        .pz-body { flex: 1; display: flex; overflow: hidden; }

        /* -- SIDEBAR -- */
        .pz-sidebar {
          width: 240px; flex-shrink: 0;
          background: ${T.sidebar}; border-right: 1px solid #1f2937;
          display: flex; flex-direction: column; overflow-y: auto;
        }
        .pz-nav { padding: 0.6rem 0.5rem; flex: 1; }
        .pz-nav-label {
          font-size: 0.56rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          color: #374151; padding: 0.7rem 0.7rem 0.3rem;
        }
        .pz-nav-item {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 0.7rem; border-radius: 4px; cursor: pointer;
          font-size: 0.77rem; font-weight: 500; color: #9ca3af;
          transition: background 0.1s, color 0.1s;
          margin-bottom: 2px; user-select: none;
        }
        .pz-nav-item:hover { background: #1f2937; color: #f9fafb; }
        .pz-nav-item.active { background: rgba(255,184,0,0.1); color: ${T.yellow}; font-weight: 600; }
        .pz-nav-item.active .ms { color: ${T.yellow}; }
        .pz-nav-item .ms {
          font-family: 'Material Symbols Outlined'; font-style: normal;
          font-weight: normal; line-height: 1; font-size: 1.05rem; flex-shrink: 0;
        }
        .pz-sb-bottom { padding: 0.7rem; border-top: 1px solid #1f2937; }
        .pz-sb-user { display: flex; align-items: center; gap: 0.45rem; }
        .pz-sb-av {
          width: 30px; height: 30px; border-radius: 4px;
          background: ${T.yellow}; color: ${T.ink};
          font-size: 0.66rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .pz-sb-info { flex: 1; min-width: 0; }
        .pz-sb-email {
          font-size: 0.63rem; font-weight: 600; color: #d1d5db;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .pz-sb-role {
          font-size: 0.53rem; font-weight: 600; color: #374151;
          text-transform: uppercase; letter-spacing: 0.07em; margin-top: 2px;
        }

        /* -- CONTENT -- */
        .pz-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: ${T.bg}; }
        .pz-content-head {
          padding: 0.9rem 1.25rem; flex-shrink: 0;
          background: ${T.card}; border-bottom: 1px solid ${T.border};
          display: flex; justify-content: space-between; align-items: center; gap: 1rem;
        }
        .pz-page-title { font-size: 0.94rem; font-weight: 700; color: ${T.ink}; letter-spacing: -0.02em; }
        .pz-page-sub { font-size: 0.65rem; color: ${T.muted}; margin-top: 2px; font-weight: 400; }
        .pz-scroll { flex: 1; overflow-y: auto; padding: 1.25rem; }

        /* -- PANEL -- */
        .pz-panel { background: ${T.card}; border: 1px solid ${T.border}; border-radius: 4px; overflow: hidden; }
        .pz-panel-head {
          padding: 0.75rem 1rem; border-bottom: 1px solid ${T.border};
          display: flex; justify-content: space-between; align-items: center;
        }
        .pz-panel-label { font-size: 0.74rem; font-weight: 700; color: ${T.ink}; }
        .pz-panel-count { font-size: 0.62rem; color: ${T.muted}; margin-top: 2px; font-weight: 400; }

        /* -- BTN ADD -- */
        .pz-btn-add {
          display: inline-flex; align-items: center; gap: 0.25rem;
          padding: 0.42rem 0.8rem;
          background: ${T.yellow}; color: ${T.ink};
          border: 1px solid ${T.yHover}; border-radius: 4px;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 0.7rem; font-weight: 700; cursor: pointer;
          transition: background 0.1s; white-space: nowrap;
        }
        .pz-btn-add:hover { background: ${T.yHover}; }
        .pz-btn-add .ms {
          font-family: 'Material Symbols Outlined'; font-style: normal;
          font-weight: normal; line-height: 1; font-size: 0.9rem;
        }

        /* -- EMPTY -- */
        .pz-empty {
          padding: 3rem 2rem; display: flex; flex-direction: column;
          align-items: center; text-align: center;
        }
        .pz-empty .ms {
          font-size: 2.2rem; color: #d1d5db;
          font-family: 'Material Symbols Outlined'; font-style: normal;
          font-weight: normal; line-height: 1; margin-bottom: 0.7rem; display: block;
        }
        .pz-empty-title { font-size: 0.84rem; font-weight: 700; color: ${T.ink}; margin-bottom: 0.3rem; }
        .pz-empty-desc { font-size: 0.68rem; color: ${T.muted}; max-width: 260px; line-height: 1.65; margin-bottom: 1rem; }
        .pz-btn-empty {
          display: inline-flex; align-items: center; gap: 0.25rem;
          padding: 0.48rem 0.9rem; background: ${T.yellow}; color: ${T.ink};
          border: 1px solid ${T.yHover}; border-radius: 4px;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 0.7rem; font-weight: 700;
          cursor: pointer; transition: background 0.1s;
        }
        .pz-btn-empty:hover { background: ${T.yHover}; }
        .pz-btn-empty .ms {
          font-family: 'Material Symbols Outlined'; font-style: normal;
          font-weight: normal; line-height: 1; font-size: 0.85rem;
        }

        /* -- OVERLAY / MODAL -- */
        .pz-overlay {
          position: fixed; inset: 0;
          background: rgba(17,24,39,0.5); backdrop-filter: blur(3px);
          z-index: 400; display: flex; align-items: center; justify-content: center; padding: 1.25rem;
        }
        .pz-modal {
          background: ${T.card}; border-radius: 6px;
          width: 100%; max-width: 560px; max-height: 92vh; overflow-y: auto;
          border: 1px solid ${T.border};
        }
        .pz-modal-wide { max-width: 720px; }

        /* -- ICON HELPER -- */
        .ms {
          font-family: 'Material Symbols Outlined'; font-style: normal;
          font-weight: normal; line-height: 1; user-select: none;
        }

        /* -- MOBILE -- */
        @media (max-width: 767px) {
          .pz-sidebar { display: none; }
          .pz-tb-divider, .pz-tb-section, .pz-tb-role { display: none; }
          .pz-tb-name { font-size: 0.88rem; }
          .pz-app { padding-bottom: 56px; }
          .pz-body { overflow: visible; }
          .pz-main { overflow: visible; }
          .pz-scroll { overflow: visible; padding: 1rem; }
          .pz-content-head { padding: 0.75rem 1rem; }
          .pz-bottom-nav {
            display: flex !important;
            position: fixed; bottom: 0; left: 0; right: 0; height: 56px;
            background: #000; border-top: 1px solid #1f2937;
            z-index: 300;
          }
          .pz-bn-item {
            flex: 1; display: flex; flex-direction: column;
            align-items: center; justify-content: center; gap: 2px;
            cursor: pointer; color: #6b7280;
            font-size: 0.52rem; font-weight: 600; letter-spacing: 0.04em;
            text-transform: uppercase; transition: color 0.1s;
          }
          .pz-bn-item.active { color: ${T.yellow}; }
          .pz-bn-item .ms { font-size: 1.3rem; }
          .pz-modal { max-width: 100% !important; margin: 0 !important; border-radius: 0 !important; max-height: 100vh !important; }
          .pz-overlay { padding: 0 !important; align-items: flex-end !important; }
        }
        @media (min-width: 768px) {
          .pz-bottom-nav { display: none !important; }
        }
      `}</style>

      <div className="pz-app">

        {/* TOPBAR */}
        <header className="pz-topbar">
          <div className="pz-tb-brand">
            <div className="pz-tb-logo"><img src={logo} alt="Pazzi" /></div>
            <span className="pz-tb-name">Pazzi Admin</span>
          </div>
          <div className="pz-tb-divider" />
          <span className="pz-tb-section">{sectionTitle[section]}</span>
          <div className="pz-tb-right">
            <span className="pz-tb-role">{roleLabel}</span>
            <div className="pz-tb-avatar">{adminInitial}</div>
            <button className="pz-tb-logout" onClick={onLogout}>
              <span className="ms">logout</span>Salir
            </button>
          </div>
        </header>

        <div className="pz-body">

          {/* SIDEBAR */}
          <aside className="pz-sidebar">
            <nav className="pz-nav">
              <div className="pz-nav-label">Navegación</div>
              {NAV.map(item => (
                <div
                  key={item.id}
                  className={`pz-nav-item${section === item.id ? ' active' : ''}`}
                  onClick={() => setSection(item.id)}
                >
                  <span className="ms">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </nav>
            <div className="pz-sb-bottom">
              <div className="pz-sb-user">
                <div className="pz-sb-av">{adminInitial}</div>
                <div className="pz-sb-info">
                  <div className="pz-sb-email">{adminEmail}</div>
                  <div className="pz-sb-role">{roleLabel}</div>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <div className="pz-main">
            <div className="pz-content-head">
              <div>
                <div className="pz-page-title">{sectionTitle[section]}</div>
                <div className="pz-page-sub">{sectionSub[section]}</div>
              </div>
              {section === 'puntos' && (
                <button className="pz-btn-add" onClick={openNewForm}>
                  <span className="ms">add</span>Nuevo punto
                </button>
              )}
            </div>

            <div className="pz-scroll">

              {section === 'dashboard' && (
                <Dashboard
                  puntos={puntos}
                  refresh={refresh}
                  setPuntos={setPuntos}
                  onGoToPuntos={() => setSection('puntos')}
                  onGoToMapa={() => setSection('mapa')}
                />
              )}

              {section === 'puntos' && (
                <div className="pz-panel">
                  <div className="pz-panel-head">
                    <div>
                      <div className="pz-panel-label">{isAdmin ? 'Todos los puntos' : 'Mis puntos activos'}</div>
                      <div className="pz-panel-count">
                        {puntos.length} punto{puntos.length !== 1 ? 's' : ''} registrado{puntos.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <ExcelImportExport isAdmin={isAdmin} onImportDone={() => setRefresh(prev => prev + 1)} />
                  </div>
                  <PuntosTable
                    refresh={refresh}
                    onEdit={isAdmin ? handleEdit : null}
                    onDelete={isAdmin ? handleDelete : null}
                    setPuntos={setPuntos}
                    isAdmin={isAdmin}
                    emptySlot={
                      <div className="pz-empty">
                        <span className="ms">storefront</span>
                        <div className="pz-empty-title">Sin puntos registrados</div>
                        <p className="pz-empty-desc">Registrá la primera sucursal para comenzar a gestionar los puntos de venta.</p>
                        <button className="pz-btn-empty" onClick={openNewForm}>
                          <span className="ms">add_business</span>Registrar primer punto
                        </button>
                      </div>
                    }
                  />
                </div>
              )}

              {section === 'mapa' && (
                <MapaView puntos={puntos} refresh={refresh} setPuntos={setPuntos} />
              )}

              {section === 'solicitudes' && (
                <SolicitudesView
                  refresh={refresh}
                  onRefresh={() => setRefresh(prev => prev + 1)}
                />
              )}

              {section === 'mis-solic' && (
                <MisSolicitudesView refresh={refresh} />
              )}

            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="pz-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="pz-modal pz-modal-wide">
            <PuntoForm
              punto={selectedPunto}
              isAdmin={isAdmin}
              onSuccess={handleFormSuccess}
              onCancel={() => { setShowForm(false); setSelectedPunto(null); }}
            />
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="pz-overlay" onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="pz-modal">
            <ConfirmDelete
              punto={deleteConfirm}
              loading={deleteLoading}
              onConfirm={confirmDelete}
              onCancel={() => setDeleteConfirm(null)}
            />
          </div>
        </div>
      )}

      {/* BOTTOM NAV (mobile only) */}
      <nav className="pz-bottom-nav" style={{ display: 'none' }}>
        {NAV.map(item => (
          <div
            key={item.id}
            className={`pz-bn-item${section === item.id ? ' active' : ''}`}
            onClick={() => setSection(item.id)}
          >
            <span className="ms">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>
    </>
  );
}
