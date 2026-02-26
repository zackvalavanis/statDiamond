interface PlayerModalProps {
  show: boolean,
  onClose: () => void
}


export function PlayerModal({ show, onClose, player }: PlayerModalProps) {
  if (!show) {
    return null
  }

  return (
    <div>
      <h1>Player Modal</h1>
      <h1>{player.name}</h1>

      <button onClick={onClose}>Close Player Modal</button>
    </div>
  )
}