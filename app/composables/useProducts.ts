import { ref } from 'vue'
import { SECTIONS_COUNT, TEXT_PARAGRAPH } from '~/constants/content'

export interface ProductCard {
  id: number
  title: string
  description: string
  image: string
}

function placeholderSrc(idx: number) {
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>
      <rect width='100%' height='100%' fill='#e9edf3'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
        font-family='Inter,system-ui,Segoe UI,Roboto' font-size='18' fill='#667085'>
        No image ${idx + 1}
      </text>
    </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function makeFallback(count: number): ProductCard[] {
  return Array.from({ length: count }, (_, i) => ({
    id: 10000 + i,
    title: `Карточка ${i + 1}`,
    description: TEXT_PARAGRAPH,
    image: placeholderSrc(i),
  }))
}

export function useProducts() {
  const products = ref<ProductCard[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load(count = SECTIONS_COUNT) {
    loading.value = true
    error.value = null
    products.value = []
    try {
      const res = await fetch(`https://dummyjson.com/products?limit=${count}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { products: any[] }
      const list = (data.products ?? []).slice(0, count)
      const mapped: ProductCard[] = list.map((p, idx) => ({
        id: Number(p.id ?? idx),
        title: String(p.title ?? `Карточка ${idx + 1}`),
        description: String(p.description ?? TEXT_PARAGRAPH),
        image: String(p.thumbnail ?? p.images?.[0] ?? placeholderSrc(idx)),
      }))
      if (mapped.length < count) {
        mapped.push(...makeFallback(count - mapped.length))
      }
      products.value = mapped
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to load products'
      products.value = makeFallback(count)
    } finally {
      loading.value = false
    }
  }

  return { products, loading, error, load }
}
