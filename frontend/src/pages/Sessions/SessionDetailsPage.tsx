import { type FormEvent, useEffect, useState } from 'react'
import { useSessionEventsStore } from '../../stores/sessionEventsStore'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSessionsStore } from '../../stores/sessionsStore'
import type { SessionEventType } from '../../types/sessionEvent'
import { useDecisionsStore } from '../../stores/decisionsStore'

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
const eventTypeLabels: Record<string, string> = {
  PRODUCTION_PROBLEM: 'Производственная проблема',
  WEATHER_CHANGE: 'Изменение погодных условий',
  RESOURCE_LIMIT: 'Ограничение ресурсов',
  EQUIPMENT_FAILURE: 'Сбой оборудования',
  TEAM_CONFLICT: 'Командный конфликт',
  INFORMATION_UPDATE: 'Информационное обновление',
}

function getEventTypeLabel(eventType: string) {
  return eventTypeLabels[eventType] ?? eventType
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

  const {
    events,
    isLoading: isEventsLoading,
    error: eventsError,
    fetchSessionEvents,
    createSessionEvent,
    deleteSessionEvent,
    clearEvents,
    clearError: clearEventsError,
  } = useSessionEventsStore()

  const {
    decisions,
    isLoading: isDecisionsLoading,
    error: decisionsError,
    fetchSessionDecisions,
    createDecision,
    evaluateDecision,
    deleteDecision,
    clearDecisions,
    clearError: clearDecisionsError,
  } = useDecisionsStore()
  
  const [eventTitle, setEventTitle] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [eventType, setEventType] =
    useState<SessionEventType>('PRODUCTION_PROBLEM')
  const [eventImpact, setEventImpact] = useState('')

  const [decisionEventId, setDecisionEventId] = useState('')
  const [decisionDescription, setDecisionDescription] = useState('')
  const [decisionResult, setDecisionResult] = useState('')
  const [decisionScore, setDecisionScore] = useState(3)
  const [moderatorComment, setModeratorComment] = useState('')

  useEffect(() => {
    if (id) {
      void fetchSessionById(id)
    }

    return () => {
      clearSelectedSession()
      clearError()
    }
  }, [id, fetchSessionById, clearSelectedSession, clearError])

  useEffect(() => {
    if (id) {
      void fetchSessionEvents(id)
    }

    return () => {
      clearEvents()
      clearEventsError()
    }
  }, [id, fetchSessionEvents, clearEvents, clearEventsError])

  useEffect(() => {
    if (id) {
      void fetchSessionDecisions(id)
    }

    return () => {
      clearDecisions()
      clearDecisionsError()
    }
  }, [id, fetchSessionDecisions, clearDecisions, clearDecisionsError])

  async function handleAddEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearEventsError()

    if (!id || selectedSession?.status !== 'ACTIVE') {
      return
    }

    const normalizedTitle = eventTitle.trim()
    const normalizedDescription = eventDescription.trim()
    const normalizedImpact = eventImpact.trim()

    if (!normalizedTitle || !normalizedDescription) {
      return
    }

    const createdEvent = await createSessionEvent(id, {
      title: normalizedTitle,
      description: normalizedDescription,
      eventType,
      impact: normalizedImpact || null,
    })

    if (!createdEvent) {
      return
    }

    setEventTitle('')
    setEventDescription('')
    setEventType('PRODUCTION_PROBLEM')
    setEventImpact('')
  }

  async function handleDeleteEvent(eventId: string) {
    const confirmed = window.confirm('Удалить событие сессии?')

    if (!confirmed) {
      return
    }

    await deleteSessionEvent(eventId)
  }

  async function handleAddDecision(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
  clearDecisionsError()

  if (!id || selectedSession?.status !== 'ACTIVE') {
    return
  }

  const normalizedDescription = decisionDescription.trim()
  const normalizedResult = decisionResult.trim()

  if (!normalizedDescription) {
    return
  }

  const createdDecision = await createDecision(id, {
    eventId: decisionEventId || null,
    description: normalizedDescription,
    result: normalizedResult || null,
  })

  if (!createdDecision) {
    return
  }

  setDecisionEventId('')
  setDecisionDescription('')
  setDecisionResult('')
}

async function handleEvaluateDecision(decisionId: string) {
  const normalizedComment = moderatorComment.trim()

  const evaluatedDecision = await evaluateDecision(decisionId, {
    score: decisionScore,
    moderatorComment: normalizedComment || null,
  })

  if (!evaluatedDecision) {
    return
  }

  setDecisionScore(3)
  setModeratorComment('')
}

