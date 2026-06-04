/**
 * Normalizador de teléfonos argentinos.
 *
 * Formato canónico de salida:
 *   +54 9 <area> <subscriber>
 *
 * Donde:
 *   - area = 2 dígitos si empieza con 11 (CABA), 3 dígitos en el resto.
 *   - subscriber = el resto de los 10 dígitos del número nacional, con
 *     guion entre la primera mitad y la segunda:
 *       · 8 dígitos → XXXX-XXXX  (CABA: 11)
 *       · 7 dígitos → XXXX-XXX   (interior: 221, 351, etc.)
 *       · 6 dígitos → XXX-XXX
 *
 * Acepta entradas con o sin `+54`, `0054`, `9`, `15`, `0` de tronco, y
 * cualquier separador (espacios, guiones, paréntesis). Devuelve `null`
 * si no se puede normalizar a un número argentino de 10 dígitos.
 */
export function normalizeArgPhone(raw) {
  if (raw == null) return null;
  let digits = String(raw).replace(/\D/g, '');
  if (!digits) return null;

  // 00 prefijo internacional
  if (digits.startsWith('00')) digits = digits.slice(2);
  // Código de país
  if (digits.startsWith('54')) digits = digits.slice(2);
  // Indicativo móvil "9" (Argentina lo usa después de +54)
  if (digits.startsWith('9')) digits = digits.slice(1);
  // Prefijo móvil legado "15" (cuando viene sin código de país)
  if (digits.length > 10 && digits.startsWith('15')) digits = digits.slice(2);
  // "0" de discado nacional
  if (digits.length > 10 && digits.startsWith('0')) digits = digits.slice(1);
  // Pase final: si queda 11 dígitos, recortar 0 o 15 inicial
  if (digits.length === 11) {
    if (digits.startsWith('0')) digits = digits.slice(1);
    else if (digits.startsWith('15')) digits = digits.slice(2);
  }

  if (digits.length !== 10) return null;

  let area, subscriber;
  if (digits.startsWith('11')) {
    area = digits.slice(0, 2);
    subscriber = digits.slice(2); // 8 dígitos
  } else {
    area = digits.slice(0, 3);
    subscriber = digits.slice(3); // 7 dígitos
  }

  let formattedSub;
  if (subscriber.length === 8) {
    formattedSub = `${subscriber.slice(0, 4)}-${subscriber.slice(4)}`;
  } else if (subscriber.length === 7) {
    formattedSub = `${subscriber.slice(0, 4)}-${subscriber.slice(4)}`;
  } else if (subscriber.length === 6) {
    formattedSub = `${subscriber.slice(0, 3)}-${subscriber.slice(3)}`;
  } else {
    return null;
  }

  return `+54 9 ${area} ${formattedSub}`;
}

export default { normalizeArgPhone };
