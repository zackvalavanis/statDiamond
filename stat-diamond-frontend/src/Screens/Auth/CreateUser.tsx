import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { CreateUserInfo } from "../../types/types"

export function CreateUser() {
  const navigate = useNavigate()
  const api = import.meta.env.VITE_API_URL

  const [formData, setFormData] = useState<CreateUserInfo>({
    email: "",
    name: "",
    password: "",
  })

  const handleCreateUser = async () => {
    try {
      const res = await fetch(`${api}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail)
        )
      }

      alert("User Created")
      navigate("/")
    } catch (error: any) {
      console.error(error)
      alert(error.message)
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCreateUser()
  }

  return (
    <div>
      <form onSubmit={submit}>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />

        <button type="submit">Create Account</button>
      </form>
    </div>
  )
}