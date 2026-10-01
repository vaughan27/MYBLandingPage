import { useEffect, useState } from "react";

const heroImages = [
  "/assets/BehBehani.webp",
  "/assets/porshe2.webp",
  "/assets/scenery.webp",
];

export default function Hero() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    // Preload images after the first image has loaded.
    const preloadImages = heroImages.slice(1).map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    const interval = setInterval(() => {
      setCurrentImage((current) => (current + 1) % heroImages.length);
    }, 6000);

    return () => {
      clearInterval(interval);

      // Prevent unused Image objects from being retained.
      preloadImages.forEach((img) => {
        img.src = "";
      });
    };
  }, []);

  return (
    <section className="hero" style={{ paddingBottom: "10px" }}>
      {/* Background slideshow */}
      <div className="hero__background" aria-hidden="true">
        {heroImages.map((image, index) => (
          <div
            key={image}
            className={`hero__background-image ${
              index === currentImage ? "is-active" : ""
            }`}
            style={{ backgroundImage: `url("${image}")` }}
          />
        ))}

        {/* Dark translucent layer */}
        <div className="hero__overlay" />
      </div>

      <div className="container hero__inner">
        <p className="hero__eyebrow">MYB Group</p>

        <h1 className="hero__title">
          Moving Forward Together : Balancing Performance, Clarity, and
          Wellbeing
        </h1>

        <p className="hero__sub">
          Discipline sustains our progress, accountability strengthens our
          standards, and honesty preserves the trust on which our culture is
          built.
        </p>
      </div>

      <svg
        className="hero__ridge"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="
            M0 80
            L0 40
            L120 10
            L240 40
            L360 10
            L480 40
            L600 10
            L720 40
            L840 10
            L960 40
            L1080 10
            L1200 40
            L1320 10
            L1440 40
            L1440 82
            Z
          "
          fill="var(--sand-50)"
        />
      </svg>

    </section>
  );
}