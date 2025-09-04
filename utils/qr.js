import qrcode from 'qrcode';
import crypto from 'crypto';

function signPayload(payloadObj) {
  const json = JSON.stringify(payloadObj);
  const sig = crypto.createHmac('sha256', process.env.QR_SECRET || 'qr_secret').update(json).digest('hex');
  return { json, sig };
}

export async function generateQR(payloadObj) {
  const { json, sig } = signPayload(payloadObj);
  const wrapped = { payload: payloadObj, sig };
  const str = JSON.stringify(wrapped);
  const dataUrl = await qrcode.toDataURL(str);
  return { dataUrl, raw: str, sig };
}

export function verifyQR(str) {
  try {
    const wrapped = JSON.parse(str);
    const payload = wrapped.payload;
    const sig = wrapped.sig;
    const expected = crypto.createHmac('sha256', process.env.QR_SECRET || 'qr_secret').update(JSON.stringify(payload)).digest('hex');
    return { valid: sig === expected, payload };
  } catch (e) {
    return { valid: false };
  }
}
