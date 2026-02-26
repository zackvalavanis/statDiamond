import './PlayerPage.css'
import { PlayerModal } from './PlayerModal'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'


interface Player {
  id: number
  name: string
  batting_avg: number
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
  const filteredPlayers = selectedTeam ? players.filter((p) => p.team === selectedTeam) : players
  const [selectedPlayer, setSelectedPlayer] = useState('')



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


  const handlePlayerModalShowing = (player: Player) => {
    setSelectedPlayer(player)
    setIsModalShowing(true)
  }

  const handlePlayerModalClose = () => {
    setIsModalShowing(false)
  }

  const sayHi = () => {
    console.log('hi')
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
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Team</th>
            <th>Position</th>
            <th>Avg</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlayers.map((player) => (
            <tr className="players-container" key={player.id}>
              <td><button onClick={() => handlePlayerModalShowing(player)}>{player.name}</button></td>
              <td>{player.team}</td>
              <td>{player.position}</td>
              <td>{player.batting_avg}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <PlayerModal show={isModalShowing} onClose={handlePlayerModalClose} player={selectedPlayer} />
    </div>
  )
}