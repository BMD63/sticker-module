import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { usePictures, type PictureSource } from '~/composables/usePictures'

function mockBlobUrlSequence(count: number) {
  const queue = Array.from({ length: count }, (_, i) => `blob:mock-${i}`)
  return vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
    const next = queue.shift()
    if (!next) throw new Error('No more blob urls')
    return next
  })
}

describe('usePictures (cats & dogs)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('cats: загружает нужное количество изображений (N отдельных fetch + blob)', async () => {
    const COUNT = 3
    const { images, loading, error, load, setSource } = usePictures('cats' as PictureSource, COUNT)

    // cats → каждый запрос возвращает blob
    vi.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['x'], { type: 'image/png' }),
    } as any)
    const createSpy = mockBlobUrlSequence(COUNT)

    setSource('cats')
    const p = load(COUNT)
    expect(loading.value).toBe(true)
    await p

    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(images.value).toHaveLength(COUNT)
    expect(createSpy).toHaveBeenCalledTimes(COUNT)
  })

  it('dogs: делает один запрос к dog.ceo и кладёт массив URL из JSON', async () => {
    const COUNT = 3
    const dogUrls = ['https://images.dog/1.jpg', 'https://images.dog/2.jpg', 'https://images.dog/3.jpg']
    const { images, loading, error, load, setSource } = usePictures('dogs' as PictureSource, COUNT)

    // dogs → один fetch, json = { status:'success', message: string[] }
    vi.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success', message: dogUrls }),
    } as any)

    setSource('dogs')
    const p = load(COUNT)
    expect(loading.value).toBe(true)
    await p

    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(images.value).toEqual(dogUrls)
  })

  it('ошибки fetch попадают в error, loading снимается, images очищается', async () => {
    const { images, loading, error, load, setSource } = usePictures('cats' as PictureSource, 2)

    vi.spyOn(global, 'fetch' as any).mockRejectedValue(new Error('Network down'))

    setSource('cats')
    await load(2)

    expect(loading.value).toBe(false)
    expect(images.value).toEqual([])
    expect(error.value).toBe('Network down')
  })
})
