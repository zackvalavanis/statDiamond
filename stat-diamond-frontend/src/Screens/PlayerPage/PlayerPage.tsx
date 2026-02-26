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
    "ARI", "ATL", "BAL", "BOS", "CHC",
    "CHW", "CIN", "CLE", "COL", "DET",
    "HOU", "KC", "LAA", "LAD", "MIA",
    "MIL", "MIN", "NYM", "NYY", "OAK",
    "PHI", "PIT", "SD", "SF", "SEA",
    "STL", "TB", "TEX", "TOR", "WSH",
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
        <option value="ARI">Arizona Diamondbacks</option>
        <option value="ATL">Atlanta Braves</option>
        <option value="BAL">Baltimore Orioles</option>
        <option value="BOS">Boston Red Sox</option>
        <option value="CHC">Chicago Cubs</option>
        <option value="CHW">Chicago White Sox</option>
        <option value="CIN">Cincinnati Reds</option>
        <option value="CLE">Cleveland Guardians</option>
        <option value="COL">Colorado Rockies</option>
        <option value="DET">Detroit Tigers</option>
        <option value="HOU">Houston Astros</option>
        <option value="KC">Kansas City Royals</option>
        <option value="LAA">Los Angeles Angels</option>
        <option value="LAD">Los Angeles Dodgers</option>
        <option value="MIA">Miami Marlins</option>
        <option value="MIL">Milwaukee Brewers</option>
        <option value="MIN">Minnesota Twins</option>
        <option value="NYM">New York Mets</option>
        <option value="NYY">New York Yankees</option>
        <option value="OAK">Oakland Athletics</option>
        <option value="PHI">Philadelphia Phillies</option>
        <option value="PIT">Pittsburgh Pirates</option>
        <option value="SD">San Diego Padres</option>
        <option value="SF">San Francisco Giants</option>
        <option value="SEA">Seattle Mariners</option>
        <option value="STL">St. Louis Cardinals</option>
        <option value="TB">Tampa Bay Rays</option>
        <option value="TEX">Texas Rangers</option>
        <option value="TOR">Toronto Blue Jays</option>
        <option value="WSH">Washington Nationals</option>
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