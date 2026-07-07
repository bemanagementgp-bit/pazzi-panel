import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { FiMapPin, FiNavigation, FiPlus } from 'react-icons/fi'
import ModalRegistro from './ModalRegistro'
import puntosData from '../../data/puntos-de-venta.json'

const ZONAS = ['Todas', 'CABA', 'Zona Norte', 'Zona Oeste', 'Zona Sur', 'Costa Atlántica', 'Mar del Plata', 'Córdoba', 'San Luis', 'Bariloche']

function calcDist(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function PuntosDeVenta() {
  const sectionRef = useRef(null)
  const mapRef = useRef(null)
  const leafletMap = useRef(null)
  const markersLayer = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: '-60px' })

  const [zonaActiva, setZonaActiva] = useState('Todas')
  const [userPos, setUserPos] = useState(null)
  const [locating, setLocating] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [nearbyCount, setNearbyCount] = useState(null)

  const filtered = zonaActiva === 'Todas' ? puntosData : puntosData.filter((p) => p.zona === zonaActiva)
  const sorted = userPos
    ? [...filtered].sort((a, b) =>
        calcDist(userPos.lat, userPos.lng, a.lat, a.lng) - calcDist(userPos.lat, userPos.lng, b.lat, b.lng)
      )
    : filtered

  const geolocate = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        setUserPos({ lat, lng })
        setNearbyCount(puntosData.filter((p) => calcDist(lat, lng, p.lat, p.lng) < 20).length)
        setLocating(false)
        leafletMap.current?.setView([lat, lng], 12)
      },
      () => setLocating(false)
    )
  }

  // Init Leaflet once section is visible
  useEffect(() => {
    if (!inView || leafletMap.current) return
    let mounted = true

    const init = async () => {
      try {
        const L = await import('leaflet')
        await import('leaflet/dist/leaflet.css')
        if (!mounted || !mapRef.current) return

        const map = L.map(mapRef.current, { center: [-38.4, -63.6], zoom: 5 })
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map)
        leafletMap.current = map
        markersLayer.current = L.layerGroup().addTo(map)
        addMarkers(L, puntosData)
      } catch (e) { console.error(e) }
    }

    init()
    return () => { mounted = false }
  }, [inView])

  const makeIcon = (L) =>
    L.divIcon({
      html: `<div style="width:28px;height:28px;background:#f7b404;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #1A1008;box-shadow:0 3px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;">
        <span style="transform:rotate(45deg);font-size:12px;font-weight:900;color:#1A1008;display:block;text-align:center;line-height:24px;">P</span>
      </div>`,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -32],
    })

  const makePopup = (p) =>
    `<div style="font-family:Montserrat,sans-serif;min-width:160px;padding:4px">
      <div style="font-weight:900;font-size:14px;color:#1A1008;margin-bottom:4px">${p.nombre}</div>
      <div style="font-size:12px;color:#666;margin-bottom:2px">📍 ${p.direccion}</div>
      <div style="display:inline-block;background:#f7b404;color:#1A1008;font-size:11px;font-weight:700;padding:2px 8px;border-radius:9999px;margin-top:6px">${p.zona}</div>
    </div>`

  const addMarkers = (L, points) => {
    if (!markersLayer.current) return
    markersLayer.current.clearLayers()
    const icon = makeIcon(L)
    points.forEach((p) => {
      L.marker([p.lat, p.lng], { icon }).bindPopup(makePopup(p), { maxWidth: 260 }).addTo(markersLayer.current)
    })
  }

  // Update markers when filter changes
  useEffect(() => {
    if (!leafletMap.current) return
    import('leaflet').then((L) => {
      addMarkers(L, filtered)
      if (filtered.length > 0 && zonaActiva !== 'Todas') {
        const bounds = L.latLngBounds(filtered.map((p) => [p.lat, p.lng]))
        leafletMap.current.fitBounds(bounds, { padding: [40, 40] })
      } else if (zonaActiva === 'Todas') {
        leafletMap.current.setView([-38.4, -63.6], 5)
      }
    })
  }, [zonaActiva])

  return (
    <section
      id="puntos-de-venta"
      ref={sectionRef}
      className="w-full py-24"
      style={{ background: 'linear-gradient(180deg, #FFFBEB 0%, #FFF9C4 100%)' }}
    >
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4"
            style={{ background: 'rgba(247,180,4,0.2)', color: '#1A1008', border: '1px solid rgba(247,180,4,0.4)' }}
          >
            Puntos de Venta
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-stone-900 mb-4"
          >
            Encontrá tu{' '}
            <span style={{ color: '#f7b404' }}>Pazzi</span>{' '}
            más cercano
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-stone-500 max-w-2xl mx-auto"
          >
            Más de <strong className="text-stone-700">1000 puntos de venta</strong> en todo el país.
            Encontrá el tuyo usando el mapa o filtrando por zona.
          </motion.p>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap gap-3 items-center justify-between mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={geolocate}
            disabled={locating}
            className="flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm shadow-md"
            style={{ background: locating ? '#888' : '#1A1008', color: '#f7b404' }}
          >
            <FiNavigation size={15} className={locating ? 'animate-spin' : ''} />
            {locating ? 'Buscando...' : 'Usar mi ubicación'}
          </motion.button>

          {nearbyCount !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-2 rounded-full text-sm font-bold"
              style={{ background: 'rgba(247,180,4,0.3)', color: '#1A1008' }}
            >
              {nearbyCount} Pazzi a menos de 20 km
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-full font-black text-sm shadow-md"
            style={{ background: '#f7b404', color: '#1A1008' }}
          >
            <FiPlus size={15} />
            ¿Vendés Pazzi? Registrá tu negocio
          </motion.button>
        </motion.div>

        {/* Zone filter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {ZONAS.map((zona) => (
            <motion.button
              key={zona}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => setZonaActiva(zona)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={
                zonaActiva === zona
                  ? { background: '#f7b404', color: '#1A1008', fontWeight: 800 }
                  : { background: 'white', color: '#555', border: '1px solid #e5e7eb' }
              }
            >
              {zona}
              {zona !== 'Todas' && (
                <span className="ml-1 text-xs opacity-60">
                  ({puntosData.filter((p) => p.zona === zona).length})
                </span>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Map + List */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div
              ref={mapRef}
              className="w-full rounded-2xl overflow-hidden shadow-lg"
              style={{ height: '480px', border: '1px solid rgba(247,180,4,0.3)', isolation: 'isolate' }}
            />
          </motion.div>

          {/* List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="overflow-y-auto rounded-2xl bg-white shadow"
            style={{ height: '480px', border: '1px solid rgba(247,180,4,0.3)' }}
          >
            <div
              className="p-4 flex items-center justify-between sticky top-0 bg-white z-10"
              style={{ borderBottom: '1px solid rgba(247,180,4,0.25)' }}
            >
              <span className="font-bold text-stone-800 text-sm">
                {sorted.length} punto{sorted.length !== 1 ? 's' : ''} de venta
              </span>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(247,180,4,0.2)', color: '#1A1008' }}
              >
                {zonaActiva}
              </span>
            </div>

            <div>
              {sorted.map((punto, i) => (
                <motion.div
                  key={punto.id}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.5 + i * 0.02 }}
                  className="p-4 hover:bg-amber-50 cursor-pointer transition-colors group"
                  style={{ borderBottom: '1px solid #fef9c3' }}
                  onClick={() => leafletMap.current?.setView([punto.lat, punto.lng], 15)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: '#f7b404' }}
                    >
                      <FiMapPin size={13} style={{ color: '#1A1008' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-stone-800 group-hover:text-yellow-700 transition-colors truncate">
                        {punto.nombre}
                      </p>
                      <p className="text-xs text-stone-400 truncate mt-0.5">{punto.direccion}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(247,180,4,0.2)', color: '#1A1008' }}
                        >
                          {punto.zona}
                        </span>
                        {userPos && (
                          <span className="text-xs text-stone-400">
                            {calcDist(userPos.lat, userPos.lng, punto.lat, punto.lng).toFixed(1)} km
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <ModalRegistro isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  )
}
