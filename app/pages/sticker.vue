<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import { useRoute, useRouter } from '#imports'
  import { usePictures } from '~/composables/usePictures'
  import { type PictureSource } from '~/constants/api'
  import { STICKER_TITLE, CTA_LABEL, SECTIONS_COUNT, TEXT_PARAGRAPH } from '~/constants/content'

  const route = useRoute()
  const router = useRouter()

  const initialSrc = (route.query.src === 'dogs' ? 'dogs' : 'cats') as PictureSource

  const { images, loading, error, load, setSource } = usePictures(initialSrc, 3)

  const selected = ref<PictureSource>(initialSrc)

  async function onSelect(next: PictureSource) {
    if (selected.value === next) return
    selected.value = next
    setSource(next)
    await load(3)
    router.replace({ query: { ...route.query, src: next } })
  }

  onMounted(() => {
    if (!images.value.length) load(3)
  })

  function cssPx(varName: string, fallback: number): number {
    const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
    const n = parseFloat(v)
    return Number.isFinite(n) ? n : fallback
  }
  function getStickerBand() {
    const vh = window.innerHeight
    const boxH = cssPx('--sticker-box-h', 266)
    const top = vh / 2 - boxH / 2
    const bottom = top + boxH
    return { top, bottom }
  }
  let rafId: number | null = null
  function schedule(fn: () => void) {
    if (rafId != null) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
      rafId = null
      fn()
    })
  }
  function updateAvoid() {
    const paras = document.querySelectorAll<HTMLElement>('.content-paragraph')
    const isExpanded = document.body.classList.contains('sticker-expanded')
    if (!isExpanded) {
      paras.forEach((p) => p.classList.remove('avoid-sticker'))
      return
    }
    const { top, bottom } = getStickerBand()
    paras.forEach((p) => {
      const r = p.getBoundingClientRect()
      const intersects = r.bottom > top && r.top < bottom
      if (intersects) p.classList.add('avoid-sticker')
      else p.classList.remove('avoid-sticker')
    })
  }
  function bindListeners() {
    const handler = () => schedule(updateAvoid)
    window.addEventListener('scroll', handler, { passive: true })
    window.addEventListener('resize', handler)
    window.addEventListener('sticker-change', handler)
    const mo = new MutationObserver(handler)
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    ;(bindListeners as any)._cleanup = () => {
      window.removeEventListener('scroll', handler)
      window.removeEventListener('resize', handler)
      window.removeEventListener('sticker-change', handler)
      mo.disconnect()
    }
  }
  onMounted(async () => {
    await nextTick()
    bindListeners()
    updateAvoid()
  })
  onBeforeUnmount(() => {
    const c = (bindListeners as any)._cleanup
    if (c) c()
  })

  // кнопки карточки
  function onRetry() {
    load(3)
  }
  const onCta = () => {
    // eslint-disable-next-line no-console
    console.log('CTA clicked')
  }
</script>

<template>
  <main class="sticker-page">
    <h1 class="title">Демонстрация стикера</h1>

    <!-- Переключатель источникa -->
    <div class="source-toggle" role="tablist" aria-label="Источник картинок">
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

    <section v-for="i in SECTIONS_COUNT" :key="i" class="section">
      <h2>Раздел {{ i }}</h2>
      <p class="content-paragraph">{{ TEXT_PARAGRAPH }}</p>
    </section>
  </main>

  <StickerWidget
    :rail-images="images"
    :panel-images="images"
    :loading="loading"
    :error="error"
    :title="STICKER_TITLE"
    :cta-label="CTA_LABEL"
    @cta="onCta"
    @retry="onRetry"
  />
</template>

<style lang="scss" scoped>
  .source-toggle {
    display: inline-flex;
    gap: 4px;
    padding: 4px;
    border-radius: 12px;
    background: rgba(16, 24, 40, 0.05);
    margin: 0 auto 16px;
    position: sticky;
    top: 12px;
    z-index: 1;
  }
  .toggle-btn {
    border: 0;
    background: transparent;
    padding: 8px 12px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 14px;
    color: var(--color-text);
    opacity: 0.7;
  }
  .toggle-btn.active {
    background: #fff;
    box-shadow: 0 2px 8px rgba(16, 24, 40, 0.08);
    opacity: 1;
  }

  .sticker-page {
    padding: 24px;
    padding-right: 110px;
    max-width: 1440px;
    margin: 0 auto;
    overflow-wrap: anywhere;
    word-break: normal;
    hyphens: auto;
  }
  .title {
    text-align: center;
    margin: 0 0 16px;
  }
  .section {
    margin: 24px 0;
    padding: 16px 20px;
    background: var(--color-bg-panel);
    border: 1px solid rgba(16, 24, 40, 0.06);
    border-radius: 16px;
    box-shadow: 0 6px 20px rgba(16, 24, 40, 0.08);
  }
  .section h2 {
    margin: 0 0 10px;
    font-size: 20px;
    line-height: 1.2;
    font-weight: 600;
    color: var(--color-text);
    justify-self: center;
  }
  .section p {
    margin: 0;
    color: var(--color-text);
    opacity: 0.9;
    hyphens: auto;
  }

  :global(:root) {
    --sticker-right: 24px;
    --sticker-rail-w: 68px;
    --sticker-panel-w: 280px;
    --sticker-gap: 16px;
  }
  .content-paragraph {
    transition: padding-right 180ms ease;
  }
  :global(body.sticker-expanded) :deep(.content-paragraph.avoid-sticker) {
    padding-right: calc(var(--sticker-panel-w) + var(--sticker-right) + var(--sticker-gap));
    transition: padding-right 0.2s ease;
  }
</style>
