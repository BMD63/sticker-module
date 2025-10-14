<script setup lang="ts">
import SiteHeader from '~/components/SiteHeader.vue'
import SiteFooter from '~/components/SiteFooter.vue'
</script>

<template>
  <div class="site">
    <SiteHeader />
    <main class="site-main">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped lang="scss">
.site {
  min-height: 100svh;              
  display: grid;
  grid-template-rows: auto 1fr auto; /* header / content / footer */
  background: var(--color-page, #fff);
}


.site-main {
  padding: 16px;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
}
</style>
