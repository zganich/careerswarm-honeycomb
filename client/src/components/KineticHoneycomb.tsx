import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number; // Original size before variance
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  color: string; // Color for gradient (gray → orange)
  targetX?: number;
  targetY?: number;
  isLocked?: boolean;
  // Spring physics for overshoot
  springVelocity?: number;
  springOffset?: number;
}

interface KineticHoneycombProps {
  onGridCompletion?: (percentage: number) => void;
}

export function KineticHoneycomb({ onGridCompletion }: KineticHoneycombProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);
  const lastCompletionRef = useRef<number>(0);

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
        const baseSize = Math.random() * 3 + 1;
        const sizeVariance = 1 + (Math.random() - 0.5) * 0.4; // 20% variance
        particlesRef.current.push({
          x: Math.random() * canvas.width * 0.3, // Left 30%
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          baseSize: baseSize,
          size: baseSize * sizeVariance, // Organic size variance
          opacity: Math.random() * 0.3 + 0.1,
          rotation: Math.random() * Math.PI * 2, // Random initial rotation
          rotationSpeed: (Math.random() - 0.5) * 0.02, // Subtle tumbling
          color: '#9CA3AF', // Start as muted gray
          isLocked: false,
          springVelocity: 0,
          springOffset: 0,
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
        // Spring physics for locked particles (overshoot effect)
        if (particle.isLocked) {
          if (particle.springOffset !== undefined && particle.springVelocity !== undefined) {
            // Apply spring force
            const springForce = -particle.springOffset * 0.3; // Spring constant
            particle.springVelocity = (particle.springVelocity + springForce) * 0.85; // Damping
            particle.springOffset += particle.springVelocity;
            
            // Stop spring when settled
            if (Math.abs(particle.springOffset) < 0.1 && Math.abs(particle.springVelocity) < 0.1) {
              particle.springOffset = 0;
              particle.springVelocity = 0;
            }
          }
          
          const springX = particle.x + (particle.springOffset || 0);
          const springY = particle.y + (particle.springOffset || 0) * 0.5;
          drawHexagon(ctx, springX, springY, particle.baseSize * 2, particle.opacity, 0, particle.color);
          return;
        }
        
        // Update rotation (tumbling through space)
        particle.rotation += particle.rotationSpeed;
        
        // Color gradient: gray → orange based on position
        const progressToRight = particle.x / (canvas.width * 0.7);
        const grayR = 156, grayG = 163, grayB = 175; // #9CA3AF
        const orangeR = 249, orangeG = 115, orangeB = 22; // #F97316
        const r = Math.round(grayR + (orangeR - grayR) * progressToRight);
        const g = Math.round(grayG + (orangeG - grayG) * progressToRight);
        const b = Math.round(grayB + (orangeB - grayB) * progressToRight);
        particle.color = `rgb(${r}, ${g}, ${b})`;

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
          const targetX = Math.round(particle.x / 30) * 30;
          const targetY = Math.round(particle.y / 30) * 30;
          
          // Initialize spring physics for overshoot
          const velocity = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
          particle.springVelocity = velocity * 2; // Initial overshoot velocity
          particle.springOffset = 0;
          
          particle.x = targetX;
          particle.y = targetY;
          particle.size = particle.baseSize; // Normalize size when locked
          particle.opacity = 0.4;
          particle.color = '#F97316'; // Full brand orange when locked
          particle.rotationSpeed = 0; // Stop tumbling when locked
        }

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Draw particle with rotation and color
        drawHexagon(ctx, particle.x, particle.y, particle.size, particle.opacity, particle.rotation, particle.color);
      });
      
      // Track grid completion percentage
      const lockedCount = particlesRef.current.filter(p => p.isLocked).length;
      const totalCount = particlesRef.current.length;
      const completionPercentage = Math.round((lockedCount / totalCount) * 100);
      
      // Trigger callback when completion percentage changes
      if (onGridCompletion && completionPercentage !== lastCompletionRef.current) {
        lastCompletionRef.current = completionPercentage;
        onGridCompletion(completionPercentage);
      }

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

  // Draw hexagon outline with rotation and color
  const drawHexagon = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    opacity: number,
    rotation: number = 0,
    color: string = '#F97316'
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
    
    // Parse color and apply opacity
    if (color.startsWith('#')) {
      // Hex color
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    } else {
      // RGB color
      ctx.strokeStyle = color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
    }
    
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
