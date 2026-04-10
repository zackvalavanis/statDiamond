import { useEffect, useState } from "react"
import { useAuth } from "../../Context/UseAuth"
import type { FavoritePlayer } from "../../types/types"
import './Profile.css'


export function Profile() {
  const [favoritePlayers, setFavoritePlayers] = useState<FavoritePlayer[]>([])
  const { token, user } = useAuth()
  const api = import.meta.env.VITE_API_URL



  useEffect(() => {
    const handleFavoritePlayers = async () => {
      if (!token) {
        console.log("No Token - User is not logged in")
        return
      }
      try {
        const res = await fetch(`${api}/api/favorites/players`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        })
        if (res.ok) {
          const data = await res.json()
          setFavoritePlayers(data)
          console.log(data)
        } else {
          console.log("Failed to receive favorite player data")
        }
      } catch (error) {
        console.error("ERROR", error)
      }
    }
    handleFavoritePlayers()
  }, [token])


  if (!user) {
    return <div>Please log in to see your favorites</div>
  }

  return (
    <div className="profile-page">
      <div>
        <h1>Welcome {user?.name}</h1>
      </div>

      <div>
        <h1>
          Your Teams:
        </h1>
      </div>

      <div>
        <h1>
          Your Players:
        </h1>
        {favoritePlayers.map((player) => (
          <div key={player.id}>
            <p>{player.player_name}</p>

          </div>
        ))}
      </div>
    </div>
  )
}