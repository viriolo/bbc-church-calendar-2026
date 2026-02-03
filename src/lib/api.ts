const API_BASE = '/api';

// ── Types matching the database rows ──
export interface EventRow {
  id: number;
  title: string;
  date: string; // ISO date string from DB
  end_date: string | null;
  status: string;
  ministry: string | null;
  description: string | null;
  budget: number | null;
  sponsor: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuarterRow {
  id: number;
  name: string;
  theme: string;
  pathway: string;
  study: string;
  focus: string;
  scripture: string;
  start_date: string;
  end_date: string;
  color: string;
  color_hex: string;
  total_events: number;
  confirmed_events: number;
  pending_events: number;
  progress: number;
}

export interface StatsRow {
  total_events: string;
  confirmed_events: string;
  pending_events: string;
  needs_attention: string;
  upcoming: string;
  ministries: string;
  this_month: string;
}

// ── API functions ──

export async function fetchEvents(params?: {
  status?: string;
  ministry?: string;
  month?: string;
  search?: string;
}): Promise<EventRow[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.ministry) searchParams.set('ministry', params.ministry);
  if (params?.month) searchParams.set('month', params.month);
  if (params?.search) searchParams.set('search', params.search);

  const qs = searchParams.toString();
  const url = `${API_BASE}/events${qs ? `?${qs}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch events: ${res.status}`);
  }
  return res.json();
}

export async function createEvent(event: {
  title: string;
  date: string;
  end_date?: string;
  status?: string;
  ministry?: string;
  description?: string;
  budget?: number;
  sponsor?: string;
  category?: string;
  actor?: string;
}): Promise<EventRow> {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to create event: ${res.status}`);
  }
  return res.json();
}

export async function updateEvent(
  id: number,
  updates: Partial<{
    title: string;
    date: string;
    end_date: string | null;
    status: string;
    ministry: string;
    description: string;
    budget: number | null;
    sponsor: string | null;
    category: string;
    actor?: string;
  }>
): Promise<EventRow> {
  const res = await fetch(`${API_BASE}/events?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to update event: ${res.status}`);
  }
  return res.json();
}

export async function deleteEvent(id: number, actor?: string): Promise<void> {
  const qs = actor ? `id=${id}&actor=${encodeURIComponent(actor)}` : `id=${id}`;
  const res = await fetch(`${API_BASE}/events?${qs}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to delete event: ${res.status}`);
  }
}

export async function fetchQuarters(): Promise<QuarterRow[]> {
  const res = await fetch(`${API_BASE}/quarters`);
  if (!res.ok) {
    throw new Error(`Failed to fetch quarters: ${res.status}`);
  }
  return res.json();
}

export async function fetchStats(): Promise<StatsRow> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) {
    throw new Error(`Failed to fetch stats: ${res.status}`);
  }
  return res.json();
}

// ── Comments ──
export async function fetchComments(eventId: number): Promise<{ id: number; event_id: number; author: string; content: string; created_at: string }[]> {
  const res = await fetch(`${API_BASE}/comments?event_id=${eventId}`);
  if (!res.ok) throw new Error(`Failed to fetch comments: ${res.status}`);
  return res.json();
}

export async function addComment(eventId: number, content: string, author?: string): Promise<{ id: number; event_id: number; author: string; content: string; created_at: string }> {
  const res = await fetch(`${API_BASE}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_id: eventId, content, author }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to add comment: ${res.status}`);
  }
  return res.json();
}

// ── Activity log ──
export async function fetchActivity(eventId: number): Promise<{ id: number; event_id: number | null; actor: string; action: string; summary: string; created_at: string }[]> {
  const res = await fetch(`${API_BASE}/activity?event_id=${eventId}`);
  if (!res.ok) throw new Error(`Failed to fetch activity: ${res.status}`);
  return res.json();
}
