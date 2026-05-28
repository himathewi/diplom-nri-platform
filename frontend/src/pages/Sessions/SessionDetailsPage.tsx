import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  getLabel,
  scenarioDomainLabels,
  sessionEventTypeLabels,
  sessionStatusLabels,
} from '../../constants/labels'
import { useDecisionsStore } from '../../stores/decisionsStore'
import { useReportsStore } from '../../stores/reportsStore'
import { useSessionEventsStore } from '../../stores/sessionEventsStore'
import { useSessionsStore } from '../../stores/sessionsStore'
import type { SessionEventType } from '../../types/sessionEvent'
import { useInvitationsStore } from '../../stores/invitationsStore'
import type { InvitationType } from '../../types/invitation'  
import { useSessionTasksStore } from '../../stores/sessionTasksStore'

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

  const {
    selectedReport,
    isLoading: isReportLoading,
    error: reportError,
    fetchReportBySessionId,
    createReport,
    deleteReport,
    clearSelectedReport,
    clearError: clearReportError,
  } = useReportsStore()
  const {
    invitations,
    createdInviteUrl,
    createdCode,
    isLoading: isInvitationsLoading,
    error: invitationsError,
    fetchSessionInvitations,
    createSessionInvitation,
    revokeInvitation,
    clearInvitationResult,
    clearError: clearInvitationsError,
  } = useInvitationsStore()
  const {
    sessionTasks,
    isLoading: isSessionTasksLoading,
    error: sessionTasksError,
    fetchSessionTasks,
    createSessionTask,
    deleteSessionTask,
    clearSessionTasks,
    clearError: clearSessionTasksError,
  } = useSessionTasksStore()
  
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
  const [invitationType, setInvitationType] = useState<InvitationType>('LINK')
  const [invitationExpiresInHours, setInvitationExpiresInHours] = useState(24)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescriptionForParticipants, setTaskDescriptionForParticipants] =
    useState('')
  const [taskDescriptionForModerator, setTaskDescriptionForModerator] =
    useState('')
  const [taskDifficulty, setTaskDifficulty] = useState(3)
  const [taskFatigueCost, setTaskFatigueCost] = useState(1)
  const [isTaskVisible, setIsTaskVisible] = useState(true)

  const [checkTaskId, setCheckTaskId] = useState('')
  const [checkResult, setCheckResult] = useState<{
    dice: number
    difficulty: number
    success: boolean
  } | null>(null)

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

  useEffect(() => {
    if (id && selectedSession?.status === 'FINISHED') {
      void fetchReportBySessionId(id)
    }

    return () => {
      clearSelectedReport()
      clearReportError()
    }
  }, [
    id,
    selectedSession?.status,
    fetchReportBySessionId,
    clearSelectedReport,
    clearReportError,
  ])
  useEffect(() => {
  if (id) {
    void fetchSessionInvitations(id)
  }

  return () => {
    clearInvitationResult()
    clearInvitationsError()
  }
  }, [
    id,
    fetchSessionInvitations,
    clearInvitationResult,
    clearInvitationsError,
  ])
  useEffect(() => {
    if (id) {
      void fetchSessionTasks(id)
    }

    return () => {
      clearSessionTasks()
      clearSessionTasksError()
    }
  }, [id, fetchSessionTasks, clearSessionTasks, clearSessionTasksError])

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

async function handleCreateReport() {
  if (!id || selectedSession?.status !== 'FINISHED') {
    return
  }

  await createReport(id)
}

async function handleDeleteReport() {
  if (!selectedReport) {
    return
  }

  const confirmed = window.confirm('Удалить отчёт по сессии?')

  if (!confirmed) {
    return
  }

  await deleteReport(selectedReport.id)
}
async function handleCreateInvitation(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
  clearInvitationsError()
  clearInvitationResult()

  if (!id || selectedSession?.status !== 'PLANNED') {
    return
  }

  await createSessionInvitation(id, {
    type: invitationType,
    expiresInHours: invitationExpiresInHours,
  })
}

