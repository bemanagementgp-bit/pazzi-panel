import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FiInstagram } from 'react-icons/fi'
import imgClasico   from '../assets/Hamburguesa_Simple.jpg'
import imgQueso     from '../assets/Hamburguesa_Con Queso.jpg'
import imgSemilla   from '../assets/Hamburguesa_Con Semillas.jpg'
import imgVegano    from '../assets/Hamburguesa Avena.jpg'
import imgChips     from '../assets/Chips_Simple.jpg'
import imgChipsQ    from '../assets/Chips_Con Queso_1.jpg'
import imgPBT       from '../assets/Panchos_Simple.jpg'
import imgMolde     from '../assets/Molde_1.jpg'
import imgLomitero  from '../assets/Lomitero_1.jpg'
import imgArabe     from '../assets/Arabe_1.jpg'
import imgPebete    from '../assets/Pebete.jpg'
import imgSmash     from '../assets/Hamburguesa_Smash 1.jpg'

const productos = [
  { id: 1,  nombre: 'Pan de Papa Clásico',  descripcion: 'El original. Suave, esponjoso y con el sabor inconfundible a papa que lo hace único.', img: imgClasico,  tag: 'El más vendido' },
  { id: 2,  nombre: 'Pan de Papa Queso',    descripcion: 'Con queso rallado integrado en la masa. Para los amantes del queso y el pan artesanal.', img: imgQueso,    tag: 'Favorito' },
  { id: 3,  nombre: 'Pan de Papa Semilla',  descripcion: 'Con mezcla de semillas de sésamo, girasol y lino. Textura extra, sabor premium.', img: imgSemilla,  tag: 'Artesanal' },
  { id: 4,  nombre: 'Pan de Papa Vegano',   descripcion: 'Sin ingredientes de origen animal. Igual de esponjoso, igual de rico. Apto veganos.', img: imgVegano,   tag: 'Vegano' },
  { id: 5,  nombre: 'Lomitero',             descripcion: 'El pan ideal para el lomo perfecto. Tamaño y esponjosidad pensados para tu lomito favorito.', img: imgLomitero, tag: 'Clásico' },
  { id: 6,  nombre: 'Pan Árabe',            descripcion: 'Liviano y flexible. Perfecto para wraps, shawarmas o cualquier creación que se te ocurra.', img: imgArabe,    tag: 'Versátil' },
  { id: 7,  nombre: 'Pebete',               descripcion: 'El pebete de papa que buscabas. Suave, redondo y con todo el sabor artesanal de Pazzi.', img: imgPebete,   tag: 'Clásico' },
  { id: 8,  nombre: 'Smash Burger',         descripcion: 'Diseñado para el smash. Aguanta la presión, absorbe los jugos y lleva el resultado al siguiente nivel.', img: imgSmash,    tag: 'Trending' },
  { id: 9,  nombre: 'Chips Clásico',        descripcion: 'Chips de pan de papa artesanal. Crocantes, livianos y perfectos para snackear.', img: imgChips,    tag: 'Snack' },
  { id: 10, nombre: 'Chips Queso',          descripcion: 'Chips de pan de papa con sabor a queso intenso. El snack que no podés parar de comer.', img: imgChipsQ,   tag: 'Snack' },
  { id: 11, nombre: 'PBT',                  descripcion: 'El pan ideal para tu sándwich perfecto. Grande, esponjoso y con todo el sabor Pazzi.', img: imgPBT,      tag: 'Nuevo' },
  { id: 12, nombre: 'Pan de Molde',         descripcion: 'Pan de papa en formato molde. Ideal para tostadas, sándwiches y todo lo que imagines.', img: imgMolde,    tag: 'Familiar' },
]

function ProductCard({ producto, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 4) * 0.07, ease: 'easeOut' }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.10)' }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-amber-100 cursor-pointer"
    >
      <div
        className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-black"
        style={{ background: '#f7b404', color: '#1A1008' }}
      >
        {producto.tag}
      </div>

      <div className="relative h-48 flex items-center justify-center overflow-hidden" style={{ background: '#FFF8E1' }}>
        <motion.img
          src={producto.img}
          alt={producto.nombre}
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.35 }}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-5">
        <h3 className="font-black text-base text-stone-900 mb-2 leading-tight">{producto.nombre}</h3>
        <p className="text-sm text-stone-500 leading-relaxed">{producto.descripcion}</p>
        <div
          className="mt-4 h-1 rounded-full w-10 group-hover:w-full transition-all duration-500"
          style={{ background: '#f7b404' }}
        />
      </div>
    </motion.div>
  )
}

export default function Productos() {
  const titleRef = useRef(null)
  const titleInView = useInView(titleRef, { once: true, margin: '-60px' })

  return (
    <section id="productos" className="w-full py-24" style={{ background: '#FFFBEB' }}>
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={titleRef} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4"
            style={{ background: 'rgba(247,180,4,0.15)', color: '#1A1008', border: '1px solid rgba(247,180,4,0.4)' }}
          >
            Nuestras variedades
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-stone-900 mb-4"
            style={{ fontFamily: 'Chunko, sans-serif' }}
          >
            Pan de Papa{' '}
            <span style={{ color: '#f7b404' }}>Artesanal</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-stone-500 max-w-2xl mx-auto mb-8"
          >
            Cada variedad está elaborada con ingredientes seleccionados y el proceso artesanal que nos hace únicos.{' '}
            <strong className="text-stone-700">¡Pazzi va con todo!</strong>
          </motion.p>

          <motion.a
            href="https://www.instagram.com/pazzi_buns"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 16 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm"
            style={{ background: '#1A1008', color: '#ffffff' }}
          >
            <FiInstagram size={18} />
            Ver más en Instagram
          </motion.a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productos.map((p, i) => (
            <ProductCard key={p.id} producto={p} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-14"
        >
          <p className="text-stone-500 mb-4 font-medium">¿Querés probarlos?</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => document.querySelector('#puntos-de-venta')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-black text-base"
            style={{ background: '#f7b404', color: '#1A1008' }}
          >
            Encontrá dónde comprarlos
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
