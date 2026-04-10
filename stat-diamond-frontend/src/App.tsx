import './App.css'
import { Header } from './Screens/Header/Header'
import { Footer } from './Screens/Footer/Footer'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { MainPage } from './Screens/MainPage/MainPage'
import { PlayersPage } from './Screens/PlayerPage/PlayersPage'
import { Login } from './Screens/Auth/Login'
import { CreateUser } from './Screens/Auth/CreateUser'
import { AuthProvider } from './Context/AuthProvider'
import { Profile } from './Screens/UserPage/Profile'
import { Teams } from './Screens/TeamPages/Teams'
import { TeamDetails } from './Screens/TeamPages/TeamDetails'
import { Toaster } from 'react-hot-toast'
import { AdvancedStatsPage } from './Screens/AdvancedStats/AdvancedStatsPage'
import { PlayerPage } from './Screens/PlayerPage/PlayerPage'
import { News } from './Screens/News /News'
import { LiveGames } from './Screens/LiveGames/LiveGames'
import { LiveGamePage } from './Screens/LiveGames/LiveGamePage'
import { Story } from './Screens/News /Story'


function App() {
  const router = createBrowserRouter([
    {
      element: (
        <div className="app-layout">
          <Toaster /* ... */ />
          <Header />
          <main className='content'>
            <Outlet />
          </main>
          <Footer />
        </div>
      ),
      children: [
        { path: '/', element: <MainPage /> },
        { path: '/player', element: <PlayersPage /> },
        { path: '/player/:playerId', element: <PlayerPage /> },
        { path: '/login', element: <Login /> },
        { path: '/create-account', element: <CreateUser /> },
        { path: '/profile', element: <Profile /> },
        { path: `/teams`, element: <Teams /> },
        { path: `/teams/:teamId`, element: <TeamDetails /> },
        { path: '/advanced-stats', element: <AdvancedStatsPage /> },
        { path: '/news', element: <News /> },
        { path: '/news/:id', element: <Story /> },
        { path: '/live-games', element: <LiveGames /> },
        { path: '/live-games/:gameId', element: <LiveGamePage /> }
      ]
    }
  ])


  return (
    <>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </>
  )
}

export default App
