import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { FiX, FiCheck } from 'react-icons/fi'

const ZONAS = ['CABA', 'Zona Norte', 'Zona Oeste', 'Zona Sur', 'Costa Atlántica', 'Mar del Plata', 'Córdoba', 'San Luis', 'Bariloche']

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL

export default function ModalRegistro({ isOpen, onClose }) {
  const [form, setForm] = useState({ nombre: '', direccion: '', zona: '', telefono: '', email: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.direccion.trim()) e.direccion = 'Requerido'
    if (!form.zona) e.zona = 'Seleccioná una zona'
    if (!form.telefono.trim()) e.telefono = 'Requerido'
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Email inválido'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    setServerError(false)
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams(form),
      })
      setSent(true)
    } catch {
      setServerError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => { setSent(false); setLoading(false); setServerError(false); setForm({ nombre: '', direccion: '', zona: '', telefono: '', email: '' }); setErrors({}) }, 300)
  }

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors bg-white ${errors[field] ? 'border-red-400' : 'border-stone-200 focus:border-yellow-400'}`

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 9999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between" style={{ background: '#1A1008' }}>
              <div>
                <h3 className="text-xl font-black text-white">Registrá tu negocio</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Sumate a la familia Pazzi</p>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#f7b404' }}>
                    <FiCheck size={28} style={{ color: '#1A1008' }} />
                  </div>
                  <h4 className="text-xl font-black text-stone-900 mb-2">¡Recibimos tu registro!</h4>
                  <p className="text-stone-500 text-sm">
                    Nos comunicaremos con vos en las próximas 48hs para coordinar la incorporación a nuestra red de puntos de venta.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    onClick={handleClose}
                    className="mt-6 px-6 py-3 rounded-full font-black text-sm"
                    style={{ background: '#f7b404', color: '#1A1008' }}
                  >
                    Cerrar
                  </motion.button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">Nombre del negocio *</label>
                    <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Almacén La Esquina" className={inputClass('nombre')} />
                    {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">Dirección *</label>
                    <input type="text" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Av. Corrientes 1234, CABA" className={inputClass('direccion')} />
                    {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">Zona *</label>
                    <select value={form.zona} onChange={(e) => setForm({ ...form, zona: e.target.value })} className={inputClass('zona')}>
                      <option value="">Seleccioná una zona</option>
                      {ZONAS.map((z) => <option key={z} value={z}>{z}</option>)}
                    </select>
                    {errors.zona && <p className="text-red-500 text-xs mt-1">{errors.zona}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1">Teléfono *</label>
                      <input type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="+54 11 ..." className={inputClass('telefono')} />
                      {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1">Email *</label>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tu@email.com" className={inputClass('email')} />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={loading ? {} : { scale: 1.02 }} whileTap={loading ? {} : { scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl font-black text-base transition-opacity"
                    style={{ background: '#f7b404', color: '#1A1008', opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? 'Enviando...' : 'Registrar mi negocio'}
                  </motion.button>

                  {serverError && (
                    <p className="text-red-500 text-xs text-center mt-1">
                      Hubo un error al enviar. Intentá de nuevo.
                    </p>
                  )}
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
