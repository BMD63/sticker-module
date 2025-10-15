<script setup lang="ts">
import { useRouter } from '#imports'
const router = useRouter()
function goSticker(src: 'cats' | 'dogs') {
  router.push({ path: '/sticker', query: { src } })
}
</script>

<template>
  <section class="hero">
    <video
      class="hero-media"
      autoplay
      muted
      playsinline
      loop
      preload="metadata"
      poster="/media/hero.jpg"
    >
      <source
        src="/media/hero.mp4"
        type="video/mp4"
      >
    </video>

    <div class="hero-inner">
      <h1>Стикер-виджет: красиво, умно, быстро</h1>
      <p class="lead">
        Загрузка аватарок, состояния, модалка, валидация, анимации и CI/CD — всё уже здесь.
      </p>
      <br>
      <p class="lead">
        Бонус: котики и пёсики из открытых API.
      </p>

      <div class="cta-row">
        <button
          class="pill"
          @click="goSticker('cats')"
        >
          Котики
        </button>
        <button
          class="pill"
          @click="goSticker('dogs')"
        >
          Пёсики
        </button>
      </div>
    </div>
  </section>

  <section class="features">
    <article class="card">
      <h3>Состояния и a11y</h3>
      <p>Скелетоны, ошибка, aria-атрибуты — из коробки.</p>
    </article>

    <article class="card">
      <h3>Модалка + Zod</h3>
      <p>Валидация: e-mail/телефон (минимум один), без прыгающей вёрстки.</p>
    </article>

    <article class="card">
      <h3>CI/CD</h3>
      <p>Автосборка и деплой на GitHub Pages при каждом push в <code>main</code>.</p>
    </article>

    <article class="card">
      <h3>Котики/Пёсики API</h3>
      <p>
        Универсальный <code>usePictures</code>: источник выбирается через query/переключатель.
        Dog CEO и Cataas в одном интерфейсе.
      </p>
    </article>

    <article class="card">
      <h3>Умная вёрстка страницы</h3>
      <p>
        Параграфы рядом со стикером автоматически сужаются <em>только</em> в зоне
        пересечения — ни пикселя лишнего.
      </p>
    </article>

    <article class="card">
      <h3>Responsive images + Prefetch</h3>
      <p>
        Готовность к <code>srcset</code>/<code>sizes</code> и предзагрузке при наведении —
        быстрые переходы и меньше трафика.
      </p>
    </article>
  </section>
</template>

<style scoped lang="scss">
.hero {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(16,24,40,.35);
  isolation: isolate;
  min-height: clamp(460px, 72vh, 820px);
}
.hero-media {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  filter: saturate(1.1) contrast(1.05) brightness(.9);
}
.hero-inner {
  position: relative; z-index: 1;
  min-height: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(36px, 7vw, 80px) clamp(20px, 4vw, 48px);
  text-align: center; color: #fff;
  text-shadow: 0 4px 18px rgba(0,0,0,.35);
  background: linear-gradient(to bottom, rgba(0,0,0,.18), rgba(0,0,0,.5));
}
.hero-inner h1 {
  margin: 0 0 12px;
  font-weight: 800;
  font-size: clamp(28px, 5vw, 64px);
  line-height: 1.08;
}
.lead {
  margin: 0 auto; max-width: 880px;
  font-size: clamp(16px, 2.2vw, 20px);
  opacity: .95;
}
.cta-row { margin-top: 20px; display: inline-flex; gap: 10px; }
.pill {
  height: 44px; padding: 0 16px; border: 0; border-radius: 999px;
  background: rgba(255,255,255,.16); color: #fff; backdrop-filter: blur(4px);
  box-shadow: 0 10px 30px rgba(0,0,0,.25);
  cursor: pointer; transition: transform .08s, background .15s, box-shadow .15s;
}
.pill:hover { background: rgba(255,255,255,.22); box-shadow: 0 14px 36px rgba(0,0,0,.3); }
.pill:active { transform: translateY(1px); }

/* FEATURES — двухрядная сетка при ширине ≥1024px */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.card {
  position: relative;
  padding: 18px 16px;
  border-radius: 16px;
  background:
    radial-gradient(120% 120% at 0% 0%, rgba(255,255,255,.75), rgba(255,255,255,.55)) 
    var(--color-bg-panel);
  border: 1px solid rgba(16,24,40,.12);
  box-shadow:
    0 10px 26px rgba(16,24,40,.12),
    inset 0 0 0 1px rgba(255,255,255,.35);
  color: var(--color-text);
  transition: transform .08s ease, box-shadow .18s ease, border-color .18s ease;
}
.card:hover {
  transform: translateY(-3px);
  border-color: rgba(16,24,40,.18);
  box-shadow:
    0 18px 36px rgba(16,24,40,.18),
    inset 0 0 0 1px rgba(255,255,255,.5);
}
.card h3 { margin: 0 0 6px; font-size: 16px; line-height: 1.2; }
.card p { margin: 0; opacity: .9; font-size: 14px; }
.card code {
  background: rgba(16,24,40,.08);
  padding: 0 6px; border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: .92em;
}

@media (min-width: 1024px) {
  .features { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 420px) { .hero { min-height: 60vh; } }
</style>
