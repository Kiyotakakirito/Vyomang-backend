import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particleCount = 50;
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }
    particlesRef.current = particles;

    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        gradient.addColorStop(0, `rgba(200, 200, 200, ${particle.opacity})`);
        gradient.addColorStop(1, 'rgba(200, 200, 200, 0)');

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      ctx.strokeStyle = 'rgba(200, 200, 200, 0.05)';
      ctx.lineWidth = 1;
      particlesRef.current.forEach((p1, i) => {
        particlesRef.current.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.globalAlpha = 1 - distance / 150;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#000000] via-[#111111] to-[#222222]" />
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ opacity: 0.8 }}
      />

      {/* Enhanced floating shapes with 3D effect */}
      <motion.div
        className="floating-shape w-64 h-64 -top-20 -left-20"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
          boxShadow: [
            '0 0 20px rgba(200, 200, 200, 0.3)',
            '0 0 40px rgba(200, 200, 200, 0.6)',
            '0 0 20px rgba(200, 200, 200, 0.3)',
          ],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          boxShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      
      <motion.div
        className="floating-shape w-96 h-96 -bottom-32 -right-32"
        animate={{
          rotate: -360,
          scale: [1, 1.2, 1],
          boxShadow: [
            '0 0 30px rgba(200, 200, 200, 0.4)',
            '0 0 60px rgba(200, 200, 200, 0.8)',
            '0 0 30px rgba(200, 200, 200, 0.4)',
          ],
        }}
        transition={{
          rotate: { duration: 25, repeat: Infinity, ease: "linear" },
          scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
          boxShadow: { duration: 5, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      
      <motion.div
        className="floating-shape w-48 h-48 top-1/4 right-1/4"
        animate={{
          y: [-20, 20, -20],
          x: [-10, 10, -10],
          rotate: 180,
          boxShadow: [
            '0 0 15px rgba(200, 200, 200, 0.3)',
            '0 0 30px rgba(200, 200, 200, 0.6)',
            '0 0 15px rgba(200, 200, 200, 0.3)',
          ],
        }}
        transition={{
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          x: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 15, repeat: Infinity, ease: "linear" },
          boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      
      {/* Additional floating elements for more immersive effect */}
      <motion.div
        className="absolute w-32 h-32 top-1/3 left-1/4 rounded-full"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.3, 0.1],
          rotate: [0, 180, 360],
        }}
        transition={{
          scale: { duration: 12, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
        }}
        style={{
          background: 'radial-gradient(circle, rgba(200, 200, 200, 0.3) 0%, rgba(200, 200, 200, 0) 70%)',
        }}
      />
      
      <motion.div
        className="absolute w-24 h-24 bottom-1/4 right-1/3"
        animate={{
          x: [-10, 10, -10],
          y: [-10, 10, -10],
          opacity: [0.1, 0.4, 0.1],
        }}
        transition={{
          x: { duration: 7, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 9, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 10, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{
          background: 'conic-gradient(from 0deg, rgba(200, 200, 200, 0.2), rgba(200, 200, 200, 0.05), rgba(200, 200, 200, 0.2))',
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/60 via-transparent to-[#222222]/40" />
      
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Subtle light rays for atmospheric effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-full"
            style={{
              left: `${20 * (i + 1)}%`,
              background: `linear-gradient(to bottom, transparent, rgba(200, 200, 200, 0.05), transparent)`
            }}
            animate={{
              opacity: [0.1, 0.4, 0.1],
              scaleY: [0.8, 1.2, 0.8],
            }}
            transition={{
              opacity: { duration: 6, repeat: Infinity, delay: i * 0.5 },
              scaleY: { duration: 4, repeat: Infinity, delay: i * 0.7 },
            }}
          />
        ))}
      </div>
    </div>
  );
}
