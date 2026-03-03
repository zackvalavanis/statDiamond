import './Teams.css'
import { Link } from 'react-router-dom'


export function Teams() {



  const handleTeamRouting = () => {

  }

  return (
    <div className='leagues-container'>
      <div className='division-container'>
        <h1>NL</h1>
        <h2>NL Central</h2>
        <p><Link to='teams/cubs'></Link>Chicago Cubs</p>
        <p>Cincinnati Reds</p>
        <p>Milwaukee Brewers</p>
        <p>Pittsburgh Pirates</p>
        <p>St. Louis Cardinals</p>

        <h2>NL West</h2>
        <p>Arizona Diamondbacks</p>
        <p>Colorado Rockies</p>
        <p>Los Angeles Dodgers</p>
        <p>San Diego Padres</p>
        <p>San Francisco Giants</p>

        <h2>NL East</h2>
        <p>Atlanta Braves</p>
        <p>Miami Marlins</p>
        <p>New York Mets</p>
        <p>Philadelphia Phillies</p>
        <p>Washington Nationals</p>
      </div>

      <div className='division-container'>
        <h1>AL</h1>
        <h2>AL Central</h2>
        <p>Chicago White Sox</p>
        <p>Cleveland Guardians</p>
        <p>Detroit Tigers</p>
        <p>Kansas City Royals</p>
        <p>Minnesota Twins</p>

        <h2>AL West</h2>
        <p>Houston Astros</p>
        <p>Los Angeles Angels</p>
        <p>Oakland Athletics</p>
        <p>Seattle Mariners</p>
        <p>Texas Rangers</p>

        <h2>AL East</h2>
        <p>Baltimore Orioles</p>
        <p>Boston Red Sox</p>
        <p>New York Yankees</p>
        <p>Tampa Bay Rays</p>
        <p>Toronto Blue Jays</p>
      </div>
    </div>
  )
}