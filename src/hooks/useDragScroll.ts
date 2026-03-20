// src/hooks/useDragScroll.ts
// Enables click-and-drag horizontal scrolling on desktop.
// mousemove and mouseup listeners are attached to window during a drag
// so fast mouse movement outside the container does not break the drag.
import { useRef, useEffect } from 'react'

export function useDragScroll<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let isDown = false
    let startX = 0
    let startScrollLeft = 0
    let hasDragged = false

    const onMouseDown = (e: MouseEvent) => {
      // Only respond to left mouse button
      if (e.button !== 0) return
      isDown = true
      hasDragged = false
      startX = e.clientX
      startScrollLeft = el.scrollLeft
      el.classList.add('drag-scrolling')
      e.preventDefault()
      // Attach move and up to window so fast drags are not lost
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      const dx = e.clientX - startX
      if (Math.abs(dx) > 3) {
        hasDragged = true
        e.preventDefault()
      }
      el.scrollLeft = startScrollLeft - dx
    }

    const onMouseUp = () => {
      isDown = false
      el.classList.remove('drag-scrolling')
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      if (hasDragged) {
        // Suppress the click that fires immediately after mouseup
        const suppressClick = (ev: Event) => {
          ev.stopPropagation()
          ev.preventDefault()
          el.removeEventListener('click', suppressClick, true)
        }
        el.addEventListener('click', suppressClick, true)
        setTimeout(() => {
          el.removeEventListener('click', suppressClick, true)
        }, 300)
      }
    }

    el.addEventListener('mousedown', onMouseDown)

    return () => {
      el.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return ref
}
