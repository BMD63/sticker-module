
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},           
    removeListener: () => {},        
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}
if (typeof URL !== 'undefined' && !URL.createObjectURL) {
  URL.createObjectURL = () => 'blob:mock'
}

if (typeof window !== 'undefined' && !window.requestAnimationFrame) {
  window.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 16) as unknown as number
  window.cancelAnimationFrame = (id: number) => clearTimeout(id)
}
