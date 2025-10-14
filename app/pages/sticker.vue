<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRoute } from '#imports'
import { z } from 'zod'

import { usePictures } from '~/composables/usePictures'
import type { PictureSource } from '~/constants/api'
import { STICKER_TITLE, CTA_LABEL, SECTIONS_COUNT, TEXT_PARAGRAPH } from '~/constants/content'
import { AVOID_PADDING_DIVISOR } from '~/constants/ui'

/* ——— источник картинок из query ——— */
function pickSrc(q: unknown): PictureSource {
  const v = Array.isArray(q) ? q[0] : q
  const s = String(v ?? '').toLowerCase()
  return s === 'dogs' ? 'dogs' : 'cats'
}

const route = useRoute()

const src = ref<PictureSource>(pickSrc(route.query.src))

const { images, loading, error, load, setSource } = usePictures(src.value, 3)
onMounted(() => { load() })

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
})

const errors = reactive<Record<string, string>>({})

const phoneRegex = /^\+?\d[\d\s()-]{6,}$/

/* e-mail и phone «опциональны», но хотя бы одно из них обязательно */
const LeadSchema = z.object({
  name: z.string().trim().min(1, 'Укажите имя'),
  email: z.string().trim().email('Некорректный e-mail').optional().or(z.literal('')),
  phone: z.string().trim().regex(phoneRegex, 'Некорректный телефон').optional().or(z.literal('')),
  question: z.string().trim().min(5, 'Опишите ваш вопрос подробнее'),
}).refine(v => (v.email && v.email.length) || (v.phone && v.phone.length), {
  message: 'Укажите хотя бы один контакт',
  path: ['email'], // подсказку показываем под e-mail
})

function resetErrors() {
  Object.keys(errors).forEach(k => delete errors[k])
}
function resetForm() {
  form.name = ''
  form.email = ''
  form.phone = ''
  form.question = ''
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
/* ——— Токены стикера ——— */
:global(:root) {
  --sticker-right: 24px;
  --sticker-rail-w: 68px;
  --sticker-panel-w: 280px;
  --sticker-gap: 16px;
}

/* ——— Контент страницы ——— */
.content-paragraph { transition: padding-right 180ms ease; }

.sticker-page {
  padding: 24px;
  padding-right: 110px;
  max-width: 1440px;
  margin: 0 auto;
  overflow-wrap: anywhere;
  word-break: normal;
  hyphens: auto;
}
.title { text-align: center; margin: 0 0 16px; }
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
.section p { margin: 0; color: var(--color-text); opacity: .9; hyphens: auto; }

/* ——— Форма модалки ——— */
.lead-form { display: grid; gap: 12px; }

.lead-row { display: grid; gap: 12px; }
.lead-row.two { grid-template-columns: 1fr 1fr; }

.field { display: grid; gap: 6px; }

.lead-form label { font-size: 14px; color: var(--color-text); opacity: .9; }
.lead-form input,
.lead-form textarea {
  border: 1px solid rgba(16,24,40,.16);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  background: #fff;
  outline: none;
}
.lead-form [aria-invalid="true"] { border-color: #fda29b; background: #fff7f7; }

/* Резерв места под ошибку */
.error {
  min-height: 18px;
  font-size: 12px;
  color: #b42318;
}

.lead-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}
.btn {
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 0;
  cursor: pointer;
  background: #f2f4f7;
}
.btn.primary { background: #111827; color: #fff; }
.btn:hover { filter: brightness(.98); }

@media (max-width: 520px) {
  .lead-row.two { grid-template-columns: 1fr; }
}
</style>
