import './MainPage.css'
import logo from '../../assets/StatDiamondLogo.png'
// import { ModalHome } from './Modal-home'
import { useState } from 'react'
import { useEffect } from 'react'
import type { Player } from '../../types/types'


export function MainPage() {
  const [topBattingAvg, setTopBattingAvg] = useState<Player[]>([])
  const number = Array.from({ length: 10 }, (_, i) => i + 1)
  // const [topHomeRun, setTopHomeRun] = useState([])
  // const [topSo, setSo] = useState([])
  // const [topERA, setTopERA] = useState([])



  useEffect(() => {
    const handleFetchTopAverages = async () => {
      try {
        const season = 2025;
        const res = await fetch(`http://localhost:8000/api/stats/player/batting?start=${season}&end=${season}&min_pa=1`)
        const data = await res.json()
        console.log(data)
        const top_batting_averages = (data.sort((a, b) => b.batting_average - a.batting_average).slice(0, 10))
        setTopBattingAvg(top_batting_averages)
      } catch (error) {
        console.error("There was an error", error)
      }
    }

    // const handleFetchTopERA = () => {

    // }

    // const handleFetchTopStrikeouts = () => {

    // }

    // const handleFetchTopHomeRuns = () => {

    // }

    handleFetchTopAverages()
  }, [])




  return (
    <div className='main-page-container'>
      <div className='logo-container'>
        <img className='logo' src={logo} />
      </div>
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
                  <tr key={leaders.IDfg}>
                    <td>{index + 1}</td>
                    <td>{leaders.Name}</td>
                    <td>{leaders.AVG}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className='leader-box-left'>
          <div className='Home runs'>
            <h1>Home Runs</h1>

          </div>
        </div>

        <div className='leader-box-right'>
          <div className='ERA'>
            <h1>ERA</h1>

          </div>
        </div>

        <div className='leader-box-right'>
          <div className='strikeouts'>
            <h1>Strikeouts</h1>

          </div>
        </div>

      </div>
    </div>
  )
}