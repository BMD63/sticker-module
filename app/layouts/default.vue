<script setup lang="ts">
import SiteHeader from '~/components/SiteHeader.vue'
import SiteFooter from '~/components/SiteFooter.vue'
</script>

<template>
  <div class="layout">
    <SiteHeader />
    <main><slot /></main>
    <SiteFooter />
  </div>
</template>

<style scoped lang="scss">
.layout > main {
  min-height: 60vh;
}
</style>
