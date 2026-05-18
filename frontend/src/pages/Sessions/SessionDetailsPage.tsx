import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSessionsStore } from '../../stores/sessionsStore'

const statusLabels: Record<string, string> = {
  PLANNED: 'Запланирована',
  ACTIVE: 'Активна',
  FINISHED: 'Завершена',
}

const domainLabels: Record<string, string> = {
  CROP_PRODUCTION: 'Растениеводство',
  GREENHOUSE: 'Тепличное хозяйство',
  LIVESTOCK: 'Животноводство',
  LOGISTICS: 'Логистика',
  PROCESSING: 'Переработка продукции',
  ROBOTICS: 'Робототехника',
  TEAMBUILDING: 'Командное обучение',
}

function getStatusLabel(status: string) {
  return statusLabels[status] ?? status
}

function getDomainLabel(domain: string) {
  return domainLabels[domain] ?? domain
}

export function SessionDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    selectedSession,
    isLoading,
    error,
    fetchSessionById,
    startSession,
    finishSession,
    deleteSession,
    clearSelectedSession,
    clearError,
  } = useSessionsStore()

  useEffect(() => {
    if (id) {
      void fetchSessionById(id)
    }

    return () => {
      clearSelectedSession()
      clearError()
    }
  }, [id, fetchSessionById, clearSelectedSession, clearError])

  async function handleStartSession() {
    if (!id) {
      return
    }

    await startSession(id)
  }

  async function handleFinishSession() {
    if (!id) {
      return
    }

    const confirmed = window.confirm(
      'Завершить сессию? После завершения она станет недоступна для активной модерации.',
    )

    if (!confirmed) {
      return
    }

    await finishSession(id)
  }

  async function handleDeleteSession() {
    if (!id) {
      return
    }

    const confirmed = window.confirm(
      'Удалить сессию? Это действие нельзя отменить.',
    )

    if (!confirmed) {
      return
    }

    await deleteSession(id)
    navigate('/sessions')
  }

  if (!id) {
    return (
      <section>
        <h1>Сессия не найдена</h1>
        <p>В адресе страницы отсутствует идентификатор сессии.</p>

        <Link className="text-link" to="/sessions">
          ← Вернуться к сессиям
        </Link>
      </section>
    )
  }

  if (isLoading && !selectedSession) {
    return (
      <section>
        <p>Загрузка сессии...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <div className="alert-error">
          <p>{error}</p>
        </div>

        <Link className="text-link" to="/sessions">
          ← Вернуться к сессиям
        </Link>
      </section>
    )
  }

  if (!selectedSession) {
    return (
      <section>
        <h1>Сессия не найдена</h1>
        <p>Возможно, сессия была удалена или недоступна текущему пользователю.</p>

        <Link className="text-link" to="/sessions">
          ← Вернуться к сессиям
        </Link>
      </section>
    )
  }

  const participants = selectedSession.participants ?? []
  const scenarioTasks = selectedSession.scenario.tasks ?? []

  return (
    <section>
      <div className="page-header">
        <div>
          <Link className="text-link" to="/sessions">
            ← К списку сессий
          </Link>

          <p className="eyebrow">Игровая сессия</p>
          <h1>{selectedSession.scenario.title}</h1>

          <p>{selectedSession.scenario.description}</p>

          <div className="scenario-card__meta">
            <span>{getStatusLabel(selectedSession.status)}</span>
            <span>{getDomainLabel(selectedSession.scenario.domain)}</span>
            <span>Участников: {participants.length}</span>
          </div>
        </div>

        <div className="header-actions">
          {selectedSession.status === 'PLANNED' && (
            <button
              className="button-primary"
              type="button"
              disabled={isLoading}
              onClick={handleStartSession}
            >
              Запустить
            </button>
          )}

          {selectedSession.status === 'ACTIVE' && (
            <button
              className="button-secondary"
              type="button"
              disabled={isLoading}
              onClick={handleFinishSession}
            >
              Завершить
            </button>
          )}

          <button
            className="button-danger"
            type="button"
            disabled={isLoading}
            onClick={handleDeleteSession}
          >
            Удалить
          </button>
        </div>
      </div>

      <div className="details-grid">
        <article className="details-card">
          <h2>Параметры сессии</h2>

          <dl className="details-list">
            <div>
              <dt>Статус</dt>
              <dd>{getStatusLabel(selectedSession.status)}</dd>
            </div>

            <div>
              <dt>Сценарий</dt>
              <dd>{selectedSession.scenario.title}</dd>
            </div>

            <div>
              <dt>Команда</dt>
              <dd>{selectedSession.team?.name ?? 'Не назначена'}</dd>
            </div>

            <div>
              <dt>Модератор</dt>
              <dd>{selectedSession.moderator?.name ?? 'Не указан'}</dd>
            </div>
          </dl>
        </article>

        <article className="details-card">
          <h2>Задачи сценария</h2>

          {scenarioTasks.length === 0 ? (
            <div className="empty-state">
              <h2>Задач нет</h2>
              <p>
                У выбранного сценария нет задач. Лучше добавить задачи на
                странице сценария перед проведением сессии.
              </p>

              <Link
                className="button-primary"
                to={`/scenarios/${selectedSession.scenario.id}`}
              >
                Открыть сценарий
              </Link>
            </div>
          ) : (
            <div className="tasks-list">
              {scenarioTasks.map((task) => (
                <article className="task-card" key={task.id}>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>

                  {task.expectedResult && (
                    <div className="info-box">
                      <h3>Ожидаемый результат</h3>
                      <p>{task.expectedResult}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="details-card">
          <h2>Участники</h2>

          {participants.length === 0 ? (
            <div className="empty-state">
              <h2>Участников пока нет</h2>
              <p>
                Участники будут добавляться через команду, приглашение или
                отдельный механизм назначения в сессию.
              </p>
            </div>
          ) : (
            <div className="members-list">
              {participants.map((participant) => (
                <article className="member-card" key={participant.id}>
                  <div>
                    <h3>
                    {participant.character?.name ?? `Участник ${participant.id}`}
                    </h3>

                    <p>
                    {participant.character?.profession ?? 'Ролевой профиль не указан'}
                    </p>
                    <div className="scenario-card__meta">
                      <span>ID: {participant.id}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="details-card">
          <h2>События сессии</h2>

          <div className="info-box">
            <h3>Следующий этап</h3>
            <p>
              Здесь будет расположен журнал событий сессии: производственные
              проблемы, изменения условий, технические сбои и информационные
              обновления от модератора.
            </p>
          </div>
        </article>
      </div>
    </section>
  )
}