import { useParams } from 'react-router-dom'
import './TeamDetails.css'
import { useEffect, useState } from 'react'
import type { Roster } from '../../types/types'

const MLB_TEAM_CAP_IDS: Record<string, number> = {
  'Arizona Diamondbacks': 109,
  'Atlanta Braves': 144,
  'Baltimore Orioles': 110,
  'Boston Red Sox': 111,
  'Chicago Cubs': 112,
  'Chicago White Sox': 145,
  'Cincinnati Reds': 113,
  'Cleveland Guardians': 114,
  'Colorado Rockies': 115,
  'Detroit Tigers': 116,
  'Houston Astros': 117,
  'Kansas City Royals': 118,
  'Los Angeles Angels': 108,
  'Los Angeles Dodgers': 119,
  'Miami Marlins': 146,
  'Milwaukee Brewers': 158,
  'Minnesota Twins': 142,
  'New York Mets': 121,
  'New York Yankees': 147,
  'Oakland Athletics': 133,
  'Philadelphia Phillies': 143,
  'Pittsburgh Pirates': 134,
  'San Diego Padres': 135,
  'San Francisco Giants': 137,
  'Seattle Mariners': 136,
  'St. Louis Cardinals': 138,
  'Tampa Bay Rays': 139,
  'Texas Rangers': 140,
  'Toronto Blue Jays': 141,
  'Washington Nationals': 120
};

export function TeamDetails() {
  const { teamId } = useParams()
  const [roster, setRoster] = useState<Roster[]>([])
  const api = import.meta.env.VITE_API_URL
  const team_id = teamId && teamId in MLB_TEAM_CAP_IDS ? MLB_TEAM_CAP_IDS[teamId] : 0
  const hitters = roster.filter(p => p.Position != 'p')
  const pitchers = roster.filter(p => p.Position === 'p')
  console.log(hitters)
  console.log(pitchers)

  useEffect(() => {


    const handleGetTeam = async (teamId: string) => {
      try {
        const res = await fetch(`${api}/api/teams/${teamId}/roster`)
        const data = await res.json()
        setRoster(data)

      } catch (error) {
        console.log(error)
      }
    }
    handleGetTeam(teamId!)

  }, [teamId])


  return (
    <div className='team-page'>
      <h1>{teamId}</h1>
      <img
        src={`https://www.mlbstatic.com/team-logos/team-cap-on-dark/${team_id}.svg`}
        alt={teamId || ''}
        className="player-headshot"
      />
      <h1>Hitting</h1>
      <table className='team-details-table'>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Age</th>
            <th>Position</th>
            <th>AB</th>
            <th>H</th>
            <th>2B</th>
            <th>3B</th>
            <th>HR</th>
            <th>BB</th>
            <th>RBI</th>
            <th>AVG</th>
            <th>OBP</th>
            <th>SLG</th>
            <th>K</th>
            <th>SB</th>

          </tr>
        </thead>
        <tbody>
          {hitters.sort((a, b) => b.AB - a.AB).map((player, index) => (
            <tr key={player.IDfg}>
              <td>{index + 1}</td>
              <td>{player.Name}</td>
              <td>{player.Age}</td>
              <td>{player.Position}</td>
              <td>{player.AB}</td>
              <td>{player['H']}</td>
              <td>{player['2B']}</td>
              <td>{player['3B']}</td>
              <td>{player.HR}</td>
              <td>{player.BB}</td>
              <td>{player.RBI}</td>
              <td>{player.AVG}</td>
              <td>{player.OBP}</td>
              <td>{player.SLG}</td>
              <td>{player.K}</td>
              <td>{player.SB}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h1>Pitching</h1>
      <table className='team-details-table'>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Age</th>
            <th>Position</th>
            <th>AB</th>
            <th>H</th>
            <th>2B</th>
            <th>3B</th>
            <th>HR</th>
            <th>BB</th>
            <th>RBI</th>
            <th>AVG</th>
            <th>OBP</th>
            <th>SLG</th>
            <th>K</th>
            <th>SB</th>

          </tr>
        </thead>
        <tbody>
          {pitchers.sort((a, b) => b.AB - a.AB).map((player, index) => (
            <tr key={player.IDfg}>
              <td>{index + 1}</td>
              <td>{player.Name}</td>
              <td>{player.Age}</td>
              <td>{player.Position}</td>
              <td>{player.AB}</td>
              <td>{player['H']}</td>
              <td>{player['2B']}</td>
              <td>{player['3B']}</td>
              <td>{player.HR}</td>
              <td>{player.BB}</td>
              <td>{player.RBI}</td>
              <td>{player.AVG}</td>
              <td>{player.OBP}</td>
              <td>{player.SLG}</td>
              <td>{player.K}</td>
              <td>{player.SB}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
