import { useState, useEffect } from "react"
import type { ReactNode } from "react"
import type { User } from "../types/types"
import { AuthContext } from "./AuthContext"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch('http://localhost:8000/api/auth/me', {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        if (res.ok) {
          const userData = await res.json()
          setUser(userData)
        } else {
          localStorage.removeItem('access_token')
          setToken(null)
        }
      } catch (error) {
        console.error("Failed to fetch user", error)
        localStorage.removeItem('access_token')
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [token])

  const login = async (newToken: string) => {
    localStorage.setItem('access_token', newToken)
    setToken(newToken)
    const res = await fetch('http://localhost:8000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${newToken}`
      }
    })
    const userData = await res.json()
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}