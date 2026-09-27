'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

const INK = '#1B2A22';
const PAPER = '#F3EFE4';
const LEDGER_GREEN = '#2F5233';
const RULE = '#C9BFA6';
const BRICK = '#A6402C';

type TierId = 'starter' | 'growth' | 'complete';

const TIERS: {
  id: TierId;
  name: string;
  priceZAR: number; // full rand amount, not cents
  cadence: string;
  bestFor: string;
  lines: string[];
}[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceZAR: 5750,
    cadence: '/month',
    bestFor: 'Solo operators and side businesses under R250k/mo revenue',
    lines: [
      'Up to 150 transactions categorized monthly',
      'Monthly bank & card reconciliation',
      'Profit & loss statement, delivered by the 5th',
      'Email support, 2 business day response',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    priceZAR: 10700,
    cadence: '/month',
    bestFor: 'Small teams with payroll and multiple accounts',
    lines: [
      'Up to 500 transactions categorized monthly',
      'Weekly reconciliation across all accounts',
      'P&L, balance sheet, and cash flow statement',
      'Payroll processing for up to 5 employees',
      'Priority email + monthly 30-minute review call',
    ],
  },
  {
    id: 'complete',
    name: 'Complete',
    priceZAR: 16500,
    cadence: '/month',
    bestFor: 'Established businesses that want books fully off their plate',
    lines: [
      'Unlimited transaction categorization',
      'Weekly reconciliation + quarterly close',
      'Full financial statement package',
      'Payroll processing for up to 15 employees',
      'VAT return preparation',
      'Direct line to your bookkeeper, same-day response',
    ],
  },
];

// These are placeholder prices (roughly converted from a US-market retainer).
// Edit priceZAR above to whatever fits your market — that's the only thing
// you need to touch to change what you charge.
function formatPrice(rand: number) {
  return `R${Math.round(rand).toLocaleString('en-US')}`;
}

