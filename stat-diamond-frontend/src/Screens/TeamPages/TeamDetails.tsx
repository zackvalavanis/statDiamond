import { useParams } from 'react-router-dom'
import './TeamDetails.css'


export function TeamDetails() {
  const { teamId } = useParams()

  return (
    <h1>
      {teamId}
    </h1>
  )

}
