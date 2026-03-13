import { useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface ShootingStar {
  x: number;
  y: number;
  angle: number;
  speed: number;
  length: number;
  life: number;
  maxLife: number;
}

interface Sparkle {
  x: number;
  y: number;
  opacity: number;
  size: number;
}

const StarField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  
  // Theme-adaptive colors and density
  const starColor = theme === 'light' ? 'rgba(50,80,160,' : 'rgba(255,255,255,';
  const sparkleColor = theme === 'light' ? 'rgba(100,140,220,' : 'rgba(200, 240, 255,';
  const count = theme === 'light' ? 60 : 120;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let mouseX = 0;
    let mouseY = 0;

    // === NEBULA (drawn to offscreen canvas once) ===
    const nebulaCanvas = document.createElement('canvas');
    const nebulaCtx = nebulaCanvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawNebula();
    };
    resize();
    window.addEventListener('resize', resize);

    function drawNebula() {
      nebulaCanvas.width = canvas.width;
      nebulaCanvas.height = canvas.height;
      const nebulae = [
        { x: canvas.width * 0.15, y: canvas.height * 0.2, r: 300, color: '0,210,255', opacity: 0.03 },
        { x: canvas.width * 0.85, y: canvas.height * 0.8, r: 350, color: '123,47,255', opacity: 0.02 },
        { x: canvas.width * 0.5, y: canvas.height * 0.5, r: 250, color: '0,255,136', opacity: 0.015 },
        { x: canvas.width * 0.8, y: canvas.height * 0.15, r: 200, color: '0,210,255', opacity: 0.025 },
        { x: canvas.width * 0.2, y: canvas.height * 0.85, r: 280, color: '123,47,255', opacity: 0.02 },
      ];
      nebulae.forEach(n => {
        const grd = nebulaCtx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        grd.addColorStop(0, `rgba(${n.color}, ${n.opacity})`);
        grd.addColorStop(0.5, `rgba(${n.color}, ${n.opacity * 0.4})`);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        nebulaCtx.fillStyle = grd;
        nebulaCtx.beginPath();
        nebulaCtx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        nebulaCtx.fill();
      });
    }

    // === STARS with depth layers ===
    const stars = Array.from({ length: count }, () => {
      const speed = Math.random() * 0.3 + 0.05;
      // Depth layer: 1=far, 2=mid, 3=near
      const layer = speed < 0.12 ? 1 : speed < 0.22 ? 2 : 3;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: layer === 1 ? Math.random() * 0.3 + 0.5 : layer === 2 ? Math.random() * 0.4 + 0.8 : Math.random() * 0.8 + 1.2,
        speed,
        opacity: layer === 1 ? Math.random() * 0.2 + 0.2 : layer === 2 ? Math.random() * 0.3 + 0.4 : Math.random() * 0.3 + 0.7,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        layer,
      };
    });

    // === SHOOTING STARS ===
    const shootingStars: ShootingStar[] = [];
    const sparkles: Sparkle[] = [];
    let nextShootingStarTime = performance.now() + Math.random() * 3000 + 3000;

    const spawnShootingStar = () => {
      if (shootingStars.length >= 3) return;
      const angle = Math.random() * 0.5 + 0.3; // ~20-45 deg
      shootingStars.push({
        x: Math.random() * canvas.width * 0.8,
        y: Math.random() * canvas.height * 0.4,
        angle,
        speed: Math.random() * 6 + 12,
        length: Math.random() * 70 + 80,
        life: 0,
        maxLife: 1,
      });
    };

    const handleMouse = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouse);

    let time = 0;
    const animate = (now: number) => {
      if (document.hidden) {
        animId = requestAnimationFrame(animate);
        return;
      }
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw nebula layer first
      ctx.drawImage(nebulaCanvas, 0, 0);

      // Draw stars with depth layers
      stars.forEach((star) => {
        const parallaxX = mouseX * star.speed * 20;
        const parallaxY = mouseY * star.speed * 20;
        const drawX = ((star.x + parallaxX) % canvas.width + canvas.width) % canvas.width;
        const drawY = ((star.y + parallaxY) % canvas.height + canvas.height) % canvas.height;
        const twinkle = Math.sin(time * star.twinkleSpeed * 60 + star.twinklePhase) * 0.3 + 0.7;
        const alpha = star.opacity * twinkle;

        if (star.layer === 3) {
          // Cross-sparkle for near stars
          ctx.save();
          ctx.translate(drawX, drawY);
          ctx.strokeStyle = `${sparkleColor}${alpha * 0.6})`;
          ctx.lineWidth = 0.5;
          const armLen = star.size * 2;
          ctx.beginPath();
          ctx.moveTo(-armLen, 0); ctx.lineTo(armLen, 0);
          ctx.moveTo(0, -armLen); ctx.lineTo(0, armLen);
          ctx.stroke();
          ctx.restore();
        }

        ctx.beginPath();
        ctx.arc(drawX, drawY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `${starColor}${alpha})`;
        ctx.fill();
      });

      // Shooting stars
      if (now >= nextShootingStarTime) {
        spawnShootingStar();
        nextShootingStarTime = now + Math.random() * 3000 + 3000;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.life += 0.02;

        const fadeOut = s.life > 0.8 ? 1 - (s.life - 0.8) / 0.2 : 1;
        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const grd = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grd.addColorStop(0, `${sparkleColor}${0.9 * fadeOut})`);
        grd.addColorStop(1, `${sparkleColor}0)`);

        ctx.strokeStyle = grd;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Sparkle trail
        if (Math.random() > 0.6) {
          sparkles.push({ x: s.x - Math.cos(s.angle) * 10, y: s.y - Math.sin(s.angle) * 10, opacity: 0.8, size: Math.random() * 1.5 + 0.5 });
        }

        if (s.life >= s.maxLife || s.x > canvas.width + 100 || s.y > canvas.height + 100) {
          shootingStars.splice(i, 1);
        }
      }

      // Sparkles fade
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const sp = sparkles[i];
        sp.opacity -= 0.03;
        if (sp.opacity <= 0) { sparkles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = `${sparkleColor}${sp.opacity})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

export default StarField;