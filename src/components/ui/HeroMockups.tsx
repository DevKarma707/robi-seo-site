"use client";

import Image from "next/image";

export function HeroMockups() {
  return (
    <div
      className="hero-mockups-wrapper"
      style={{
        position: "relative",
        width: "630px",
        height: "630px",
        perspective: "5000px",
        perspectiveOrigin: "bottom left",
        top: "10px",
        left: "20px",
      }}
    >
      {/* Card 1 - small top left */}
      <div className="hero-mockup mockup1">
        <Image
          src="/images/card-1.png"
          alt="Robi AI - Invoice card"
          width={210}
          height={138}
          className="w-full h-full object-cover rounded-[10px]"
        />
      </div>

      {/* Card 2 - small top right */}
      <div className="hero-mockup mockup2">
        <Image
          src="/images/card-2.png"
          alt="Robi AI - Stats card"
          width={210}
          height={138}
          className="w-full h-full object-cover rounded-[10px]"
        />
      </div>

      {/* Dashboard desktop - large center */}
      <div className="hero-mockup mockup3">
        <Image
          src="/images/dashboard-desktop.png"
          alt="Robi AI - Dashboard"
          width={575}
          height={351}
          className="w-full h-full object-cover object-left rounded-[10px]"
        />
      </div>

      {/* Card 3 - bottom left */}
      <div className="hero-mockup mockup4">
        <Image
          src="/images/card-3.png"
          alt="Robi AI - Feature card"
          width={322}
          height={207}
          className="w-full h-full object-cover rounded-[10px]"
        />
      </div>

      {/* Dashboard mobile - bottom right */}
      <div className="hero-mockup mockup5">
        <Image
          src="/images/dashboard-mobile.jpg"
          alt="Robi AI - Mobile app"
          width={184}
          height={334}
          className="w-full h-full object-cover object-top rounded-[10px]"
        />
      </div>
    </div>
  );
}
