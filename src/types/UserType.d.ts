export type Group = {
  id: number;
  name: string;
  capacity: number;
};

// The open assignment (ended_at is null) with its group, as sent at login.
export type GroupAssignment = {
  id: number;
  group_id: number;
  user_id: number;
  assigned_by: number | null;
  assigned_at: string;
  ended_at: string | null;
  reason: string | null;
  group?: Group | null;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status?: string;
  profile?: unknown | null;
  // Laravel sends relation names in snake_case
  current_assignment?: GroupAssignment | null;
};