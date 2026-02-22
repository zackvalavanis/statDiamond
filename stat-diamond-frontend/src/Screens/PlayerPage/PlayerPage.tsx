import './PlayerPage.css'
import { PlayerModal } from './PlayerModal'
import { useState } from 'react'


// interface Player {
//   id: number
//   name: string
// }

export function PlayerPage() {
  // const [players, setPlayers] = useState<Player[]>([])
  const [isModalShowing, setIsModalShowing] = useState(false)


  // useEffect(() => {
  //   const fetchPlayers = async () => {
  //     try {
  //       const res = await fetch('http://127.0.0.1:8000/player/dummy/list')
  //       const data = await res.json()
  //       console.log(data)
  //       setPlayers(data)
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   }
  //   fetchPlayers()
  // }, [])


  const handlePlayerModalShowing = () => {
    setIsModalShowing(true)
  }

  const handlePlayerModalClose = () => {
    setIsModalShowing(false)
  }

  return (
    <div>
      <PlayerModal show={isModalShowing} onClose={handlePlayerModalClose} />
      {!isModalShowing && (
        <button onClick={handlePlayerModalShowing}>Open Player Modal</button>
      )}
    </div>
  )
}