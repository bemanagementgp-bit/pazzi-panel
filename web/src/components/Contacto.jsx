import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { FiInstagram, FiMessageCircle, FiSend, FiCheck } from 'react-icons/fi'

export default function Contacto() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', tipo: 'Cliente', consulta: '' })
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Email inválido'
    if (!form.consulta.trim()) e.consulta = 'Contanos tu consulta'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSent(true)
  }

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors bg-white ${errors[field] ? 'border-red-400' : 'border-stone-200 focus:border-yellow-400'}`

  return (
    <section
      id="contacto"
      ref={ref}
      className="w-full py-24 relative overflow-hidden"
      style={{ background: '#1A1008' }}
    >

      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4"
            style={{ background: 'rgba(247,180,4,0.12)', color: '#f7b404', border: '1px solid rgba(247,180,4,0.25)' }}
          >
            Contacto
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-white mb-4"
          >
            ¿Tenés alguna{' '}
            <span style={{ color: '#f7b404' }}>consulta</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg max-w-xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            Escribinos y te respondemos a la brevedad. También podés encontrarnos en Instagram.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Social */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 flex flex-col gap-6 justify-center"
          >
            <div>
              <h3 className="text-xl font-black text-white mb-2">¡Seguinos!</h3>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                En Instagram compartimos novedades, recetas y las últimas noticias de Pazzi Buns.
              </p>
            </div>

            <motion.a
              href="https://instagram.com/pazzi_buns"
              target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.03, x: 4 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-4 p-5 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#E1306C' }}>
                <FiInstagram size={22} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">@pazzi_buns</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Seguinos en Instagram</p>
              </div>
            </motion.a>

            <motion.a
              href="https://wa.me/5491100000000?text=Hola%20Pazzi%20Buns!"
              target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.03, x: 4 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-4 p-5 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#25D366' }}>
                <FiMessageCircle size={22} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">WhatsApp</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Escribinos directo</p>
              </div>
            </motion.a>

            <div
              className="p-5 rounded-2xl text-center"
              style={{ background: 'rgba(247,180,4,0.08)', border: '1px solid rgba(247,180,4,0.2)' }}
            >
              <p className="font-black italic text-lg" style={{ color: '#f7b404' }}>"¡Pazzi va con todo!"</p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3 bg-white rounded-3xl p-8 shadow-2xl"
          >
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#f7b404' }}>
                  <FiCheck size={28} style={{ color: '#1A1008' }} />
                </div>
                <h4 className="text-2xl font-black text-stone-900 mb-2">¡Mensaje enviado!</h4>
                <p className="text-stone-500">Te respondemos a la brevedad. ¡Gracias por contactarnos!</p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setSent(false)}
                  className="mt-6 px-6 py-3 rounded-full font-black text-sm"
                  style={{ background: '#f7b404', color: '#1A1008' }}
                >
                  Enviar otro mensaje
                </motion.button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-black text-stone-900 mb-6">Envianos tu consulta</h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">Nombre *</label>
                    <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Tu nombre" className={inputClass('nombre')} />
                    {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">Email *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tu@email.com" className={inputClass('email')} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">Teléfono</label>
                    <input type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="+54 11 ..." className={inputClass('telefono')} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">Soy</label>
                    <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className={inputClass('tipo')}>
                      <option>Cliente</option>
                      <option>Comercio</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Consulta *</label>
                  <textarea value={form.consulta} onChange={(e) => setForm({ ...form, consulta: e.target.value })} placeholder="¿En qué podemos ayudarte?" rows={4} className={inputClass('consulta') + ' resize-none'} />
                  {errors.consulta && <p className="text-red-500 text-xs mt-1">{errors.consulta}</p>}
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-2"
                  style={{ background: '#f7b404', color: '#1A1008' }}
                >
                  <FiSend size={18} />
                  Enviar mensaje
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
