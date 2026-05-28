import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSessionsStore } from '../../stores/sessionsStore'
import {
  getLabel,
  scenarioDomainLabels,
  sessionStatusLabels,
} from '../../constants/labels'



export function SessionsPage() {
  const {
    sessions,
    isLoading,
    error,
    fetchSessions,
    clearError,
  } = useSessionsStore()

  useEffect(() => {
    void fetchSessions()

    return () => {
      clearError()
    }
  }, [fetchSessions, clearError])

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Игровые сессии</p>
          <h1>Сессии</h1>

          <p>
            Сессии связывают сценарий, команду, модератора и участников. Через
            них проводится сценарное моделирование и фиксируются результаты
            командной работы.
          </p>
        </div>

        <Link className="button-primary" to="/sessions/create">
          Создать сессию
        </Link>
      </div>

      {isLoading && sessions.length === 0 && <p>Загрузка сессий...</p>}

      {error && (
        <div className="alert-error">
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && sessions.length === 0 && (
        <div className="empty-state">
          <h2>Сессий пока нет</h2>

          <p>
            Создайте первую сессию на основе сценария и команды, чтобы начать
            проведение настольно-ролевого моделирования.
          </p>

          <Link className="button-primary" to="/sessions/create">
            Создать первую сессию
          </Link>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="cards-grid">
          {sessions.map((session) => (
            <article className="scenario-card" key={session.id}>
              <div className="scenario-card__header">
                <h2>{session.scenario.title}</h2>
                <span>{getLabel(sessionStatusLabels, session.status)}</span>
              </div>

              <p>{session.scenario.description}</p>

              <div className="scenario-card__meta">
                <span>{getLabel(scenarioDomainLabels, session.scenario.domain)}</span>
                <span>Команда: {session.team?.name ?? 'Не назначена'}</span>
                <span>Участников: {session.participants.length}</span>
              </div>

              <div className="card-actions">
                <Link className="button-secondary" to={`/sessions/${session.id}`}>
                  Открыть
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}