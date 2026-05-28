import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useInvitationsStore } from '../../stores/invitationsStore'

export function InvitationLinkPage() {
  const { token } = useParams()
  const navigate = useNavigate()

  const {
    selectedInvitation,
    isLoading,
    error,
    getInvitationByLinkToken,
    acceptInvitationByLinkToken,
    clearSelectedInvitation,
    clearError,
  } = useInvitationsStore()

  useEffect(() => {
    if (token) {
      void getInvitationByLinkToken(token)
    }

    return () => {
      clearSelectedInvitation()
      clearError()
    }
  }, [token, getInvitationByLinkToken, clearSelectedInvitation, clearError])

  async function handleAcceptInvitation() {
    if (!token) {
      return
    }

    const invitation = await acceptInvitationByLinkToken(token)

    if (!invitation) {
      return
    }

    navigate(`/sessions/${invitation.sessionId}`)
  }

  if (!token) {
    return (
      <section>
        <h1>Приглашение не найдено</h1>
        <p>В ссылке отсутствует токен приглашения.</p>

        <Link className="text-link" to="/">
          ← На главную
        </Link>
      </section>
    )
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Приглашение</p>
          <h1>Присоединение к игровой сессии</h1>

          <p>
            Проверьте сведения о сессии и подтвердите участие. После принятия
            приглашения вы будете добавлены в список участников.
          </p>
        </div>
      </div>

      <article className="details-card">
        {isLoading && !selectedInvitation && <p>Загрузка приглашения...</p>}

        {error && (
          <div className="alert-error">
            <p>{error}</p>
          </div>
        )}

        {selectedInvitation && (
          <>
            <h2>{selectedInvitation.session.scenario?.title ?? 'Сессия'}</h2>

            {selectedInvitation.session.scenario?.description && (
              <p>{selectedInvitation.session.scenario.description}</p>
            )}

            <dl className="details-list">
              <div>
                <dt>Статус приглашения</dt>
                <dd>{selectedInvitation.status}</dd>
              </div>

              <div>
                <dt>Статус сессии</dt>
                <dd>{selectedInvitation.session.status}</dd>
              </div>

              <div>
                <dt>Команда</dt>
                <dd>{selectedInvitation.session.team?.name ?? 'Не указана'}</dd>
              </div>

              <div>
                <dt>Действует до</dt>
                <dd>{new Date(selectedInvitation.expiresAt).toLocaleString()}</dd>
              </div>
            </dl>

            <div className="form-actions">
              <Link className="button-secondary" to="/">
                Отмена
              </Link>

              <button
                className="button-primary"
                type="button"
                disabled={isLoading || selectedInvitation.status !== 'PENDING'}
                onClick={handleAcceptInvitation}
              >
                {isLoading ? 'Принятие...' : 'Принять приглашение'}
              </button>
            </div>
          </>
        )}
      </article>
    </section>
  )
}