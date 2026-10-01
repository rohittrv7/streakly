// YouTube feature types
export interface YouTubeVideoMetadata {
  url: string;
  title: string;
  thumbnailUrl: string;
  authorName?: string;
}

export interface TaskYouTubeLink {
  id: string;
  taskId: string;
  url: string;
  title: string;
  thumbnailUrl: string;
  watched: boolean;
  watchedTillSeconds?: number;
  notes?: string;
}
