import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export function ProtectedRoute() {
  const location = useLocation()

  const {
    user,
    isAuthenticated,
    isLoading,
    loadCurrentUser,
  } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && !user) {
      void loadCurrentUser()
    }
  }, [isAuthenticated, user, loadCurrentUser])

  if (isLoading) {
    return (
      <section>
        <p>Проверка авторизации...</p>
      </section>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}