import { useEffect, useState } from "react";

const DAY_IMAGE = "/assets/BehBehani.webp";
const NIGHT_IMAGE = "/assets/BehBehaniNight.webp";

function getHeroImage() {
  const hour = new Date().getHours();

  // Day: 6:00 AM to 5:59 PM
  // Night: 6:00 PM to 5:59 AM
  return hour >= 6 && hour < 18 ? DAY_IMAGE : NIGHT_IMAGE;
}

export default function Hero() {
  const [currentImage, setCurrentImage] = useState(getHeroImage);

  useEffect(() => {
    // Update the image if the day/night period changes
    // while the page remains open.
    const updateImage = () => {
      setCurrentImage(getHeroImage());
    };

    updateImage();

    // Check every minute.
    const interval = setInterval(updateImage, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero" style={{ paddingBottom: "10px" }}>
      {/* Background image */}
      <div className="hero__background" aria-hidden="true">
        <div
          className="hero__background-image is-active"
          style={{ backgroundImage: `url("${currentImage}")` }}
        />

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

      {/* <svg
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
      </svg> */}

    </section>
  );
}