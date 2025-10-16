<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRoute } from '#imports'
import { z } from 'zod'
import { useProducts } from '~/composables/useProducts'
import { usePictures } from '~/composables/usePictures'
import type { PictureSource } from '~/constants/api'
import { STICKER_TITLE, CTA_LABEL } from '~/constants/content'
import { AVOID_PADDING_DIVISOR } from '~/constants/ui'

/* ——— источник картинок из query ——— */
function pickSrc(q: unknown): PictureSource {
  const v = Array.isArray(q) ? q[0] : q
  const s = String(v ?? '').toLowerCase()
  return s === 'dogs' ? 'dogs' : 'cats'
}

const route = useRoute()
const { products, loading: prodLoading, error: prodError, load: loadProducts } = useProducts()

const src = ref<PictureSource>(pickSrc(route.query.src))

const { images, loading, error, load, setSource } = usePictures(src.value, 3)
onMounted(() => {
   load() 
   loadProducts()
  })

watch(
  () => route.query.src,
  (q) => {
    const next = pickSrc(q)
    if (next !== src.value) {
      src.value = next
      setSource(next)
      load()
      schedule(updateAvoid)
    }
  }
)

/* ——— утилиты для расчёта зоны стикера ——— */
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
  rafId = requestAnimationFrame(() => { rafId = null; fn() })
}

