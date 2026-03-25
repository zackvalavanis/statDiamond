import { useEffect, useState } from "react"
import type { LiveGame } from "../../types/types"
import './LiveGames.css'


export function LiveGames() {
  const [liveGames, setLiveGames] = useState<LiveGame[]>([])
  const api = import.meta.env.VITE_API_URL


  useEffect(() => {
    const fetchLiveGames = async () => {
      const res = await fetch(`${api}/api/stats/live-games`)
      const data = await res.json()
      setLiveGames(data)
    }

    fetchLiveGames()
    const interval = setInterval(fetchLiveGames, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="live-games-container">
      <div className="live-games-header">
        <h1>Live Games</h1>
        <div className="live-indicator">
          <div className="live-dot"></div>
          Updates every 30s
        </div>
      </div>

      <table className="game-details-table">
        <thead>
          <tr>
            <th>Away</th>
            <th>Score</th>
            <th>Home</th>
            <th>Score</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {liveGames.map(game => (
            <tr key={game.game_id}>
              <td>{game.away_team}</td>
              <td>{game.away_score}</td>
              <td>{game.home_team}</td>
              <td>{game.home_score}</td>
              <td>
                <span className={`status-${game.status.toLowerCase().includes('live') ? 'live' : game.status.toLowerCase().includes('final') ? 'final' : 'scheduled'}`}>
                  {game.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}