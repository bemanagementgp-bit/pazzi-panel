/**
 * Notificaciones por mail (Resend) al administrador.
 *
 * Cuando el vendedor carga un punto de venta, queda "pendiente" y el admin
 * recibe un mail para revisarlo. Las solicitudes se agrupan durante unos
 * segundos: si el vendedor importa un Excel con muchas filas, llega un solo
 * mail con todas en vez de uno por fila.
 *
 * Nunca rompe el flujo: si falta configuración o Resend falla, solo se loguea.
 *
 * Variables de entorno:
 *   RESEND_API_KEY      (requerida para enviar)  API key de Resend
 *   RESEND_FROM         (requerida para enviar)  ej: "Pazzi Panel <notificaciones@pazzibuns.com>"
 *   ADMIN_NOTIFY_EMAIL  (opcional) destinatario(s), separados por coma. Por defecto ADMIN_EMAIL
 *   PANEL_URL           (opcional) link del botón del mail. Por defecto https://admin.pazzibuns.com
 *   NOTIFY_DELAY_MS     (opcional) ventana de agrupado. Por defecto 30000 (30 s)
 */

import logger from './logger.js';

const RESEND_URL = 'https://api.resend.com/emails';
const DELAY_DEFAULT_MS = 30_000;

let pendientes = [];
let timer = null;

const env = (key) => process.env[key]?.trim();

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const lineasQueVende = (p) => {
  const lineas = [];
  if (p.vende_hamburguesa) lineas.push('Hamburguesa');
  if (p.vende_pancho) lineas.push('Pancho');
  if (p.vende_sanguches) lineas.push('Sanguches');
  return lineas.length ? lineas.join(', ') : 'Sin especificar';
};

const destinatarios = () =>
  (env('ADMIN_NOTIFY_EMAIL') || env('ADMIN_EMAIL') || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

export const armarMail = (solicitudes, panelUrl) => {
  const cantidad = solicitudes.length;
  const subject =
    cantidad === 1
      ? `Nueva solicitud de punto de venta: ${solicitudes[0].nombre}`
      : `${cantidad} nuevas solicitudes de puntos de venta`;

  const filas = solicitudes
    .map(
      (p) => `
        <tr>
          <td style="padding:14px 16px;border-bottom:1px solid #eee;">
            <div style="font-weight:800;font-size:16px;color:#0A0A0A;">${escapeHtml(p.nombre)}</div>
            <div style="margin-top:4px;font-size:14px;color:#555;">${escapeHtml(p.direccion)} · ${escapeHtml(p.zona)}</div>
            <div style="margin-top:4px;font-size:13px;color:#777;">Vende: ${escapeHtml(lineasQueVende(p))}</div>
            <div style="margin-top:2px;font-size:13px;color:#777;">Cargado por: ${escapeHtml(p.createdBy || 'vendedor')}</div>
          </td>
        </tr>`
    )
    .join('');

  const intro =
    cantidad === 1
      ? 'El vendedor cargó un punto de venta nuevo y está esperando tu aprobación.'
      : `El vendedor cargó ${cantidad} puntos de venta nuevos y están esperando tu aprobación.`;

  const html = `
  <div style="background:#FFFEF5;padding:24px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:2px solid #0A0A0A;border-radius:16px;overflow:hidden;">
      <div style="background:#FABE08;padding:16px 20px;font-weight:900;font-size:18px;color:#0A0A0A;letter-spacing:0.5px;">
        PAZZI · Solicitudes pendientes
      </div>
      <div style="padding:20px 20px 8px;font-size:15px;color:#333;">${intro}</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${filas}</table>
      <div style="padding:20px;text-align:center;">
        <a href="${escapeHtml(panelUrl)}" style="display:inline-block;background:#0A0A0A;color:#FABE08;text-decoration:none;font-weight:800;padding:12px 22px;border-radius:999px;">
          Revisar en el panel
        </a>
      </div>
    </div>
  </div>`;

  const text = [
    intro,
    '',
    ...solicitudes.map(
      (p) =>
        `- ${p.nombre} | ${p.direccion} · ${p.zona} | Vende: ${lineasQueVende(p)} | Cargado por: ${p.createdBy || 'vendedor'}`
    ),
    '',
    `Revisar en el panel: ${panelUrl}`,
  ].join('\n');

  return { subject, html, text };
};

const enviarPendientes = async () => {
  timer = null;
  const lote = pendientes;
  pendientes = [];
  if (!lote.length) return;

  const apiKey = env('RESEND_API_KEY');
  const from = env('RESEND_FROM');
  const to = destinatarios();
  if (!apiKey || !from || !to.length) {
    logger.warn('Notificación por mail omitida: falta RESEND_API_KEY, RESEND_FROM o el destinatario', {
      solicitudes: lote.length,
    });
    return;
  }

  const { subject, html, text } = armarMail(lote, env('PANEL_URL') || 'https://admin.pazzibuns.com');

  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html, text }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const detalle = await res.text().catch(() => '');
      logger.error('Resend rechazó el mail de solicitudes', { status: res.status, detalle: detalle.slice(0, 300) });
      return;
    }
    logger.info('Mail de solicitudes enviado al admin', { solicitudes: lote.length });
  } catch (error) {
    logger.error('Error enviando mail de solicitudes', { error: error.message });
  }
};

/**
 * Estado de la configuración, para dejarlo en el log al arrancar: así se ve de
 * una si los mails van a salir, sin tener que cargar un punto de prueba.
 */
export const estadoNotificaciones = () => {
  const falta = ['RESEND_API_KEY', 'RESEND_FROM'].filter((clave) => !env(clave));
  const to = destinatarios();
  if (!to.length) falta.push('ADMIN_NOTIFY_EMAIL (o ADMIN_EMAIL)');
  return { activo: falta.length === 0, falta, destinatarios: to, from: env('RESEND_FROM') || null };
};

/**
 * Encola una solicitud de punto de venta para avisar al admin.
 * Se envía un único mail con todo lo acumulado al cerrar la ventana de agrupado.
 */
export const notificarSolicitudPunto = (punto) => {
  pendientes.push(punto);
  logger.info('Solicitud encolada para avisar por mail', { punto: punto?.nombre, enCola: pendientes.length });
  if (timer) return;
  const configurado = Number(env('NOTIFY_DELAY_MS'));
  const delay = env('NOTIFY_DELAY_MS') && configurado >= 0 ? configurado : DELAY_DEFAULT_MS;
  timer = setTimeout(enviarPendientes, delay);
  // Sin unref: si el proceso se apaga justo en esta ventana, el mail se perdía.
};

/** Envía ya lo que haya en cola (para apagado ordenado y pruebas). */
export const enviarAhora = async () => {
  if (timer) clearTimeout(timer);
  await enviarPendientes();
};

export default notificarSolicitudPunto;
