import { useEffect, useState } from "react";
import jaguar from "../assets/jaguar.webp";
import porshe2 from "../assets/porshe2.webp";
import scenery from "../assets/scenery.webp";

const heroImages = [
  jaguar,
  porshe2,
  scenery,
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
    <section className="hero">
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
          d="M0 80 L120 20 L240 60 L360 10 L480 55 L600 15 L720 60 L840 20 L960 58 L1080 12 L1200 55 L1320 20 L1440 50 L1440 80 Z"
          fill="var(--sand-50)"
        />
      </svg>
    </section>
  );
}