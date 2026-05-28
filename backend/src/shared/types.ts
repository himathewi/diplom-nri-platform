export type UserRole = 'ADMIN' | 'MODERATOR' | 'PARTICIPANT'

export type CurrentUser = {
  id: string
  role: UserRole
}
