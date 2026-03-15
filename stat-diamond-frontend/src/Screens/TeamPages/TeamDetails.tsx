import { useParams } from 'react-router-dom'
import './TeamDetails.css'
import { useEffect, useState } from 'react'
import type { Roster } from '../../types/types'

export function TeamDetails() {
  const { teamId } = useParams()
  const [roster, setRoster] = useState<Roster[]>([])



  useEffect(() => {
    const handleGetTeam = async (teamId: string) => {
      try {
        const res = await fetch(`http://localhost:8000/api/teams/${teamId}/roster`)
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
      {roster.map((player) => (
        <div key={player.IDfg}>
          <p>{player.Name}</p>

        </div>
      ))}

    </div>
  )

}
