import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, Loader2, Calendar, Save } from 'lucide-react';
import type { Event } from '../types';
import { createEvent, updateEvent, deleteEvent } from '../lib/api';
import { useAdmin } from '../lib/admin';
import { format, isValid } from 'date-fns';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  event?: Event | null; // null = create, Event = edit
  prefillDate?: string; // yyyy-MM-dd format for new events from calendar click
}

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'needs-sponsor', label: 'Needs Sponsor' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const categoryOptions = [
  { value: '', label: 'Select category...' },
  { value: 'worship', label: 'Worship' },
  { value: 'prayer', label: 'Prayer' },
  { value: 'youth', label: 'Youth' },
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'training', label: 'Training' },
  { value: 'meetings', label: 'Meetings' },
  { value: 'guest', label: 'Guest' },
  { value: 'special', label: 'Special' },
];

const ministryOptions = [
  '', 'Worship', 'Prayer', 'Youth', 'Women', 'Men', 'Missions',
  'Admin', 'Fellowship', 'Evangelism', 'Training', 'Education',
  'Hospitality',
];

export default function EventFormModal({ isOpen, onClose, onSaved, event, prefillDate }: EventFormModalProps) {
  const { isAdmin } = useAdmin();
  const isEdit = !!event;
  const actor = isAdmin ? 'Admin' : 'User';
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('draft');
  const [ministry, setMinistry] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDate(isValid(event.date) ? format(event.date, 'yyyy-MM-dd') : '');
      setStatus(event.status);
      setMinistry(event.ministry || '');
      setDescription(event.description || '');
      setBudget(event.budget ? String(event.budget) : '');
      setCategory(event.category || '');
    } else {
      setTitle('');
      setDate(prefillDate || '');
      setStatus('draft');
      setMinistry('');
      setDescription('');
      setBudget('');
      setCategory('');
    }
    setError('');
    setShowDeleteConfirm(false);
  }, [event, isOpen, prefillDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      setError('Title and date are required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        title: title.trim(),
        date,
        status,
        ministry: ministry || undefined,
        description: description.trim() || undefined,
        budget: budget ? Number(budget) : undefined,
        category: category || undefined,
        actor,
      };

      if (isEdit && event) {
        await updateEvent(Number(event.id), payload);
      } else {
        await createEvent(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    setDeleting(true);
    setError('');
    try {
      await deleteEvent(Number(event.id), actor);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 pb-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {isEdit ? 'Edit Event' : 'Add New Event'}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event title"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  required
                />
              </div>

              {/* Date + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ministry + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ministry</label>
                  <select
                    value={ministry}
                    onChange={(e) => setMinistry(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  >
                    <option value="">Select ministry...</option>
                    {ministryOptions.filter(Boolean).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Budget (Kina)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 800"
                  min="0"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Event details..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {isEdit ? 'Save Changes' : 'Create Event'}
                    </>
                  )}
                </button>

                {isEdit && !showDeleteConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-3 rounded-xl border border-rose-200 text-rose-600 font-medium hover:bg-rose-50 transition-colors"
                  >
                    Delete
                  </button>
                )}

                {isEdit && showDeleteConfirm && (
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDelete}
                    className="px-4 py-3 rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Delete'}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
