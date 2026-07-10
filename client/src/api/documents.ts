import api from '../lib/axios'
import type { Document } from '../types'

export interface ProjectDocument extends Document {
  uploadedByName: string
  ce: { id: string; ceNumber: string; title: string }
}

export const getProjectDocuments = (projectId: string) =>
  api.get<ProjectDocument[]>(`/projects/${projectId}/documents`).then((r) => r.data)

export const downloadDocument = async (projectId: string, docId: string, fileName: string) => {
  const res = await api.get(`/projects/${projectId}/documents/${docId}/download`, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}
