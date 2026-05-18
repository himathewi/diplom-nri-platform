import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useScenariosStore } from '../../stores/scenariosStore'

export function ScenariosPage() {
  const {
    scenarios,
    isLoading,
    error,
    fetchScenarios,
    clearError,
  } = useScenariosStore()

  useEffect(() => {
    void fetchScenarios()

    return () => {
      clearError()
    }
  }, [fetchScenarios, clearError])

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Сценарии</h1>
          <p>
            Сценарии используются для моделирования производственных ситуаций
            АПК, командного взаимодействия и анализа решений участников.
          </p>
        </div>

        <Link className="button-primary" to="/scenarios/create">
          Создать сценарий
        </Link>
      </div>

      {isLoading && <p>Загрузка сценариев...</p>}

      {error && (
        <div className="alert-error">
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && scenarios.length === 0 && (
        <div className="empty-state">
          <h2>Сценариев пока нет</h2>
          <p>
            Создайте первый сценарий для командной сессии: например, сбой
            логистики во время уборочной кампании или нештатную ситуацию в
            тепличном хозяйстве.
          </p>
        </div>
      )}

      <div className="cards-grid">
        {scenarios.map((scenario) => (
          <article className="scenario-card" key={scenario.id}>
            <div className="scenario-card__header">
              <h2>{scenario.title}</h2>
              <span>Сложность: {scenario.difficulty}</span>
            </div>

            <p>{scenario.description}</p>

            <div className="scenario-card__meta">
              <span>{scenario.domain}</span>
              <span>Задач: {scenario.tasks?.length ?? 0}</span>
            </div>

            <Link to={`/scenarios/${scenario.id}`}>
              Открыть сценарий
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}