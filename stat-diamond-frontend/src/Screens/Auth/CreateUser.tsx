import { useState } from "react"
import { useNavigate } from "react-router-dom"

interface CreateUserInfo {
  name: string
  email: string
  password: string
}

const fields = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'email', label: 'email', type: 'email' },
  { name: 'password', label: 'password', type: 'password' },
]



export function CreateUser() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<CreateUserInfo>({
    name: "",
    email: '',
    password: ''
  })

  const handleCreateUser = async (formData: CreateUserInfo) => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/signup", {
        "method": 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      console.log('user data', data)
      if (data) {
        alert("User Created")
      }
      navigate('/')
    } catch (error) {
      console.log(error)
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCreateUser(formData)
    console.log(formData)
  }

  return (
    <div>
      <form onSubmit={submit}>
        {fields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              value={formData[field.name as keyof CreateUserInfo]}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            ></input>
          </div>
        ))
        }
        <button type='submit'>Create Account</button>
      </form >
    </div >
  )
}