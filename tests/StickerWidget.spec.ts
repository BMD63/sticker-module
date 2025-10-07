import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import StickerWidget from '../app/components/StickerWidget.vue'

function forceHoverSupport() {
  vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
    matches: true,
    media: q,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as any)
}

describe('StickerWidget', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('показывает скелетоны при loading', () => {
    const wrapper = mount(StickerWidget, {
      props: { loading: true },
    })
    expect(wrapper.findAll('.avatar.skeleton').length).toBe(3)

    expect(wrapper.findAll('.face.skeleton').length).toBe(3)
  })

  it('показывает бейдж ошибки при error', () => {
    const wrapper = mount(StickerWidget, {
      props: { error: 'fail', loading: false },
    })
    expect(wrapper.find('.error-badge').exists()).toBe(true)

    expect(wrapper.find('.error-text').exists()).toBe(true)
  })

  it('рендерит аватарки при успехе и раскрывается по hover', async () => {
    forceHoverSupport()
    const railImages = [
      'https://i.pravatar.cc/128?img=1',
      'https://i.pravatar.cc/128?img=2',
      'https://i.pravatar.cc/128?img=3',
    ]
    const panelImages = railImages

    const wrapper = mount(StickerWidget, {
      props: { loading: false, error: null, railImages, panelImages },
      attachTo: document.body, 
    })

    expect(wrapper.findAll('img.avatar').length).toBe(3)

    const aside = wrapper.find('aside.sticker')
    expect(aside.classes()).not.toContain('expanded')

    await aside.trigger('mouseenter')
    await nextTick()
    expect(aside.classes()).toContain('expanded')


    const panel = wrapper.find('.panelContent')
    expect(panel.attributes('aria-hidden')).toBe('false') 

    await aside.trigger('mouseleave')
    await nextTick()
    expect(aside.classes()).not.toContain('expanded')
    expect(panel.attributes('aria-hidden')).toBe('true')
  })
})
