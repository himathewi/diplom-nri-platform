import { useEffect } from 'react'
import { useUsersStore } from '../../stores/usersStore'

const roleLabels: Record<string, string> = {
  ADMIN: 'Администратор',
  MODERATOR: 'Модератор',
  PARTICIPANT: 'Участник',
}

export function UsersPage() {
  const {
    users,
    status,
    error,
    fetchUsers,
    clearError,
  } = useUsersStore()

  const isLoading = status === 'loading'

  useEffect(() => {
    void fetchUsers()

    return () => {
      clearError()
    }
  }, [fetchUsers, clearError])

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Пользователи</p>
          <h1>Пользователи портала</h1>
          <p>
            Список пользователей используется для управления ролями, формирования
            команд и назначения участников в сценарные сессии.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert-error">
          <p>{error}</p>
        </div>
      )}

      {isLoading && users.length === 0 && <p>Загрузка пользователей...</p>}

      {!isLoading && users.length === 0 && !error && (
        <div className="empty-state">
          <h2>Пользователей пока нет</h2>
          <p>
            Пользователи появятся здесь после регистрации или добавления через
            backend.
          </p>
        </div>
      )}

      {users.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Email</th>
                <th>Роль</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className="role-badge">
                      {roleLabels[user.role] ?? user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}