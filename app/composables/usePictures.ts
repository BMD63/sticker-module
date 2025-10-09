import { ref } from 'vue'
import { API, type PictureSource } from '~/constants/api'

export function usePictures(initialSource: PictureSource, defaultCount = 3) {
  const source  = ref<PictureSource>(initialSource)
  const images  = ref<string[]>([])
  const loading = ref(false)
  const error   = ref<string | null>(null)

  async function load(count = defaultCount) {
    loading.value = true
    error.value = null
    images.value = []
    try {
      if (source.value === 'cats') {
        const reqs = Array.from({ length: count }, (_, i) =>
          fetch(`${API.cats}?${Date.now()}-${i}`)
            .then((r) => {
              if (!r.ok) throw new Error(`HTTP ${r.status}`)
              return r.blob()
            })
            .then((blob) => URL.createObjectURL(blob))
        )
        images.value = await Promise.all(reqs)
      } else {
        const r = await fetch(`${API.dogs}${count}`)
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const data = await r.json()
        const arr = Array.isArray(data?.message) ? data.message : []
        if (!arr.length) throw new Error('Empty dogs payload')
        images.value = arr
      }
    } catch (e: any) {
      error.value = e?.message ?? 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  function setSource(next: PictureSource) {
    if (source.value === next) return

    if (source.value === 'cats') {
      for (const url of images.value) {
        try { URL.revokeObjectURL(url) } catch {}
      }
    }

    source.value = next
    images.value = []
    error.value = null
  }

  return { images, loading, error, load, setSource }
}