function updateAvoid() {
  const paras = document.querySelectorAll<HTMLElement>('.content-paragraph')
  const isExpanded = document.body.classList.contains('sticker-expanded')

  paras.forEach(p => p.style.removeProperty('padding-right'))
  if (!isExpanded) return

  const { top, bottom } = getStickerBand()
  const pad = `${getAvoidPaddingPx()}px`

  paras.forEach(p => {
    const r = p.getBoundingClientRect()
    const intersects = r.bottom > top && r.top < bottom
    if (intersects) p.style.setProperty('padding-right', pad)
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

/* ——— модалка + валидация Zod ——— */
const showModal = ref(false)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  question: '',
  consent: false,
})

const errors = reactive<Record<string, string>>({})

const phoneRegex = /^\+?\d[\d\s()-]{6,}$/

/* e-mail и phone «опциональны», но хотя бы одно из них обязательно */
const LeadSchema = z.object({
  name: z.string().trim().min(1, 'Укажите имя'),
  email: z.string().trim().email('Некорректный e-mail').optional().or(z.literal('')),
  phone: z.string().trim().regex(phoneRegex, 'Некорректный телефон').optional().or(z.literal('')),
  question: z.string().trim().min(5, 'Опишите ваш вопрос подробнее'),
  consent: z.boolean().refine(v => v === true, {
    message: 'Нужно согласие на обработку персональных данных',
  }),
}).refine(v => (v.email && v.email.length) || (v.phone && v.phone.length), {
  message: 'Укажите хотя бы один контакт',
  path: ['email'],
})

function resetErrors() {
  Object.keys(errors).forEach(k => delete errors[k])
}
function resetForm() {
  form.name = ''
  form.email = ''
  form.phone = ''
  form.question = ''
  form.consent = false
  resetErrors()
}

/* при закрытии модалки — очищаем форму и ошибки */
watch(showModal, (open) => {
  if (!open) resetForm()
})

function onSubmitLead(e: Event) {
  e.preventDefault()
  resetErrors()

  const res = LeadSchema.safeParse(form)
  if (!res.success) {
    for (const issue of res.error.issues) {
      const key = (issue.path[0] as string) || 'form'
      if (!errors[key]) errors[key] = issue.message
    }
    return
  }

   
  console.warn('Lead payload:', { ...form })
  showModal.value = false  
}

/* кнопки стикера */
function onRetry() { load() }
function onCta() { showModal.value = true }
</script>

<template>
  <main class="sticker-page">
    <h1 class="title">
      Демонстрация стикера
    </h1>

    <section
      v-if="prodError"
      class="section"
    >
      <h2>Ошибка загрузки</h2>
      <p class="content-paragraph">
        {{ prodError }}
      </p>
    </section>

    <section
      v-for="i in 3"
      v-else-if="prodLoading && !products.length"
      :key="'skel-'+i"
      class="section section--skeleton"
    >
      <div class="thumb skeleton" />
      <div class="body">
        <h2 class="skeleton-line" />
        <p class="content-paragraph skeleton-line" />
        <p class="content-paragraph skeleton-line short" />
      </div>
    </section>

    <section
      v-for="p in products"
      v-else
      :key="p.id"
      class="section section--product"
    >
      <img
        class="thumb"
        :src="p.image"
        :alt="p.title"
        width="120"
        height="120"
        loading="lazy"
        decoding="async"
      >
      <div class="body">
        <h2>{{ p.title }}</h2>
        <p class="content-paragraph">
          {{ p.description }}
        </p>
      </div>
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

  <!-- Модалка с формой -->
  <ModalDialog
    v-model="showModal"
    :title="'Консультация<br>эксперта'"
  >
    <form
      class="lead-form"
      novalidate
      @submit="onSubmitLead"
    >
      <div class="lead-row">
        <label class="field">
          <span>Имя</span>
          <input
            v-model="form.name"
            type="text"
            name="name"
            autocomplete="name"
            :aria-invalid="!!errors.name"
            :aria-errormessage="'err-name'"
          >
          <small
            v-if="errors.name"
            id="err-name"
            class="error"
          >{{ errors.name }}</small>
          <small
            v-else
            class="error"
            aria-hidden="true"
          />
        </label>
      </div>

      <div class="lead-row two">
        <label class="field">
          <span>E-mail</span>
          <input
            v-model="form.email"
            type="email"
            name="email"
            inputmode="email"
            autocomplete="email"
            placeholder="you@example.com"
            :aria-invalid="!!errors.email"
            :aria-errormessage="'err-email'"
          >
          <small
            v-if="errors.email"
            id="err-email"
            class="error"
          >{{ errors.email }}</small>
          <small
            v-else
            class="error"
            aria-hidden="true"
          />
        </label>

        <label class="field">
          <span>Телефон</span>
          <input
            v-model="form.phone"
            type="tel"
            name="phone"
            inputmode="tel"
            autocomplete="tel"
            placeholder="+7 999 000-00-00"
            :aria-invalid="!!errors.phone"
            :aria-errormessage="'err-phone'"
          >
          <small
            v-if="errors.phone"
            id="err-phone"
            class="error"
          >{{ errors.phone }}</small>
          <small
            v-else
            class="error"
            aria-hidden="true"
          />
        </label>
      </div>

      <label class="field">
        <span>Ваш вопрос</span>
        <textarea
          v-model="form.question"
          name="question"
          rows="4"
          placeholder="Коротко опишите, что хотите обсудить"
          :aria-invalid="!!errors.question"
          :aria-errormessage="'err-question'"
        />
        <small
          v-if="errors.question"
          id="err-question"
          class="error"
        >{{ errors.question }}</small>
        <small
          v-else
          class="error"
          aria-hidden="true"
        />
      </label>
      <label class="chk">
        <input
          v-model="form.consent"
          type="checkbox"
          name="consent"
          :aria-invalid="!!errors.consent"
          :aria-errormessage="'err-consent'"
        >
        <span class="chk-text">
          Я соглашаюсь с <NuxtLink
            to="/privacy"
            target="_blank"
            rel="noopener"
          >политикой обработки персональных данных</NuxtLink>
        </span>
      </label>
      <small
        v-if="errors.consent"
        id="err-consent"
        class="error"
      >{{ errors.consent }}</small>
      <small
        v-else
        class="error"
        aria-hidden="true"
      />

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
:global(:root) {
  --sticker-right: 24px;
  --sticker-rail-w: 68px;
  --sticker-panel-w: 280px;
  --sticker-gap: 16px;

  --primary-600: #676b75; /* кнопка */

  --card-bg: color-mix(in srgb, var(--color-bg-panel) 88%, transparent);
  --card-border: rgba(16,24,40,.08);
  --card-shadow: 0 10px 30px rgba(16,24,40,.12);
  --card-shadow-hover: 0 16px 42px rgba(16,24,40,.16);
  --accent: #5b9cff;

  --section-gap: 10px;
}

.content-paragraph { transition: padding-right 180ms ease; }

.sticker-page {
  padding: 24px clamp(24px,4vw,48px) 48px;
  padding-right: 110px;
  max-width: 1440px;
  margin: 0 auto;
  overflow-wrap: anywhere;
  word-break: normal;
  hyphens: auto;
}
.title { text-align: center; margin: 6px 0 20px; letter-spacing: .2px; }

/* Карточка раздела */
.section {
  --pad: clamp(14px, 2.6vmin, 20px);
  display: grid;
  grid-template-columns: 112px 1fr;
  align-items: center;
  gap: 16px;
  padding: var(--pad);
  min-height: 160px;

  margin: var(--section-gap) 0;

  background: linear-gradient(180deg, var(--card-bg), color-mix(in srgb, var(--card-bg) 92%, white 8%));
  border: 1px solid var(--card-border);
  border-radius: 16px;
  box-shadow: var(--card-shadow);
  transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
  position: relative;
  isolation: isolate;
}
.section:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-hover);
  background: linear-gradient(180deg, color-mix(in srgb, var(--card-bg) 94%, white 6%), var(--card-bg));
}

