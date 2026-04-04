import { createClient } from "@supabase/supabase-js";
import type { ScheduleResult } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