export default function LedgerlineLanding() {
  const [email, setEmail] = useState('');
  const [leadStatus, setLeadStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleCheckout = async (tierName: string, priceZAR: number) => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Ledgerline — ${tierName} Plan`,
          amountZAR: priceZAR,
        }),
      });
      const data = await res.json();
      if (!data.actionUrl || !data.fields) {
        console.error('Checkout error:', data.error);
        return;
      }

      // Payfast expects a real form POST, not a redirect URL — so we build
      // one on the fly and submit it. The customer briefly sees nothing
      // happen, then lands on Payfast's payment page.
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.actionUrl;
      Object.entries(data.fields as Record<string, string>).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (e) {
      console.error('Payment initiation failed:', e);
    }
  };

  const handleLeadCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLeadStatus('saving');
    try {
      const { error } = await supabase.from('leads').insert([{ email, source: 'landing_page' }]);
      if (error) throw error;
      setLeadStatus('saved');
      setEmail('');
    } catch (err) {
      console.error('Lead capture failed:', err);
      setLeadStatus('error');
    }
  };

  return (
    <div style={{ backgroundColor: PAPER, color: INK }} className="min-h-screen font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@500;700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
        .font-slab { font-family: 'Roboto Slab', ui-serif, Georgia, serif; }
        .font-mono-num { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
        .font-body { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
      `}</style>

      {/* Header */}
      <header
        className="font-body sticky top-0 z-10 px-6 py-4 md:px-12"
        style={{ backgroundColor: PAPER, borderBottom: `1px solid ${RULE}` }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-slab text-lg font-bold tracking-tight">Ledgerline</span>
          <a
            href="#pricing"
            className="text-sm font-medium px-4 py-2 rounded-sm"
            style={{ backgroundColor: LEDGER_GREEN, color: PAPER }}
          >
            See pricing
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="font-body max-w-5xl mx-auto px-6 md:px-12 pt-16 pb-14">
        <div className="max-w-2xl">
          <p className="font-mono-num text-sm mb-4" style={{ color: LEDGER_GREEN }}>
            Bookkeeping, on retainer
          </p>
          <h1 className="font-slab text-4xl md:text-5xl font-bold leading-tight">
            Your books, closed every month. Never chased.
          </h1>
          <p className="mt-6 text-lg leading-relaxed" style={{ color: '#4A4238' }}>
            Ledgerline handles reconciliation, categorization, and financial statements for small
            businesses that have outgrown a spreadsheet but aren&apos;t ready for a full-time hire.
            One flat monthly fee. No hourly surprises.
          </p>
          <div className="mt-8 flex gap-4">
            <a
              href="#pricing"
              className="px-5 py-3 text-sm font-semibold rounded-sm"
              style={{ backgroundColor: INK, color: PAPER }}
            >
              Compare plans
            </a>
            <a href="#how" className="px-5 py-3 text-sm font-semibold underline underline-offset-4">
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{ borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}` }}>
        <div className="font-body max-w-5xl mx-auto px-6 md:px-12 py-8 grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="font-mono-num text-3xl font-medium">5th</p>
            <p className="text-sm mt-1" style={{ color: '#6B6254' }}>
              of the month, statements delivered
            </p>
          </div>
          <div>
            <p className="font-mono-num text-3xl font-medium">0</p>
            <p className="text-sm mt-1" style={{ color: '#6B6254' }}>
              hourly line items on your invoice
            </p>
          </div>
          <div>
            <p className="font-mono-num text-3xl font-medium">1</p>
            <p className="text-sm mt-1" style={{ color: '#6B6254' }}>
              flat fee, billed monthly
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="font-body max-w-5xl mx-auto px-6 md:px-12 py-16">
        <h2 className="font-slab text-2xl font-bold mb-8">How the retainer works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: 'Connect',
              body: 'Link your bank and card accounts through a secure read-only connection. Takes about ten minutes.',
            },
            {
              step: 'We reconcile',
              body: 'Every transaction gets categorized and matched against statements on a fixed schedule, not whenever we get to it.',
            },
            {
              step: 'You review',
              body: 'Your P&L and balance sheet land in your inbox by the same date every month, in plain language.',
            },
          ].map((item) => (
            <div key={item.step} style={{ borderTop: `2px solid ${INK}` }} className="pt-4">
              <h3 className="font-semibold mb-2">{item.step}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#4A4238' }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing — ledger sheet styling */}
      <section id="pricing" className="font-body max-w-5xl mx-auto px-6 md:px-12 py-16">
        <h2 className="font-slab text-2xl font-bold mb-2">Plans</h2>
        <p className="text-sm mb-10" style={{ color: '#6B6254' }}>
          Every plan is month-to-month. Cancel any time, keep every statement we&apos;ve produced.
        </p>

        <div style={{ border: `1px solid ${RULE}` }}>
          {TIERS.map((tier, idx) => (
            <div
              key={tier.id}
              className="grid md:grid-cols-[1fr_auto_1.4fr_auto] gap-4 md:gap-8 items-start px-6 py-8"
              style={{ borderTop: idx === 0 ? 'none' : `1px solid ${RULE}` }}
            >
              <div>
                <h3 className="font-slab text-xl font-bold">{tier.name}</h3>
                <p className="text-xs mt-2" style={{ color: '#6B6254' }}>
                  {tier.bestFor}
                </p>
              </div>

              <div className="md:text-right">
                <p className="font-mono-num text-3xl font-medium">{formatPrice(tier.priceZAR)}</p>
                <p className="text-xs" style={{ color: '#6B6254' }}>
                  ZAR {tier.cadence}
                </p>
              </div>

              <ul className="space-y-1.5 text-sm" style={{ color: '#3A342C' }}>
                {tier.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>

              <div className="md:self-center">
                <button
                  onClick={() => handleCheckout(tier.name, tier.priceZAR)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-sm whitespace-nowrap"
                  style={{
                    backgroundColor: tier.id === 'growth' ? BRICK : INK,
                    color: PAPER,
                  }}
                >
                  Start {tier.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="font-body max-w-5xl mx-auto px-6 md:px-12 py-16" style={{ borderTop: `1px solid ${RULE}` }}>
        <h2 className="font-slab text-2xl font-bold mb-8">Questions</h2>
        <div className="space-y-6 max-w-2xl">
          {[
            {
              q: 'What if I go over my transaction limit?',
              a: 'We flag it before it happens and offer to move you to the next tier. No surprise overage charges.',
            },
            {
              q: 'Do you file taxes?',
              a: 'We prepare clean, tax-ready statements. Filing itself is handled by your CPA, or we can refer one.',
            },
            {
              q: 'Can I switch plans later?',
              a: 'Yes, at the start of any billing cycle. Upgrades apply immediately; downgrades apply next cycle.',
            },
          ].map((item) => (
            <div key={item.q}>
              <p className="font-semibold">{item.q}</p>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: '#4A4238' }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Lead capture */}
      <section
        className="font-body px-6 md:px-12 py-16"
        style={{ backgroundColor: INK, color: PAPER }}
      >
        <div className="max-w-5xl mx-auto max-w-xl">
          <h2 className="font-slab text-2xl font-bold mb-3">Not ready to subscribe yet?</h2>
          <p className="text-sm mb-6" style={{ color: '#C9C2B4' }}>
            Leave your email and we&apos;ll send a sample monthly statement, no commitment.
          </p>
          <form onSubmit={handleLeadCapture} className="flex gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@business.com"
              className="flex-1 px-4 py-3 text-sm rounded-sm"
              style={{ color: INK }}
            />
            <button
              type="submit"
              disabled={leadStatus === 'saving'}
              className="px-5 py-3 text-sm font-semibold rounded-sm"
              style={{ backgroundColor: BRICK, color: PAPER }}
            >
              {leadStatus === 'saving' ? 'Sending…' : 'Send sample'}
            </button>
          </form>
          {leadStatus === 'saved' && (
            <p className="text-sm mt-3" style={{ color: '#9CC28A' }}>
              Sent. Check your inbox shortly.
            </p>
          )}
          {leadStatus === 'error' && (
            <p className="text-sm mt-3" style={{ color: '#E0938A' }}>
              Something went wrong — try again in a moment.
            </p>
          )}
        </div>
      </section>

      <footer className="font-body px-6 md:px-12 py-8 text-center text-xs" style={{ color: '#8A8172' }}>
        Ledgerline · Replace with your business name, address, and contact details
      </footer>
    </div>
  );
}
