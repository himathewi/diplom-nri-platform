import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { LoginPage } from '../pages/Auth/LoginPage'
import { RegisterPage } from '../pages/Auth/RegisterPage'
import { ProfilePage } from '../pages/ProfilePage'
import { JoinTeamPage } from '../pages/Teams/JoinTeamPage'
import { TeamDetailsPage } from '../pages/Teams/TeamDetailsPage'
import { TeamsPage } from '../pages/Teams/TeamPage'
import { CreateScenarioPage } from '../pages/Scenarios/CreateScenarioPage'
import { ScenarioDetailsPage } from '../pages/Scenarios/ScenarioDetailsPage'
import { ScenariosPage } from '../pages/Scenarios/ScenariosPage'
import { SessionsPage } from '../pages/Sessions/SessionsPage'
import { GuestRoute } from './GuestRoute'
import { ProtectedRoute } from './ProtectedRoute'
import { CreateSessionPage } from '../pages/Sessions/CreateSessionPage'
import { SessionDetailsPage } from '../pages/Sessions/SessionDetailsPage'
import { InvitationCodePage } from '../pages/Invitations/InvitationCodePage'
import { InvitationLinkPage } from '../pages/Invitations/InvitationLinkPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />

          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />

            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/join" element={<JoinTeamPage />} />
            <Route path="/teams/:id" element={<TeamDetailsPage />} />

            <Route path="/scenarios" element={<ScenariosPage />} />
            <Route path="/scenarios/create" element={<CreateScenarioPage />} />
            <Route path="/scenarios/:id" element={<ScenarioDetailsPage />} />

            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/sessions/:id" element={<SessionDetailsPage />} />
            <Route path="/sessions/create" element={<CreateSessionPage />} />
            <Route path="/invitations/code" element={<InvitationCodePage />} />
            <Route path="/invitations/link/:token" element={<InvitationLinkPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}