import type { PlayerModalProps } from '../../types/types'


export function PlayerModal({ show, onClose, player }: PlayerModalProps) {
  if (!show || !player) {
    return null
  }

  return (
    <div>
      <h2>{player.name}</h2>
      <p>Team: {player.team}</p>
      <p>Position: {player.position}</p>
      <p>AVG: {player.batting_avg}</p>
      <button onClick={onClose}>Close Player Modal</button>
    </div>
  )
}