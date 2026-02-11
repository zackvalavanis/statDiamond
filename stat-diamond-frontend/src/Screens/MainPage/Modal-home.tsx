


interface ModalHomeProps {
  show: boolean
  onClose: () => void
}


export function ModalHome({ show, onClose }: ModalHomeProps) {
  if (!show) return null

  return (
    <div className="modal">
      <h1>Hello</h1>
      <button onClick={onClose}>Close</button>
    </div>

  )
}