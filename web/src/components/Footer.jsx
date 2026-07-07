import { motion } from 'framer-motion'
import { FiInstagram } from 'react-icons/fi'
import logo from '../assets/logo.png'

const links = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#productos', label: 'Pan de Papa' },
  { href: '#quienes-somos', label: 'Quiénes Somos' },
  { href: '#puntos-de-venta', label: 'Puntos de Venta' },
  { href: '#contacto', label: 'Contacto' },
]

export default function Footer() {
  const scrollTo = (href) => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <footer className="relative overflow-hidden w-full" style={{ background: '#0D0700' }}>
      {/* Top accent */}
      <div className="h-1 w-full" style={{ background: '#f7b404' }} />

      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <motion.button whileHover={{ scale: 1.04 }} onClick={() => scrollTo('#inicio')} className="inline-block mb-4">
              <img src={logo} alt="Pazzi Buns" className="h-10 w-auto object-contain" />
            </motion.button>
            <p className="text-sm font-bold mb-2" style={{ color: '#f7b404' }}>Pan de Papa Artesanal</p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              La empresa líder en Pan de Papa Artesanal de Argentina. Desde 2019 hacemos el pan más rico y esponjoso del país.
            </p>
            <p className="mt-3 text-sm font-black italic" style={{ color: '#f7b404' }}>
              "¡Pazzi va con todo!"
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Navegación
            </h4>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => scrollTo(link.href)}
                    className="text-sm font-medium transition-colors"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#f7b404'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                  >
                    {link.label}
                  </motion.button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Seguinos
            </h4>
            <motion.a
              href="https://instagram.com/pazzi_buns"
              target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              className="inline-flex items-center gap-3 px-4 py-3 rounded-xl mb-6"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#E1306C' }}>
                <FiInstagram size={15} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">@pazzi_buns</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Instagram</p>
              </div>
            </motion.a>

            <div>
              <p className="text-xs mb-3 font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Productos
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['Clásico', 'Queso', 'Semilla', 'Vegano', 'Chips', 'PBT', 'Molde'].map((p) => (
                  <span
                    key={p}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(247,180,4,0.12)', color: '#f7b404' }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.25)' }}
        >
          <span>© {new Date().getFullYear()} Pazzi Buns Argentina. Todos los derechos reservados.</span>
          <span className="flex items-center gap-1">
            Hecho con <span style={{ color: '#f7b404' }}>♥</span> en Argentina
          </span>
        </div>
      </div>
    </footer>
  )
}
