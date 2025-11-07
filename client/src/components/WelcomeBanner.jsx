function WelcomeBanner() {
  return (
    <div
      style={{
        textAlign: 'center',
        marginBottom: '2.25rem',
      }}
    >
      <h1
        style={{
          fontSize: '3rem',
          fontWeight: '700',
          color: '#5b6ef5',
          margin: 0,
          letterSpacing: '-0.025em',
        }}
      >
        Welcome to Script Shelf!
      </h1>
      <p
        style={{
          marginTop: '1.15rem',
          fontSize: '1.1rem',
          color: '#5f6b78',
          maxWidth: '540px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        Sign in to continue curating and running your favorite scripts.
      </p>
    </div>
  );
}

export default WelcomeBanner;

