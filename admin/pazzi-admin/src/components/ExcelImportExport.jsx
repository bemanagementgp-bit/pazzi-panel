import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { puntosAPI } from '../services/api.js';

const T = {
  ink:    '#111827',
  muted:  '#6b7280',
  border: '#e5e7eb',
  bg:     '#f9fafb',
  yellow: '#ffb800',
  green:  '#16a34a',
  red:    '#dc2626',
};

const COLS    = ['nombre', 'zona', 'direccion'];
const HEADERS = {
  nombre:    'Nombre del local',
  zona:      'Zona / Barrio',
  direccion: 'Dirección completa',
};

// === Límites anti-DoS para la importación de archivos ===
const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_ROWS       = 500;             // máximo de filas a procesar

/**
 * Mitigación de CSV/XLS Injection:
 * si la celda comienza con =, +, -, @, TAB o CR, Excel/LibreOffice la
 * interpretan como fórmula al abrir el archivo. Prefijamos con apóstrofe
 * para forzar tratamiento como texto.
 * Además se eliminan caracteres de control que rompen el archivo.
 */
const sanitizeCell = (value) => {
  if (value == null) return '';
  // eslint-disable-next-line no-control-regex
  const stripped = String(value).replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '');
  if (/^[=+\-@\t\r]/.test(stripped)) return `'${stripped}`;
  return stripped;
};

const EJEMPLOS = [
  { nombre: 'Pazzi Palermo',       zona: 'Palermo',       direccion: 'Av. Santa Fe 3200, CABA' },
  { nombre: 'Pazzi Belgrano',      zona: 'Belgrano',      direccion: 'Cabildo 2150, CABA' },
  { nombre: 'Pazzi San Telmo',     zona: 'San Telmo',     direccion: 'Defensa 890, CABA' },
  { nombre: 'Pazzi Recoleta',      zona: 'Recoleta',      direccion: 'Av. Callao 1200, CABA' },
  { nombre: 'Pazzi Villa Crespo',  zona: 'Villa Crespo',  direccion: 'Corrientes 5400, CABA' },
];

