export type UserRow = {
  id: string;
  clerk_id: string;
  email: string;
  name: string;
  created_at: string;
};

export type ResumeRow = {
  id: string;
  user_id: string;
  file_url: string;
  score: number | null;
  feedback: unknown | null;
  created_at: string;
};
