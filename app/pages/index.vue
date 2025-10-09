<template>
  <main style="padding: 32px">
    <h1>Sticker App</h1>
    <p>Страница демонстрации стикера:</p>
    <ul style="display:flex; gap:12px; list-style:none; padding:0">
      <li><NuxtLink :to="{ path: '/sticker', query: { src: 'cats' } }">Котики</NuxtLink></li>
      <li><NuxtLink :to="{ path: '/sticker', query: { src: 'dogs' } }">Пёсики</NuxtLink></li>
    </ul>
  </main>
</template>

