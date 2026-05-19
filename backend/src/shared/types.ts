export type UserRole = 'ADMIN' | 'MODERATOR' | 'PARTICIPANT' | 'EXPERT'

export type CurrentUser = {
  id: string
  role: UserRole
}
