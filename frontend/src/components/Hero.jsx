export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero__inner">
        <p className="hero__eyebrow">MYB Group Intranet</p>
        <h1 className="hero__title">
          Ninety years of trade, in one place to work from today.
        </h1>
        <p className="hero__sub">
          Everything you need for your working day — company systems, the
          latest circulars, upcoming events and the people directory.
        </p>
      </div>
      <svg
        className="hero__ridge"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 80 L120 20 L240 60 L360 10 L480 55 L600 15 L720 60 L840 20 L960 58 L1080 12 L1200 55 L1320 20 L1440 50 L1440 80 Z"
          fill="var(--sand-50)"
        />
      </svg>
    </section>
  );
}
