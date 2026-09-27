import { NextResponse } from 'next/server';
import { buildPayfastSignature, currentPayfastMode, getPayfastProcessUrl } from '@/lib/payfast';

export async function POST(req: Request) {
  try {
    const { title, amountZAR } = await req.json();

    if (!title || !amountZAR) {
      return NextResponse.json({ error: 'Missing title or amountZAR' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const mode = currentPayfastMode();
    const paymentId = `ll-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const amount = Number(amountZAR).toFixed(2);

    // Field order matters for the Payfast signature — keep this order stable.
    const fields: Record<string, string> = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID || '',
      merchant_key: process.env.PAYFAST_MERCHANT_KEY || '',
      return_url: `${siteUrl}/success`,
      cancel_url: `${siteUrl}/`,
      notify_url: `${siteUrl}/api/payfast/notify`,
      m_payment_id: paymentId,
      amount,
      item_name: title.slice(0, 100), // Payfast limits item_name to 100 chars
      subscription_type: '1',
      recurring_amount: amount,
      frequency: '3', // 3 = monthly
      cycles: '0', // 0 = billed indefinitely, until the customer or you cancel
    };

    const passphrase = process.env.PAYFAST_PASSPHRASE || undefined;
    const signature = buildPayfastSignature(fields, passphrase);

    return NextResponse.json({
      actionUrl: getPayfastProcessUrl(mode),
      fields: { ...fields, signature },
    });
  } catch (err: any) {
    console.error('Payfast checkout error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
