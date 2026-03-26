import type { LiveGame } from "../../types/types"
import { useLocation, useParams } from 'react-router-dom'



export function LiveGamePage() {
  const location = useLocation()
  const { gameId } = useParams()
  const game = location.state?.game as LiveGame
  console.log(gameId)
  console.log(game)

  // Fallback if no state (e.g., user refreshed page)
  if (!game) {
    return <div>Loading game data...</div>
  }

  return (
    <div>
      <h1>{game.away_team} @ {game.home_team}</h1>
      <p>{game.away_score} - {game.home_score}</p>
    </div>
  )
}