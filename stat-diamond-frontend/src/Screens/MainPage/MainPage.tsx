import './MainPage.css'
import { useState } from 'react'
import { useEffect } from 'react'
import type { Player } from '../../types/types'


export function MainPage() {
  const [topBattingAvg, setTopBattingAvg] = useState<Player[]>([])
  const [topHomeRun, setTopHomeRun] = useState<Player[]>([])
  const [topSo, setSo] = useState<Player[]>([])
  const [topERA, setTopERA] = useState<Player[]>([])
  const now = new Date()
  const current_year = now.getFullYear()



  useEffect(() => {
    const handleFetchTopAverages = async () => {
      try {
        const season = 2025;
        const res = await fetch(`http://localhost:8000/api/stats/player/batting?start=${season}&end=${season}&min_pa=1`)
        const res2 = await fetch(`http://localhost:8000/api/stats/player/pitching?start=${season}&end=${season}&min_ip=20`)
        const data = await res.json()
        const data2 = await res2.json()
        console.log(data)
        console.log("Data 2", data2)
        const top_batting_averages = (data.sort((a: { batting_average: number }, b: { batting_average: number }) => b.batting_average - a.batting_average).slice(0, 10))
        setTopBattingAvg(top_batting_averages)
        const topHomeRun = (data.sort((a: { HR: number }, b: { HR: number }) => b.HR - a.HR).slice(0, 10))
        setTopHomeRun(topHomeRun)
        const topSo = (data2.sort((a: { strikeouts: number }, b: { strikeouts: number }) => b.strikeouts - a.strikeouts).slice(0, 10))
        setSo(topSo)
        const topERA = data2.sort((a: { ERA: number }, b: { ERA: number }) => a.ERA - b.ERA).slice(0, 10)
        setTopERA(topERA)
      } catch (error) {
        console.error("There was an error", error)
      }
    }
    handleFetchTopAverages()
  }, [])


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
                  <tr key={leaders.IDfg}>
                    <td>{index + 1}</td>
                    <td>{leaders.Name} {leaders.Position && `(${leaders.Position})`}</td>
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
                  <tr key={leaders.IDfg}>
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
                  <tr key={leaders.IDfg}>
                    <td>{index + 1}</td>
                    <td>{leaders.Name} {leaders.Position && `(${leaders.Position})`}</td>
                    <td>{leaders.ERA}</td>
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
                  <tr key={leaders.IDfg}>
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