import './PlayerPage.css'
import type { Player } from '../../types/types'
import { useLocation } from 'react-router-dom'


export function PlayerPage() {
  const location = useLocation()
  const player = location.state?.player as Player
  console.log(player)

  return (
    <>

    </>
  )
}