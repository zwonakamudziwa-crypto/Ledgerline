import crypto from 'crypto';

const PAYFAST_SANDBOX_HOST = 'sandbox.payfast.co.za';
const PAYFAST_LIVE_HOST = 'www.payfast.co.za';

/**
 * Payfast expects PHP-style urlencoding: spaces become '+' rather than '%20'.
 * This matters — a mismatched encoding produces a signature Payfast will reject.
 */
function pfEncode(value: string) {
  return encodeURIComponent(value).replace(/%20/g, '+');
}

/**
 * Builds the md5 signature Payfast uses to verify a request came from you
 * and wasn't tampered with in transit.
 *
 * IMPORTANT: Payfast signs fields in the order they're added, not alphabetically.
 * Always pass fields in the same order you'll send them in the actual form —
 * `fields` here is a plain object, and modern JS preserves insertion order for
 * string keys, so just build it in the right order at the call site.
 */
export function buildPayfastSignature(fields: Record<string, string>, passphrase?: string) {
  const pairs = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${pfEncode(String(v))}`);

  let paramString = pairs.join('&');
  if (passphrase) {
    paramString += `&passphrase=${pfEncode(passphrase)}`;
  }

  return crypto.createHash('md5').update(paramString).digest('hex');
}

export function getPayfastProcessUrl(mode: 'sandbox' | 'live') {
  const host = mode === 'live' ? PAYFAST_LIVE_HOST : PAYFAST_SANDBOX_HOST;
  return `https://${host}/eng/process`;
}

export function getPayfastValidateUrl(mode: 'sandbox' | 'live') {
  const host = mode === 'live' ? PAYFAST_LIVE_HOST : PAYFAST_SANDBOX_HOST;
  return `https://${host}/eng/query/validate`;
}

export function currentPayfastMode(): 'sandbox' | 'live' {
  return process.env.PAYFAST_MODE === 'live' ? 'live' : 'sandbox';
}
