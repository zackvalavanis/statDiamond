import './PlayerPage.css'
import { PlayerModal } from './PlayerModal'
import { useState, useEffect } from 'react'
import type { Player } from '../../types/types'

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
    { abbr: "KCR", name: "Kansas City Royals" },
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
    { abbr: "SDP", name: "San Diego Padres" },
    { abbr: "SFG", name: "San Francisco Giants" },
    { abbr: "SEA", name: "Seattle Mariners" },
    { abbr: "STL", name: "St. Louis Cardinals" },
    { abbr: "TBR", name: "Tampa Bay Rays" },
    { abbr: "TEX", name: "Texas Rangers" },
    { abbr: "TOR", name: "Toronto Blue Jays" },
    { abbr: "WSN", name: "Washington Nationals" },
    { abbr: "- - -", name: "Free Agents" }
  ];
  const [selectedTeam, setSelectedTeam] = useState('')
  const [selectedSeason, setSelectedSeason] = useState<number | ''>(2025)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  const filteredPlayers = players.filter((p) => {
    const matchesTeam = selectedTeam ? p.Team === selectedTeam : true
    const matchesSeason = selectedSeason ? p.Season === selectedSeason : true
    return matchesTeam && matchesSeason
  })

  // useState(() => (
  //   fetch('http://localhost:8000/api/stats/player/roster?start=2024&end=2024&min_pa=1')
  //     .then(r => r.json())
  //     .then(data => {
  //       console.log('All fields:', data)
  //     })
  // ))


  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const season = selectedSeason || 2024
        const res = await fetch(`http://localhost:8000/api/stats/player/batting?start=${season}&end=${season}&min_pa=1`)
        const data = await res.json()
        console.log(data)
        setPlayers(data)
      } catch (error) {
        console.log(error)
      }
    }
    fetchPlayers()
  }, [selectedSeason])


  const handlePlayerModalShowing = (player: Player) => {
    setSelectedPlayer(player)
    setIsModalShowing(true)
  }

  const handlePlayerModalClose = () => {
    setIsModalShowing(false)
  }


  return (
    <div>
      <select onChange={(e) => setSelectedTeam(e.target.value)} value={selectedTeam}>
        <option value="">Select a team</option>
        {teams.map((team) => (
          <option key={team.abbr} value={team.abbr}>
            {team.name}
          </option>
        ))}
      </select>

      <select onChange={(e) => setSelectedSeason(e.target.value ? Number(e.target.value) : '')} value={selectedSeason}>
        <option value="">All Seasons</option>
        <option value="2023">2023</option>
        <option value="2024">2024</option>
        <option value="2025">2025</option>
      </select>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Team</th>
            <th>Avg</th>
            <th>HR</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlayers.map((player) => (
            <tr className="players-container" key={`${player.IDfg}-${player.Season}`}>
              <td><button onClick={() => handlePlayerModalShowing(player)}>{player.Name}</button></td>
              <td>{player.Age}</td>
              <td>{player.Team}</td>
              <td>{player.AVG?.toFixed(3)}</td>
              <td>{player.HR}</td>

            </tr>
          ))}
        </tbody>
      </table>
      <PlayerModal show={isModalShowing} onClose={handlePlayerModalClose} player={selectedPlayer} />
    </div>
  )
}