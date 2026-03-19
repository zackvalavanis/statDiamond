import { useParams } from 'react-router-dom'
import './TeamDetails.css'
import { useEffect, useState } from 'react'
import type { Roster } from '../../types/types'

export function TeamDetails() {
  const { teamId } = useParams()
  const [roster, setRoster] = useState<Roster[]>([])
  const api = import.meta.env.VITE_API_URL



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
    <div>
      <h1>{teamId}</h1>
      <h1>Roster</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>AB</th>
          </tr>
        </thead>
        <tbody>
          {roster.map((player) => (
            <tr key={player.IDfg}>
              <td>{player.Name}</td>
              <td>{player.Position}</td>
              <td>{player.AB}</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
