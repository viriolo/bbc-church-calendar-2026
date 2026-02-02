export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      ministries: {
        Row: {
          id: string;
          name: string;
          lead_person: string;
          lead_user_id: string | null;
          meeting_day: string | null;
          meeting_time: string | null;
          contact_phone: string | null;
          contact_email: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          lead_person: string;
          lead_user_id?: string | null;
          meeting_day?: string | null;
          meeting_time?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          lead_person?: string;
          lead_user_id?: string | null;
          meeting_day?: string | null;
          meeting_time?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string | null;
          role: 'admin' | 'ministry_leader' | 'planning_committee' | 'member';
          ministry_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          phone?: string | null;
          role?: 'admin' | 'ministry_leader' | 'planning_committee' | 'member';
          ministry_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          phone?: string | null;
          role?: 'admin' | 'ministry_leader' | 'planning_committee' | 'member';
          ministry_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          event_date: string;
          start_time: string | null;
          end_time: string | null;
          category: string;
          quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
          pathway: 'Witness' | 'Bible' | 'Care/Neighbour' | 'Freedom & Justice';
          scripture: string | null;
          status: 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
          lead_person: string | null;
          ministry_id: string | null;
          location: string;
          budget_estimated: number | null;
          budget_approved: number | null;
          budget_actual: number | null;
          sponsorship_needed: boolean;
          confirmed_by: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          recurring_pattern: string | null;
          recurring_parent_id: string | null;
          is_exception: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          event_date: string;
          start_time?: string | null;
          end_time?: string | null;
          category: string;
          quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
          pathway: 'Witness' | 'Bible' | 'Care/Neighbour' | 'Freedom & Justice';
          scripture?: string | null;
          status?: 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
          lead_person?: string | null;
          ministry_id?: string | null;
          location?: string;
          budget_estimated?: number | null;
          budget_approved?: number | null;
          budget_actual?: number | null;
          sponsorship_needed?: boolean;
          confirmed_by?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          recurring_pattern?: string | null;
          recurring_parent_id?: string | null;
          is_exception?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          event_date?: string;
          start_time?: string | null;
          end_time?: string | null;
          category?: string;
          quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
          pathway?: 'Witness' | 'Bible' | 'Care/Neighbour' | 'Freedom & Justice';
          scripture?: string | null;
          status?: 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
          lead_person?: string | null;
          ministry_id?: string | null;
          location?: string;
          budget_estimated?: number | null;
          budget_approved?: number | null;
          budget_actual?: number | null;
          sponsorship_needed?: boolean;
          confirmed_by?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          recurring_pattern?: string | null;
          recurring_parent_id?: string | null;
          is_exception?: boolean;
        };
      };
      comments: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          content: string;
          created_at: string;
          resolved: boolean;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          content: string;
          created_at?: string;
          resolved?: boolean;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
          resolved?: boolean;
        };
      };
      activity_log: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          action: string;
          old_value: Json | null;
          new_value: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          action: string;
          old_value?: Json | null;
          new_value?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          action?: string;
          old_value?: Json | null;
          new_value?: Json | null;
          created_at?: string;
        };
      };
      quarterly_goals: {
        Row: {
          id: string;
          ministry_id: string;
          year: number;
          quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
          goals: string;
          status: 'active' | 'completed' | 'delayed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ministry_id: string;
          year: number;
          quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
          goals: string;
          status?: 'active' | 'completed' | 'delayed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ministry_id?: string;
          year?: number;
          quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
          goals?: string;
          status?: 'active' | 'completed' | 'delayed';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
