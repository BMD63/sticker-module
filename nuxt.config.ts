export default defineNuxtConfig({
  compatibilityDate: '2025-09-29',
  devtools: { enabled: true },
  nitro: { preset: 'github_pages' },
  css: ['~/assets/styles/main.scss'],
  app: { 
    baseURL: '/sticker-module/', 
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.png' },
      ],
       meta: [
        { name: 'theme-color', content: '#111827' } 
      ]
    },
   
  }
})
