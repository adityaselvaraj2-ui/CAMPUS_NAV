import { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface HeroProps {
  onSelectCampus: (campusId: string) => void;
}

const AnimatedTitle = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  return (
    <span className="inline-block">
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="letter-animate inline-block"
          style={{ animationDelay: `${delay + i * 0.04}s` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

const StatChip = ({ text, delay }: { text: string; delay: number }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <span
      className={`glass-card px-4 py-2 font-ui text-xs tracking-wider text-text-2 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
    >
      {text}
    </span>
  );
};

const Hero = ({ onSelectCampus }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-[70px]">
      {/* Decorative grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--aurora-1) / 0.03) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--aurora-1) / 0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Beacon icon */}
        <div className="animate-fade-up mb-8 flex justify-center" style={{ animationDelay: '0.2s' }}>
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <Navigation className="w-8 h-8 text-primary" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 beacon-ring" />
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 beacon-ring beacon-ring-delay-1" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-black leading-tight mb-4">
          <AnimatedTitle text="CAMPUS" />
          <br />
          <span className="text-gradient-cyan">
            <AnimatedTitle text="NAVIGATOR" delay={0.3} />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-up font-body text-lg md:text-xl text-text-2 max-w-2xl mx-auto mb-10" style={{ animationDelay: '0.8s' }}>
          The spatial digital twin of St. Joseph's campuses.
          <br className="hidden sm:block" />
          Navigate. Discover. Never get lost.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-up flex flex-col sm:flex-row gap-4 justify-center mb-10" style={{ animationDelay: '1s' }}>
          <button
            onClick={() => onSelectCampus('sjce')}
            className="group relative px-8 py-4 rounded-xl font-ui text-sm font-bold tracking-wider
                       bg-primary/10 border-2 border-primary/40 text-primary
                       hover:bg-primary/20 hover:border-primary hover:-translate-y-1
                       active:translate-y-0 transition-all duration-300
                       hover:shadow-[0_0_30px_hsl(var(--aurora-1)/0.4)]"
          >
            <MapPin className="w-4 h-4 inline-block mr-2 -mt-0.5" />
            EXPLORE SJCE
          </button>
          <button
            onClick={() => onSelectCampus('sjit')}
            className="group relative px-8 py-4 rounded-xl font-ui text-sm font-bold tracking-wider
                       bg-secondary/10 border-2 border-secondary/40 text-secondary
                       hover:bg-secondary/20 hover:border-secondary hover:-translate-y-1
                       active:translate-y-0 transition-all duration-300
                       hover:shadow-[0_0_30px_hsl(var(--aurora-2)/0.4)]"
          >
            <MapPin className="w-4 h-4 inline-block mr-2 -mt-0.5" />
            EXPLORE SJIT
          </button>
        </div>

        {/* Stat Chips */}
        <div className="flex flex-wrap gap-3 justify-center">
          <StatChip text="2 CAMPUSES" delay={1200} />
          <StatChip text="28+ BUILDINGS MAPPED" delay={1400} />
          <StatChip text="REAL-TIME GPS NAV" delay={1600} />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 animate-fade-up" style={{ animationDelay: '2s' }}>
        <div className="w-6 h-10 rounded-full border-2 border-text-3 flex justify-center pt-2">
          <div className="w-1 h-3 rounded-full bg-text-3 animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
