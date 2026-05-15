import selloAmarillo from '/sello-amarillo.png'
import selloDefault from '/sello.png'

/**
 * Sello circular tipo "stamp" decorativo.
 *
 * Props:
 *  - variant: 'amarillo' | 'oscuro'
 *  - size: px (default 140)
 *  - rotate: deg (default -8)
 *  - className: posicionamiento extra (ej. 'absolute -top-6 -right-6')
 */
export default function Sello({
  variant = 'amarillo',
  size = 140,
  rotate = -8,
  className = '',
}) {
  const src = variant === 'amarillo' ? selloAmarillo : selloDefault
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `rotate(${rotate}deg)`,
        objectFit: 'contain',
      }}
    />
  )
}
