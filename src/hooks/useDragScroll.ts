// src/hooks/useDragScroll.ts
// Reusable hook that enables mouse-drag-to-scroll on any horizontally-scrollable element.
// Usage:
//   const ref = useDragScroll<HTMLDivElement>()
//   return <div ref={ref} className="my-scroll-row">…</div>

import { useRef, useEffect } from 'react'

export function useDragScroll<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let isDown = false
    let startX = 0
    let scrollLeft = 0

    const onMouseDown = (e: MouseEvent) => {
      isDown = true
      startX = e.pageX - el.offsetLeft
      scrollLeft = el.scrollLeft
      el.classList.add('drag-scrolling')
    }

    const onMouseLeave = () => {
      isDown = false
      el.classList.remove('drag-scrolling')
    }

    const onMouseUp = () => {
      isDown = false
      el.classList.remove('drag-scrolling')
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - el.offsetLeft
      const walk = (x - startX) * 1.5 // scroll-speed multiplier
      el.scrollLeft = scrollLeft - walk
    }

    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('mouseleave', onMouseLeave)
    el.addEventListener('mouseup', onMouseUp)
    el.addEventListener('mousemove', onMouseMove)

    return () => {
      el.removeEventListener('mousedown', onMouseDown)
      el.removeEventListener('mouseleave', onMouseLeave)
      el.removeEventListener('mouseup', onMouseUp)
      el.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return ref
}
