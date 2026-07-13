import api from '../lib/axios'
import type { User } from '../types'

export const login = (email: string, password: string) =>
  api.post<{ user: User; token: string }>('/auth/login', { email, password }).then((r) => r.data)

export const register = (data: { email: string; password: string; name: string }) =>
  api.post<{ pendingApproval: boolean; message: string }>('/auth/register', data).then((r) => r.data)

export const forgotPassword = (email: string) =>
  api.post<{ message: string }>('/auth/forgot-password', { email }).then((r) => r.data)

export const resetPassword = (token: string, password: string) =>
  api.post<{ message: string }>('/auth/reset-password', { token, password }).then((r) => r.data)

export const getMe = () =>
  api.get<User>('/auth/me').then((r) => r.data)

export const getUsers = () =>
  api.get<User[]>('/auth/users').then((r) => r.data)

export const updateUser = (id: string, data: { isActive?: boolean; role?: string }) =>
  api.patch<User>(`/auth/users/${id}`, data).then((r) => r.data)
