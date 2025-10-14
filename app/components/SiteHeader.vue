<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from '#imports'

type PictureSource = 'cats' | 'dogs'

const route = useRoute()
const router = useRouter()

const isStickerPage = computed(() => route.path.startsWith('/sticker'))
const isHome = computed(() => route.path === '/')

function pickSrc(q: unknown): PictureSource {
  const v = Array.isArray(q) ? q[0] : q
  const s = String(v ?? '').toLowerCase()
  return s === 'dogs' ? 'dogs' : 'cats'
}
const selected = computed<PictureSource>(() => pickSrc(route.query.src))

async function onSelect(next: PictureSource) {
  if (selected.value === next) return
  await router.replace({ query: { ...route.query, src: next } })
}
</script>

<template>
  <!-- Полоса хедера на всю ширину -->
  <header class="site-header">
    <!-- Внутренний контейнер: центрируем и разводим контент по краям -->
    <div class="header-inner">
      <!-- Слева -->
      <NuxtLink
        to="/"
        class="brand"
        aria-label="Home"
      >
        <span class="dot" />
        <span class="brand-text">Sticker&nbsp;App</span>
      </NuxtLink>

      <!-- Справа -->
      <div class="right">
        <!-- Только на /sticker — переключатель источника -->
        <div
          v-if="isStickerPage"
          class="source-toggle"
          role="tablist"
          aria-label="Источник картинок"
        >
          <button
            role="tab"
            :aria-selected="selected === 'cats'"
            class="toggle-btn"
            :class="{ active: selected === 'cats' }"
            @click="onSelect('cats')"
          >
            Котики
          </button>
          <button
            role="tab"
            :aria-selected="selected === 'dogs'"
            class="toggle-btn"
            :class="{ active: selected === 'dogs' }"
            @click="onSelect('dogs')"
          >
            Пёсики
          </button>
        </div>

        <!-- Только на главной — кнопка открытия стикера -->
        <NuxtLink
          v-else-if="isHome"
          to="/sticker"
          class="primary-btn"
        >
          Открыть стикер
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
/* полоса на всю ширину */
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background: color-mix(in srgb, var(--color-bg-panel) 82%, transparent);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid rgba(16, 24, 40, 0.06);
  /* без скруглений, чтобы тянуться до краёв */
}

/* контейнер внутри полосы */
.header-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 10px 20px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

/* левая часть */
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--color-text);
  font-weight: 700;
  font-size: 16px;
}
.brand .dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #111827;
}
.brand-text { line-height: 1; }

/* правая часть */
.right {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

/* переключатель (на /sticker) */
.source-toggle {
  display: inline-flex;
  gap: 8px;
  padding: 4px;
  border-radius: 12px;
  background: rgba(16, 24, 40, 0.05);
}
.toggle-btn {
  border: 0;
  background: transparent;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text);
  opacity: .7;
}
.toggle-btn.active {
  background: #fff;
  box-shadow: 0 2px 8px rgba(16,24,40,.08);
  opacity: 1;
}

/* кнопка (на /) */
.primary-btn {
  display: inline-block;
  height: 40px;
  line-height: 40px;
  padding: 0 16px;
  border-radius: 12px;
  background: #111827;
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  box-shadow: 0 6px 20px rgba(16,24,40,.08);
  transition: filter .15s ease, transform .08s ease;
}
.primary-btn:hover { filter: brightness(.95); }
.primary-btn:active { transform: translateY(1px); }
</style>
