import api from '../lib/axios'

export type CommentTarget = 'PROJECT' | 'EARLY_WARNING' | 'RISK' | 'COMPENSATION_EVENT' | 'NOTICE'

export interface Comment {
  id: string
  projectId: string
  targetType: CommentTarget
  targetId: string
  body: string
  authorId: string
  createdAt: string
  author: { id: string; name: string; email: string }
}

export const getComments = (projectId: string, targetType: CommentTarget, targetId?: string) =>
  api.get<Comment[]>(`/projects/${projectId}/comments`, { params: { targetType, targetId } }).then((r) => r.data)

export const addComment = (projectId: string, targetType: CommentTarget, body: string, targetId?: string) =>
  api.post<Comment>(`/projects/${projectId}/comments`, { targetType, targetId, body }).then((r) => r.data)

export const deleteComment = (projectId: string, id: string) =>
  api.delete(`/projects/${projectId}/comments/${id}`)
