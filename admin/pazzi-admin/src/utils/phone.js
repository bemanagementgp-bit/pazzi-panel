/**
 * Normalizador de teléfonos argentinos (mismo algoritmo que el backend).
 * Ver backend/server/utils/phone.js para el contrato.
 */
export function normalizeArgPhone(raw) {
  if (raw == null) return null;
  let digits = String(raw).replace(/\D/g, '');
  if (!digits) return null;

  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('54')) digits = digits.slice(2);
  if (digits.startsWith('9'))  digits = digits.slice(1);
  if (digits.length > 10 && digits.startsWith('15')) digits = digits.slice(2);
  if (digits.length > 10 && digits.startsWith('0'))  digits = digits.slice(1);
  if (digits.length === 11) {
    if (digits.startsWith('0'))  digits = digits.slice(1);
    else if (digits.startsWith('15')) digits = digits.slice(2);
  }

  if (digits.length !== 10) return null;

  let area, subscriber;
  if (digits.startsWith('11')) {
    area = digits.slice(0, 2);
    subscriber = digits.slice(2);
  } else {
    area = digits.slice(0, 3);
    subscriber = digits.slice(3);
  }

  let formattedSub;
  if (subscriber.length === 8)      formattedSub = `${subscriber.slice(0, 4)}-${subscriber.slice(4)}`;
  else if (subscriber.length === 7) formattedSub = `${subscriber.slice(0, 4)}-${subscriber.slice(4)}`;
  else if (subscriber.length === 6) formattedSub = `${subscriber.slice(0, 3)}-${subscriber.slice(3)}`;
  else return null;

  return `+54 9 ${area} ${formattedSub}`;
}

export default { normalizeArgPhone };