async function handleDeleteDecision(decisionId: string) {
  const confirmed = window.confirm('Удалить решение?')

  if (!confirmed) {
    return
  }

  await deleteDecision(decisionId)
}

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

          {selectedSession.status === 'PLANNED' && (
            <div className="info-box">
              <h3>Сессия ещё не запущена</h3>
              <p>
                Запустите сессию, чтобы модератор мог добавлять события и фиксировать
                изменения производственной ситуации.
              </p>
            </div>
          )}

          {selectedSession.status === 'ACTIVE' && (
            <form className="task-form session-event-form" onSubmit={handleAddEvent}>
              <label className="form-field">
                <span>Название события</span>
                <input
                  required
                  maxLength={120}
                  value={eventTitle}
                  placeholder="Например: Сбой охлаждения партии продукции"
                  onChange={(event) => setEventTitle(event.target.value)}
                />
              </label>

              <label className="form-field">
                <span>Тип события</span>
                <select
                  value={eventType}
                  onChange={(event) =>
                    setEventType(event.target.value as SessionEventType)
                  }
                >
                  <option value="PRODUCTION_PROBLEM">Производственная проблема</option>
                  <option value="WEATHER_CHANGE">Изменение погодных условий</option>
                  <option value="RESOURCE_LIMIT">Ограничение ресурсов</option>
                  <option value="EQUIPMENT_FAILURE">Сбой оборудования</option>
                  <option value="TEAM_CONFLICT">Командный конфликт</option>
                  <option value="INFORMATION_UPDATE">Информационное обновление</option>
                </select>
              </label>

              <label className="form-field">
                <span>Описание</span>
                <textarea
                  required
                  rows={4}
                  value={eventDescription}
                  placeholder="Опишите, что изменилось в ситуации и какие ограничения появились у участников."
                  onChange={(event) => setEventDescription(event.target.value)}
                />
              </label>

              <label className="form-field">
                <span>Влияние на сессию</span>
                <textarea
                  rows={3}
                  value={eventImpact}
                  placeholder="Например: команда должна перераспределить ресурсы или изменить маршрут."
                  onChange={(event) => setEventImpact(event.target.value)}
                />
              </label>

              {eventsError && (
                <div className="alert-error">
                  <p>{eventsError}</p>
                </div>
              )}

              <div className="form-actions">
                <button
                  className="button-primary"
                  type="submit"
                  disabled={isEventsLoading}
                >
                  {isEventsLoading ? 'Сохранение...' : 'Добавить событие'}
                </button>
              </div>
            </form>
          )}

          {selectedSession.status === 'FINISHED' && (
            <div className="info-box">
              <h3>Сессия завершена</h3>
              <p>
                Журнал событий доступен только для просмотра и последующего анализа.
              </p>
            </div>
          )}

          {isEventsLoading && events.length === 0 && <p>Загрузка событий...</p>}

          {!isEventsLoading && events.length === 0 && (
            <div className="empty-state">
              <h2>Событий пока нет</h2>
              <p>
                Во время активной сессии модератор сможет добавлять события, которые
                меняют условия сценария и требуют решений участников.
              </p>
            </div>
          )}

          {events.length > 0 && (
            <div className="events-list">
              {events.map((sessionEvent) => (
                <article className="event-card" key={sessionEvent.id}>
                  <div className="task-card__header">
                    <div>
                      <h3>{sessionEvent.title}</h3>

                      <div className="scenario-card__meta">
                        <span>{getEventTypeLabel(sessionEvent.eventType)}</span>
                      </div>
                    </div>

                    {selectedSession.status === 'ACTIVE' && (
                      <button
                        className="button-ghost-danger"
                        type="button"
                        onClick={() => handleDeleteEvent(sessionEvent.id)}
                      >
                        Удалить
                      </button>
                    )}
                  </div>

                  <p>{sessionEvent.description}</p>

                  {sessionEvent.impact && (
                    <div className="info-box">
                      <h3>Влияние</h3>
                      <p>{sessionEvent.impact}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="details-card">
          <h2>Решения участников</h2>

          {selectedSession.status === 'PLANNED' && (
            <div className="info-box">
              <h3>Сессия ещё не запущена</h3>
              <p>
                Решения можно фиксировать только после запуска сессии и появления
                сценарных событий.
              </p>
            </div>
          )}

          {selectedSession.status === 'ACTIVE' && (
            <form className="task-form decision-form" onSubmit={handleAddDecision}>
              <label className="form-field">
                <span>Связанное событие</span>

                <select
                  value={decisionEventId}
                  onChange={(event) => setDecisionEventId(event.target.value)}
                >
                  <option value="">Без привязки к событию</option>

                  {events.map((sessionEvent) => (
                    <option key={sessionEvent.id} value={sessionEvent.id}>
                      {sessionEvent.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>Описание решения</span>

                <textarea
                  required
                  rows={4}
                  value={decisionDescription}
                  placeholder="Опишите решение команды или участника по текущей ситуации."
                  onChange={(event) => setDecisionDescription(event.target.value)}
                />
              </label>

              <label className="form-field">
                <span>Результат решения</span>

                <textarea
                  rows={3}
                  value={decisionResult}
                  placeholder="Например: выбран альтернативный маршрут, перераспределены ресурсы, назначен ответственный."
                  onChange={(event) => setDecisionResult(event.target.value)}
                />
              </label>

              {decisionsError && (
                <div className="alert-error">
                  <p>{decisionsError}</p>
                </div>
              )}

              <div className="form-actions">
                <button
                  className="button-primary"
                  type="submit"
                  disabled={isDecisionsLoading}
                >
                  {isDecisionsLoading ? 'Сохранение...' : 'Добавить решение'}
                </button>
              </div>
            </form>
          )}

          {selectedSession.status === 'FINISHED' && (
            <div className="info-box">
              <h3>Сессия завершена</h3>
              <p>
                Решения доступны для просмотра и анализа. Новые решения после
                завершения сессии не добавляются.
              </p>
            </div>
          )}

          {isDecisionsLoading && decisions.length === 0 && (
            <p>Загрузка решений...</p>
          )}

          {!isDecisionsLoading && decisions.length === 0 && (
            <div className="empty-state">
              <h2>Решений пока нет</h2>
              <p>
                Во время активной сессии здесь будут фиксироваться решения участников
                или команды по событиям сценария.
              </p>
            </div>
          )}

          {decisions.length > 0 && (
            <div className="decisions-list">
              {decisions.map((decision) => (
                <article className="decision-card" key={decision.id}>
                  <div className="task-card__header">
                    <div>
                      <h3>Решение #{decision.id}</h3>

                      <div className="scenario-card__meta">
                        {decision.eventId && <span>Событие: {decision.eventId}</span>}
                        {decision.score !== null && decision.score !== undefined && (
                          <span>Оценка: {decision.score} / 5</span>
                        )}
                      </div>
                    </div>

                    {selectedSession.status === 'ACTIVE' && (
                      <button
                        className="button-ghost-danger"
                        type="button"
                        onClick={() => handleDeleteDecision(decision.id)}
                      >
                        Удалить
                      </button>
                    )}
                  </div>

                  <p>{decision.description}</p>

                  {decision.result && (
                    <div className="info-box">
                      <h3>Результат</h3>
                      <p>{decision.result}</p>
                    </div>
                  )}

                  {decision.moderatorComment && (
                    <div className="info-box">
                      <h3>Комментарий модератора</h3>
                      <p>{decision.moderatorComment}</p>
                    </div>
                  )}

                  {selectedSession.status === 'ACTIVE' && (
                    <form
                      className="decision-evaluation-form"
                      onSubmit={(event) => {
                        event.preventDefault()
                        void handleEvaluateDecision(decision.id)
                      }}
                    >
                      <label className="form-field">
                        <span>Оценка решения</span>

                        <input
                          min={1}
                          max={5}
                          type="number"
                          value={decisionScore}
                          onChange={(event) => {
                            const value = Number(event.target.value)
                            setDecisionScore(Math.min(5, Math.max(1, value)))
                          }}
                        />
                      </label>

                      <label className="form-field">
                        <span>Комментарий модератора</span>

                        <textarea
                          rows={2}
                          value={moderatorComment}
                          placeholder="Кратко оцените качество решения."
                          onChange={(event) => setModeratorComment(event.target.value)}
                        />
                      </label>

                      <div className="form-actions">
                        <button
                          className="button-secondary"
                          type="submit"
                          disabled={isDecisionsLoading}
                        >
                          Оценить
                        </button>
                      </div>
                    </form>
                  )}
                </article>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  )
}