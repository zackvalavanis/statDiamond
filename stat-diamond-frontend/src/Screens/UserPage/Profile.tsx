import { useAuth } from "../../Context/UseAuth"



export function Profile() {
  const [favoritePlayer, setFavoritePlayer] = useState('')

  const handleFavoritePlayers = async () => {

  }







  const { user } = useAuth()
  return (
    <div>
      <div>
        <h1>Welcome {user?.name}</h1>
      </div>

      <div>
        <h1>
          Favorite Teams:
        </h1>
      </div>

      <div>
        <h1>
          Favorite Players:
        </h1>
      </div>
    </div>
  )
}