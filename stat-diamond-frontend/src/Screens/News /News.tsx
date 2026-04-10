import { useEffect, useState } from "react"
import type { Article } from "../../types/types"
import { useNavigate } from "react-router-dom"

export function News() {
  const [articles, setArticles] = useState<Article[]>([])
  const navigate = useNavigate();


  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/news')
        const data = await res.json();
        console.log(data)
        setArticles(data.articles)
      } catch (error) {
        console.error("Error fetching news", error)
      }
    }
    fetchNews();
  }, [])

  console.log(articles)


  return (
    <div>
      <h1>MLB News</h1>

      <div>
        {articles.map((article, index) => (
          <div style={{ cursor: 'pointer' }} key={article.id || index} onClick={() => navigate(`/news/${article.id}`, { state: { article } })}>
            <div>
              {article.images?.[0]?.url && (
                <img
                  src={article.images[0].url}
                  alt={article.headline}
                  className="news-image"
                  style={{ height: '250px', width: '400px' }}
                />
              )}
              <h1 style={{ fontSize: '20px' }}>{article.headline}</h1>


            </div>

          </div>
        ))}
      </div>



    </div>

  )
}