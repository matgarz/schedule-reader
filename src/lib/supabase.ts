import { createClient } from "@supabase/supabase-js";
import type { ScheduleResult } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

const safeSupabaseUrl = hasSupabaseEnv ? supabaseUrl : "https://placeholder.supabase.co";
const safeSupabaseAnonKey = hasSupabaseEnv
  ? supabaseAnonKey
  : "public-anon-key-placeholder";

if (!hasSupabaseEnv) {
  // Keep app renderable in local dev even when env vars are not configured.
  console.warn(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Using placeholder Supabase config."
  );
}

export const supabase = createClient(safeSupabaseUrl, safeSupabaseAnonKey);

export interface GroupModel {
  id: string;
  created_at: string;
}

export interface ScheduleModel {
  id: string;
  group_id: string;
  user_name: string;
  schedule_data: ScheduleResult;
  created_at: string;
}

export interface MessageModel {
  id: string;
  group_id: string;
  user_name: string;
  content: string;
  created_at: string;
}
