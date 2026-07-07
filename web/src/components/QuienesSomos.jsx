import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FiTool, FiAward, FiThumbsUp, FiFlag } from 'react-icons/fi'

const valores = [
  { Icon: FiTool,     titulo: 'Proceso Artesanal',   desc: 'Cada pan se elabora siguiendo procesos artesanales que preservan la textura y el sabor auténtico.' },
  { Icon: FiAward,    titulo: 'Calidad Premium',      desc: 'Usamos la mejor harina, papa seleccionada y materia prima de primera calidad sin excepciones.' },
  { Icon: FiThumbsUp, titulo: 'Con Papa, Todo Mejor', desc: 'La papa le da una suavidad y esponjosidad inigualable. Nuestro diferencial desde siempre.' },
  { Icon: FiFlag,     titulo: '100% Argentino',       desc: 'Nacimos en Argentina, crecemos en Argentina. Apoyamos el producto nacional con orgullo.' },
]

export default function QuienesSomos() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      id="quienes-somos"
      className="w-full py-24"
      style={{ background: '#FFFBEB' }}
    >
      <div ref={ref} className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6"
          style={{ background: 'rgba(247,180,4,0.15)', color: '#1A1008', border: '1px solid rgba(247,180,4,0.4)' }}
        >
          Nuestra historia
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl font-black text-stone-900 mb-6 leading-tight"
          style={{ fontFamily: 'Chunko, sans-serif' }}
        >
          Líderes en{' '}
          <span style={{ color: '#f7b404' }}>Pan de Papa</span>{' '}
          Artesanal
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4 text-stone-600 leading-relaxed mb-12 max-w-3xl"
        >
          <p className="text-base">
            <strong className="text-stone-800">Pazzi Buns es hoy la empresa líder en Pan de Papa Artesanal de Argentina.</strong>{' '}
            Desde 2019, transformamos la forma en que los argentinos disfrutan del pan.
          </p>
          <p className="text-base">
            Nuestra misión es simple: hacer el mejor pan de papa del mercado, con ingredientes de calidad premium
            y el proceso artesanal que nos distingue. Sin conservantes artificiales, sin aditivos innecesarios.
            Solo papa, harina y amor.
          </p>
          <p className="text-base">
            Hoy contamos con <strong className="text-stone-800">más de 1000 puntos de venta</strong> en todo el país,
            desde CABA hasta Bariloche, pasando por la Costa Atlántica, Córdoba y San Luis.
            Porque <em className="font-bold" style={{ color: '#1A1008' }}>¡Pazzi va con todo!</em>
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {valores.map((v, i) => {
            const { Icon } = v
            return (
              <motion.div
                key={v.titulo}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.3 + i * 0.1 }}
                className="flex gap-4 items-start p-5 rounded-2xl"
                style={{ background: 'rgba(247,180,4,0.07)', border: '1px solid rgba(247,180,4,0.2)' }}
              >
                <div className="mt-0.5 shrink-0 w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: '#f7b404' }}>
                  <Icon size={18} style={{ color: '#1A1008' }} />
                </div>
                <div>
                  <h4 className="font-black text-sm text-stone-900 mb-1">{v.titulo}</h4>
                  <p className="text-sm text-stone-500 leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