async function handleRevokeInvitation(invitationId: string) {
  const confirmed = window.confirm('Отозвать приглашение?')

  if (!confirmed) {
    return
  }

  await revokeInvitation(invitationId)
}
  async function handleCreateSessionTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearSessionTasksError()

    if (!id || selectedSession?.status !== 'PLANNED') {
      return
    }

    const normalizedTitle = taskTitle.trim()
    const normalizedParticipantDescription =
      taskDescriptionForParticipants.trim()
    const normalizedModeratorDescription = taskDescriptionForModerator.trim()

    if (!normalizedTitle || !normalizedParticipantDescription) {
      return
    }

    const createdTask = await createSessionTask(id, {
      title: normalizedTitle,
      descriptionForParticipants: normalizedParticipantDescription,
      descriptionForModerator: normalizedModeratorDescription || undefined,
      difficulty: taskDifficulty,
      fatigueCost: taskFatigueCost,
      isVisibleToParticipants: isTaskVisible,
    })

    if (!createdTask) {
      return
    }

    setTaskTitle('')
    setTaskDescriptionForParticipants('')
    setTaskDescriptionForModerator('')
    setTaskDifficulty(3)
    setTaskFatigueCost(1)
    setIsTaskVisible(true)
  }

  async function handleDeleteSessionTask(taskId: string) {
    const confirmed = window.confirm('Удалить задание сессии?')

    if (!confirmed) {
      return
    }

    await deleteSessionTask(taskId)
  }

  function handleRollD6(taskId: string) {
    const task = sessionTasks.find((item) => item.id === taskId)

    if (!task) {
      return
    }

    const dice = Math.floor(Math.random() * 6) + 1
    const difficulty = task.difficulty ?? 1

    setCheckTaskId(taskId)
    setCheckResult({
      dice,
      difficulty,
      success: dice >= difficulty,
    })
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
            <span>{getLabel(sessionStatusLabels, selectedSession.status)}</span>
            <span>{getLabel(scenarioDomainLabels, selectedSession.scenario.domain)}</span>
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
              <dd>getLabel(sessionStatusLabels, selectedSession.status)</dd>
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
          <h2>Задания сессии</h2>

          {selectedSession.status === 'PLANNED' && (
            <form className="task-form session-task-form" onSubmit={handleCreateSessionTask}>
              <label className="form-field">
                <span>Название задания</span>

                <input
                  required
                  maxLength={120}
                  value={taskTitle}
                  placeholder="Например: Проверить условия хранения продукции"
                  onChange={(event) => setTaskTitle(event.target.value)}
                />
              </label>

              <label className="form-field">
                <span>Описание для участников</span>

                <textarea
                  required
                  rows={3}
                  value={taskDescriptionForParticipants}
                  placeholder="Опишите задачу так, как её увидит команда."
                  onChange={(event) =>
                    setTaskDescriptionForParticipants(event.target.value)
                  }
                />
              </label>

              <label className="form-field">
                <span>Заметка модератора</span>

                <textarea
                  rows={3}
                  value={taskDescriptionForModerator}
                  placeholder="Скрытая подсказка, критерии выполнения или последствия ошибки."
                  onChange={(event) =>
                    setTaskDescriptionForModerator(event.target.value)
                  }
                />
              </label>

              <div className="form-row">
                <label className="form-field">
                  <span>Сложность</span>

                  <input
                    min={1}
                    max={6}
                    type="number"
                    value={taskDifficulty}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      setTaskDifficulty(Math.min(6, Math.max(1, value)))
                    }}
                  />
                </label>

                <label className="form-field">
                  <span>Расход усталости</span>

                  <input
                    min={0}
                    max={10}
                    type="number"
                    value={taskFatigueCost}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      setTaskFatigueCost(Math.min(10, Math.max(0, value)))
                    }}
                  />
                </label>
              </div>

              <label className="checkbox-field">
                <input
                  checked={isTaskVisible}
                  type="checkbox"
                  onChange={(event) => setIsTaskVisible(event.target.checked)}
                />

                <span>Показывать участникам</span>
              </label>

              {sessionTasksError && (
                <div className="alert-error">
                  <p>{sessionTasksError}</p>
                </div>
              )}

              <div className="form-actions">
                <button
                  className="button-primary"
                  type="submit"
                  disabled={isSessionTasksLoading}
                >
                  {isSessionTasksLoading ? 'Сохранение...' : 'Добавить задание'}
                </button>
              </div>
            </form>
          )}

          {selectedSession.status === 'ACTIVE' && (
            <div className="info-box">
              <h3>Сессия активна</h3>
              <p>
                Участники могут выполнять открытые задания. Для демонстрации проверки
                действия используется бросок к6: результат считается успешным, если
                значение кубика не ниже сложности задания.
              </p>
            </div>
          )}

          {selectedSession.status === 'FINISHED' && (
            <div className="info-box">
              <h3>Сессия завершена</h3>
              <p>
                Задания доступны для просмотра и последующего анализа результатов.
              </p>
            </div>
          )}

          {isSessionTasksLoading && sessionTasks.length === 0 && (
            <p>Загрузка заданий...</p>
          )}

          {!isSessionTasksLoading && sessionTasks.length === 0 && (
            <div className="empty-state">
              <h2>Заданий пока нет</h2>
              <p>
                Добавьте задания сессии, чтобы участники могли выполнять действия,
                расходовать усталость и получать результат проверки.
              </p>
            </div>
          )}

          {sessionTasks.length > 0 && (
            <div className="session-tasks-list">
              {sessionTasks.map((task) => (
                <article className="session-task-card" key={task.id}>
                  <div className="task-card__header">
                    <div>
                      <h3>{task.title}</h3>

                      <div className="scenario-card__meta">
                        <span>Сложность: {task.difficulty ?? 1}</span>
                        <span>Усталость: {task.fatigueCost ?? 0}</span>
                        <span>
                          {task.isVisibleToParticipants
                            ? 'Видно участникам'
                            : 'Скрыто от участников'}
                        </span>
                      </div>
                    </div>

                    {selectedSession.status === 'PLANNED' && (
                      <button
                        className="button-ghost-danger"
                        type="button"
                        disabled={isSessionTasksLoading}
                        onClick={() => handleDeleteSessionTask(task.id)}
                      >
                        Удалить
                      </button>
                    )}
                  </div>

                  <p>{task.descriptionForParticipants}</p>

                  {task.descriptionForModerator && (
                    <div className="info-box">
                      <h3>Заметка модератора</h3>
                      <p>{task.descriptionForModerator}</p>
                    </div>
                  )}

                  {selectedSession.status === 'ACTIVE' && (
                    <div className="task-check-panel">
                      <div>
                        <h3>Проверка действия к6</h3>
                        <p>
                          Бросок должен быть не ниже сложности задания. Расход усталости:
                          {` ${task.fatigueCost ?? 0}`}.
                        </p>
                      </div>

                      <button
                        className="button-secondary"
                        type="button"
                        onClick={() => handleRollD6(task.id)}
                      >
                        Бросить к6
                      </button>

                      {checkTaskId === task.id && checkResult && (
                        <div className="dice-result">
                          <span>Кубик: {checkResult.dice}</span>
                          <span>Сложность: {checkResult.difficulty}</span>
                          <strong>
                            {checkResult.success ? 'Успех' : 'Неудача'}
                          </strong>
                        </div>
                      )}
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
                    {participant.character?.professionalFunction ?? 'Ролевой профиль не указан'}
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
          <h2>Приглашения участников</h2>

          {selectedSession.status === 'PLANNED' ? (
            <form className="task-form invitation-form" onSubmit={handleCreateInvitation}>
              <label className="form-field">
                <span>Тип приглашения</span>

                <select
                  value={invitationType}
                  onChange={(event) =>
                    setInvitationType(event.target.value as InvitationType)
                  }
                >
                  <option value="LINK">Ссылка-приглашение</option>
                  <option value="CODE">6-значный код</option>
                </select>
              </label>

              <label className="form-field">
                <span>Срок действия, часов</span>

                <input
                  min={1}
                  max={168}
                  type="number"
                  value={invitationExpiresInHours}
                  onChange={(event) => {
                    const value = Number(event.target.value)
                    setInvitationExpiresInHours(Math.min(168, Math.max(1, value)))
                  }}
                />
              </label>

              {invitationsError && (
                <div className="alert-error">
                  <p>{invitationsError}</p>
                </div>
              )}

              <div className="form-actions">
                <button
                  className="button-primary"
                  type="submit"
                  disabled={isInvitationsLoading}
                >
                  {isInvitationsLoading ? 'Создание...' : 'Создать приглашение'}
                </button>
              </div>
            </form>
          ) : (
            <div className="info-box">
              <h3>Создание приглашений недоступно</h3>
              <p>
                Приглашения можно создавать только до запуска сессии. После запуска
                состав участников фиксируется.
              </p>
            </div>
          )}

          {(createdInviteUrl || createdCode) && (
            <div className="invitation-result">
              <h3>Приглашение создано</h3>

              {createdInviteUrl && (
                <label className="form-field">
                  <span>Ссылка</span>
                  <input readOnly value={createdInviteUrl} />
                </label>
              )}

              {createdCode && (
                <label className="form-field">
                  <span>Код приглашения</span>
                  <input readOnly value={createdCode} />
                </label>
              )}
            </div>
          )}

          {isInvitationsLoading && invitations.length === 0 && (
            <p>Загрузка приглашений...</p>
          )}

          {!isInvitationsLoading && invitations.length === 0 && (
            <div className="empty-state">
              <h2>Приглашений пока нет</h2>
              <p>
                Создайте ссылку или код, чтобы участник мог присоединиться к
                запланированной игровой сессии.
              </p>
            </div>
          )}

          {invitations.length > 0 && (
            <div className="invitations-list">
              {invitations.map((invitation) => (
                <article className="invitation-card" key={invitation.id}>
                  <div className="task-card__header">
                    <div>
                      <h3>
                        {invitation.type === 'LINK'
                          ? 'Ссылка-приглашение'
                          : 'Код приглашения'}
                      </h3>

                      <div className="scenario-card__meta">
                        <span>Статус: {invitation.status}</span>
                        <span>
                          Действует до:{' '}
                          {new Date(invitation.expiresAt).toLocaleString()}
                        </span>
                        <span>Попыток: {invitation.attemptsCount}</span>
                      </div>
                    </div>

                    {selectedSession.status === 'PLANNED' &&
                      invitation.status === 'PENDING' && (
                        <button
                          className="button-ghost-danger"
                          type="button"
                          disabled={isInvitationsLoading}
                          onClick={() => handleRevokeInvitation(invitation.id)}
                        >
                          Отозвать
                        </button>
                      )}
                  </div>

                  {invitation.invitedUser && (
                    <p>
                      Участник: {invitation.invitedUser.name} ·{' '}
                      {invitation.invitedUser.email}
                    </p>
                  )}
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
                        <span>{getLabel(sessionEventTypeLabels, sessionEvent.eventType)}</span>
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
        
        <article className="details-card">
          <h2>Итоговый отчёт</h2>

          {selectedSession.status !== 'FINISHED' && (
            <div className="info-box">
              <h3>Отчёт пока недоступен</h3>
              <p>
                Итоговый отчёт формируется после завершения сессии, когда уже доступны
                события, решения участников и оценки модератора.
              </p>
            </div>
          )}

          {selectedSession.status === 'FINISHED' && !selectedReport && (
            <>
              <div className="info-box">
                <h3>Отчёт ещё не сформирован</h3>
                <p>
                  Сформируйте итоговый отчёт, чтобы зафиксировать результаты сценарной
                  сессии, успешные действия, проблемные решения и рекомендации для
                  команды.
                </p>
              </div>

              {reportError && (
                <div className="alert-error report-error">
                  <p>{reportError}</p>
                </div>
              )}

              <div className="form-actions report-actions">
                <button
                  className="button-primary"
                  type="button"
                  disabled={isReportLoading}
                  onClick={handleCreateReport}
                >
                  {isReportLoading ? 'Формирование...' : 'Сформировать отчёт'}
                </button>
              </div>
            </>
          )}

          {selectedSession.status === 'FINISHED' && selectedReport && (
            <div className="report-card">
              <div className="task-card__header">
                <div>
                  <h3>Отчёт #{selectedReport.id}</h3>

                  <div className="scenario-card__meta">
                    <span>Сессия: {selectedReport.sessionId}</span>
                    <span>Создан: {new Date(selectedReport.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  className="button-ghost-danger"
                  type="button"
                  disabled={isReportLoading}
                  onClick={handleDeleteReport}
                >
                  Удалить
                </button>
              </div>

              <div className="report-section">
                <h4>Краткое резюме</h4>
                <p>{selectedReport.summary}</p>
              </div>

              {selectedReport.successfulActions && (
                <div className="report-section">
                  <h4>Успешные действия</h4>
                  <p>{selectedReport.successfulActions}</p>
                </div>
              )}

              {selectedReport.problemActions && (
                <div className="report-section">
                  <h4>Проблемные действия</h4>
                  <p>{selectedReport.problemActions}</p>
                </div>
              )}

              {selectedReport.recommendations && (
                <div className="report-section">
                  <h4>Рекомендации</h4>
                  <p>{selectedReport.recommendations}</p>
                </div>
              )}
            </div>
          )}
        </article>
      </div>
    </section>
  )
}