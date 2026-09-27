export default function SuccessPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: '#F3EFE4',
        color: '#1B2A22',
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Thanks — you&apos;re subscribed.
        </h1>
        <p style={{ color: '#4A4238' }}>
          Check your email for a receipt from Payfast. We&apos;ll be in touch shortly to get
          started.
        </p>
      </div>
    </div>
  );
}
