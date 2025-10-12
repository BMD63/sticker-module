<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import { usePictures } from '~/composables/usePictures'
import type { PictureSource } from '~/constants/api'
import { STICKER_TITLE, CTA_LABEL, SECTIONS_COUNT, TEXT_PARAGRAPH } from '~/constants/content'
import { AVOID_PADDING_DIVISOR } from '~/constants/ui'

function pickSrc(q: unknown): PictureSource {
  const v = Array.isArray(q) ? q[0] : q
  const s = String(v ?? '').toLowerCase()
  return s === 'dogs' ? 'dogs' : 'cats'
}

const route = useRoute()
const router = useRouter()

const src = ref<PictureSource>(pickSrc(route.query.src))
const selected = ref<PictureSource>(src.value)

const { images, loading, error, load, setSource } = usePictures(src.value, 3)
onMounted(() => { load() })

watch(
  () => route.query.src,
  (q) => {
    const next = pickSrc(q)
    if (next !== src.value) {
      src.value = next
      selected.value = next
      setSource(next)
      load()
      schedule(updateAvoid)
    }
  }
)

async function onSelect(next: PictureSource) {
  if (selected.value === next) return
  selected.value = next
  await router.replace({ query: { ...route.query, src: next } })
}

// ————— вспомогательные утилиты —————
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

function getAvoidPaddingPx() {
  const panelW = cssPx('--sticker-panel-w', 280)
  const right = cssPx('--sticker-right', 24)
  const gap = cssPx('--sticker-gap', 16)
  return Math.round((panelW + right + gap) / AVOID_PADDING_DIVISOR)
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

  paras.forEach((p) => p.style.removeProperty('padding-right'))

  if (!isExpanded) return

  const { top, bottom } = getStickerBand()
  const pad = `${getAvoidPaddingPx()}px`

  paras.forEach((p) => {
    const r = p.getBoundingClientRect()
    const intersects = r.bottom > top && r.top < bottom
    if (intersects) {
      p.style.setProperty('padding-right', pad)
    }
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

const showModal = ref(false)
// имитация хэндлера
function onRetry() { load() }
function onCta() {
  /* eslint-disable-next-line no-console */
  console.log('CTA clicked')
  showModal.value = true
}

function submitDemo(e: Event) {
  e.preventDefault()
  // eslint-disable-next-line no-console
  console.log('submit demo form')
  showModal.value = false
}
</script>

<template>
  <main class="sticker-page">
    <h1 class="title">
      Демонстрация стикера
    </h1>

    <div
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

    <section
      v-for="i in SECTIONS_COUNT"
      :key="i"
      class="section"
    >
      <h2>Раздел {{ i }}</h2>
      <p class="content-paragraph">
        {{ TEXT_PARAGRAPH }}
      </p>
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
  <ModalDialog
    v-model="showModal"
    :title="$t ? $t('sticker.title') : 'Консультация<br>эксперта'"
  >
    <form
      class="lead-form"
      @submit="submitDemo"
    >
      <label>
        Имя
        <input
          type="text"
          name="name"
          required
        >
      </label>
      <label>
        Телефон/Email
        <input
          type="text"
          name="contact"
          required
        >
      </label>
      <label>
        Комментарий
        <textarea
          name="msg"
          rows="4"
        />
      </label>
      <div class="lead-actions">
        <button
          type="submit"
          class="btn primary"
        >
          Отправить
        </button>
        <button
          type="button"
          class="btn"
          @click="showModal = false"
        >
          Отмена
        </button>
      </div>
    </form>
  </ModalDialog>
</template>

<style lang="scss" scoped>
.source-toggle {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 0 0 16px;
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

/* Глобальные токены для расчёта отступов */
:global(:root) {
  --sticker-right: 24px;
  --sticker-rail-w: 68px;
  --sticker-panel-w: 280px;
  --sticker-gap: 16px;
}

.content-paragraph {
  transition: padding-right 180ms ease;
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
  border: 1px solid rgba(16,24,40,.06);
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(16,24,40,.08);
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
  opacity: .9;
  hyphens: auto;
}

.lead-form {
  display: grid; gap: 12px;
}
.lead-form label { display: grid; gap: 6px; font-size: 14px; }
.lead-form input, .lead-form textarea {
  border: 1px solid rgba(16,24,40,.16);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
}
.lead-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
.btn {
  height: 40px; padding: 0 14px; border-radius: 10px; border: 0; cursor: pointer;
  background: #f2f4f7;
}
.btn.primary { background: #111827; color: #fff; }
.btn:hover { filter: brightness(0.98); }
</style>