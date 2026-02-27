<template>
  <canvas
    ref="canvasRef"
    class="neural-bg"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import gsap from 'gsap';

// --- Types ---
interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  opacity: number;
  color: string;
  gsapCtx: gsap.Context | null;
}

// --- Refs ---
const canvasRef = ref<HTMLCanvasElement | null>(null);

// --- State ---
let ctx: CanvasRenderingContext2D | null = null;
let animFrameId: number | null = null;
let particles: Particle[] = [];
let resizeObserver: ResizeObserver | null = null;

const PARTICLE_COUNT = 80;
const MAX_CONNECTION_DISTANCE = 130;
const COLORS = ['#00f5ff', '#8b5cf6', '#ec4899', '#00f5ff', '#00f5ff']; // cyan weighted

// --- Particle Factory ---
function createParticle(canvasWidth: number, canvasHeight: number): Particle {
  return {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    baseX: 0,
    baseY: 0,
    radius: Math.random() * 2 + 1,
    opacity: Math.random() * 0.6 + 0.2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    gsapCtx: null,
  };
}

// --- Init Particles ---
function initParticles(width: number, height: number): void {
  particles.forEach((p) => {
    if (p.gsapCtx) p.gsapCtx.revert();
  });

  particles = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = createParticle(width, height);
    p.baseX = p.x;
    p.baseY = p.y;
    particles.push(p);
  }

  console.debug(`[NeuralBackground] Created ${particles.length} particles`);
  animateParticles(width, height);
}

// --- GSAP Particle Animation ---
function animateParticles(width: number, height: number): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    console.debug('[NeuralBackground] Reduced motion: skipping GSAP animations');
    return;
  }

  particles.forEach((p, i) => {
    const amplitude = 40 + Math.random() * 60;
    const duration = 3 + Math.random() * 5;
    const delay = (i / PARTICLE_COUNT) * -duration;

    p.gsapCtx = gsap.context(() => {
      gsap.to(p, {
        x: p.baseX + (Math.random() - 0.5) * amplitude,
        y: p.baseY + (Math.random() - 0.5) * amplitude,
        duration,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay,
        onRepeat() {
          // Drift base position slightly over time, keeping in bounds
          const newTargetX = p.x + (Math.random() - 0.5) * amplitude;
          const newTargetY = p.y + (Math.random() - 0.5) * amplitude;
          gsap.set(this, {
            x: Math.max(10, Math.min(width - 10, newTargetX)),
            y: Math.max(10, Math.min(height - 10, newTargetY)),
          });
        },
      });

      // Opacity pulse
      gsap.to(p, {
        opacity: Math.random() * 0.4 + 0.1,
        duration: 1.5 + Math.random() * 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: Math.random() * 2,
      });
    });
  });
}

// --- Draw Frame ---
function drawFrame(width: number, height: number): void {
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);

  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i]!;
      const b = particles[j]!;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MAX_CONNECTION_DISTANCE) {
        const alpha = (1 - dist / MAX_CONNECTION_DISTANCE) * 0.35;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(0, 245, 255, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  // Draw particles
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

    // Parse color to rgba
    const hex = p.color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
    ctx.fill();

    // Glow effect for larger particles
    if (p.radius > 2) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}

// --- Render Loop ---
function startRenderLoop(): void {
  if (!canvasRef.value) return;
  const { width, height } = canvasRef.value;

  function loop() {
    drawFrame(width, height);
    animFrameId = requestAnimationFrame(loop);
  }

  animFrameId = requestAnimationFrame(loop);
  console.debug('[NeuralBackground] Render loop started');
}

// --- Canvas Resize ---
function resizeCanvas(): void {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const parent = canvas.parentElement || document.body;
  canvas.width = parent.clientWidth || window.innerWidth;
  canvas.height = parent.clientHeight || window.innerHeight;

  ctx = canvas.getContext('2d');
  console.debug(`[NeuralBackground] Canvas resized to ${canvas.width}x${canvas.height}`);
  initParticles(canvas.width, canvas.height);
}

// --- Lifecycle ---
onMounted(() => {
  if (!canvasRef.value) return;
  console.debug('[NeuralBackground] Mounting');

  resizeCanvas();
  startRenderLoop();

  resizeObserver = new ResizeObserver(() => {
    console.debug('[NeuralBackground] Parent resized, reinitializing');
    resizeCanvas();
  });

  const parent = canvasRef.value.parentElement;
  if (parent) resizeObserver.observe(parent);
});

onUnmounted(() => {
  console.debug('[NeuralBackground] Unmounting, cleaning up');

  if (animFrameId !== null) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }

  particles.forEach((p) => {
    if (p.gsapCtx) p.gsapCtx.revert();
  });
  particles = [];

  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});
</script>

<style scoped>
.neural-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
