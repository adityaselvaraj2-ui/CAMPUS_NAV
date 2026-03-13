import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, ChevronDown } from 'lucide-react';
import CampusBackgroundOverlay from './CampusBackgroundOverlay';
import { Campus } from '@/data/campusData';
import { fetchCampusWeather, weatherCodeToEmoji, WeatherData } from '@/utils/weather';

interface HeroProps {
  onSelectCampus: (campusId: string) => void;
  hoveredCampus: Campus;
  onHoverCampus: (id: string) => void;
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
  const [count, setCount] = useState(0);
  const matchResult = text.match(/^(\d+)(.+)$/);
  const hasNum = !!matchResult;
  const targetNum = matchResult ? parseInt(matchResult[1]) : 0;
  const suffix = matchResult ? matchResult[2] : text;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!visible || !hasNum) return;
    const duration = 1200;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * targetNum));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, hasNum, targetNum]);

  return (
    <span
      className={`glass-card px-4 py-2 font-ui text-xs tracking-wider text-muted-foreground transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
    >
      {hasNum ? `${count}${suffix}` : text}
    </span>
  );
};

// Orbiting particle dots around beacon
const OrbitDots = () => {
  const dots = [0, 60, 120, 180, 240, 300];
  return (
    <>
      {dots.map((angle, i) => (
        <div
          key={i}
          className="absolute inset-0 pointer-events-none"
          style={{
            animation: `orbit-spin 8s linear infinite`,
            ['--start-angle' as string]: `${angle}deg`,
          }}
        >
          <div
            className="absolute rounded-full bg-primary"
            style={{
              width: i % 2 === 0 ? 5 : 3,
              height: i % 2 === 0 ? 5 : 3,
              opacity: i % 2 === 0 ? 0.9 : 0.4,
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%)`,
              boxShadow: '0 0 6px hsl(var(--aurora-1) / 0.6)',
            }}
          />
        </div>
      ))}
    </>
  );
};

