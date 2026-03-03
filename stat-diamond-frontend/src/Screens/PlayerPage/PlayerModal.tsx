import type { PlayerModalProps } from '../../types/types'
import { useAuth } from '../../Context/UseAuth'


export function PlayerModal({ show, onClose, player }: PlayerModalProps) {
  const { token, user } = useAuth()

  const handleFollowPlayer = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/favorites/players', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          player_id: player?.IDfg.toString(),
          player_name: player?.Name
        })
      })
      if (res.ok) {
        alert("Player added to favorites")
      } else {
        const error = await res.json()
        alert(error.detail || "Failed to add favorite")
      }
    } catch (error) {
      console.error("Error adding favorite", error)
    }
  }


  if (!show || !player) {
    return null
  }

  return (
    <div>
      <h2>{player.Name}</h2>
      <p>Team: {player.Team}</p>
      <p>Age: {player.Age}</p>
      <p>AVG: {player.AVG}</p>
      {user && <button onClick={handleFollowPlayer}>Follow Player</button>}
      <button onClick={onClose}>Close Player Modal</button>
    </div>
  )
}