export default function ExcelImportExport({ isAdmin, onImportDone }) {
  const fileRef                       = useRef(null);
  const [importing, setImporting]     = useState(false);
  const [resultado, setResultado]     = useState(null);
  const [showResult, setShowResult]   = useState(false);

  /* ── Descargar plantilla ─────────────────────────────────────────────── */
  const descargarPlantilla = async () => {
    // Traer puntos existentes de la base de datos
    let puntosExistentes = [];
    try {
      const res = isAdmin ? await puntosAPI.getAllAdmin() : await puntosAPI.getAll();
      puntosExistentes = res.data || [];
    } catch { /* si falla, la plantilla igual se descarga vacía */ }

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Pazzi Buns';
    const ws = wb.addWorksheet('Puntos de Venta', {
      views: [{ state: 'frozen', ySplit: 3 }],
    });

    // Anchos de columna
    ws.columns = [
      { key: 'nombre',    width: 30 },
      { key: 'zona',      width: 22 },
      { key: 'direccion', width: 40 },
    ];

    // Fila 1 — Título
    ws.mergeCells('A1:C1');
    const titleCell = ws.getCell('A1');
    titleCell.value         = '🥐 PAZZI BUNS — Puntos de Venta';
    titleCell.font          = { name: 'Arial', bold: true, size: 13, color: { argb: 'FF111827' } };
    titleCell.fill          = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFB800' } };
    titleCell.alignment     = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height     = 32;

    // Fila 2 — instrucción
    ws.mergeCells('A2:C2');
    const subCell = ws.getCell('A2');
    subCell.value       = 'Podés agregar nuevas filas al final. No modifiques los encabezados.';
    subCell.font        = { name: 'Arial', italic: true, size: 9, color: { argb: 'FF6B7280' } };
    subCell.fill        = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9E6' } };
    subCell.alignment   = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(2).height = 18;

    // Fila 3 — Headers
    const headerRow = ws.getRow(3);
    const headerLabels = [HEADERS.nombre, HEADERS.zona, HEADERS.direccion];
    headerLabels.forEach((label, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value     = label;
      cell.font      = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF111827' } };
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE68A' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border    = {
        bottom: { style: 'medium', color: { argb: 'FFFFB800' } },
        right:  { style: 'thin',   color: { argb: 'FFD1D5DB' } },
      };
    });
    headerRow.height = 22;

    // Filas con datos reales (o ejemplos si no hay datos aún).
    // Cada celda pasa por sanitizeCell() para neutralizar fórmulas (=, +, -, @).
    const filas = puntosExistentes.length > 0 ? puntosExistentes : EJEMPLOS;
    filas.forEach((item, idx) => {
      const row  = ws.addRow([
        sanitizeCell(item.nombre),
        sanitizeCell(item.zona),
        sanitizeCell(item.direccion),
      ]);
      const even = idx % 2 === 0;
      row.eachCell((cell) => {
        cell.font      = { name: 'Arial', size: 10, color: { argb: 'FF374151' } };
        cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: even ? 'FFFFFFFF' : 'FFFFF9E6' } };
        cell.alignment = { vertical: 'middle' };
        cell.border    = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
      });
      row.height = 18;
    });

    // Guardar y descargar
    const buffer = await wb.xlsx.writeBuffer();
    const blob   = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement('a');
    a.href       = url;
    a.download   = 'puntos-pazzi.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Importar Excel ──────────────────────────────────────────────────── */
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    // Defensa contra DoS: rechazar archivos demasiado grandes antes de parsear.
    if (file.size > MAX_FILE_BYTES) {
      setResultado({ ok: 0, errores: [{ fila: '-', motivo: `El archivo supera ${MAX_FILE_BYTES / (1024 * 1024)} MB.` }] });
      setShowResult(true);
      return;
    }

    setImporting(true);
    setShowResult(false);
    setResultado(null);

    try {
      const buffer = await file.arrayBuffer();
      // sheetRows acota cuántas filas decodifica XLSX en memoria.
      // cellFormula/cellHTML en false: nunca interpretar fórmulas ni HTML embebido.
      const wb     = XLSX.read(buffer, {
        type: 'array',
        cellFormula: false,
        cellHTML: false,
        sheetRows: MAX_ROWS + 10,
      });
      const ws     = wb.Sheets[wb.SheetNames[0]];
      // La plantilla tiene 2 filas antes del encabezado real (título + instrucción).
      // range: 2 le dice a SheetJS que empiece desde la fila 3 (índice 2) como encabezados.
      let rows     = XLSX.utils.sheet_to_json(ws, { defval: '', range: 2 });

      if (rows.length > MAX_ROWS) {
        rows = rows.slice(0, MAX_ROWS);
      }

      if (!rows.length) {
        setResultado({ ok: 0, errores: [{ fila: '-', motivo: 'El archivo está vacío.' }] });
        setShowResult(true);
        setImporting(false);
        return;
      }

      const normalize = (raw) => {
        const m = {};
        for (const [k, v] of Object.entries(raw)) {
          const kl = k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          if (kl.includes('nombre'))   m.nombre    = String(v).trim();
          if (kl.includes('zona'))     m.zona      = String(v).trim();
          if (kl.includes('direcci'))  m.direccion = String(v).trim();
        }
        return m;
      };

      // Normaliza un string para comparación (minúsculas, sin tildes, sin espacios extra)
      const normalizeStr = (s = '') =>
        s.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');

      // Traer todos los puntos existentes para detectar duplicados
      let existentes = [];
      try {
        const res = isAdmin ? await puntosAPI.getAllAdmin() : await puntosAPI.getAll();
        existentes = res.data || [];
      } catch { /* si falla, seguimos sin chequeo de duplicados */ }

      const ok_list  = [];
      const errores  = [];
      const duplicados = [];

      for (let i = 0; i < rows.length; i++) {
        const fila = i + 4; // empieza en fila 4 (título + instrucción + header)
        const d    = normalize(rows[i]);

        if (!d.nombre)    { errores.push({ fila, motivo: 'Falta el nombre' });    continue; }
        if (!d.zona)      { errores.push({ fila, motivo: 'Falta la zona' });      continue; }
        if (!d.direccion) { errores.push({ fila, motivo: 'Falta la dirección' }); continue; }

        // Chequeo de duplicados: mismo nombre Y misma dirección (normalizado)
        const isDuplicate = existentes.some(
          ex =>
            normalizeStr(ex.nombre)    === normalizeStr(d.nombre) &&
            normalizeStr(ex.direccion) === normalizeStr(d.direccion)
        );
        if (isDuplicate) {
          duplicados.push({ fila, motivo: `"${d.nombre}" ya existe en esa dirección` });
          continue;
        }

        const payload = {
          nombre:    d.nombre,
          zona:      d.zona,
          direccion: d.direccion,
        };

        try {
          await puntosAPI.create(payload);
          ok_list.push(d.nombre);
          // Agregar a existentes para evitar duplicar dentro del mismo archivo
          existentes.push({ nombre: d.nombre, direccion: d.direccion });
        } catch (err) {
          errores.push({ fila, motivo: `${d.nombre} — ${err.response?.data?.error || 'Error al guardar'}` });
        }
      }

      setResultado({ ok: ok_list.length, errores, duplicados });
      setShowResult(true);
      if (ok_list.length > 0 && onImportDone) onImportDone();
    } catch {
      setResultado({ ok: 0, errores: [{ fila: '-', motivo: 'No se pudo leer el archivo. Verificá que sea un .xlsx válido.' }] });
      setShowResult(true);
    } finally {
      setImporting(false);
    }
  };

  /* ── Estilos botones ─────────────────────────────────────────────────── */
  const btnStyle = (active, accent) => ({
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.45rem 0.85rem',
    background: !active ? T.bg : accent,
    border: `1px solid ${!active ? T.border : accent}`,
    borderRadius: 4,
    cursor: !active ? 'not-allowed' : 'pointer',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: '0.72rem', fontWeight: 700, color: T.ink,
    opacity: !active ? 0.6 : 1,
    transition: 'all 0.12s',
    whiteSpace: 'nowrap',
  });

  const icon = (name, color) => (
    <span style={{
      fontFamily: 'Material Symbols Outlined', fontStyle: 'normal',
      fontWeight: 'normal', lineHeight: 1, fontSize: '0.9rem',
      color: color || 'inherit',
    }}>{name}</span>
  );

  const resultBg = resultado?.errores?.length === 0 && !resultado?.duplicados?.length
    ? { bg: '#f0fdf4', border: '#bbf7d0' }
    : resultado?.ok === 0 && !resultado?.duplicados?.length
      ? { bg: '#fef2f2', border: '#fca5a5' }
      : { bg: '#fefce8', border: '#fef08a' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

      {/* Botones */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={descargarPlantilla} style={btnStyle(true, T.bg)}>
          {icon('download', T.green)}
          Plantilla Excel
        </button>

        <button onClick={() => fileRef.current?.click()} disabled={importing} style={btnStyle(!importing, T.yellow)}>
          {icon('upload_file')}
          {importing ? 'Importando...' : 'Importar Excel'}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </div>

      {/* Resultado */}
      {showResult && resultado && (
        <div style={{
          background: resultBg.bg,
          border: `1px solid ${resultBg.border}`,
          borderRadius: 4,
          padding: '0.75rem 1rem',
          fontSize: '0.72rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              {resultado.ok > 0 && (
                <div style={{ fontWeight: 700, color: T.green, marginBottom: (resultado.errores.length || resultado.duplicados?.length) ? '0.4rem' : 0 }}>
                  ✓ {resultado.ok} punto{resultado.ok !== 1 ? 's' : ''} importado{resultado.ok !== 1 ? 's' : ''} correctamente
                  {!isAdmin && ' — quedan pendientes de aprobación'}
                </div>
              )}
              {resultado.duplicados?.length > 0 && (
                <div style={{ marginBottom: resultado.errores.length ? '0.4rem' : 0 }}>
                  <div style={{ fontWeight: 700, color: '#b45309', marginBottom: '0.3rem' }}>
                    ⚠ {resultado.duplicados.length} duplicado{resultado.duplicados.length !== 1 ? 's' : ''} omitido{resultado.duplicados.length !== 1 ? 's' : ''}:
                  </div>
                  <ul style={{ paddingLeft: '1rem', margin: 0, color: '#92400e' }}>
                    {resultado.duplicados.map((e, i) => (
                      <li key={i}>Fila {e.fila}: {e.motivo}</li>
                    ))}
                  </ul>
                </div>
              )}
              {resultado.errores.length > 0 && (
                <div>
                  <div style={{ fontWeight: 700, color: T.red, marginBottom: '0.3rem' }}>
                    ✗ {resultado.errores.length} error{resultado.errores.length !== 1 ? 'es' : ''}:
                  </div>
                  <ul style={{ paddingLeft: '1rem', margin: 0, color: T.red }}>
                    {resultado.errores.map((e, i) => (
                      <li key={i}>Fila {e.fila}: {e.motivo}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowResult(false)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.muted, fontSize: '0.8rem', padding: 0, flexShrink: 0 }}
            >✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
