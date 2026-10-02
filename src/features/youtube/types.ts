export type TaskLinkKind = "video" | "playlist";

export interface TaskLink {
  id: string;
  taskId: string;
  url: string;
  kind: TaskLinkKind;
  externalId?: string | null;
  title?: string | null;
  thumbnailUrl?: string | null;
  watched: boolean;
  watchedTillSeconds?: number | null;
  note?: string | null;
  playlistTotal?: number | null;
  playlistDone?: number | null;
  createdAt: string;
}

export interface TaskLinkRow {
  id: string;
  task_id: string;
  url: string;
  kind: string;
  external_id: string | null;
  title: string | null;
  thumbnail_url: string | null;
  watched: number;
  watched_till_seconds: number | null;
  note: string | null;
  playlist_total: number | null;
  playlist_done: number | null;
  created_at: string;
}

export function mapTaskLinkRow(row: TaskLinkRow): TaskLink {
  return {
    id: row.id,
    taskId: row.task_id,
    url: row.url,
    kind: (row.kind as TaskLinkKind) || "video",
    externalId: row.external_id,
    title: row.title,
    thumbnailUrl: row.thumbnail_url,
    watched: row.watched === 1,
    watchedTillSeconds: row.watched_till_seconds,
    note: row.note,
    playlistTotal: row.playlist_total,
    playlistDone: row.playlist_done,
    createdAt: row.created_at,
  };
}
