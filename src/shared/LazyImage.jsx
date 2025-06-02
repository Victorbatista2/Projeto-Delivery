"use client"

import { useState, useRef, useEffect } from "react"
import "./LazyImage.css"

const LazyImage = ({ src, alt, className = "", placeholder = "/placeholder.svg?height=150&width=250", ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoaded(true)
  }

  return (
    <div ref={imgRef} className={`lazy-image-container ${className}`} {...props}>
      {!isInView && (
        <div className="lazy-image-placeholder">
          <div className="lazy-image-skeleton"></div>
        </div>
      )}

      {isInView && (
        <img
          src={hasError ? placeholder : src}
          alt={alt}
          className={`lazy-image ${isLoaded ? "loaded" : "loading"}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  )
}

export default LazyImage
