import { NextResponse } from 'next/server';
import { buildPayfastSignature, currentPayfastMode, getPayfastValidateUrl } from '@/lib/payfast';
import { supabase } from '@/lib/supabase';

/**
 * Payfast calls this URL on its own servers after a payment completes —
 * this is how you actually find out a payment succeeded. The browser
 * redirect to return_url is just for the customer; never trust it alone.
 *
 * Two checks before believing anything in this request:
 * 1. The signature Payfast sent matches one we compute ourselves.
 * 2. Payfast's own server confirms the request when we post it back to them.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const params = new URLSearchParams(rawBody);
  const data: Record<string, string> = {};
  params.forEach((value, key) => {
    data[key] = value;
  });

  const receivedSignature = data.signature;
  delete data.signature;

  const passphrase = process.env.PAYFAST_PASSPHRASE || undefined;
  const expectedSignature = buildPayfastSignature(data, passphrase);

  if (receivedSignature !== expectedSignature) {
    console.warn('Payfast ITN: signature mismatch — ignoring');
    return new NextResponse('invalid signature', { status: 400 });
  }

  try {
    const mode = currentPayfastMode();
    const verifyRes = await fetch(getPayfastValidateUrl(mode), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: rawBody,
    });
    const verifyText = (await verifyRes.text()).trim();
    if (verifyText !== 'VALID') {
      console.warn('Payfast ITN: server-side validation failed:', verifyText);
      return new NextResponse('validation failed', { status: 400 });
    }
  } catch (e) {
    console.error('Payfast ITN: validation request errored', e);
    return new NextResponse('validation error', { status: 500 });
  }

  if (data.payment_status === 'COMPLETE') {
    try {
      await supabase.from('payments').insert([
        {
          m_payment_id: data.m_payment_id,
          pf_payment_id: data.pf_payment_id,
          amount_gross: data.amount_gross,
          item_name: data.item_name,
          email: data.email_address,
          status: data.payment_status,
        },
      ]);
    } catch (e) {
      console.error('Failed to record payment in Supabase:', e);
    }
  }

  return new NextResponse('OK', { status: 200 });
}
