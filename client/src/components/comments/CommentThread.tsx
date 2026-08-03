import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Send, Trash2 } from 'lucide-react'
import { getComments, addComment, deleteComment, CommentTarget } from '../../api/comments'
import { useAuthStore } from '../../store/authStore'
import { useProjectRole } from '../../hooks/useProjectRole'
import { useToast } from '../ui/Toast'
import Button from '../ui/Button'
import { format, parseISO } from 'date-fns'

interface Props {
  targetType: CommentTarget
  targetId?: string
  title?: string
  compact?: boolean
}

export default function CommentThread({ targetType, targetId, title = 'Discussion', compact }: Props) {
  const { projectId } = useParams<{ projectId: string }>()
  const me = useAuthStore((s) => s.user)
  const { role, isCompleted } = useProjectRole()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [draft, setDraft] = useState('')

  const key = ['comments', projectId, targetType, targetId ?? projectId]

  const { data: comments = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: () => getComments(projectId!, targetType, targetId),
    enabled: !!projectId,
  })

  const addMutation = useMutation({
    mutationFn: (body: string) => addComment(projectId!, targetType, body, targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key })
      setDraft('')
    },
    onError: () => toast.error('Could not post your comment. Please try again.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteComment(projectId!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
    onError: () => toast.error('Could not delete the comment.'),
  })

  // Everyone on the project can comment — including viewers (the client side
  // of a contract needs a voice) — but never on a completed project.
  const canComment = !!role && !isCompleted

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const body = draft.trim()
    if (body) addMutation.mutate(body)
  }

  return (
    <div className={compact ? '' : 'bg-white rounded-xl border border-slate-200 shadow-card'}>
      {!compact && (
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
          {comments.length > 0 && (
            <span className="text-xs text-slate-400">{comments.length}</span>
          )}
        </div>
      )}

      <div className={compact ? 'space-y-3' : 'px-5 py-4 space-y-4'}>
        {isLoading ? (
          <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-12 rounded-lg bg-slate-100 animate-pulse" />)}</div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-slate-400">
            No comments yet. {canComment ? 'Start the conversation below.' : ''}
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex gap-3 group">
              <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-navy-900 font-bold text-xs shrink-0">
                {c.author.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-slate-800">{c.author.name}</p>
                  <span className="text-xs text-slate-400">{format(parseISO(c.createdAt), 'dd MMM yyyy, HH:mm')}</span>
                  {(c.authorId === me?.id || role === 'ADMIN') && !isCompleted && (
                    <button
                      onClick={() => deleteMutation.mutate(c.id)}
                      title="Delete comment"
                      className="ml-auto opacity-0 group-hover:opacity-100 p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-600 mt-0.5 whitespace-pre-wrap break-words">{c.body}</p>
              </div>
            </div>
          ))
        )}

        {canComment && (
          <form onSubmit={submit} className="flex items-start gap-2 pt-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                // Ctrl/Cmd+Enter posts, matching common chat behaviour
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit(e as unknown as React.FormEvent)
              }}
              rows={2}
              placeholder="Write a comment… everyone on this project will be notified by email"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green resize-y"
            />
            <Button type="submit" size="sm" icon={<Send className="w-3.5 h-3.5" />} loading={addMutation.isPending} disabled={!draft.trim()}>
              Post
            </Button>
          </form>
        )}

        {isCompleted && (
          <p className="text-xs text-slate-400 pt-1">This project is completed — the discussion is read-only.</p>
        )}
      </div>
    </div>
  )
}
