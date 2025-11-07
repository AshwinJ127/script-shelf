function RegistrationBanner() {
  return (
    <div
      style={{
        textAlign: 'center',
        marginBottom: '2.25rem',
      }}
    >
      <h1
        style={{
          fontSize: '2.85rem',
          fontWeight: '700',
          color: '#5b6ef5',
          margin: 0,
          letterSpacing: '-0.02em',
        }}
      >
        New to Script Shelf?
      </h1>
      <p
        style={{
          marginTop: '1.1rem',
          fontSize: '1.05rem',
          color: '#5f6b78',
          maxWidth: '520px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        Start by entering your email and creating a password!
      </p>
    </div>
  );
}

export default RegistrationBanner;

