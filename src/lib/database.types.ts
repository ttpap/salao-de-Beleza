export type Database = {
  public: {
    Tables: {
      professionals: {
        Row: Professional;
        Insert: Omit<Professional, "id" | "created_at">;
        Update: Partial<Omit<Professional, "id" | "created_at">>;
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, "id" | "created_at">;
        Update: Partial<Omit<Client, "id" | "created_at">>;
      };
      services: {
        Row: Service;
        Insert: Omit<Service, "id" | "created_at">;
        Update: Partial<Omit<Service, "id" | "created_at">>;
      };
      appointments: {
        Row: Appointment;
        Insert: Omit<Appointment, "id" | "created_at">;
        Update: Partial<Omit<Appointment, "id" | "created_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      appointment_status: AppointmentStatus;
    };
  };
};

export type AppointmentStatus =
  | "agendado"
  | "confirmado"
  | "em_atendimento"
  | "concluido"
  | "cancelado";

export type Professional = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string;
  specialties: string[];
  commission_pct: number;
  is_active: boolean;
  work_schedule: WorkSchedule;
  google_calendar_id: string | null;
  google_refresh_token: string | null;
};

export type WorkSchedule = {
  [key in
    | "seg"
    | "ter"
    | "qua"
    | "qui"
    | "sex"
    | "sab"
    | "dom"]: {
    active: boolean;
    start: string;
    end: string;
  };
};

export type Client = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
};

export type Service = {
  id: string;
  created_at: string;
  name: string;
  duration_min: number;
  price: number;
  is_active: boolean;
};

export type Appointment = {
  id: string;
  created_at: string;
  client_id: string;
  professional_id: string;
  service_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string | null;
  price: number;
  google_event_id: string | null;
  google_master_event_id: string | null;
};

export type AppointmentWithRelations = Appointment & {
  client: Client;
  professional: Professional;
  service: Service;
};
