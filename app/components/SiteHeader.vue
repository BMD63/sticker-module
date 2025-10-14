<script setup lang="ts">
import { ref, watch, } from 'vue'
import { useRoute, useRouter } from '#imports'

type Source = 'cats' | 'dogs'

function pickSrc(q: unknown): Source {
  const v = Array.isArray(q) ? q[0] : q
  const s = String(v ?? '').toLowerCase()
  return s === 'dogs' ? 'dogs' : 'cats'
}

const route = useRoute()
const router = useRouter()
const selected = ref<Source>(pickSrc(route.query.src))

watch(
  () => route.query.src,
  q => { selected.value = pickSrc(q) }
)

async function onSelect(src: Source) {
  if (selected.value === src) return
  selected.value = src
  await router.replace({ query: { ...route.query, src } })
}
</script>

<template>
  <header class="site-header">
    <nav class="nav">
      <NuxtLink
        to="/"
        class="brand"
      >
        Sticker App
      </NuxtLink>

      <div class="spacer" />

      <div
        class="toggle"
        role="tablist"
        aria-label="Источник картинок"
      >
        <button
          role="tab"
          :aria-selected="selected === 'cats'"
          class="tbtn"
          :class="{ active: selected === 'cats' }"
          @click="onSelect('cats')"
        >
          Котики
        </button>
        <button
          role="tab"
          :aria-selected="selected === 'dogs'"
          class="tbtn"
          :class="{ active: selected === 'dogs' }"
          @click="onSelect('dogs')"
        >
          Пёсики
        </button>
      </div>

      <NuxtLink
        :to="{ path: '/sticker', query: { src: selected } }"
        class="cta-link"
      >
        Открыть стикер
      </NuxtLink>
    </nav>
  </header>
</template>

<style scoped lang="scss">
.site-header {
  position: sticky; top: 0; z-index: 100;
  background: rgba(255,255,255,.7);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(16,24,40,.06);
}
.nav {
  display: grid; grid-template-columns: max-content 1fr max-content max-content;
  align-items: center; gap: 12px;
  max-width: 1200px; margin: 0 auto; padding: 10px 16px;
}
.brand {
  font-weight: 700; letter-spacing: .2px; color: var(--color-text);
  text-decoration: none;
}
.spacer { width: 100%; }
.toggle {
  display: inline-flex; gap: 4px; padding: 4px; border-radius: 12px;
  background: rgba(16,24,40,.05);
}
.tbtn {
  border: 0; background: transparent; padding: 8px 12px; border-radius: 10px;
  cursor: pointer; font-size: 14px; color: var(--color-text); opacity: .7;
}
.tbtn.active { background: #fff; box-shadow: 0 2px 8px rgba(16,24,40,.08); opacity: 1; }
.cta-link {
  text-decoration: none; font-weight: 600; font-size: 14px;
  padding: 10px 14px; border-radius: 10px; color: #fff; background: #111827;
  box-shadow: 0 4px 14px rgba(17,24,39,.15);
}
@media (max-width: 720px) {
  .nav { grid-template-columns: 1fr max-content; gap: 8px; }
  .spacer, .cta-link { display: none; }
  .brand { font-size: 16px; }
}
</style>

