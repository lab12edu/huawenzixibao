// src/hooks/useDragScroll.ts
// Enables click-and-drag horizontal scrolling on desktop using the
// Pointer Events API.  Uses a callback ref so that listeners are
// attached the moment the element is mounted in the DOM — even if it
// is rendered after an async data load.
import { useRef, useCallback, useEffect } from 'react'

export function useDragScroll<T extends HTMLElement = HTMLElement>() {
  // Keep a stable ref to the current element so the cleanup closure can reach it
  const elRef = useRef<T | null>(null)

  const attach = useCallback((el: T | null) => {
    // Detach from previous element if any
    if (elRef.current) {
      const prev = elRef.current
      prev.removeEventListener('pointerdown',   prev._ds_down   as EventListener)
      prev.removeEventListener('pointermove',   prev._ds_move   as EventListener)
      prev.removeEventListener('pointerup',     prev._ds_up     as EventListener)
      prev.removeEventListener('pointercancel', prev._ds_up     as EventListener)
      prev.style.touchAction = ''
      prev.style.overflowX   = ''
      prev.style.cursor      = ''
    }

    elRef.current = el
    if (!el) return

    let startX        = 0
    let startScrollLeft = 0
    let pointerId     = -1
    let hasDragged    = false

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      el.setPointerCapture(e.pointerId)
      pointerId       = e.pointerId
      startX          = e.clientX
      startScrollLeft = el.scrollLeft
      hasDragged      = false
      el.classList.add('drag-scrolling')
    }

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return
      if (!el.hasPointerCapture(e.pointerId)) return
      const dx = e.clientX - startX
      if (Math.abs(dx) > 4) {
        hasDragged = true
        e.preventDefault()
      }
      el.scrollLeft = startScrollLeft - dx
    }

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return
      el.classList.remove('drag-scrolling')
      pointerId = -1
      if (hasDragged) {
        const suppressClick = (ev: Event) => {
          ev.stopPropagation()
          ev.preventDefault()
        }
        el.addEventListener('click', suppressClick, { capture: true, once: true })
        setTimeout(() => el.removeEventListener('click', suppressClick, true), 300)
      }
    }

    // Store handlers on element so detach closure can reach them
    ;(el as any)._ds_down = onPointerDown
    ;(el as any)._ds_move = onPointerMove
    ;(el as any)._ds_up   = onPointerUp

    el.style.touchAction = 'pan-y'
    el.style.overflowX   = 'auto'
    el.style.cursor      = 'grab'

    el.addEventListener('pointerdown',   onPointerDown)
    el.addEventListener('pointermove',   onPointerMove, { passive: false })
    el.addEventListener('pointerup',     onPointerUp)
    el.addEventListener('pointercancel', onPointerUp)
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => attach(null)
  }, [attach])

  return attach
}
