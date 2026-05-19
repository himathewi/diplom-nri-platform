import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'


export function RegisterPage() {
  const navigate = useNavigate()

  const { register, isLoading, error, clearError } = useAuthStore()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearError()

    const normalizedName = name.trim()
    const normalizedEmail = email.trim()

    if (!normalizedName || !normalizedEmail || !password) {
      return
    }

    await register({
      name: normalizedName,
      email: normalizedEmail,
      password,
    })

    navigate('/profile')
  }

  return (
    <section>
      <div className="auth-card">
        <p className="eyebrow">Новый пользователь</p>

        <h1>Регистрация</h1>

        <p>
          Создайте пользователя портала. Базовая роль назначается системой, а расширенные
          права выдаются администратором.
        </p>

        <form className="form-card auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Имя</span>
            <input
              required
              autoComplete="name"
              value={name}
              placeholder="Иван Петров"
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label className="form-field">
            <span>Email</span>
            <input
              required
              autoComplete="email"
              type="email"
              value={email}
              placeholder="participant@example.com"
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="form-field">
            <span>Пароль</span>
            <input
              required
              minLength={6}
              autoComplete="new-password"
              type="password"
              value={password}
              placeholder="Минимум 6 символов"
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>


          {error && (
            <div className="alert-error">
              <p>{error}</p>
            </div>
          )}

          <div className="form-actions">
            <Link className="button-secondary" to="/login">
              Уже есть аккаунт
            </Link>

            <button className="button-primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Создание...' : 'Зарегистрироваться'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}