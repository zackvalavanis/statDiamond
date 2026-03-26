import { useEffect, useState } from "react"
import type { LiveGame } from "../../types/types"
import './LiveGames.css'
import { useNavigate } from "react-router-dom"


export function LiveGames() {
  const [liveGames, setLiveGames] = useState<LiveGame[]>([])
  const api = import.meta.env.VITE_API_URL
  const navigate = useNavigate();

  const formatGameTime = (isoString: string) => {
    const date = new Date(isoString)

    const timeString = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
      timeZoneName: 'short'
    })

    return timeString
  }

  const getInningSymbol = (state: string | null) => {
    if (!state) return ''
    const symbols = {
      'Top': '▲',      // Top of inning
      'Bottom': '▼',   // Bottom of inning  
      'Middle': '◆',   // Middle (between innings)
      'End': '■'       // End of inning
    }
    return symbols[state as keyof typeof symbols] || ''
  }


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

  const handleGamePage = (game: LiveGame) => {
    navigate(`/live-games/${game.game_id}/`, { state: { game } })
  }

  console.log(liveGames)
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
            <th>Inning</th>
            <th>Home</th>
            <th>Game Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {liveGames.map(game => (
            <tr
              style={{ cursor: 'pointer' }}
              onClick={() => handleGamePage(game)}
              key={game.game_id}
            >
              <td>
                <div className="team-info">
                  <div className="team-name">{game.away_team}</div>
                  <div className="team-record">{game.away_record}</div>
                </div>
              </td>

              <td className="score-cell">
                <div className="score-display">
                  <span className="score">{game.away_score}</span>
                  <span className="score-separator">-</span>
                  <span className="score">{game.home_score}</span>
                </div>
              </td>

              <td>
                <span className="inning-symbol">{getInningSymbol(game.inning_state)} {game.inning}</span>
              </td>

              <td>
                <div className="team-info">
                  <div className="team-name">{game.home_team}</div>
                  <div className="team-record">{game.home_record}</div>
                </div>
              </td>


              <td>{formatGameTime(game.game_time)}</td>

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