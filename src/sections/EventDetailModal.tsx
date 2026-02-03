import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Users,
  Pencil,
  MessageSquare,
  History,
  Loader2,
  Send,
  CheckCircle2,
  Clock,
  FileEdit,
  HeartHandshake,
} from 'lucide-react';
import type { Event, Comment, ActivityItem } from '../types';
import { fetchComments, addComment, fetchActivity } from '../lib/api';
import { useAdmin } from '../lib/admin';
import { format, isValid } from 'date-fns';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onEdit: (event: Event) => void;
  onSaved: () => void;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  confirmed: { label: 'Confirmed', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-100' },
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-600 bg-amber-100' },
  draft: { label: 'Draft', icon: FileEdit, color: 'text-slate-600 bg-slate-100' },
  'needs-sponsor': { label: 'Needs Sponsor', icon: HeartHandshake, color: 'text-rose-600 bg-rose-100' },
};

function safeFormat(date: Date, fmt: string, fallback = '—'): string {
  try {
    return isValid(date) ? format(date, fmt) : fallback;
  } catch {
    return fallback;
  }
}

export default function EventDetailModal({ isOpen, onClose, event, onEdit, onSaved }: EventDetailModalProps) {
  const { isAdmin } = useAdmin();
  const [comments, setComments] = useState<Comment[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState('');

  const eventId = event ? Number(event.id) : 0;

  useEffect(() => {
    if (!isOpen || !eventId) return;
    setLoadingComments(true);
    setLoadingActivity(true);
    setComments([]);
    setActivity([]);
    Promise.all([fetchComments(eventId), fetchActivity(eventId)])
      .then(([c, a]) => {
        setComments(c);
        setActivity(a);
      })
      .catch(() => {})
      .finally(() => {
        setLoadingComments(false);
        setLoadingActivity(false);
      });
  }, [isOpen, eventId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newComment.trim();
    if (!content || !eventId) return;
    setSubmittingComment(true);
    setCommentError('');
    try {
      const created = await addComment(eventId, content, isAdmin ? 'Admin' : 'User');
      setComments((prev) => [...prev, created]);
      setNewComment('');
      onSaved();
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!event) return null;

  const status = statusConfig[event.status] ?? statusConfig.draft;
  const StatusIcon = status.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 truncate">{event.title}</h3>
                  <p className="text-sm text-slate-500">{safeFormat(event.date, 'EEEE, MMMM d, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => { onEdit(event); onClose(); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Event info */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium ${status.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  {status.label}
                </span>
                {event.ministry && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm bg-slate-100 text-slate-700">
                    <Users className="w-4 h-4" />
                    {event.ministry}
                  </span>
                )}
                {event.budget != null && (
                  <span className="text-sm text-slate-600">Budget: K{event.budget.toLocaleString()}</span>
                )}
              </div>
              {event.description && (
                <p className="text-slate-600 text-sm">{event.description}</p>
              )}

              {/* Comments */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
                  <MessageSquare className="w-4 h-4" />
                  Comments
                </h4>
                {loadingComments ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading…
                  </div>
                ) : (
                  <ul className="space-y-3 mb-4">
                    {comments.length === 0 ? (
                      <li className="text-sm text-slate-500">
                        No comments yet. Add a note below to coordinate with the team.
                      </li>
                    ) : (
                      comments.map((c) => (
                        <li key={c.id} className="pl-3 border-l-2 border-slate-200">
                          <p className="text-sm text-slate-800">{c.content}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {c.author} · {safeFormat(new Date(c.created_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </li>
                      ))
                    )}
                  </ul>
                )}
                {isAdmin && (
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="e.g. Waiting for Pastor to confirm the date…"
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      disabled={submittingComment}
                    />
                    <button
                      type="submit"
                      disabled={submittingComment || !newComment.trim()}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Add
                    </button>
                  </form>
                )}
                {commentError && (
                  <p className="mt-2 text-sm text-rose-600">{commentError}</p>
                )}
              </div>

              {/* Activity log */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
                  <History className="w-4 h-4" />
                  Activity
                </h4>
                {loadingActivity ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading…
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {activity.length === 0 ? (
                      <li className="text-sm text-slate-500">
                        No activity yet. Changes you make when editing this event will appear here.
                      </li>
                    ) : (
                      activity.map((a) => (
                        <li key={a.id} className="flex gap-3 text-sm">
                          <span className="text-slate-400 shrink-0 whitespace-nowrap">
                            {safeFormat(new Date(a.created_at), 'MMM d, yyyy \'at\' h:mm a')}
                          </span>
                          <span className="text-slate-700">
                            {a.summary}
                            {a.actor ? ` — ${a.actor}` : ''}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
