// src/hooks/useDragScroll.ts
// Enables click-and-drag horizontal scrolling on desktop.
// Uses getBoundingClientRect() — NOT offsetLeft — for correct position
// calculation regardless of DOM nesting depth.
import { useRef, useEffect } from 'react'

export function useDragScroll<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let isDown = false
    let startX = 0
    let scrollLeft = 0
    let hasDragged = false

    const onMouseDown = (e: MouseEvent) => {
      isDown = true
      hasDragged = false
      startX = e.pageX - el.getBoundingClientRect().left
      scrollLeft = el.scrollLeft
      el.classList.add('drag-scrolling')
    }

    const onMouseUp = () => {
      if (hasDragged) {
        const suppressClick = (ev: MouseEvent) => {
          ev.stopPropagation()
          ev.preventDefault()
          el.removeEventListener('click', suppressClick, true)
        }
        el.addEventListener('click', suppressClick, true)
      }
      isDown = false
      el.classList.remove('drag-scrolling')
    }

    const onMouseLeave = () => {
      isDown = false
      el.classList.remove('drag-scrolling')
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      const x = e.pageX - el.getBoundingClientRect().left
      const walk = (x - startX) * 1.2
      if (Math.abs(walk) > 4) {
        hasDragged = true
        e.preventDefault()
      }
      el.scrollLeft = scrollLeft - walk
    }

    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('mouseup', onMouseUp)
    el.addEventListener('mouseleave', onMouseLeave)
    el.addEventListener('mousemove', onMouseMove)

    return () => {
      el.removeEventListener('mousedown', onMouseDown)
      el.removeEventListener('mouseup', onMouseUp)
      el.removeEventListener('mouseleave', onMouseLeave)
      el.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return ref
}
