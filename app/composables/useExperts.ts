// app/composables/useExperts.ts
import { ref } from 'vue'

export type Expert = { name: string; avatar: string }

function formatName(n: any): string {
  const first = (n?.first ?? '').trim()
  const last  = (n?.last ?? '').trim()
  const full  = `${first} ${last}`.trim()
  return full || 'Expert'
}

export function useExperts() {
  const experts = ref<Expert[]>([])
  const loading = ref(false)
  const error   = ref<string | null>(null)

  async function loadExperts(count = 3) {
    loading.value = true
    error.value = null
    experts.value = []
    try {
      const url = `https://randomuser.me/api/?results=${count}&inc=name,picture&noinfo`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      experts.value = (data?.results ?? []).map((r: any) => ({
        name: formatName(r?.name),
        avatar: r?.picture?.medium || r?.picture?.thumbnail || ''
      }))
    } catch (e: any) {
      error.value = e?.message || 'Failed to load experts'
    } finally {
      loading.value = false
    }
  }

  return { experts, loading, error, loadExperts }
}
