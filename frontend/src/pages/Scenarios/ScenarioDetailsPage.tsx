import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useScenariosStore } from '../../stores/scenariosStore'

const domainLabels: Record<string, string> = {
  CROP_PRODUCTION: 'Растениеводство',
  GREENHOUSE: 'Тепличное хозяйство',
  LIVESTOCK: 'Животноводство',
  LOGISTICS: 'Логистика',
  PROCESSING: 'Переработка',
  ROBOTICS: 'Робототехника',
  TEAMBUILDING: 'Тимбилдинг',
}

function getDomainLabel(domain: string) {
  return domainLabels[domain] ?? domain
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
    clearSelectedScenario,
    clearError,
  } = useScenariosStore()

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
      'Удалить сценарий? Это действие нельзя отменить.',
    )

    if (!confirmed) {
      return
    }

    await deleteScenario(id)
    navigate('/scenarios')
  }

  if (!id) {
    return (
      <section>
        <h1>Сценарий не найден</h1>
        <p>В адресе страницы отсутствует идентификатор сценария.</p>
        <Link to="/scenarios">Вернуться к сценариям</Link>
      </section>
    )
  }

  if (isLoading) {
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

        <Link to="/scenarios">Вернуться к сценариям</Link>
      </section>
    )
  }

  if (!selectedScenario) {
    return (
      <section>
        <h1>Сценарий не найден</h1>
        <p>Возможно, сценарий был удалён или недоступен текущему пользователю.</p>
        <Link to="/scenarios">Вернуться к сценариям</Link>
      </section>
    )
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <Link className="text-link" to="/scenarios">
            ← К списку сценариев
          </Link>

          <h1>{selectedScenario.title}</h1>

          <p>{selectedScenario.description}</p>
        </div>

        <button
          className="button-danger"
          type="button"
          onClick={handleDeleteScenario}
        >
          Удалить
        </button>
      </div>

      <div className="details-grid">
        <article className="details-card">
          <h2>Параметры сценария</h2>

          <dl className="details-list">
            <div>
              <dt>Направление</dt>
              <dd>{getDomainLabel(selectedScenario.domain)}</dd>
            </div>

            <div>
              <dt>Сложность</dt>
              <dd>{selectedScenario.difficulty} / 5</dd>
            </div>

            <div>
              <dt>Цель</dt>
              <dd>{selectedScenario.goal}</dd>
            </div>
          </dl>
        </article>

        <article className="details-card">
          <h2>Задачи сценария</h2>

          {selectedScenario.tasks.length === 0 ? (
            <p>
              Для сценария пока не добавлены задачи. Позже здесь будет интерфейс
              добавления этапов сценарной сессии.
            </p>
          ) : (
            <div className="tasks-list">
              {selectedScenario.tasks.map((task) => (
                <article className="task-card" key={task.id}>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>

                  <div className="scenario-card__meta">
                    <span>{task.taskType}</span>
                    {task.expectedResult && (
                      <span>Ожидаемый результат: {task.expectedResult}</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  )
}