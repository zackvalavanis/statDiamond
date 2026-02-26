import './PlayerPage.css'
import { PlayerModal } from './PlayerModal'
import { useState, useEffect } from 'react'


interface Player {
  id: number
  name: string
  batting_avg: GLfloat
  position: string
  team: string
}

export function PlayerPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [isModalShowing, setIsModalShowing] = useState(false)
  const teams = [
    { abbr: "ARI", name: "Arizona Diamondbacks" },
    { abbr: "ATL", name: "Atlanta Braves" },
    { abbr: "BAL", name: "Baltimore Orioles" },
    { abbr: "BOS", name: "Boston Red Sox" },
    { abbr: "CHC", name: "Chicago Cubs" },
    { abbr: "CHW", name: "Chicago White Sox" },
    { abbr: "CIN", name: "Cincinnati Reds" },
    { abbr: "CLE", name: "Cleveland Guardians" },
    { abbr: "COL", name: "Colorado Rockies" },
    { abbr: "DET", name: "Detroit Tigers" },
    { abbr: "HOU", name: "Houston Astros" },
    { abbr: "KC", name: "Kansas City Royals" },
    { abbr: "LAA", name: "Los Angeles Angels" },
    { abbr: "LAD", name: "Los Angeles Dodgers" },
    { abbr: "MIA", name: "Miami Marlins" },
    { abbr: "MIL", name: "Milwaukee Brewers" },
    { abbr: "MIN", name: "Minnesota Twins" },
    { abbr: "NYM", name: "New York Mets" },
    { abbr: "NYY", name: "New York Yankees" },
    { abbr: "OAK", name: "Oakland Athletics" },
    { abbr: "PHI", name: "Philadelphia Phillies" },
    { abbr: "PIT", name: "Pittsburgh Pirates" },
    { abbr: "SD", name: "San Diego Padres" },
    { abbr: "SF", name: "San Francisco Giants" },
    { abbr: "SEA", name: "Seattle Mariners" },
    { abbr: "STL", name: "St. Louis Cardinals" },
    { abbr: "TB", name: "Tampa Bay Rays" },
    { abbr: "TEX", name: "Texas Rangers" },
    { abbr: "TOR", name: "Toronto Blue Jays" },
    { abbr: "WSH", name: "Washington Nationals" },
  ];
  const [selectedTeam, setSelectedTeam] = useState('')
  const filteredPlayers = selectedTeam ? players.filter((p) => p.team == selectedTeam) : players



  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch('http://localhost:8000/player/dummy/list')
        const data = await res.json()
        console.log(data)
        setPlayers(data)
      } catch (error) {
        console.log(error)
      }
    }
    fetchPlayers()
  }, [])


  const handlePlayerModalShowing = () => {
    setIsModalShowing(true)
  }

  const handlePlayerModalClose = () => {
    setIsModalShowing(false)
  }


  return (
    <div>
      <select onChange={(e) => setSelectedTeam(e.target.value)}>
        <option value="">Select a team</option>
        {teams.map((team) => (
          <option key={team.abbr} value={team.abbr}>
            {team.name}
          </option>
        ))}
      </select>
      {filteredPlayers.map((player) => (
        <div key={player.id}>
          <h1>{player.name}</h1>
          <h1>{player.batting_avg}</h1>
          <h1>{player.position}</h1>
          <h1>{player.team}</h1>
        </div>
      ))}
      <PlayerModal show={isModalShowing} onClose={handlePlayerModalClose} />
      {!isModalShowing && (
        <button onClick={handlePlayerModalShowing}>Open Player Modal</button>
      )}
    </div>
  )
}