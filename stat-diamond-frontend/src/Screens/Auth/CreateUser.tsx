import { useState } from "react"

interface CreateUserInfo {
  first_name: string
  last_name: string
  username: string
  email: string
  password: string
}

const fields = [
  { name: 'first_name', label: 'First Name', type: 'text' },
  { name: 'last_name', label: 'Last Name', type: 'text' },
  { name: 'username', label: 'username', type: 'text' },
  { name: 'email', label: 'email', type: 'email' },
  { name: 'password', label: 'password', type: 'password' },
]



export function CreateUser() {
  const [formData, setFormData] = useState<CreateUserInfo>({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: ''
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
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