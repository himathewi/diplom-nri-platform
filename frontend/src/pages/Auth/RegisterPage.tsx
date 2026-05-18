import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import type { UserRole } from '../../types/auth'

const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: 'PARTICIPANT', label: 'Участник' },
  { value: 'MODERATOR', label: 'Модератор' },
  { value: 'EXPERT', label: 'Эксперт' },
]

export function RegisterPage() {
  const navigate = useNavigate()

  const { register, isLoading, error, clearError } = useAuthStore()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('PARTICIPANT')

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
      role,
    })

    navigate('/profile')
  }

  return (
    <section>
      <div className="auth-card">
        <p className="eyebrow">Новый пользователь</p>

        <h1>Регистрация</h1>

        <p>
          Создайте пользователя портала. Роль определяет доступные действия в
          сценариях, командах и игровых сессиях.
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

          <label className="form-field">
            <span>Роль</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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