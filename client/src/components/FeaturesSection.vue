<template>
  <section ref="sectionRef" class="features-section">
    <!-- Section header -->
    <div class="features-header">
      <span class="features-eyebrow">Возможности</span>
      <h2 class="features-title">
        <span class="gradient-text">Всё что нужно</span>
        <br />
        <span style="color: var(--neuro-text);">для YouTube-успеха</span>
      </h2>
      <p class="features-subtitle">
        ИИ-инструменты для создания контента, SEO и монетизации — в одном месте
      </p>
    </div>

    <!-- Feature Cards Grid -->
    <div class="features-grid" ref="gridRef">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="feature-card glass-card"
      >
        <div class="feature-icon-wrap" :style="{ '--icon-color': feature.color }">
          <q-icon :name="feature.icon" size="28px" class="feature-icon" />
        </div>
        <h3 class="feature-title">{{ feature.title }}</h3>
        <p class="feature-desc">{{ feature.desc }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const features = [
  {
    icon: 'auto_awesome',
    title: 'AI Идеи для Видео',
    desc: '5 уникальных идей с SEO-ключами, хуком и анализом аудитории — за секунды.',
    color: '#00f5ff',
  },
  {
    icon: 'trending_up',
    title: 'SEO-Оптимизация',
    desc: 'Названия, описания и теги, которые выводят ваши видео в топ поиска YouTube.',
    color: '#8b5cf6',
  },
  {
    icon: 'description',
    title: 'Полные Сценарии',
    desc: 'Детальные планы с главами, thumbnail-концептами и крючками удержания.',
    color: '#ec4899',
  },
  {
    icon: 'analytics',
    title: 'Анализ Ниши',
    desc: 'Конкурентный анализ с Google Search — узнайте, что работает в вашей нише.',
    color: '#00f5ff',
  },
];

const sectionRef = ref<HTMLElement | null>(null);
const gridRef = ref<HTMLElement | null>(null);

let gsapCtx: gsap.Context | null = null;

onMounted(() => {
  console.debug('[FeaturesSection] Mounted, initializing ScrollTrigger');

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    console.debug('[FeaturesSection] Reduced motion, skipping animations');
    return;
  }

  gsapCtx = gsap.context(() => {
    const cards = gridRef.value?.querySelectorAll('.feature-card') ?? [];

    // Section header fade in
    gsap.from('.features-header', {
      scrollTrigger: {
        trigger: sectionRef.value,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      y: 40,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
    });

    // Cards stagger from bottom
    if (cards.length) {
      gsap.from(cards, {
        scrollTrigger: {
          trigger: gridRef.value,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 40,
        opacity: 0,
        scale: 0.95,
        duration: 0.5,
        stagger: 0.15,
        ease: 'power2.out',
      });
    }

    console.debug('[FeaturesSection] ScrollTrigger registered for', cards.length, 'cards');
  }, sectionRef.value ?? undefined);
});

onUnmounted(() => {
  console.debug('[FeaturesSection] Unmounting, cleaning up GSAP');
  if (gsapCtx) gsapCtx.revert();
});
</script>

<style scoped lang="scss">
.features-section {
  padding: 80px 24px 100px;
  background: linear-gradient(
    to bottom,
    var(--neuro-bg),
    var(--neuro-bg-secondary),
    var(--neuro-bg)
  );
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    height: 80px;
    background: linear-gradient(to bottom, transparent, rgba(0, 245, 255, 0.3));
  }
}

// Header
.features-header {
  text-align: center;
  margin-bottom: 60px;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}

.features-eyebrow {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--neuro-accent);
  margin-bottom: 16px;
  padding: 4px 12px;
  background: rgba(0, 245, 255, 0.08);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 20px;
}

.features-title {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 800;
  line-height: 1.2;
  margin: 12px 0 16px;
}

.features-subtitle {
  font-size: 1rem;
  color: var(--neuro-text-muted);
  line-height: 1.6;
  margin: 0;
}

// Grid
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  max-width: 940px;
  margin: 0 auto;
}

// Card
.feature-card {
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: default;
  will-change: transform, opacity;
}

.feature-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 245, 255, 0.06);
  border: 1px solid rgba(0, 245, 255, 0.15);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;

  .feature-card:hover & {
    border-color: rgba(0, 245, 255, 0.35);
    box-shadow: 0 0 14px rgba(0, 245, 255, 0.2);
  }
}

.feature-icon {
  color: var(--icon-color, #00f5ff);
}

.feature-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--neuro-text);
  margin: 0;
}

.feature-desc {
  font-size: 0.875rem;
  color: var(--neuro-text-muted);
  line-height: 1.6;
  margin: 0;
}

// Responsive
@media (max-width: 600px) {
  .features-section {
    padding: 60px 16px 80px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
