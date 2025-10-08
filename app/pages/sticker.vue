<script setup lang="ts">
import { onMounted } from 'vue'
import { useCats } from '~/composables/useCats'
import { STICKER_TITLE, CTA_LABEL, SECTIONS_COUNT, TEXT_PARAGRAPH } from '~/constants/content'

const { images, loading, error, loadCats } = useCats()

onMounted(() => {
  loadCats(3) 
})

function onRetry() {
  loadCats(3)          // повторная загрузка
}

const onCta = () => {
  /* eslint-disable-next-line no-console */
  console.log('CTA clicked') // имитация вызова обработчика
}
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
      <p>
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
</template>

<style lang="scss" scoped>
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
}

.section p {
  margin: 0;
  color: var(--color-text);
  opacity: .9;                               
  hyphens: auto;
}

h2 {
  justify-self: center;
}
</style>
