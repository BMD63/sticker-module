import { useCats } from '../app/composables/useCats'
import { vi } from 'vitest'
import { describe, it, expect, beforeEach, } from 'vitest'

function mockBlobUrlSequence(count: number) {
  const urls = Array.from({ length: count }, (_, i) => `blob:mock-${i}`)

  const createSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {

    const next = urls.shift()
    if (!next) throw new Error('No more blob urls')
    return next
  })
  return { createSpy, initialUrls: urls }
}

describe('useCats', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('loads requested number of images', async () => {
    const { images, loading, error, loadCats } = useCats()
    const COUNT = 3

 
    vi.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['x'], { type: 'image/png' }),
    } as any)

    const { createSpy } = mockBlobUrlSequence(COUNT)

    const p = loadCats(COUNT)
    expect(loading.value).toBe(true)
    await p

    expect(error.value).toBeNull()
    expect(loading.value).toBe(false)
    expect(images.value).toHaveLength(COUNT)

    expect(createSpy).toHaveBeenCalledTimes(COUNT)
  })

  it('sets error on failed response and stops loading', async () => {
    const { images, loading, error, loadCats } = useCats()

    // mock fetch → not ok
    vi.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: false,
      status: 500,
    } as any)

    const p = loadCats(2)
    expect(loading.value).toBe(true)
    await p

    expect(loading.value).toBe(false)
    expect(images.value).toEqual([])
    expect(error.value).toBeTruthy()
  })

  it('sets error on fetch rejection', async () => {
    const { images, loading, error, loadCats } = useCats()

    vi.spyOn(global, 'fetch' as any).mockRejectedValue(new Error('Network down'))

    await loadCats(1)
    expect(loading.value).toBe(false)
    expect(images.value).toEqual([])
    expect(error.value).toBe('Network down')
  })
})
