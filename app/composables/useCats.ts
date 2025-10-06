import { ref } from 'vue'

export function useCats() {
  const images = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadCats(count = 3) {
    loading.value = true
    error.value = null
    images.value = []

    try {
      const reqs = Array.from({ length: count }, (_, i) =>
        fetch(`https://cataas.com/cat?${Date.now()}-${i}`) 
          .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`)
            return r.blob()
          })
          .then(blob => URL.createObjectURL(blob))
      )

      images.value = await Promise.all(reqs)
    } catch (e: any) {
      error.value = e?.message ?? 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  return { images, loading, error, loadCats }
}
