interface PlayerModalProps {
  show: boolean,
  onClose: () => void
}


export function PlayerModal({ show, onClose }: PlayerModalProps) {
  if (!show) {
    return null
  }

  return (
    <div>
      <h1>Player Modal</h1>
      <button onClick={onClose}>Close Player Modal</button>
    </div>
  )
}