import { useEffect, useRef } from 'react';

const StarField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let mouseX = 0;
    let mouseY = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 1500 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.3 + 0.05,
      opacity: Math.random() * 0.7 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    const handleMouse = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouse);

    let time = 0;
    const animate = () => {
      if (document.hidden) {
        animId = requestAnimationFrame(animate);
        return;
      }
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        const parallaxX = mouseX * star.speed * 20;
        const parallaxY = mouseY * star.speed * 20;
        const drawX = ((star.x + parallaxX) % canvas.width + canvas.width) % canvas.width;
        const drawY = ((star.y + parallaxY) % canvas.height + canvas.height) % canvas.height;
        const twinkle = Math.sin(time * star.twinkleSpeed * 60 + star.twinklePhase) * 0.3 + 0.7;
        
        ctx.beginPath();
        ctx.arc(drawX, drawY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${star.opacity * twinkle})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(animate);
    };
    animate();

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
