<script setup lang="ts">
</script>

<template>
  <section class="hero">
    <video
      class="bg"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      poster="/media/hero.jpg"
    >
      <source
        src="/media/hero.mp4"
        type="video/mp4"
      >
    </video>

    <div class="overlay" />

    <div class="content">
      <h1>Стикер-виджет: красиво, умно, быстро</h1>
      <p>Загрузка аватарок, состояния, модалка, валидация, анимации и CI/CD — всё уже здесь.</p>
      <div class="actions">
        <NuxtLink
          class="btn"
          :to="{ path: '/sticker', query: { src: 'cats' } }"
        >
          Котики
        </NuxtLink>
        <NuxtLink
          class="btn ghost"
          :to="{ path: '/sticker', query: { src: 'dogs' } }"
        >
          Пёсики
        </NuxtLink>
      </div>
    </div>
  </section>

  <section class="demo-blurbs">
    <article>
      <h3>Состояния и a11y</h3>
      <p>Скелетоны, ошибка, aria-атрибуты — из коробки.</p>
    </article>
    <article>
      <h3>Модалка + Zod</h3>
      <p>Валидация: e-mail/телефон (минимум один), без прыгающей вёрстки.</p>
    </article>
    <article>
      <h3>CI/CD</h3>
      <p>Автосборка и деплой на GitHub Pages при каждом push в main.</p>
    </article>
  </section>
</template>

<style scoped lang="scss">
.hero {
  position: relative;
  min-height: clamp(60vh, 72vh, 86vh);
  display: grid; place-items: center;
  overflow: hidden;
  border-bottom: 1px solid rgba(16,24,40,.08);
}
.bg {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; filter: saturate(1.05) contrast(1.02);
}
.overlay {
  position: absolute; inset: 0;
  background:
    radial-gradient(1200px 400px at 80% 20%, rgba(0,0,0,.18), transparent 60%),
    linear-gradient(to bottom, rgba(0,0,0,.35), rgba(0,0,0,.15), rgba(0,0,0,.35));
}
.content {
  position: relative; z-index: 1;
  max-width: 900px; padding: 24px; text-align: center; color: #fff;
  text-shadow: 0 2px 18px rgba(0,0,0,.35);
}
.content h1 {
  font-size: clamp(28px, 5vw, 56px);
  line-height: 1.05; margin: 0 0 12px;
}
.content p {
  font-size: clamp(16px, 2.2vw, 22px); opacity: .92; margin: 0 0 18px;
}
.actions { display: inline-grid; grid-auto-flow: column; gap: 10px; }
.btn {
  display: inline-block; padding: 12px 16px; border-radius: 12px; text-decoration: none;
  background: #111827; color: #fff; font-weight: 600; box-shadow: 0 10px 28px rgba(17,24,39,.25);
}
.btn.ghost {
  background: rgba(255,255,255,.14); color: #fff; backdrop-filter: blur(6px);
  box-shadow: 0 10px 28px rgba(17,24,39,.15); border: 1px solid rgba(255,255,255,.25);
}
.btn:hover { filter: brightness(.98); }

.demo-blurbs {
  max-width: 1100px; margin: 28px auto; padding: 0 16px;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
}
.demo-blurbs article {
  background: var(--color-bg-panel); border: 1px solid rgba(16,24,40,.06);
  border-radius: 16px; padding: 16px 18px; box-shadow: 0 6px 20px rgba(16,24,40,.08);
}
.demo-blurbs h3 { margin: 0 0 8px; font-size: 18px; }
.demo-blurbs p { margin: 0; opacity: .9; }

@media (max-width: 840px) {
  .demo-blurbs { grid-template-columns: 1fr; }
}
</style>
