<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'

const props = withDefaults(defineProps<{
  railImages?: string[]     
  panelImages?: string[]    
  title?: string
  ctaLabel?: string
  loading?: boolean
  error?: string | null
}>(), {
  railImages: () => [
    'https://i.pravatar.cc/128?img=5',
    'https://i.pravatar.cc/128?img=12',
    'https://i.pravatar.cc/128?img=32',
  ],
  panelImages: () => [
    'https://i.pravatar.cc/128?img=5',
    'https://i.pravatar.cc/128?img=12',
    'https://i.pravatar.cc/128?img=32',
  ],
  title: 'Консультация<br>эксперта',
  ctaLabel: 'Получить консультацию',
  loading: false,
  error: null,
})

const expanded = ref(false)  
const canHover = ref(true)

const titleLines = computed(() => {
  const raw = String(props.title ?? '')
  return raw.split(/<br\s*\/?>/i)
})

if (typeof window !== 'undefined') {
  canHover.value = matchMedia('(any-hover: hover)').matches
}

function notifyStickerChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('sticker-change'))
  }
}

function onEnter() {
  if (canHover.value) {
    expanded.value = true
    if (typeof document !== 'undefined') {
      document.body.classList.add('sticker-expanded')
    }
    notifyStickerChange()
  }
}
function onLeave() {
  if (canHover.value) {
    expanded.value = false
    if (typeof document !== 'undefined') {
      document.body.classList.remove('sticker-expanded')
    }
    notifyStickerChange()
  }
}

watch(expanded, (val) => {
  if (typeof document !== 'undefined') {
    document.body.classList.toggle('sticker-expanded', val)
  }
  notifyStickerChange()
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.classList.remove('sticker-expanded')
  }
})
const emit = defineEmits<{ (e: 'cta'): void; (e: 'retry'): void }>()
</script>

<template>
  <aside
    class="sticker"
    :class="{ expanded }"
    aria-label="Стикер-консультация"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <div class="bubble">
      <div
        class="railContent"
        :aria-hidden="expanded"
      >
        <template v-if="props.loading">
          <div
            v-for="n in 3"
            :key="'rail-skel-'+n"
            class="avatar skeleton"
          />
        </template>
        <template v-else-if="!props.error">
          <img 
            v-for="(src,i) in props.railImages.slice(0,3)" 
            :key="'rail-'+i" 
            class="avatar" 
            :src="src" 
            :alt="`эксперт ${i+1}`" 
            width="64" 
            height="64" 
            loading="lazy" 
            decoding="async" 
          >
        </template>
        <template v-else>
          <div
            class="error-badge"
            title="Не удалось загрузить"
          >
            !
          </div>
        </template>
        <button
          class="arrow"
          type="button"
          aria-hidden="true"
          tabindex="-1"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            class="chevron"
            width="16"
            height="16"
          >
            <path
              d="M15 6L9 12l6 6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <div
        class="panelContent"
        :aria-hidden="!expanded"
      >
        <h3 class="title">
          <template
            v-for="(line, i) in titleLines"
            :key="i"
          >
            <span>{{ line }}</span><br v-if="i < titleLines.length - 1">
          </template>
        </h3>
        <div class="faces">
          <template v-if="props.loading">
            <div
              v-for="n in 3"
              :key="'face-skel-'+n"
              class="face skeleton"
            />
          </template>
          <template v-else-if="!props.error">
            <img
              v-for="(src,i) in props.panelImages.slice(0,3)"
              :key="'face-'+i"
              class="face"
              :src="src"
              :alt="`эксперт ${i+1}`"
              width="64"
              height="64"
              loading="lazy"
              decoding="async"
            >
          </template>    
          <template v-else>
            <p class="error-text">
              Не удалось загрузить изображения.
            </p>
          </template>
        </div>   
        <button
          class="cta"
          type="button"
          @click="props.error ? emit('retry') : emit('cta')"
        >
          {{ props.error ? 'Повторить' : props.ctaLabel }}
        </button>
      </div>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
:root { --elev: 0 14px 40px rgba(16,24,40,.14); }
:global(:root) {
  --cta-bg: #6a6d72;         /* фон кнопки  */
  --cta-bg-hover: #0f172a;   /* фон при hover */
  --cta-fg: #ffffff;         /* цвет текста */
  --cta-height: 48px;        /* ВЫСОТА кнопки */
  --cta-radius: 14px;        /* радиус скругления */
}
.sticker {
  --rail-w: 68px;
  --panel-w: 280px;
  --box-h: 266px;
  --sticker-box-h: var(--box-h);

  --pad-collapsed: 3px 3px 18px 3px;
  --pad-expanded: 16px;
  --radius-collapsed: 14px;
  --radius-expanded: 20px;

  --avatar: 64px;
  --avatar-radius: 16px;
  --overlap-v: -20px;

  --face: 64px;
  --face-radius: 16px;
  --overlap-h: -12px;

  position: fixed;
  right: 24px;
  top: 50%;
  z-index: 50;
  transform: translateY(-50%);
}

