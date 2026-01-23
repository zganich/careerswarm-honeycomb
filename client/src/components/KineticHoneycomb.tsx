import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  targetX?: number;
  targetY?: number;
  isLocked?: boolean;
}

export function KineticHoneycomb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles (The Dust - left side)
    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = 65; // Increased by 30% for denser chaos
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width * 0.3, // Left 30%
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.3 + 0.1,
          rotation: Math.random() * Math.PI * 2, // Random initial rotation
          rotationSpeed: (Math.random() - 0.5) * 0.02, // Subtle tumbling
          isLocked: false,
        });
      }
    };
    initParticles();

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // If particle is locked in grid, don't move it
        if (particle.isLocked) {
          drawHexagon(ctx, particle.x, particle.y, particle.size * 2, particle.opacity, 0); // No rotation when locked
          return;
        }
        
        // Update rotation (tumbling through space)
        particle.rotation += particle.rotationSpeed;

        // Mouse attraction (The Flow)
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200) {
          // Particles stream toward mouse
          particle.vx += (dx / distance) * 0.05;
          particle.vy += (dy / distance) * 0.05;
        } else {
          // Gentle drift (The Dust)
          particle.vx += (Math.random() - 0.5) * 0.02;
          particle.vy += (Math.random() - 0.5) * 0.02;
        }

        // Damping
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Check if particle reached right side (lock into grid)
        if (particle.x > canvas.width * 0.7) {
          particle.isLocked = true;
          particle.x = Math.round(particle.x / 30) * 30; // Snap to grid
          particle.y = Math.round(particle.y / 30) * 30;
          particle.opacity = 0.4;
          particle.rotationSpeed = 0; // Stop tumbling when locked
        }

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Draw particle with rotation
        if (particle.isLocked) {
          drawHexagon(ctx, particle.x, particle.y, particle.size * 2, particle.opacity, 0);
        } else {
          drawHexagon(ctx, particle.x, particle.y, particle.size, particle.opacity, particle.rotation);
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Draw hexagon outline with rotation
  const drawHexagon = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    opacity: number,
    rotation: number = 0
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const hx = size * Math.cos(angle);
      const hy = size * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(hx, hy);
      } else {
        ctx.lineTo(hx, hy);
      }
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(249, 115, 22, ${opacity})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
