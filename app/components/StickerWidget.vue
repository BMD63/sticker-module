<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  railImages?: string[]     
  panelImages?: string[]    
  title?: string
  ctaLabel?: string
  loading?: boolean
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
})

const expanded = ref(false)  
const canHover = ref(true)

if (typeof window !== 'undefined') {
  canHover.value = matchMedia('(any-hover: hover)').matches
}

function onEnter() { if (canHover.value) expanded.value = true }
function onLeave() { if (canHover.value) expanded.value = false }

const emit = defineEmits<{ (e: 'cta'): void }>()
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
      <div class="railContent" :aria-hidden="expanded">
        <template v-if="props.loading">
            <div class="avatar skeleton" v-for="n in 3" :key="'rail-skel-'+n" />
        </template>
        <template v-else>
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
          />
        </template>
        <button class="arrow" type="button" aria-hidden="true" tabindex="-1">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="chevron" width="16" height="16">
            <path d="M15 6L9 12l6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
      </div>

      <div class="panelContent" :aria-hidden="!expanded">
        <h3 class="title" v-html="props.title" />
        <div class="faces">
            <template v-if="props.loading">
                <div class="face skeleton" v-for="n in 3" :key="'face-skel-'+n" />
            </template>
            <template v-else>
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
                />
            </template>
        </div>
        <button class="cta" type="button" @click="emit('cta')">
            {{ props.ctaLabel }}
        </button>
      </div>
    </div>
  </aside>
</template>

<style lang="scss" scoped>

.sticker {
  --rail-w: 68px;           
  --panel-w: 280px;         
  --box-h: 266px;           
  --pad-collapsed: 2px 2px 16px 2px;
  --pad-expanded: 16px;
  --radius-collapsed: 14px;  
  --radius-expanded: 20px;

  --avatar: 64px;
  --avatar-radius: 16px;
  --overlap-v: -20px;

  --face: 64px;
  --face-radius: 16px;
  --overlap-h: -12px;

  --btn-bg: #fff;

  --t-expand: 180ms;                    
  --t-pop: 280ms;                      
  --ease-pop: cubic-bezier(.2,.8,.2,1);

  position: fixed;
  right: 24px;
  top: 50%;
  z-index: 50;
  transform: translateY(-50%);
}

:root { 
    --elev: 0 14px 40px rgba(16,24,40,.14); 
}

.bubble {
  position: relative;
  transform-origin: right center;
  width: var(--rail-w);
  height: var(--box-h);
  padding: var(--pad-collapsed);
  border-radius: var(--radius-collapsed) 0 0 var(--radius-collapsed);
  background: #F4F6F9;
  box-shadow: var(--elev);
  overflow: hidden;
  transition:
    width var(--t-expand) ease-out,
    padding var(--t-expand) ease-out,
    background var(--t-expand) ease-out,
    border-radius var(--t-expand) ease-out;
}
.sticker.expanded .bubble {
  width: var(--panel-w);
  padding: var(--pad-expanded);
  border-radius: var(--radius-expanded);
  background: #F7F9FC;
}

.railContent {
  position: absolute; 
  inset: 0;
  display: flex; 
  flex-direction: column;
  align-items: center; 
  justify-content: center;
  transition: opacity 150ms ease-out;
}
.sticker.expanded .railContent { 
    opacity: 0; pointer-events: none; 
}

.avatar {
  width: var(--avatar);
  height: var(--avatar);
  border-radius: var(--avatar-radius);
  background: #d9d9d9;
  box-sizing: border-box;
  border: 3px solid #F4F6F9    ;
}
.avatar + .avatar { 
    margin-top: var(--overlap-v); 
}

.arrow {
  width: 24px; 
  height: 24px;
  border: 0; 
  background: transparent; 
  padding: 0;
  display: grid; 
  place-items: center; 
  cursor: pointer;
  margin-top: 32px;
}
.chevron { 
    width: 16px; 
    height: 16px; 
    color: #333; 
    opacity: .4; 
    transition: opacity .15s, 
    transform .18s; 
}
.arrow:hover .chevron { 
    opacity: 1; 
}
:deep([aria-pressed="true"]) .chevron { 
    transform: rotate(180deg); 
}

.panelContent {
  position: absolute; 
  inset: 0;
  display: grid; 
  grid-auto-rows: max-content;
  justify-items: center; 
  align-content: start;
  opacity: 0; 
  pointer-events: none; 
  transition: opacity 150ms ease-out;
}
.sticker.expanded .panelContent { 
    opacity: 1; pointer-events: auto; 
}

.title {
  width: 216px; 
  margin: 8px auto 16px; 
  text-align: center;
  font-weight: 600; 
  font-size: 23px; 
  line-height: 1; 
  color: #333;
}
.faces { 
    display: flex; 
    justify-content: center; 
    align-items: center; 
    margin: 8px 0 24px; 
}
.face  { 
    width: var(--face); 
    height: var(--face); 
    border-radius: var(--face-radius); 
    background: #d9d9d9; 
    box-sizing: border-box;
    border: 3px solid #F4F6F9;
}
.face + .face { 
    margin-left: var(--overlap-h); 
}

.cta {
  display: inline-block; 
  width: 216px; 
  height: 56px; 
  line-height: 56px; 
  text-align: center;
  font-weight: 500; 
  font-size: 16px; 
  color: #333;
  border: 0; 
  border-radius: 16px; 
  background: var(--btn-bg);
  box-shadow: 0 6px 24px rgba(16,24,40,.08); 
  cursor: pointer;
}

@keyframes bubble-pop {
    0%   { transform: scale(0.965); box-shadow: 0 8px 24px rgba(16,24,40,.10); }
    60%  { transform: scale(1.04);  box-shadow: 0 20px 48px rgba(16,24,40,.18); }
    100% { transform: scale(1.00);  box-shadow: var(--elev); }
}
.sticker.expanded .bubble { 
    animation: bubble-pop 2240ms cubic-bezier(.2,.8,.2,1) both; 
}

.panelContent > * {
  transform: translateY(8px);
  opacity: 0;
  transition: transform 240ms cubic-bezier(.2,.8,.2,1), opacity 240ms ease;
}
.sticker.expanded .panelContent > * { transform: translateY(0); opacity: 1; }
.panelContent .title { transition-delay: 40ms; }
.panelContent .faces { transition-delay: 90ms; }
.panelContent .cta   { transition-delay: 140ms; }

@media (hover: hover) {
  .sticker:hover .bubble {
    width: var(--panel-w);
    padding: var(--pad-expanded);
    border-radius: var(--radius-expanded);
    background: #F7F9FC;
    animation: bubble-pop var(--t-pop) var(--ease-pop) both;
  }
  .sticker:hover .railContent { opacity: 0; pointer-events: none; }
  .sticker:hover .panelContent { opacity: 1; pointer-events: auto; }
}

.skeleton {
  position: relative;
  overflow: hidden;
  background: #e9edf3;
}
.skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent);
  animation: shimmer 1.2s infinite;
}
@keyframes shimmer {
  100% { transform: translateX(100%); }
}

</style>