/* Стеклянный пузырь */
.bubble {
  position: relative;
  transform-origin: right center;
  width: var(--rail-w);
  height: var(--box-h);
  padding: var(--pad-collapsed);
  border-radius: var(--radius-collapsed) 0 0 var(--radius-collapsed);
  background: color-mix(in srgb, var(--color-bg-panel) 78%, transparent);
  backdrop-filter: blur(8px) saturate(1.05);
  border: 1px solid rgba(255,255,255,.18);
  box-shadow: var(--elev);
  overflow: hidden;
  transition: width .22s ease-out, padding .22s ease-out, border-radius .22s ease-out, background .22s ease-out;
}
.sticker.expanded .bubble {
  width: var(--panel-w);
  padding: var(--pad-expanded);
  border-radius: var(--radius-expanded);
  background: color-mix(in srgb, var(--color-bg-panel) 86%, white 14%);
}

/* Rail (свёрнутое состояние) */
.railContent {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  transition: opacity 160ms ease-out;
}
.sticker.expanded .railContent { opacity: 0; pointer-events: none; }

.avatar {
  width: var(--avatar); height: var(--avatar);
  border-radius: var(--avatar-radius);
  background: #d9d9d9;
  box-sizing: border-box;
  border: 3px solid color-mix(in srgb, var(--color-bg-rail, #eef2f6) 82%, white 18%);
  outline: 2px solid rgba(255,255,255,.45);
  outline-offset: -2px;
}
.avatar + .avatar { margin-top: var(--overlap-v); }

/* Стрелка */
.arrow {
  width: 28px; height: 28px;
  margin-top: 32px;
  border: 0; background: rgba(0,0,0,.08);
  color: var(--color-text);
  border-radius: 999px;
  display: grid; place-items: center;
  cursor: pointer;
  transition: filter .15s, transform .18s;
}
.arrow:hover { filter: brightness(.96); transform: translateY(-1px); }
.chevron { width: 16px; height: 16px; opacity: .6; }

/* Панель (раскрытое состояние) */
.panelContent {
  position: absolute; 
  inset: 0;
  display: grid; 
  grid-auto-rows: max-content; 
  justify-items: center; align-content: start;
  opacity: 0; 
  pointer-events: none; 
  transition: opacity 160ms ease-out;
  row-gap: 10px;
}
.sticker.expanded .panelContent { opacity: 1; pointer-events: auto; }

.title {
  width: 216px; margin: 6px auto 14px; text-align: center;
  font-weight: 700; font-size: 23px; line-height: 1;
  color: var(--color-text);
}

/* лица/эксперты */
.faces {
  display: flex; justify-content: center; align-items: flex-start;
  gap: 12px; margin: 8px 0 18px;
}
.face-card { display: grid; justify-items: center; gap: 6px; width: 84px; }
.face {
  width: var(--face); height: var(--face);
  border-radius: var(--face-radius);
  background: #d9d9d9;
  box-sizing: border-box;
  border: 3px solid color-mix(in srgb, var(--color-bg-rail, #eef2f6) 82%, white 18%);
  outline: 2px solid rgba(255,255,255,.55);
  outline-offset: -2px;
}
.face + .face { margin-left: var(--overlap-h); }
.face-name { font-size: 12px; line-height: 1.2; text-align: center; max-width: 84px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--color-text); opacity: .9; }

/* CTA — нейтральная, в тему */
.cta {
  width: 216px;
  height: var(--cta-height);
  line-height: var(--cta-height);   
  border: 0;
  border-radius: var(--cta-radius);
  background: var(--cta-bg);
  color: var(--cta-fg);
  font-weight: 600;
  font-size: 15px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(16,24,40,.10);
  transition: filter .15s ease, transform .06s ease;
  margin-top: 8px;                   
}
.cta:hover { filter: brightness(.98); background: var(--cta-bg-hover); }
.cta:active { transform: translateY(1px); }

/* Скелетоны/ошибки */
.skeleton { position: relative; overflow: hidden; background: #e9edf3; }
.skeleton::after { content: ""; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent); animation: shimmer 1.2s infinite; }
@keyframes shimmer { 100% { transform: translateX(100%); } }

.error-badge {
  width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center;
  font-weight: 700; color: #b42318; background: #fee4e2; border: 2px solid #fda29b;
  box-sizing: border-box; margin-top: 8px;
}
.error-text { margin: 8px 0 16px; font-size: 14px; color: #b42318; text-align: center; }

/* Поп-анимация */
@keyframes bubble-pop {
  0% { transform: scale(.965); box-shadow: 0 8px 24px rgba(16,24,40,.10); }
  60% { transform: scale(1.04); box-shadow: 0 20px 48px rgba(16,24,40,.18); }
  100% { transform: scale(1); box-shadow: var(--elev); }
}
.sticker.expanded .bubble { animation: bubble-pop 224ms cubic-bezier(.2,.8,.2,1) both; }
</style>