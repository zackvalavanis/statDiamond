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
        { path: '/login', element: <Login /> },
        { path: '/create-account', element: <CreateUser /> },
        { path: '/profile', element: <Profile /> },
        { path: `/teams`, element: <Teams /> },
        { path: `/teams/:teamId`, element: <TeamDetails /> }
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