const Hero = ({ onSelectCampus, hoveredCampus, onHoverCampus }: HeroProps) => {
  const [weather, setWeather] = useState<Record<string, WeatherData | null>>({});

  useEffect(() => {
    ['sjce', 'sjit', 'cit'].forEach(async id => {
      const w = await fetchCampusWeather(id);
      setWeather(prev => ({ ...prev, [id]: w }));
    });
  }, []);

  const handleMagneticMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.25;
    const dy = (e.clientY - cy) * 0.25;
    e.currentTarget.style.transform = `translate(${dx}px, ${dy}px) translateY(-4px)`;
  }, []);

  const handleMagneticLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = '';
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-[70px]">
      <CampusBackgroundOverlay campus={hoveredCampus} />
      {/* Aurora background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute"
          style={{
            top: '-20%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%',
            background: 'radial-gradient(circle, hsl(var(--aurora-1) / 0.08) 0%, transparent 70%)',
            animation: 'aurora-drift-1 12s ease-in-out infinite alternate',
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: '-20%', right: '-10%', width: '50vw', height: '50vw', borderRadius: '50%',
            background: 'radial-gradient(circle, hsl(var(--aurora-2) / 0.07) 0%, transparent 70%)',
            animation: 'aurora-drift-2 15s ease-in-out infinite alternate',
          }}
        />
        <div
          className="absolute"
          style={{
            top: '40%', left: '40%', width: '30vw', height: '30vw', borderRadius: '50%',
            background: 'radial-gradient(circle, hsl(var(--aurora-3) / 0.04) 0%, transparent 70%)',
            animation: 'aurora-drift-3 18s ease-in-out infinite alternate',
          }}
        />
      </div>

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
        {/* Beacon icon with orbiting particles */}
        <div className="animate-fade-up mb-8 flex justify-center" style={{ animationDelay: '0.2s' }}>
          <div className="relative" style={{ width: 120, height: 120 }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <Navigation className="w-8 h-8 text-primary" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-primary/30 beacon-ring" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-primary/20 beacon-ring beacon-ring-delay-1" />
            <OrbitDots />
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
        <p className="animate-fade-up font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10" style={{ animationDelay: '0.8s' }}>
          The spatial digital twin of South India's premier engineering campuses.
          <br className="hidden sm:block" />
          Navigate. Discover. Never get lost.
        </p>

        {/* CTA Buttons with magnetic hover & shimmer */}
        <div className="animate-fade-up flex flex-col sm:flex-row gap-4 justify-center mb-10 flex-wrap" style={{ animationDelay: '1s' }}>
          <button
            onClick={() => onSelectCampus('sjce')}
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
            onMouseEnter={() => onHoverCampus('sjce')}
            className="group relative px-8 py-4 rounded-xl font-ui text-sm font-bold tracking-wider overflow-hidden
                       bg-primary/10 border-2 border-primary/40 text-primary
                       hover:bg-primary/20 hover:border-primary
                       active:translate-y-0 transition-all duration-300
                       hover:shadow-[0_0_30px_hsl(var(--aurora-1)/0.4)]"
          >
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
              style={{
                background: 'linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.12) 50%, transparent 80%)',
                animation: 'shimmer-sweep 600ms ease-out',
              }}
            />
            <MapPin className="w-4 h-4 inline-block mr-2 -mt-0.5" />
            EXPLORE SJCE
            {weather.sjce && (
              <div className="flex items-center gap-1.5 font-ui text-[10px] text-muted-foreground/50 mt-1">
                <span>{weatherCodeToEmoji(weather.sjce.weatherCode)}</span>
                <span>{weather.sjce.temp}°C</span>
                <span className="opacity-40">·</span>
                <span>{weather.sjce.humidity}% RH</span>
              </div>
            )}
          </button>
          <button
            onClick={() => onSelectCampus('sjit')}
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
            onMouseEnter={() => onHoverCampus('sjit')}
            className="group relative px-8 py-4 rounded-xl font-ui text-sm font-bold tracking-wider overflow-hidden
                       bg-secondary/10 border-2 border-secondary/40 text-secondary
                       hover:bg-secondary/20 hover:border-secondary
                       active:translate-y-0 transition-all duration-300
                       hover:shadow-[0_0_30px_hsl(var(--aurora-2)/0.4)]"
          >
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
              style={{
                background: 'linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.12) 50%, transparent 80%)',
                animation: 'shimmer-sweep 600ms ease-out',
              }}
            />
            <MapPin className="w-4 h-4 inline-block mr-2 -mt-0.5" />
            EXPLORE SJIT
            {weather.sjit && (
              <div className="flex items-center gap-1.5 font-ui text-[10px] text-muted-foreground/50 mt-1">
                <span>{weatherCodeToEmoji(weather.sjit.weatherCode)}</span>
                <span>{weather.sjit.temp}°C</span>
                <span className="opacity-40">·</span>
                <span>{weather.sjit.humidity}% RH</span>
              </div>
            )}
          </button>
          <button
            onClick={() => onSelectCampus('cit')}
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
            onMouseEnter={() => onHoverCampus('cit')}
            className="group relative px-8 py-4 rounded-xl font-ui text-sm font-bold tracking-wider overflow-hidden
                       border-2 active:translate-y-0 transition-all duration-300"
            style={{
              background: 'hsl(var(--solar) / 0.10)',
              borderColor: 'hsl(var(--solar) / 0.40)',
              color: 'hsl(var(--solar))',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--solar))'; e.currentTarget.style.background = 'hsl(var(--solar) / 0.20)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--solar) / 0.40)'; e.currentTarget.style.background = 'hsl(var(--solar) / 0.10)'; }}
          >
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
              style={{
                background: 'linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.12) 50%, transparent 80%)',
                animation: 'shimmer-sweep 600ms ease-out',
              }}
            />
            <MapPin className="w-4 h-4 inline-block mr-2 -mt-0.5" />
            EXPLORE CIT (COIMBATORE)
            {weather.cit && (
              <div className="flex items-center gap-1.5 font-ui text-[10px] text-muted-foreground/50 mt-1">
                <span>{weatherCodeToEmoji(weather.cit.weatherCode)}</span>
                <span>{weather.cit.temp}°C</span>
                <span className="opacity-40">·</span>
                <span>{weather.cit.humidity}% RH</span>
              </div>
            )}
          </button>
        </div>

        {/* Stat Chips */}
        <div className="flex flex-wrap gap-3 justify-center">
          <StatChip text="3 CAMPUSES" delay={1200} />
          <StatChip text="80+ BUILDINGS MAPPED" delay={1400} />
          <StatChip text="REAL-TIME GPS NAV" delay={1600} />
        </div>
      </div>

      {/* Scroll indicator — cascading chevrons */}
      <div className="absolute bottom-8 animate-fade-up flex flex-col items-center gap-0" style={{ animationDelay: '2s' }}>
        {[0, 1, 2].map((i) => (
          <ChevronDown
            key={i}
            className="w-5 h-5 text-muted-foreground/30 animate-bounce"
            style={{
              animationDelay: `${i * 200}ms`,
              animationDuration: '2s',
              opacity: 1 - i * 0.3,
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;