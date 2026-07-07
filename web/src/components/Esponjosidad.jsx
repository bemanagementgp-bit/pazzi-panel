import { useRef, useState, useCallback } from 'react'
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion'
import panImg from '../assets/pan-png.png'

const ESTADO = { IDLE: 'idle', PRESSING: 'pressing', RELEASED: 'released' }

const statusText = {
  [ESTADO.IDLE]:     'Apretá acá 👆',
  [ESTADO.PRESSING]: '¡Qué esponjoso! 🤩',
  [ESTADO.RELEASED]: '¡Volvió solo! ✨',
}

export default function Esponjosidad() {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: '-80px' })

  const pressure = useMotionValue(0)
  const scaleY        = useTransform(pressure, [0, 1], [1, 0.6])
  const scaleX        = useTransform(pressure, [0, 1], [1, 1.3])
  const translateY    = useTransform(pressure, [0, 1], [0, 18])
  const shadowScaleX  = useTransform(pressure, [0, 1], [1, 1.8])
  const shadowOpacity = useTransform(pressure, [0, 1], [0.1, 0.5])

  const [estado, setEstado] = useState(ESTADO.IDLE)
  const startClientY = useRef(null)
  const animRef = useRef(null)
  const MAX_PX = 90

  const startPress = useCallback((clientY) => {
    if (animRef.current) animRef.current.stop()
    startClientY.current = clientY
    setEstado(ESTADO.PRESSING)
  }, [])

  const movePress = useCallback((clientY) => {
    if (startClientY.current === null) return
    const delta = Math.max(0, clientY - startClientY.current)
    pressure.set(Math.min(1, delta / MAX_PX))
  }, [pressure])

  const endPress = useCallback(() => {
    startClientY.current = null
    setEstado(ESTADO.RELEASED)
    animRef.current = animate(pressure, 0, { type: 'spring', stiffness: 300, damping: 15 })
    setTimeout(() => setEstado(ESTADO.IDLE), 1200)
  }, [pressure])

  const onMouseDown  = (e) => startPress(e.clientY)
  const onMouseMove  = (e) => { if (estado !== ESTADO.PRESSING) return; movePress(e.clientY) }
  const onMouseUp    = () => { if (estado === ESTADO.PRESSING) endPress() }
  const onMouseLeave = () => { if (estado === ESTADO.PRESSING) endPress() }
  const onTouchStart = (e) => startPress(e.touches[0].clientY)
  const onTouchMove  = (e) => { e.preventDefault(); movePress(e.touches[0].clientY) }
  const onTouchEnd   = () => endPress()

  return (
    <section
      ref={sectionRef}
      className="w-full py-24 overflow-hidden"
      style={{
        background: '#E2DFD0',
        boxShadow: 'inset 0 20px 50px rgba(0,0,0,0.18), inset 0 -20px 50px rgba(0,0,0,0.10)',
      }}
    >
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Pan interactivo */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center select-none"
          >
            <div
              className="relative flex flex-col items-center"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              style={{ cursor: estado === ESTADO.PRESSING ? 'grabbing' : 'grab', touchAction: 'none' }}
            >
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  width: '60%', height: '16px',
                  background: 'rgba(0,0,0,0.8)', filter: 'blur(14px)',
                  scaleX: shadowScaleX, opacity: shadowOpacity,
                  transformOrigin: 'center', zIndex: 0,
                }}
              />
              <motion.img
                src={panImg}
                alt="Pan de Papa Pazzi"
                draggable={false}
                className="w-72 sm:w-80 lg:w-96 h-auto object-contain relative z-10"
                style={{ scaleY, scaleX, y: translateY, transformOrigin: 'bottom center' }}
              />
            </div>

            <motion.div
              key={estado}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-8 px-5 py-2.5 rounded-full text-sm font-bold"
              style={{
                background: estado === ESTADO.PRESSING ? '#f7b404' : 'rgba(247,180,4,0.15)',
                color: estado === ESTADO.PRESSING ? '#0A0A0A' : '#555',
                transition: 'background 0.2s',
              }}
            >
              {statusText[estado]}
            </motion.div>
          </motion.div>

          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col"
          >
            <h2
              className="text-4xl sm:text-5xl font-black mb-6 leading-tight"
              style={{ fontFamily: 'Chunko, sans-serif', color: '#1A1008' }}
            >
              Probá la{' '}
              <span style={{ color: '#f7b404' }}>esponjosidad</span>
            </h2>

            <p className="text-lg leading-relaxed" style={{ color: '#555' }}>
              Pazzi es súper fluffy. Así de suave es cada uno de nuestros panes. Una textura
              que solo se logra con el proceso artesanal que nos hace únicos desde 2019.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
