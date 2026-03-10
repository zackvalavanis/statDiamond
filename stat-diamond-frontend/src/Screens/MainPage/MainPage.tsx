import './MainPage.css'
import logo from '../../assets/StatDiamondLogo.png'
// import { ModalHome } from './Modal-home'
// import { useState } from 'react'
import { useEffect } from 'react'


export function MainPage() {
  const user = localStorage.getItem('token')
  console.log(user)


  useEffect(() => {
    const handleFetchTopAverages = () => {

    }

    const handleFetchTopERA = () => {

    }

    const handleFetchTopStrikeouts = () => {

    }

    const handleFetchTopHomeRuns = () => {

    }
  })


  return (
    <div className='main-page-container'>
      <div className='logo-container'>
        <img className='logo' src={logo} />
      </div>
      <div className='leader-boxes-container'>
        <div className='leader-box-left'>
          <div className='batting_average'>
            <h1>Batting Average</h1>
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