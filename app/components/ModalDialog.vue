<script setup lang="ts">
import { onBeforeUnmount, ref, watch, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  closeOnEsc?: boolean
  closeOnBackdrop?: boolean
}>(), {
  title: 'Заявка на консультацию',
  closeOnEsc: true,
  closeOnBackdrop: true,
})

const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const dialog = ref<HTMLElement | null>(null)
let lastActive: Element | null = null

function close() { emit('update:modelValue', false) }

function onKeydown(e: KeyboardEvent) {
  if (props.closeOnEsc && e.key === 'Escape') {
    e.preventDefault()
    close()
  }
}

function focusTrap(e: FocusEvent) {
  if (!dialog.value) return
  if (!dialog.value.contains(e.target as Node)) {
    e.stopPropagation()
    const focusable = dialog.value.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusable?.focus()
  }
}

watch(() => props.modelValue, async (open) => {
  if (open) {
    lastActive = document.activeElement
    await nextTick()
    const focusable = dialog.value?.querySelector<HTMLElement>(
      'input, button, [href], [tabindex]:not([tabindex="-1"])'
    )
    focusable?.focus()
    document.addEventListener('keydown', onKeydown)
    document.addEventListener('focusin', focusTrap)
    document.documentElement.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', onKeydown)
    document.removeEventListener('focusin', focusTrap)
    document.documentElement.style.overflow = ''
    ;(lastActive as HTMLElement | null)?.focus?.()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('focusin', focusTrap)
  document.documentElement.style.overflow = ''
})

function onBackdrop(e: MouseEvent) {
  if (!props.closeOnBackdrop) return
  if (e.target && (e.target as HTMLElement).classList.contains('backdrop')) {
    close()
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="backdrop"
      @mousedown="onBackdrop"
    >
      <section
        ref="dialog"
        class="dialog"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <header class="dialog__header">
          <h3
            class="dialog__title"
            v-html="title"
          />
          <button
            class="dialog__close"
            type="button"
            aria-label="Закрыть"
            @click="close"
          >
            ×
          </button>
        </header>

        <div class="dialog__body">
          <!-- slot для контента формы -->
          <slot />
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.backdrop {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(16,24,40,.46);
  display: grid; place-items: center;
  padding: 24px;
}

.dialog {
  width: min(560px, 100%);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(16,24,40,.26);
  outline: none;
  animation: pop .16s ease-out;
}

.dialog__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 16px 8px;
}
.dialog__title { margin: 0; font-size: 20px; font-weight: 600; line-height: 1.2; }
.dialog__close {
  border: 0; background: transparent; cursor: pointer; font-size: 22px; line-height: 1;
  width: 32px; height: 32px; border-radius: 8px;
}
.dialog__close:hover { background: rgba(16,24,40,.06); }

.dialog__body { padding: 0 16px 16px; }

@keyframes pop { from { transform: translateY(6px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
</style>
