<script setup lang="ts">
import { onMounted } from 'vue'
import { useCats } from '~/composables/useCats'

const { images, loading, error, loadCats } = useCats()

onMounted(() => {
  loadCats(3) 
})
</script>

<template>
  <main class="sticker-page">
    <h1 class="title">Демонстрация стикера</h1>
    <p v-if="loading">Загружаем изображения…</p>
    <p v-else-if="error">Ошибка: {{ error }}</p>
    <section v-for="i in 12" :key="i" class="section">
      <h2>Раздел {{ i }}</h2>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum quis
        nulla eget nisl dictum luctus. Integer vitae ante eget arcu porttitor
        suscipit. Quisque dictum, enim nec volutpat gravida, nunc velit pharetra
        nibh, at luctus sapien nulla ac orci. Suspendisse potenti. Proin tempor
        viverra justo, ut ultrices arcu luctus sit amet.
      </p>
    </section>
  </main>
  <StickerWidget
    v-if="images.length"
    :rail-images="images"
    :panel-images="images"
    title="Консультация<br>эксперта"
    cta-label="Получить консультацию"
    @cta="console.log('CTA clicked')"
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
