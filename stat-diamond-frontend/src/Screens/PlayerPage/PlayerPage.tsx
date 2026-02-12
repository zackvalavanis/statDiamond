import './PlayerPage.css'
import { useEffect, useState } from 'react'


interface Player {
  id: number
  name: string
}

export function PlayerPage() {
  const [players, setPlayers] = useState<Player[]>([])


  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/player/dummy/list')
        const data = await res.json()
        console.log(data)
        setPlayers(data)
      } catch (error) {
        console.log(error)
      }
    }
    fetchPlayers()
  }, [])



  return (
    <div>
      {players.map((p) => (
        <div key={p.id}>
          <h1>{p.name}</h1>

        </div>
      ))}
    </div>
  )
}