<script setup lang="ts">
import { onMounted } from 'vue'
import { useCats } from '~/composables/useCats'
import { STICKER_TITLE, CTA_LABEL, SECTIONS_COUNT, TEXT_PARAGRAPH } from '~/constants/content'

const { images, loading, error, loadCats } = useCats()

onMounted(() => {
  loadCats(3) 
})

const onCta = () => {
  console.log('CTA clicked') // имитация вызова обработчика
}
</script>

<template>
  <main class="sticker-page">
    <h1 class="title">Демонстрация стикера</h1>
    <p v-if="loading">Загружаем изображения…</p>
    <p v-else-if="error">Ошибка: {{ error }}</p>
    <section v-for="i in SECTIONS_COUNT" :key="i" class="section">
      <h2>Раздел {{ i }}</h2>
      <p>
        {{ TEXT_PARAGRAPH }}
      </p>
    </section>
  </main>
  <StickerWidget
    v-if="images.length || loading"
    :rail-images="images"
    :panel-images="images"
    :loading="loading"
    :title="STICKER_TITLE"
    :cta-label="CTA_LABEL"
    @cta="onCta" 
  />
</template>

<style lang="scss" scoped>
.sticker-page {
  padding: 24px;
  padding-right: 140px;
  max-width: 1280px;
  margin: 0 auto;
}
.title { 
  text-align: center; 
  margin: 0 0 16px;
}
.section { 
  margin: 32px 0; 
}
</style>
