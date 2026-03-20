// src/hooks/useDragScroll.ts
// Enables click-and-drag horizontal scrolling on desktop using the
// Pointer Events API (pointerdown/pointermove/pointerup).
// Pointer capture ensures the drag continues even when the cursor
// leaves the element mid-drag — no window listener needed.
import { useRef, useEffect } from 'react'

export function useDragScroll<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let startX        = 0
    let startScrollLeft = 0
    let pointerId     = -1
    let hasDragged    = false

    const onPointerDown = (e: PointerEvent) => {
      // Only respond to mouse (primary) or touch
      if (e.pointerType === 'mouse' && e.button !== 0) return

      // Capture the pointer so pointermove fires even outside the element
      el.setPointerCapture(e.pointerId)
      pointerId    = e.pointerId
      startX       = e.clientX
      startScrollLeft = el.scrollLeft
      hasDragged   = false
      el.classList.add('drag-scrolling')
    }

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return
      if (!el.hasPointerCapture(e.pointerId)) return

      const dx = e.clientX - startX

      if (Math.abs(dx) > 4) {
        hasDragged = true
        // Prevent native scrolling / text selection only once dragging starts
        e.preventDefault()
      }

      el.scrollLeft = startScrollLeft - dx
    }

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return
      el.classList.remove('drag-scrolling')
      pointerId = -1

      if (hasDragged) {
        // Suppress the click that fires immediately after pointerup
        const suppressClick = (ev: Event) => {
          ev.stopPropagation()
          ev.preventDefault()
        }
        el.addEventListener('click', suppressClick, { capture: true, once: true })
        // Safety clean-up after 300 ms in case click never fires
        setTimeout(() => {
          el.removeEventListener('click', suppressClick, true)
        }, 300)
      }
    }

    // touch-action: pan-y keeps vertical page-scroll working while we handle
    // horizontal drag ourselves via Pointer Events.
    el.style.touchAction = 'pan-y'

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove, { passive: false })
    el.addEventListener('pointerup',   onPointerUp)
    el.addEventListener('pointercancel', onPointerUp)

    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup',   onPointerUp)
      el.removeEventListener('pointercancel', onPointerUp)
      el.style.touchAction = ''
    }
  }, [])

  return ref
}
