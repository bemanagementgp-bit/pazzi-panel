import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import homeFondo from '../assets/home-fondo.png'
import homeFondoMobile from '../assets/home-fondo-mobile.png'
import burgerImg from '../assets/Hamburguesa_Smash 1.jpg'

const INTERVAL = 5000

function SlidePicante() {
  return (
    <div className="w-full h-full flex overflow-hidden" style={{ background: '#CC2200' }}>
      <div className="flex-1 flex flex-col justify-center px-10 lg:px-20 py-12 z-10 min-w-0">
        <p
          className="text-white uppercase leading-none mb-1"
          style={{ fontFamily: 'Chunko, sans-serif', fontSize: 'clamp(22px, 3.5vw, 52px)' }}
        >
          Animate a el
        </p>
        <p
          className="text-white leading-none"
          style={{ fontFamily: 'Veni, sans-serif', fontSize: 'clamp(60px, 10vw, 130px)' }}
        >
          Picante
        </p>
        <div className="mt-3 h-1 w-40 rounded-full bg-white/80" />
      </div>
      <div className="flex-1 relative overflow-hidden">
        <img
          src={burgerImg}
          alt="Pan Picante"
          className="w-full h-full object-cover object-center"
        />
      </div>
    </div>
  )
}

function SlideImage() {
  return (
    <>
      <img src={homeFondoMobile} alt="Pazzi Buns" className="w-full h-full object-cover block md:hidden" />
      <img src={homeFondo} alt="Pazzi Buns" className="w-full h-full object-cover hidden md:block" />
    </>
  )
}

function SlideNuevo() {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center px-8 py-12"
      style={{ background: '#CC2200' }}
    >
      <p
        className="text-white uppercase text-center leading-none"
        style={{ fontFamily: 'Chunko, sans-serif', fontSize: 'clamp(42px, 8vw, 120px)' }}
      >
        Nuevo
      </p>
      <p
        className="text-white uppercase text-center leading-none"
        style={{ fontFamily: 'Chunko, sans-serif', fontSize: 'clamp(24px, 5vw, 80px)' }}
      >
        Pan de Papa
      </p>
      <p
        className="text-white text-center leading-none"
        style={{ fontFamily: 'Veni, sans-serif', fontSize: 'clamp(56px, 10vw, 130px)' }}
      >
        Picante
      </p>
      <div className="mt-4 h-1 w-56 rounded-full bg-white/70" />
    </div>
  )
}

const slides = [
  { id: 0, Component: SlidePicante },
  { id: 1, Component: SlideImage },
  { id: 2, Component: SlideNuevo },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const goTo = useCallback((idx) => {
    setDirection(idx >= current ? 1 : -1)
    setCurrent(idx)
  }, [current])

  useEffect(() => {
    const t = setTimeout(() => {
      setDirection(1)
      setCurrent((c) => (c + 1) % slides.length)
    }, INTERVAL)
    return () => clearTimeout(t)
  }, [current])

  const { Component } = slides[current]

  return (
    <section id="inicio" className="w-full relative overflow-hidden" style={{ height: 'min(88vh, 680px)' }}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -50 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Component />
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 28 : 8,
              height: 8,
              background: i === current ? '#f7b404' : 'rgba(255,255,255,0.5)',
            }}
          />
        ))}
      </div>
    </section>
  )
}
