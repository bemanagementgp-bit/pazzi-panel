import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FiArrowRight, FiPackage, FiStar } from 'react-icons/fi'
import imgClasico from '../assets/Hamburguesa_Simple.jpg'
import imgQueso from '../assets/Hamburguesa_Con Queso.jpg'
import imgSemilla from '../assets/Hamburguesa_Con Semillas.jpg'
import imgVegano from '../assets/Hamburguesa Avena.jpg'
import imgChips from '../assets/Chips_Simple.jpg'
import imgChipsQ from '../assets/Chips_Con Queso_1.jpg'
import imgPBT from '../assets/Panchos_Simple.jpg'
import imgMolde from '../assets/Molde_1.jpg'

const productos = [
  { id: 1, nombre: 'Pan de papa clásico', descripcion: 'El original. Suave, esponjoso y con el sabor inconfundible a papa.', img: imgClasico, tag: 'Más vendido' },
  { id: 2, nombre: 'Pan de papa con queso', descripcion: 'Con queso rallado integrado en la masa. Para los amantes del queso.', img: imgQueso, tag: 'Favorito' },
  { id: 3, nombre: 'Pan de papa con semillas', descripcion: 'Con sésamo, girasol y lino. Textura extra, sabor premium.', img: imgSemilla, tag: 'Artesanal' },
  { id: 4, nombre: 'Pan de papa vegano', descripcion: 'Sin ingredientes de origen animal. Igual de esponjoso, igual de rico.', img: imgVegano, tag: 'Vegano' },
  { id: 5, nombre: 'Chips clásicos', descripcion: 'Chips de pan de papa artesanal. Crocantes, livianos y para snackear.', img: imgChips, tag: 'Snack' },
  { id: 6, nombre: 'Chips con queso', descripcion: 'Chips de pan de papa con sabor a queso intenso. Adictivos.', img: imgChipsQ, tag: 'Snack' },
  { id: 7, nombre: 'PBT', descripcion: 'El pan ideal para tu sándwich perfecto. Grande, esponjoso y con sabor Pazzi.', img: imgPBT, tag: 'Nuevo' },
  { id: 8, nombre: 'Pan de molde', descripcion: 'Pan de papa en formato molde. Ideal para tostadas y sándwiches.', img: imgMolde, tag: 'Familiar' },
]

function ProductCard({ producto, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -8, rotate: index % 2 === 0 ? -0.5 : 0.5 }}
      className="group relative bg-paper border-[1.5px] border-ink rounded-[28px] overflow-hidden flex flex-col"
      style={{ boxShadow: '8px 8px 0 var(--ink)' }}
    >
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: 'var(--cream)' }}>
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-10" style={{ background: 'var(--yellow)' }} />
        <span
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-xs font-black"
          style={{ background: 'var(--paper)', color: 'var(--ink)', border: '1.5px solid var(--ink)' }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <img
          src={producto.img}
          alt={producto.nombre}
          className="relative z-[1] w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className="absolute top-3 left-3 z-10 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.15em] rounded-full"
          style={{ background: 'var(--ink)', color: 'var(--yellow)' }}
        >
          {producto.tag}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1 border-t-[3px]" style={{ borderColor: 'var(--yellow)' }}>
        <h3 className="font-black text-base uppercase tracking-tight text-ink mb-2 leading-tight">
          {producto.nombre}
        </h3>
        <p className="text-sm text-ink-60 leading-relaxed font-medium flex-1">
          {producto.descripcion}
        </p>
      </div>
    </motion.article>
  )
}

export default function Productos() {
  const titleRef = useRef(null)
  const titleInView = useInView(titleRef, { once: true, margin: '-60px' })

  return (
    <section id="productos" className="w-full relative overflow-hidden py-16 sm:py-24" style={{ background: 'var(--cream)' }}>
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(var(--ink) 1px, transparent 1px), linear-gradient(90deg, var(--ink) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div ref={titleRef} className="mb-12 sm:mb-16 grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7 max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4 }}
              className="eyebrow mb-4 px-4 py-2 rounded-full inline-flex items-center gap-2"
              style={{ background: 'var(--yellow)', border: '2px solid var(--ink)' }}
            >
              <FiPackage size={14} />
              Nuestras variedades
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="h-display text-4xl sm:text-5xl lg:text-6xl text-ink mt-3 mb-4"
            >
              Pan de papa
              <br />
              <span className="mark-yellow"><span style={{ position: 'relative', zIndex: 1 }}>artesanal.</span></span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-base sm:text-lg text-ink-60 font-medium max-w-xl"
            >
              Estos son algunos de los productos de la familia pazzi
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, rotate: 6, y: 20 }}
            animate={titleInView ? { opacity: 1, rotate: -2, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="hidden lg:flex lg:col-span-5 justify-end"
          >
            <div className="relative w-full max-w-sm rounded-[32px] p-5" style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
              <p className="text-xs font-black uppercase tracking-[0.18em] mb-3" style={{ color: 'var(--yellow)' }}>Familia Pazzi</p>
              <div className="flex items-end justify-between gap-5">
                <p className="h-display text-5xl leading-none">8</p>
                <p className="text-sm font-bold uppercase leading-tight text-right">productos para cada burger, pancho o mesa.</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {productos.map((p, i) => (
            <ProductCard key={p.id} producto={p} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[28px] p-5 sm:p-6"
          style={{ background: 'var(--paper)', border: '1.5px solid var(--ink)', boxShadow: '8px 8px 0 var(--yellow)' }}
        >
          <p className="font-bold text-ink uppercase text-sm tracking-[0.1em] inline-flex items-center gap-2">
            <FiStar size={16} style={{ color: 'var(--yellow)', fill: 'var(--yellow)' }} />
            ¿Querés probarlos?
          </p>
          <button
            onClick={() => document.querySelector('#puntos-de-venta')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary"
          >
            Encontrá dónde comprarlos <FiArrowRight />
          </button>
        </motion.div>
      </div>
    </section>
  )
}
