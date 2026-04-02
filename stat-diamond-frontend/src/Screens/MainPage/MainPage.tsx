import './MainPage.css'
import { useState } from 'react'
import { useEffect } from 'react'
import type { Player } from '../../types/types'
import { useNavigate } from 'react-router-dom'


export function MainPage() {
  const [topBattingAvg, setTopBattingAvg] = useState<Player[]>([])
  const [topHomeRun, setTopHomeRun] = useState<Player[]>([])
  const [topSo, setSo] = useState<Player[]>([])
  const [topERA, setTopERA] = useState<Player[]>([])
  const now = new Date()
  const current_year = now.getFullYear()
  const navigate = useNavigate()
  const api = import.meta.env.VITE_API_URL



  useEffect(() => {
    const handleFetchTopAverages = async () => {
      try {
        const season = 2026;
        const [res, res2] = await Promise.all([
          fetch(`${api}/api/stats/player/batting-complete?start=${season}&min_pa=10`),
          fetch(`${api}/api/stats/player/pitching-complete?start=${season}&end=${season}&min_ip=10`)
        ])
        const data = await res.json()
        const data2 = await res2.json()

        console.log('Sample player keys:', Object.keys(data[0] || {}))

        const top_batting_averages = [...data]
          .sort((a, b) => (b.AVG || 0) - (a.AVG || 0))
          .slice(0, 10)
        setTopBattingAvg(top_batting_averages)

        const topHomeRun = [...data]
          .sort((a, b) => {
            const aHR = Number(a.HR) || 0
            const bHR = Number(b.HR) || 0
            return bHR - aHR
          })
          .slice(0, 10)
        setTopHomeRun(topHomeRun)

        const topSo = [...data2]
          .sort((a, b) => (b.SO || 0) - (a.SO || 0))
          .slice(0, 10)
        setSo(topSo)

        const topERA = [...data2]
          .sort((a, b) => (a.ERA || 0) - (b.ERA || 0))
          .slice(0, 10)
        console.log(topERA)
        setTopERA(topERA)

      } catch (error) {
        console.error("There was an error", error)
      }
    }
    handleFetchTopAverages()
  }, [api])


  const navigateToPlayer = (player: Player) => {
    navigate(`/player/${player.IDfg}`, { state: { player } })
  }


  return (
    <div className='main-page-container'>
      <h1 className='main-header'>League Leaders {current_year}</h1>
      <div className='leader-boxes-container'>
        <div className='leader-box-left'>
          <div className='batting_average'>
            <h1>Batting Average</h1>
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>AVG</th>
                </tr>
              </thead>
              <tbody>
                {topBattingAvg.map((leaders, index) => (
                  <tr onClick={() => navigateToPlayer(leaders)} key={leaders.IDfg}>
                    <td>{index + 1}</td>
                    <td>{leaders.Name} {leaders.Position && `(${leaders.Position})`}</td>
                    <td>{leaders.AVG?.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className='leader-box-left'>
          <div className='Home runs'>
            <h1>Home Runs</h1>
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>HR</th>
                </tr>
              </thead>
              <tbody>
                {topHomeRun.map((leaders, index) => (
                  <tr onClick={() => navigateToPlayer(leaders)} key={leaders.IDfg}>
                    <td>{index + 1}</td>
                    <td>{leaders.Name} {leaders.Position && `(${leaders.Position})`}</td>
                    <td>{leaders.HR}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>

        <div className='leader-box-right'>
          <div className='ERA'>
            <h1>ERA</h1>
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>ERA</th>
                </tr>
              </thead>
              <tbody>
                {topERA.map((leaders, index) => (
                  <tr onClick={() => navigateToPlayer(leaders)} key={leaders.IDfg}>
                    <td>{index + 1}</td>
                    <td>{leaders.Name} {leaders.Position && `(${leaders.Position})`}</td>
                    <td>{leaders.ERA ? Number(leaders.ERA).toFixed(2) : '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>

        <div className='leader-box-right'>
          <div className='strikeouts'>
            <h1>Strikeouts</h1>
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Strikeouts</th>
                </tr>
              </thead>
              <tbody>
                {topSo.map((leaders, index) => (
                  <tr onClick={() => navigateToPlayer(leaders)} key={leaders.IDfg}>
                    <td>{index + 1}</td>
                    <td>{leaders.Name} {leaders.Position && `(${leaders.Position})`}</td>
                    <td>{leaders.SO}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Awards Section */}
        <div>
        </div>
      </div>
    </div>
  )
}