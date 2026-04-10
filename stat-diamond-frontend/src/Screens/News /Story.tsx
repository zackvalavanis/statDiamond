import { useLocation, useNavigate, useParams } from "react-router-dom"



export function Story() {
  const location = useLocation()
  const { id } = useParams()
  const navigate = useNavigate()
  const article = location.state?.article

  return (
    <div>
      <h1>
        Hello {id}
      </h1>
      {article.images?.[0]?.url && (
        <img
          src={article.images[0].url}
          alt={article.headline}
          className="news-image"
          style={{ height: '250px', width: '400px' }}
        />
      )}

    </div>
  )
}