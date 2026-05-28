import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useInvitationsStore } from '../../stores/invitationsStore'

export function InvitationCodePage() {
  const navigate = useNavigate()

  const {
    isLoading,
    error,
    acceptInvitationByCode,
    clearError,
  } = useInvitationsStore()

  const [code, setCode] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearError()

    const normalizedCode = code.trim()

    if (!normalizedCode) {
      return
    }

    const invitation = await acceptInvitationByCode({
      code: normalizedCode,
    })

    if (!invitation) {
      return
    }

    navigate(`/sessions/${invitation.sessionId}`)
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Код приглашения</p>
          <h1>Присоединение к сессии по коду</h1>

          <p>
            Введите 6-значный код, полученный от модератора сценарной сессии.
          </p>
        </div>
      </div>

      <article className="details-card">
        <form className="task-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Код приглашения</span>

            <input
              required
              inputMode="numeric"
              maxLength={6}
              value={code}
              placeholder="Например: 123456"
              onChange={(event) => setCode(event.target.value)}
            />
          </label>

          {error && (
            <div className="alert-error">
              <p>{error}</p>
            </div>
          )}

          <div className="form-actions">
            <Link className="button-secondary" to="/">
              Отмена
            </Link>

            <button
              className="button-primary"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Проверка...' : 'Принять приглашение'}
            </button>
          </div>
        </form>
      </article>
    </section>
  )
}