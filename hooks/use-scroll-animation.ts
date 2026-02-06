import { useEffect, useRef } from "react"

export interface ScrollAnimationOptions {
  threshold?: number | number[]
  rootMargin?: string
  animationClass?: string
  delay?: number
  triggerOnce?: boolean
}

const defaultOptions: ScrollAnimationOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
  triggerOnce: true,
  delay: 0,
}

export const useScrollAnimation = (options: ScrollAnimationOptions = {}) => {
  const ref = useRef<HTMLElement>(null)
  const opts = { ...defaultOptions, ...options }

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add delay if specified
          if (opts.delay && opts.delay > 0) {
            setTimeout(() => {
              element.classList.add("scroll-animated")
              element.style.opacity = "1"
            }, opts.delay)
          } else {
            element.classList.add("scroll-animated")
            element.style.opacity = "1"
          }

          // Stop observing if triggerOnce is true
          if (opts.triggerOnce) {
            observer.unobserve(element)
          }
        }
      })
    }, {
      threshold: opts.threshold,
      rootMargin: opts.rootMargin,
    })

    // Set initial state
    element.style.opacity = "0"
    element.classList.add("scroll-animate")

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [opts])

  return ref
}

// Hook for animating multiple elements with staggered animation
export const useStaggeredScrollAnimation = (
  count: number,
  options: ScrollAnimationOptions = {}
) => {
  const containerRef = useRef<HTMLElement>(null)
  const opts = { ...defaultOptions, ...options }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const elements = container.querySelectorAll("[data-scroll-animate]")
    const observers = new Array(elements.length)

    elements.forEach((element, index) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const delay = index * (opts.delay || 100)
              setTimeout(() => {
                element.classList.add("scroll-animated")
                element.style.opacity = "1"
              }, delay)

              if (opts.triggerOnce) {
                observer.unobserve(element as Element)
              }
            }
          })
        },
        {
          threshold: opts.threshold,
          rootMargin: opts.rootMargin,
        }
      )

      element.style.opacity = "0"
      element.classList.add("scroll-animate")
      observer.observe(element as Element)
      observers[index] = observer
    })

    return () => {
      observers.forEach((observer) => observer?.disconnect())
    }
  }, [opts])

  return containerRef
}
