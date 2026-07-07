import './index.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Esponjosidad from './components/Esponjosidad'
import Productos from './components/Productos'
import QuienesSomos from './components/QuienesSomos'
import PuntosDeVenta from './components/PuntosDeVenta'
import Contacto from './components/Contacto'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <Hero />

        {/* Divider */}
        <div className="w-full h-px" style={{ background: 'rgba(0,0,0,0.1)' }} />

        <Esponjosidad />
        <PuntosDeVenta />
        <QuienesSomos />
        <Productos />
        <Contacto />
      </main>
      <Footer />
    </>
  )
}
