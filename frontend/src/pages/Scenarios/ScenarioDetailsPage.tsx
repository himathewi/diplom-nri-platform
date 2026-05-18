import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useScenariosStore } from '../../stores/scenariosStore'

const domainLabels: Record<string, string> = {
  CROP_PRODUCTION: 'Растениеводство',
  GREENHOUSE: 'Тепличное хозяйство',
  LIVESTOCK: 'Животноводство',
  LOGISTICS: 'Логистика',
  PROCESSING: 'Переработка продукции',
  ROBOTICS: 'Робототехника',
  TEAMBUILDING: 'Командное обучение',
}

const taskTypeLabels: Record<string, string> = {
  production_situation: 'Производственная ситуация',
  resource_distribution: 'Распределение ресурсов',
  team_decision: 'Командное решение',
  risk_response: 'Реакция на риск',
  technical_failure: 'Технический сбой',
}

function getDomainLabel(domain: string) {
  return domainLabels[domain] ?? domain
}

function getTaskTypeLabel(taskType: string) {
  return taskTypeLabels[taskType] ?? taskType
}

export function ScenarioDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    selectedScenario,
    isLoading,
    error,
    fetchScenarioById,
    deleteScenario,
    addScenarioTask,
    deleteScenarioTask,
    clearSelectedScenario,
    clearError,
  } = useScenariosStore()

  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskType, setTaskType] = useState('production_situation')
  const [expectedResult, setExpectedResult] = useState('')

  useEffect(() => {
    if (id) {
      void fetchScenarioById(id)
    }

    return () => {
      clearSelectedScenario()
      clearError()
    }
  }, [id, fetchScenarioById, clearSelectedScenario, clearError])

  async function handleDeleteScenario() {
    if (!id) {
      return
    }

    const confirmed = window.confirm(
      'Удалить сценарий? Вместе с ним будут недоступны связанные задачи сценария.',
    )

    if (!confirmed) {
      return
    }

    await deleteScenario(id)
    navigate('/scenarios')
  }

  async function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearError()

    if (!id) {
      return
    }

    const normalizedTitle = taskTitle.trim()
    const normalizedDescription = taskDescription.trim()
    const normalizedTaskType = taskType.trim()
    const normalizedExpectedResult = expectedResult.trim()

    if (!normalizedTitle || !normalizedDescription || !normalizedTaskType) {
      return
    }

    await addScenarioTask(id, {
      title: normalizedTitle,
      description: normalizedDescription,
      taskType: normalizedTaskType,
      expectedResult: normalizedExpectedResult || null,
    })

    setTaskTitle('')
    setTaskDescription('')
    setTaskType('production_situation')
    setExpectedResult('')
  }

  async function handleDeleteTask(taskId: string) {
    if (!id) {
      return
    }

    const confirmed = window.confirm('Удалить задачу сценария?')

    if (!confirmed) {
      return
    }

    await deleteScenarioTask(id, taskId)
  }

  if (!id) {
    return (
      <section>
        <h1>Сценарий не найден</h1>
        <p>В адресе страницы отсутствует идентификатор сценария.</p>
        <Link className="text-link" to="/scenarios">
          ← Вернуться к сценариям
        </Link>
      </section>
    )
  }

  if (isLoading && !selectedScenario) {
    return (
      <section>
        <p>Загрузка сценария...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <div className="alert-error">
          <p>{error}</p>
        </div>

        <Link className="text-link" to="/scenarios">
          ← Вернуться к сценариям
        </Link>
      </section>
    )
  }

  if (!selectedScenario) {
    return (
      <section>
        <h1>Сценарий не найден</h1>
        <p>Возможно, сценарий был удалён или недоступен текущему пользователю.</p>

        <Link className="text-link" to="/scenarios">
          ← Вернуться к сценариям
        </Link>
      </section>
    )
  }

  const tasks = selectedScenario.tasks ?? []

  return (
    <section>
      <div className="page-header">
        <div>
          <Link className="text-link" to="/scenarios">
            ← К списку сценариев
          </Link>

          <p className="eyebrow">Сценарий</p>
          <h1>{selectedScenario.title}</h1>

          <p>{selectedScenario.description}</p>

          <div className="scenario-card__meta">
            <span>{getDomainLabel(selectedScenario.domain)}</span>
            <span>Сложность: {selectedScenario.difficulty} / 5</span>
            <span>Задач: {tasks.length}</span>
          </div>
        </div>

        <button
          className="button-danger"
          type="button"
          onClick={handleDeleteScenario}
        >
          Удалить сценарий
        </button>
      </div>

      <div className="details-grid">
        <article className="details-card">
          <h2>Цель сценария</h2>

          <p>{selectedScenario.goal}</p>
        </article>

        <article className="details-card">
          <h2>Добавление задачи сценария</h2>

          <p>
            Задача сценария описывает отдельный этап, проблему или решение,
            которое участники должны проработать во время сценарной сессии.
          </p>

          <form className="task-form" onSubmit={handleAddTask}>
            <label className="form-field">
              <span>Название задачи</span>
              <input
                required
                maxLength={120}
                value={taskTitle}
                placeholder="Например: Распределить технику между участками"
                onChange={(event) => setTaskTitle(event.target.value)}
              />
            </label>

            <label className="form-field">
              <span>Тип задачи</span>
              <select
                value={taskType}
                onChange={(event) => setTaskType(event.target.value)}
              >
                <option value="production_situation">
                  Производственная ситуация
                </option>
                <option value="resource_distribution">
                  Распределение ресурсов
                </option>
                <option value="team_decision">Командное решение</option>
                <option value="risk_response">Реакция на риск</option>
                <option value="technical_failure">Технический сбой</option>
              </select>
            </label>

            <label className="form-field">
              <span>Описание задачи</span>
              <textarea
                required
                rows={4}
                value={taskDescription}
                placeholder="Опишите, что должны проанализировать и решить участники."
                onChange={(event) => setTaskDescription(event.target.value)}
              />
            </label>

            <label className="form-field">
              <span>Ожидаемый результат</span>
              <textarea
                rows={3}
                value={expectedResult}
                placeholder="Например: участники должны выбрать приоритетный маршрут и обосновать решение."
                onChange={(event) => setExpectedResult(event.target.value)}
              />
            </label>

            <div className="form-actions">
              <button
                className="button-primary"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Сохранение...' : 'Добавить задачу'}
              </button>
            </div>
          </form>
        </article>

        <article className="details-card">
          <h2>Задачи сценария</h2>

          {tasks.length === 0 ? (
            <div className="empty-state">
              <h2>Задач пока нет</h2>
              <p>
                Добавь хотя бы одну задачу, иначе сценарий невозможно
                использовать как нормальную учебную сессию.
              </p>
            </div>
          ) : (
            <div className="tasks-list">
              {tasks.map((task) => (
                <article className="task-card" key={task.id}>
                  <div className="task-card__header">
                    <div>
                      <h3>{task.title}</h3>

                      <div className="scenario-card__meta">
                        <span>{getTaskTypeLabel(task.taskType)}</span>
                      </div>
                    </div>

                    <button
                      className="button-ghost-danger"
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      Удалить
                    </button>
                  </div>

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
      </div>
    </section>
  )
}