.section :is(.thumb, figure.thumb) {
  justify-self: center;
  display: grid; place-items: center;
  width: 112px; height: 112px;
  border-radius: 14px;
  background: rgba(16,24,40,.04);
  border: 1px solid rgba(16,24,40,.06);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.18);
}
.section :is(.thumb, figure.thumb) img {
  max-width: 88px; max-height: 88px; object-fit: contain;
  filter: drop-shadow(0 6px 18px rgba(16,24,40,.18));
}

.section h2 {
  margin: 0 0 8px;
  font-size: clamp(18px, 2.2vmin, 22px);
  line-height: 1.2;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: .2px;
  background: linear-gradient(90deg, var(--color-text), color-mix(in srgb, var(--color-text) 72%, var(--accent) 28%));
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
}
.section p {
  margin: 0;
  color: color-mix(in srgb, var(--color-text) 88%, #000 12%);
  opacity: .95;
  hyphens: auto;
}

.section::before {
  content: "";
  position: absolute; inset: 0;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,.18), transparent 32%);
  pointer-events: none;
  mix-blend-mode: soft-light;
}

.section--skeleton .skeleton,
.section--skeleton .skeleton-line { position: relative; overflow: hidden; border-radius: 10px; background: #e9edf3; }
.section--skeleton .skeleton::after,
.section--skeleton .skeleton-line::after { content: ""; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent); animation: shimmer 1.1s infinite; }
.section--skeleton .skeleton-line { height: 16px; }
.section--skeleton .skeleton-line.short { width: 60%; }
@keyframes shimmer { 100% { transform: translateX(100%); } }

.section .content-paragraph {
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 680px) {
  .section { grid-template-columns: 1fr; justify-items: stretch; min-height: 0; }
  .section :is(.thumb, figure.thumb) { width: 100%; height: 180px; }
}

/* Форма модалки */
.lead-form { display: grid; gap: 12px; }
.lead-row { display: grid; gap: 12px; }
.lead-row.two { grid-template-columns: 1fr 1fr; }
.field { display: grid; gap: 6px; }

.lead-form label { font-size: 14px; color: var(--color-text); opacity: .9; }
.lead-form input, .lead-form textarea {
  border: 1px solid rgba(16,24,40,.16);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  background: #fff;
  outline: none;
}

.chk {
  display: grid;
  grid-template-columns: 20px 1fr;
  align-items: start;
  gap: 10px;
  margin-top: 4px;
}
.chk input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  accent-color: #111827; 
}
.chk-text {
  font-size: 14px;
  color: var(--color-text);
  opacity: .9;
}
.chk-text a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.lead-form [aria-invalid="true"] { border-color: #fda29b; background: #fff7f7; }

.error { min-height: 18px; font-size: 12px; color: #b42318; }
.lead-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
.btn { height: 40px; padding: 0 14px; border-radius: 10px; border: 0; cursor: pointer; background: #f2f4f7; }
.btn.primary { background: var(--primary-600); color: #fff; }
.btn:hover { filter: brightness(.98); }

@media (max-width: 520px) { .lead-row.two { grid-template-columns: 1fr; } }
</style>
