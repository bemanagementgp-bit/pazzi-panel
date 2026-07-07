import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX } from 'react-icons/fi'
import logo from '../assets/logo.png'

const links = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#productos', label: 'Pan de Papa' },
  { href: '#quienes-somos', label: 'Quiénes Somos' },
  { href: '#puntos-de-venta', label: 'Puntos de Venta' },
  { href: '#contacto', label: 'Contacto' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (href) => {
    setOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={
        scrolled
          ? { background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }
          : { background: '#FFFFFF' }
      }
    >
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.button
            onClick={() => scrollTo('#inicio')}
            whileHover={{ scale: 1.05 }}
            className="flex items-center shrink-0"
          >
            <img src={logo} alt="Pazzi Buns" className="h-10 w-auto object-contain" />
          </motion.button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <motion.button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                whileHover={{ scale: 1.04 }}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                style={{ color: '#1A1008' }}
              >
                {link.label}
              </motion.button>
            ))}
            <motion.button
              onClick={() => scrollTo('#puntos-de-venta')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="ml-3 px-5 py-2 rounded-full text-sm font-black"
              style={{ background: '#f7b404', color: '#1A1008' }}
            >
              Encontrá tu Pazzi
            </motion.button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg"
            style={{ color: '#1A1008' }}
          >
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ background: '#FFFFFF', borderTop: '1px solid rgba(0,0,0,0.08)' }}
          >
            <div className="w-full max-w-screen-xl mx-auto px-4 py-4 flex flex-col gap-1">
              {links.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => scrollTo(link.href)}
                  className="text-left px-4 py-3 rounded-xl font-semibold text-sm transition-colors"
                  style={{ color: '#1A1008' }}
                >
                  {link.label}
                </motion.button>
              ))}
              <motion.button
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: links.length * 0.05 }}
                onClick={() => scrollTo('#puntos-de-venta')}
                className="mt-2 px-4 py-3 rounded-xl font-black text-sm text-center"
                style={{ background: '#f7b404', color: '#1A1008' }}
              >
                Encontrá tu Pazzi
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
